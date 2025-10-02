<?php

namespace App\Http\Controllers\Systems;

use App\Http\Controllers\Controller;
use App\Http\Resources\Systems\RoleResource;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:255',
            'page' => 'nullable|integer|min:1',
        ]);

        $search = $request->get('search');

        $roles = Role::query()
            ->withCount('permissions')
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%');
            })
            ->orderBy('name')
            ->paginate(10);

        return inertia('systems/roles/index', [
            'roles' => RoleResource::collection($roles)->response()->getData(true),
            'search' => $search,
        ]);
    }
}
