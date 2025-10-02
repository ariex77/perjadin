<?php

namespace App\Http\Resources\Reports;

use App\Helpers\FileHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'assignment_id' => $this->assignment_id,
            'travel_type' => $this->travel_type->value,
            'status' => $this->status->value,
            // Informasi Surat Tugas
            'travel_order_number' => $this->travel_order_number,
            'destination_city' => $this->destination_city,
            'departure_date' => $this->departure_date?->format('Y-m-d'),
            'return_date' => $this->return_date?->format('Y-m-d'),
            'actual_duration' => (int) ($this->actual_duration ?? 0),
            'travel_purpose' => $this->travel_purpose,
            'travel_order_file' => $this->travel_order_file,
            'spd_file' => $this->spd_file,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'photo' => FileHelper::getUserPhotoUrl($this->user->photo),
                    'workUnit' => $this->user->workUnit ? [
                        'id' => $this->user->workUnit->id,
                        'name' => $this->user->workUnit->name,
                    ] : null,
                ];
            }),
            
            'assignment' => $this->whenLoaded('assignment', function () {
                return [
                    'id' => $this->assignment->id,
                    'purpose' => $this->assignment->purpose,
                    'destination' => $this->assignment->destination,
                    'start_date' => $this->assignment->start_date?->format('Y-m-d'),
                    'end_date' => $this->assignment->end_date?->format('Y-m-d'),
                ];
            }),
            
            'reviews' => $this->whenLoaded('reviews', function () {
                return $this->reviews->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'status' => $review->status,
                        'reviewer_type' => $review->reviewer_type,
                        'notes' => $review->notes,
                        'created_at' => $review->created_at?->format('Y-m-d H:i:s'),
                    ];
                });
            }),
            
            'transportation_types' => $this->whenLoaded('transportationTypes', function () {
                return $this->transportationTypes->map(function ($type) {
                    return [
                        'id' => $type->id,
                        'name' => $type->name,
                        'label' => $type->label,
                    ];
                });
            }),
            
            // Helper properties
            'has_reviews' => $this->whenLoaded('reviews', function () {
                return $this->reviews->count() > 0;
            }),
            
            'review_status' => $this->whenLoaded('reviews', function () {
                if ($this->reviews->count() === 0) {
                    return 'pending';
                }
                
                $approvedCount = $this->reviews->where('status', 'approved')->count();
                $rejectedCount = $this->reviews->where('status', 'rejected')->count();
                
                if ($rejectedCount > 0) {
                    return 'rejected';
                }
                
                if ($approvedCount >= 2) {
                    return 'approved';
                }
                
                return 'reviewing';
            }),
        ];
    }
}
