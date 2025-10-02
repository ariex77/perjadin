<?php

namespace App\Http\Controllers\Masters;

use App\Http\Controllers\Controller;
use App\Http\Requests\Masters\WorkUnitRequest;
use App\Http\Resources\Masters\WorkUnitResource;
use App\Models\WorkUnit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorkUnitController extends Controller
{
    public function index(Request $request)
    {
		$workUnit = WorkUnit::query()
			->select('id', 'name', 'code', 'description', 'head_id', 'created_at')
			->with(['head:id,name'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('name', 'like', '%' . $request->search . '%');
            })
            ->orderBy('name')
            ->paginate(10);

        return inertia('masters/work-units/index', [
            'workUnits' => WorkUnitResource::collection($workUnit)->response()->getData(true),
            'search' => $request->get('search', ''),
        ]);
    }

    public function create()
    {
        $leaders = User::role('leader')
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(fn($u) => ['value' => $u->id, 'label' => $u->name]);

        return inertia('masters/work-units/create', [
            'leaders' => $leaders,
        ]);
    }

    public function store(WorkUnitRequest $request)
    {
        try {
            WorkUnit::create([
                'name' => $request->name,
                'code' => $request->code,
                'description' => $request->description,
                'head_id' => $request->filled('head_id') && $request->head_id !== '' ? $request->head_id : null,
            ]);

            return redirect()->route('masters.work-units.index')->with('success', 'Unit kerja berhasil ditambahkan.');
        } catch (\Exception $e) {
            if ($e instanceof \Illuminate\Database\QueryException && $e->getCode() == 23000) {
                // Error kode 23000 = Integrity constraint violation (duplicate entry)
                return redirect()->route('masters.work-units.index')->with('error', 'Nama unit kerja sudah digunakan.');
            }
            return redirect()->route('masters.work-units.index')->with('error', 'Terjadi kesalahan saat menambah unit kerja.');
        }
    }

    public function edit(WorkUnit $workUnit)
    {
        $leaders = User::role('leader')
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(fn($u) => ['value' => $u->id, 'label' => $u->name]);

        return inertia('masters/work-units/edit', [
            'workUnit' => $workUnit,
            'leaders' => $leaders,
        ]);
    }

    public function update(WorkUnitRequest $request, WorkUnit $workUnit)
    {
        try {
            $workUnit->update([
                'name' => $request->name ?? $workUnit->name,
                'code' => $request->code ?? $workUnit->code,
                'description' => $request->description ?? $workUnit->description,
                'head_id' => $request->has('head_id')
                    ? ($request->filled('head_id') && $request->head_id !== '' ? $request->head_id : null)
                    : $workUnit->head_id,
            ]);

            return redirect()->route('masters.work-units.index')->with('success', 'Unit kerja berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->route('masters.work-units.index')->with('error', $e->getMessage() ?: 'Terjadi kesalahan saat memperbarui unit kerja.');
        }
    }

    public function destroy(WorkUnit $workUnit)
    {
        try {
            $workUnit->delete();
            return redirect()->back()->with('success', 'Unit kerja berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menghapus unit kerja.');
        }
    }

    public function bulkDelete(Request $request)
    {

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:work_units,id',
        ]);

        DB::transaction(function () use ($request) {
            WorkUnit::whereIn('id', $request->ids)->delete();
        });

        return redirect()->back()->with('success', 'Unit kerja berhasil dihapus.');
    }
}
