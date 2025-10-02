<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentDocumentation;
use App\Services\FileStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AssignmentDocumentationController extends Controller
{

    /**
     * Store a new documentation entry
     */
    public function store(Request $request, Assignment $assignment)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'address' => 'required|string|max:500',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        try {
            // Handle photo upload
            $photoPath = FileStorageService::storePublicOriginal(
                $request->file('photo'),
                'assignment-documentations',
                auth()->id()
            );

            // Create documentation entry with complete metadata
            $documentation = $assignment->assignmentDocumentations()->create([
                'photo' => $photoPath,
                'address' => $request->address,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                // Timestamps are automatically handled by Laravel's created_at field
            ]);

            return back()->with('success', 'Dokumentasi berhasil disimpan');

        } catch (\Exception $e) {       
            return back()->withErrors(['error' => 'Gagal menyimpan dokumentasi: ' . $e->getMessage()]);
        }
    }



    /**
     * Delete a documentation entry
     */
    public function destroy(Assignment $assignment, AssignmentDocumentation $assignmentDocumentation)
    {
        try {
            // Check if documentation belongs to the assignment
            if ($assignmentDocumentation->assignment_id !== $assignment->id) {
                return redirect()->back()->with('error', 'Dokumentasi tidak ditemukan pada penugasan ini');
            }

            // Check authorization - hanya user yang terlibat dalam assignment atau admin/superadmin yang bisa menghapus
            $isUserInAssignment = $assignment->users()->where('user_id', auth()->id())->exists();
            if (!$isUserInAssignment && !auth()->user()->hasAnyRole(['admin', 'superadmin'])) {
                return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk menghapus dokumentasi ini');
            }

            // Delete photo file
            if ($assignmentDocumentation->photo) {
                Storage::disk('public')->delete($assignmentDocumentation->photo);
            }

            $assignmentDocumentation->delete();

            return redirect()->back()->with('success', 'Dokumentasi berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menghapus dokumentasi');
        }
    }
}
