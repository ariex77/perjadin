<?php

namespace App\Http\Resources\Reports;

use App\Helpers\FileHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssignmentResource extends JsonResource
{

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'purpose' => $this->purpose,
            'destination' => $this->destination,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];

        // Add users if loaded
        if ($this->relationLoaded('users')) {
            $data['users'] = $this->users->map(function ($user) {
                $userData = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'photo' => FileHelper::getUserPhotoUrl($user->photo),
                ];
                
                if ($user->relationLoaded('workUnit')) {
                    $userData['work_unit'] = $user->workUnit?->name;
                }
                
                return $userData;
            });
        }

        // Add report if loaded
        if ($this->relationLoaded('reports') && $this->reports->isNotEmpty()) {
            $report = $this->reports->first();
            $data['report'] = [
                'id' => $report->id,
                'user_id' => $report->user_id,
                'created_at' => $report->created_at?->format('Y-m-d H:i:s'),
            ];
            
            if ($report->relationLoaded('reviews')) {
                $data['report']['reviews'] = $report->reviews->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'status' => $review->status,
                        'reviewer_type' => $review->reviewer_type,
                        'created_at' => $review->created_at?->format('Y-m-d H:i:s'),
                        'notes' => $review->notes,
                    ];
                });
            }
        }

        // Add helper properties if relations are loaded
        if ($this->relationLoaded('users')) {
            $data['total_users'] = $this->users->count();
        }
        
        if ($this->relationLoaded('reports')) {
            $data['has_report'] = $this->reports->isNotEmpty();
        }
        
        if ($this->relationLoaded('users') && $this->relationLoaded('reports')) {
            $totalUsers = $this->users->count();
            $hasReport = $this->reports->isNotEmpty();
            
            // Status completion (active/completed)
            $data['completion_status'] = $totalUsers === 0 ? 'no_users' : 
                ($hasReport ? 'completed' : 'active');
            
            $data['completion_percentage'] = $totalUsers === 0 ? 0 : 
                ($hasReport ? 100 : 0);
            
            // Review status untuk tabs (ditinjau/ditolak/disetujui)
            $data['review_status'] = 'ditinjau'; // default
            
            if ($hasReport) {
                $report = $this->reports->first();
                if ($report->relationLoaded('reviews') && $report->reviews->count() > 0) {
                    $hasRejected = $report->reviews->contains('status', 'rejected');
                    $approvedCount = $report->reviews->where('status', 'approved')->count();
                    
                    if ($hasRejected) {
                        $data['review_status'] = 'ditolak';
                    } elseif ($approvedCount >= 2) { // PPK + Pimpinan = 2 reviewer
                        $data['review_status'] = 'disetujui';
                    }
                    // Jika belum 2 approved dan tidak ada rejected = tetap 'ditinjau'
                }
            }
        }

        return $data;
    }
}
