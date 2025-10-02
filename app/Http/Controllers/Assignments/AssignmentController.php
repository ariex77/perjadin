<?php

namespace App\Http\Controllers\Assignments;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assignments\AssignmentRequest;
use App\Http\Resources\Assignments\AssignmentResource;
use App\Http\Resources\Assignments\DetailAssignmentResource;
use App\Mail\AssignmentNotificationMail;
use App\Models\Assignment;
use App\Models\TransportationType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class AssignmentController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $isAdminOrSuperadminOrLeader = $user && $user->hasAnyRole(['admin', 'superadmin', 'leader']);
        $isLeader = $user && $user->hasRole('leader');
        $isVerifikator = $user && $user->hasRole('verificator');

        $assignments = Assignment::query()
            ->with([
                'creator:id,name',
                'users:id,name,photo,work_unit_id',
                'users.workUnit:id,name',
                'reports:id,user_id,assignment_id,created_at,travel_type,travel_order_number,destination_city,status',
                'reports.inCityReport:id,report_id',
                'reports.outCityReport:id,report_id',
                'reports.outCountyReport:id,report_id',
                'reports.travelReport:id,report_id',
                'assignmentDocumentations:id,assignment_id,photo,created_at'
            ])
            ->when(!$isAdminOrSuperadminOrLeader && !$isVerifikator, function ($query) use ($user) {
                $query->whereHas('users', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            })
            // Tidak ada filter khusus untuk leader, leader dapat melihat semua assignment
            ->when($request->filled('search'), function ($query) use ($request, $isAdminOrSuperadminOrLeader, $isVerifikator) {
                $search = $request->search;
                if ($isAdminOrSuperadminOrLeader || $isVerifikator) {
                    $query->where(function ($q) use ($search) {
                        $q->where('destination', 'like', '%' . $search . '%')
                            ->orWhere('purpose', 'like', '%' . $search . '%')
                            ->orWhereHas('users', function ($userQuery) use ($search) {
                                $userQuery->where('name', 'like', '%' . $search . '%');
                            });
                    });
                } else {
                    $query->where(function ($q) use ($search) {
                        $q->where('destination', 'like', '%' . $search . '%')
                            ->orWhere('purpose', 'like', '%' . $search . '%');
                    });
                }
            })
            ->when($request->filled('date'), function ($query) use ($request) {
                $date = $request->date;
                if ($date) $query->whereDate('start_date', $date);
            })
            ->when($request->filled('has_reports'), function ($query) use ($request) {
                $hasReports = $request->boolean('has_reports');
                if ($hasReports) $query->whereHas('reports');
                else $query->whereDoesntHave('reports');
            })
            ->orderBy('start_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return inertia('assignments/index', [
            'assignments'         => AssignmentResource::collection($assignments)->response()->getData(true),
            'search'              => $request->get('search', ''),
            'date'                => $request->get('date', ''),
            'has_reports'         => $request->get('has_reports', ''),
            'isAdminOrSuperadmin' => $isAdminOrSuperadminOrLeader,
            'isLeader'            => $isLeader,
            'isVerifikator'       => $isVerifikator,
        ]);
    }

    public function create()
    {
        // hanya role admin/superadmin/leader boleh buat (sesuai kebutuhanmu)
        $user = Auth::user();
        if (!$user || !$user->hasAnyRole(['admin', 'superadmin', 'leader'])) {
            abort(403, 'User does not have the right roles.');
        }

        $users = User::whereHas('roles', function ($query) {
            $query->where('name', 'employee');
        })
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(fn($u) => ['value' => $u->id, 'label' => $u->name]);

        return inertia('assignments/create', [
            'users' => $users,
        ]);
    }

    public function store(AssignmentRequest $request)
    {
        $user = Auth::user();
        if (!$user || !$user->hasAnyRole(['admin', 'superadmin', 'leader'])) {
            abort(403, 'User does not have the right roles.');
        }

        try {
            $assignment = null;

            DB::transaction(function () use ($request, &$assignment) {
                $userId = Auth::id();

                $assignment = Assignment::create([
                    'purpose'     => $request->purpose,
                    'destination' => $request->destination,
                    'start_date'  => $request->start_date,
                    'end_date'    => $request->end_date,
                    'user_id'     => $userId, // pembuat
                ]);

                if ($request->filled('user_ids') && is_array($request->user_ids)) {
                    $assignment->users()->attach($request->user_ids);
                }
            });

            if ($assignment && $assignment->exists) {
                $assignment->loadMissing(['users:id,name,email']);
                foreach ($assignment->users as $user) {
                    if (!empty($user->email)) {
                        Mail::to($user->email)->send(new AssignmentNotificationMail($assignment, $user));
                    } else {
                        Log::warning('User does not have email address', [
                            'assignment_id' => $assignment->id,
                            'user_id'       => $user->id,
                            'user_name'     => $user->name
                        ]);
                    }
                }
            }

            return redirect()->route('assignments.index')
                ->with('success', 'Penugasan berhasil ditambahkan dan notifikasi email telah dikirim.');
        } catch (\Exception $e) {
            Log::error('Error creating assignment: ' . $e->getMessage(), [
                'request' => $request->all(),
                'user_id' => Auth::id(),
                'trace'   => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'Terjadi kesalahan saat menambah penugasan: ' . $e->getMessage()]);
        }
    }

    public function show(Assignment $assignment)
    {
        $assignment->load([
            'creator:id,name',
            'users:id,name,photo,email,work_unit_id',
            'users.workUnit:id,name,head_id',
            'users.workUnit.head:id,name',
            'reports.user:id,name',
            'reports.inCityReport',
            'reports.outCityReport',
            'reports.outCountyReport',
            'reports.travelReport',
            'reports.reviews:id,report_id,status,reviewer_type,created_at,notes',
            'assignmentDocumentations'
        ]);

        $transportationTypes = TransportationType::select('id', 'name', 'label')->get();

        return inertia('assignments/show', [
            'assignment'            => (new DetailAssignmentResource($assignment))->resolve(),
            'transportation_types'  => $transportationTypes,
        ]);
    }

    public function edit(Assignment $assignment)
    {
        // HANYA pembuat yang boleh mengedit
        if (Auth::id() !== (int) $assignment->user_id) {
            abort(403, 'Hanya pembuat penugasan yang dapat mengedit.');
        }

        $assignment->load(['users:id,name,photo,work_unit_id', 'users.workUnit:id,name']);

        $users = User::whereHas('roles', function ($query) {
            $query->where('name', 'employee');
        })
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(fn($u) => ['value' => $u->id, 'label' => $u->name]);

        return inertia('assignments/edit', [
            'assignment' => (new AssignmentResource($assignment))->resolve(),
            'users'      => $users,
        ]);
    }

    public function update(AssignmentRequest $request, Assignment $assignment)
    {
        // HANYA pembuat yang boleh update
        if (Auth::id() !== (int) $assignment->user_id) {
            abort(403, 'Hanya pembuat penugasan yang dapat mengedit.');
        }

        try {
            $originalIds = $assignment->users()->pluck('users.id')->toArray();

            $assignment->update([
                'purpose'     => $request->purpose,
                'destination' => $request->destination,
                'start_date'  => $request->start_date,
                'end_date'    => $request->end_date,
                'user_id'     => Auth::id(),
            ]);

            $addedIds = [];
            if ($request->filled('user_ids') && is_array($request->user_ids)) {
                $newIds   = collect($request->user_ids)->map(fn($id) => (int) $id)->unique()->values()->toArray();
                $addedIds = array_values(array_diff($newIds, $originalIds));
                $assignment->users()->sync($newIds);
            }

            if (!empty($addedIds)) {
                $this->sendAssignmentNotificationsToUserIds($assignment, $addedIds);
            }

            return redirect()->route('assignments.index')
                ->with('success', 'Penugasan berhasil diperbarui. Notifikasi dikirim ke peserta baru.');
        } catch (\Exception $e) {
            Log::error('Error updating assignment: ' . $e->getMessage(), [
                'request' => $request->all(),
                'user_id' => Auth::id(),
                'trace'   => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'Terjadi kesalahan saat memperbarui penugasan.']);
        }
    }

    public function destroy(Assignment $assignment)
    {
        // HANYA pembuat yang boleh hapus (menyesuaikan permintaan: table action = pembuat)
        if (Auth::id() !== (int) $assignment->user_id) {
            abort(403, 'Hanya pembuat penugasan yang dapat menghapus.');
        }

        try {
            $assignment->delete();
            return redirect()->back()->with('success', 'Penugasan berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting assignment: ' . $e->getMessage(), [
                'assignment_id' => $assignment->id,
                'user_id'       => Auth::id(),
                'trace'         => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Terjadi kesalahan saat menghapus penugasan.');
        }
    }

    public function bulkDelete(Request $request)
    {
        // Jika kamu ingin bulk delete tetap admin-only, biarkan seperti ini
        $user = Auth::user();
        if (!$user || !$user->hasAnyRole(['admin', 'superadmin', 'leader'])) {
            abort(403, 'User does not have the right roles.');
        }

        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'exists:assignments,id',
        ]);

        DB::transaction(function () use ($request) {
            Assignment::whereIn('id', $request->ids)->delete();
        });

        return redirect()->back()->with('success', 'Penugasan berhasil dihapus.');
    }

    /**
     * Kirim email ke subset user berdasarkan id (hanya peserta baru).
     */
    private function sendAssignmentNotificationsToUserIds(Assignment $assignment, array $userIds): void
    {
        $assignment->loadMissing(['users' => function ($q) use ($userIds) {
            $q->select('users.id', 'users.name', 'users.email')->whereIn('users.id', $userIds);
        }]);

        foreach ($assignment->users as $user) {
            if (!empty($user->email)) {
                Mail::to($user->email)->send(new AssignmentNotificationMail($assignment, $user));
            } else {
                Log::warning('User does not have email address', [
                    'assignment_id' => $assignment->id,
                    'user_id'       => $user->id,
                    'user_name'     => $user->name
                ]);
            }
        }
    }
}
