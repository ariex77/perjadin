<?php

namespace App\Http\Controllers;

use App\Http\Resources\AssignmentEmployeeResource;
use App\Models\AssignmentEmployee;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AssignmentEmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $assignmentEmployees = AssignmentEmployee::query()
            ->with(['assignment:id,purpose,destination,start_date,end_date,status', 'user:id,name,email,photo,work_unit_id'])
            ->when($request->filled('assignment_id'), function ($query) use ($request) {
                $query->where('assignment_id', $request->assignment_id);
            })
            ->when($request->filled('user_id'), function ($query) use ($request) {
                $query->where('user_id', $request->user_id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return AssignmentEmployeeResource::collection($assignmentEmployees);
    }

    /**
     * Display the specified resource.
     */
    public function show(AssignmentEmployee $assignmentEmployee): AssignmentEmployeeResource
    {
        $assignmentEmployee->load(['assignment', 'user.workUnit']);
        
        return new AssignmentEmployeeResource($assignmentEmployee);
    }

    /**
     * Get assignment employees by assignment ID.
     */
    public function byAssignment(int $assignmentId): AnonymousResourceCollection
    {
        $assignmentEmployees = AssignmentEmployee::where('assignment_id', $assignmentId)
            ->with(['user:id,name,email,photo,work_unit_id', 'user.workUnit:id,name'])
            ->get();

        return AssignmentEmployeeResource::collection($assignmentEmployees);
    }

    /**
     * Get assignment employees by user ID.
     */
    public function byUser(int $userId): AnonymousResourceCollection
    {
        $assignmentEmployees = AssignmentEmployee::where('user_id', $userId)
            ->with(['assignment:id,purpose,destination,start_date,end_date,status'])
            ->get();

        return AssignmentEmployeeResource::collection($assignmentEmployees);
    }
}
