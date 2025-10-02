<?php

namespace App\Http\Controllers\Masters;

use App\Http\Controllers\Controller;
use App\Http\Requests\Masters\EmployeeRequest;
use App\Http\Resources\Masters\EmployeeResource;
use App\Http\Resources\Masters\DetailEmployeeResource;
use App\Models\User;
use App\Enums\Gender;
use Spatie\Permission\Models\Role;
use App\Models\WorkUnit;
use App\Services\FileStorageService;
use App\Helpers\FileHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $employees = User::select('id', 'nip', 'work_unit_id', 'name', 'username', 'email', 'photo', 'created_at')
            ->with(['workUnit:id,name', 'roles:id,name'])
            ->whereHas('roles', function ($query) {
                $query->where('name', '!=', 'superadmin');
                $query->where('name', '!=', 'admin');
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('name', 'like', '%' . $request->search . '%');
            })
            ->when($request->filled('work_unit_id'), function ($query) use ($request) {
                $query->where('work_unit_id', $request->work_unit_id);
            })
            ->orderByDesc('created_at')
            ->paginate(10);

        $workUnits = WorkUnit::select('id', 'name')->get()->map(function ($workUnit) {
            return [
                'value' => (string) $workUnit->id,
                'label' => $workUnit->name,
            ];
        });

        return inertia('masters/employees/index', [
            'employees' => EmployeeResource::collection($employees)->response()->getData(true),
            'search'   => $request->get('search', ''),
            'workUnits' => $workUnits,
            'workUnitId' => $request->get('work_unit_id', ''),
        ]);
    }

    public function create()
    {
        $workUnits = WorkUnit::select('id', 'name')->get()->map(function ($workUnit) {
            return [
                'value' => (string) $workUnit->id,
                'label' => $workUnit->name,
            ];
        });
        $roles = Role::whereNotIn('name', ['superadmin', 'admin'])->select('id', 'name')->get();
        return inertia('masters/employees/create', [
            'workUnits' => $workUnits,
            'roles' => $roles,
        ]);
    }

    public function store(EmployeeRequest $request)
    {
        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $request->name,
                'nip' => $request->nip,
                'number_phone' => $request->number_phone,
                'email' => $request->email,
                'username' => $request->username,
                'level' => $request->level,
                'work_unit_id' => $request->work_unit_id,
                'gender' => $request->gender ?? Gender::MALE->value, // Default gender jika tidak diisi
                'password' => bcrypt($request->password),
            ]);

            // Assign roles
            if ($request->has('roles') && is_array($request->roles)) {
                $user->assignRole($request->roles);
            }

            // Jika user baru memiliki role 'leader', cek apakah work unit sudah memiliki leader
            if (in_array('leader', $request->roles)) {
                $workUnit = WorkUnit::find($request->work_unit_id);
                if ($workUnit && $workUnit->head_id) {
                    // Jika sudah ada leader, tampilkan pesan informasi
                    $oldLeader = User::find($workUnit->head_id);
                    $message = "Pegawai berhasil ditambahkan sebagai leader baru untuk unit kerja '{$workUnit->name}'. ";
                    $message .= "Leader sebelumnya ({$oldLeader->name}) tetap dapat mengakses data historis review yang sudah dilakukan.";

                    // Update work unit dengan leader baru
                    $workUnit->update(['head_id' => $user->id]);

                    DB::commit();
                    return redirect()->route('masters.employees.index')->with('success', $message);
                } else {
                    // Jika belum ada leader, set sebagai leader pertama
                    $workUnit->update(['head_id' => $user->id]);
                }
            }

            // Create address if provided
            if ($request->filled('address') || $request->filled('city') || $request->filled('province')) {
                $user->address()->create([
                    'address' => $request->address,
                    'city' => $request->city,
                    'province' => $request->province,
                ]);
            }

            if ($request->hasFile('photo')) {
                $imagePath = FileStorageService::storePublicOriginal(
                    $request->file('photo'),
                    'images/employees',
                    $user->id,
                    'user'
                );
                $user->update(['photo' => $imagePath]);
            }

            DB::commit();
            return redirect()->route('masters.employees.index')->with('success', 'Pegawai berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withInput()->withErrors(['error' => $e->getMessage() ?: 'Terjadi kesalahan saat menambah pegawai.']);
        }
    }

    public function edit(User $user)
    {
        $user->load(['roles', 'workUnit', 'address']);
        $workUnits = WorkUnit::select('id', 'name')->get()->map(function ($workUnit) {
            return [
                'value' => (string) $workUnit->id,
                'label' => $workUnit->name,
            ];
        });
        $roles = Role::whereNotIn('name', ['superadmin', 'admin'])->select('id', 'name')->get();

        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'nip' => $user->nip,
            'number_phone' => $user->number_phone,
            'level' => $user->level,
            'gender' => $user->gender,
            'work_unit_id' => $user->work_unit_id ? (string) $user->work_unit_id : '',
            'photo' => FileHelper::getUserPhotoUrl($user->photo),
            'roles' => $user->roles ? $user->roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                ];
            })->toArray() : [],
            'address' => $user->address ? [
                'id' => $user->address->id,
                'address' => $user->address->address,
                'city' => $user->address->city,
                'province' => $user->address->province,
            ] : null,
        ];

        return inertia('masters/employees/edit', [
            'user' => $userData,
            'workUnits' => $workUnits,
            'roles' => $roles,
        ]);
    }

    public function update(EmployeeRequest $request, User $user)
    {
        DB::beginTransaction();
        try {
            $oldRoles = $user->roles->pluck('name')->toArray();
            $newRoles = $request->roles ?? [];

            $user->name = $request->name;
            $user->username = $request->username;
            $user->email = $request->email;
            $user->nip = $request->nip;
            $user->number_phone = $request->number_phone;
            $user->level = $request->level;
            $user->work_unit_id = $request->work_unit_id;
            $user->gender = $request->gender ?? $user->gender; // Update gender jika diisi
            if ($request->filled('password')) {
                $user->password = bcrypt($request->password);
            }
            if ($request->hasFile('photo')) {
                // Hapus foto lama jika ada
                FileStorageService::deletePublicIfExists($user->photo);

                $imagePath = FileStorageService::storePublicOriginal(
                    $request->file('photo'),
                    'images/employees',
                    $user->id,
                    'user'
                );
                $user->photo = $imagePath;
            }
            $user->save();

            // Update roles
            if ($request->has('roles') && is_array($request->roles)) {
                $user->syncRoles($request->roles);
            }

            // Cek perubahan role leader
            $wasLeader = in_array('leader', $oldRoles);
            $isLeader = in_array('leader', $newRoles);

            if (!$wasLeader && $isLeader) {
                // User baru menjadi leader
                $workUnit = WorkUnit::find($request->work_unit_id);
                if ($workUnit && $workUnit->head_id && $workUnit->head_id !== $user->id) {
                    // Jika sudah ada leader lain, ganti dengan yang baru
                    $oldLeader = User::find($workUnit->head_id);
                    $message = "Pegawai berhasil diperbarui dan ditunjuk sebagai leader baru untuk unit kerja '{$workUnit->name}'. ";
                    $message .= "Leader sebelumnya ({$oldLeader->name}) tetap dapat mengakses data historis review yang sudah dilakukan.";

                    $workUnit->update(['head_id' => $user->id]);

                    DB::commit();
                    return redirect()->route('masters.employees.index')->with('success', $message);
                } else if ($workUnit && !$workUnit->head_id) {
                    // Jika belum ada leader, set sebagai leader pertama
                    $workUnit->update(['head_id' => $user->id]);
                }
            } else if ($wasLeader && !$isLeader) {
                // User tidak lagi menjadi leader
                $workUnit = WorkUnit::where('head_id', $user->id)->first();
                if ($workUnit) {
                    $workUnit->update(['head_id' => null]);
                }
            } else if ($wasLeader && $isLeader && $user->work_unit_id !== $request->work_unit_id) {
                // Leader pindah ke work unit lain
                $oldWorkUnit = WorkUnit::where('head_id', $user->id)->first();
                if ($oldWorkUnit) {
                    $oldWorkUnit->update(['head_id' => null]);
                }

                $newWorkUnit = WorkUnit::find($request->work_unit_id);
                if ($newWorkUnit && $newWorkUnit->head_id && $newWorkUnit->head_id !== $user->id) {
                    // Jika work unit baru sudah punya leader, ganti
                    $oldLeader = User::find($newWorkUnit->head_id);
                    $message = "Pegawai berhasil diperbarui dan ditunjuk sebagai leader baru untuk unit kerja '{$newWorkUnit->name}'. ";
                    $message .= "Leader sebelumnya ({$oldLeader->name}) tetap dapat mengakses data historis review yang sudah dilakukan.";

                    $newWorkUnit->update(['head_id' => $user->id]);

                    DB::commit();
                    return redirect()->route('masters.employees.index')->with('success', $message);
                } else if ($newWorkUnit) {
                    $newWorkUnit->update(['head_id' => $user->id]);
                }
            }

            // Update or create address
            if ($request->filled('address') || $request->filled('city') || $request->filled('province')) {
                $user->address()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'address' => $request->address,
                        'city' => $request->city,
                        'province' => $request->province,
                    ]
                );
            }

            DB::commit();
            return redirect()->route('masters.employees.index')->with('success', 'Pegawai berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withInput()->withErrors(['error' => $e->getMessage() ?: 'Terjadi kesalahan saat memperbarui pegawai.']);
        }
    }

    public function destroy(User $user)
    {
        try {
            // Cek apakah user masih memiliki data terkait
            if ($user->assignments()->exists()) {
                return redirect()->back()->with('error', 'Tidak dapat menghapus pegawai yang masih memiliki data penugasan.');
            }

            // Hapus semua roles terlebih dahulu
            $user->syncRoles([]);

            // Hapus user
            $user->delete();
            return redirect()->back()->with('success', 'Pegawai berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menghapus pegawai.');
        }
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:users,id',
        ]);

        // Cek apakah ada user yang masih memiliki data terkait
        $usersWithAssignments = User::whereIn('id', $request->ids)
            ->has('assignments')
            ->pluck('name');

        if ($usersWithAssignments->isNotEmpty()) {
            return redirect()->back()->with(
                'error',
                'Tidak dapat menghapus pegawai yang masih memiliki data penugasan: ' . $usersWithAssignments->implode(', ')
            );
        }

        DB::transaction(function () use ($request) {
            $users = User::whereIn('id', $request->ids)->get();

            foreach ($users as $user) {
                // Hapus semua roles terlebih dahulu
                $user->syncRoles([]);
                // Hapus user
                $user->delete();
            }
        });

        return redirect()->back()->with('success', 'Pegawai berhasil dihapus.');
    }

    public function show(User $user)
    {
        $user->load(['roles', 'workUnit', 'address']);

        return inertia('masters/employees/show', [
            'employee' => new DetailEmployeeResource($user),
        ]);
    }
}
