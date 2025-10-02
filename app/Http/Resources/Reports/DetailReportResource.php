<?php

namespace App\Http\Resources\Reports;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Reports\InCityExpenseResource;
use App\Http\Resources\Reports\OutCityExpenseResource;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use App\Helpers\FileHelper;
use App\Enums\ReviewStatus as ReviewStatusEnum;

class DetailReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $travelOrderUrl = $this->travel_order_file ? Storage::url($this->travel_order_file) : null;
        $spdFileUrl = $this->spd_file ? Storage::url($this->spd_file) : null;

        $departureDate = $this->departure_date ? Carbon::parse($this->departure_date)->format('Y-m-d') : null;
        $returnDate = $this->return_date ? Carbon::parse($this->return_date)->format('Y-m-d') : null;
        $reportCreatedAt = $this->created_at ? Carbon::parse($this->created_at)->format('Y-m-d H:i:s') : null;

        // Cari waktu review terakhir (approve/reject)
        $lastReviewAt = null;
        if ($this->reviews && $this->reviews->count() > 0) {
            $lastReview = $this->reviews
                ->filter(function ($review) {
                    return in_array($review->status, [ReviewStatusEnum::APPROVED, ReviewStatusEnum::REJECTED], true)
                        || in_array(($review->status?->value) ?? null, [ReviewStatusEnum::APPROVED->value, ReviewStatusEnum::REJECTED->value], true);
                })
                ->sortByDesc('created_at')
                ->first();
            $lastReviewAt = $lastReview?->created_at;
        }

        // can_resubmit: hanya relevan saat status rejected dan ada perubahan setelah penolakan
        $canResubmit = false;
        if ($this->status && (($this->status === 'rejected') || ($this->status->value ?? null) === 'rejected' || $this->status->value === 'rejected')) {
            $canResubmit = $this->hasChangesAfter($lastReviewAt);
        }

        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'travel_type' => $this->travel_type,
            'travel_order_number' => $this->travel_order_number,
            'destination_city' => $this->destination_city,
            'departure_date' => $departureDate,
            'return_date' => $returnDate,
            'actual_duration' => (int) ($this->actual_duration ?? 0),
            'travel_purpose' => $this->travel_purpose,
            'travel_order_file' => Storage::url($this->travel_order_file),
            'spd_file' => Storage::url($this->spd_file),
            'travel_order_file_url' => $travelOrderUrl,
            'spd_file_url' => $spdFileUrl,
            'created_at' => $reportCreatedAt,
            'can_resubmit' => $canResubmit,

            'user' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'photo' => $this->user?->photo,
                'workUnit' => $this->user?->workUnit ? [
                    'id' => $this->user->workUnit->id,
                    'name' => $this->user->workUnit->name,
                    'head' => $this->user->workUnit->head ? [
                        'id' => $this->user->workUnit->head->id,
                        'name' => $this->user->workUnit->head->name,
                        ] : null,

                ] : null,
            ],

            'assignment' => $this->assignment ? [
                'id' => $this->assignment->id,
                'purpose' => $this->assignment->purpose,
                'destination' => $this->assignment->destination,
                'start_date' => $this->assignment->start_date ? Carbon::parse($this->assignment->start_date)->format('Y-m-d') : null,
                'end_date' => $this->assignment->end_date ? Carbon::parse($this->assignment->end_date)->format('Y-m-d') : null,
            ] : null,

            'reviews' => $this->reviews?->map(function ($review) {
                return [
                    'id' => $review->id,
                    'reviewer_type' => $review->reviewer_type,
                    'status' => $review->status,
                    'notes' => $review->notes,
                    'created_at' => $review->created_at ? $review->created_at->format('Y-m-d H:i:s') : null,
                ];
            })->values()->toArray() ?? [],

            'assignmentDocumentations' => $this->assignment?->assignmentDocumentations?->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'photo' => $doc->photo ? Storage::url($doc->photo) : null,
                    'photo_path' => $doc->photo,
                    'address' => $doc->address,
                    'latitude' => (float) $doc->latitude,
                    'longitude' => (float) $doc->longitude,
                    'created_at' => $doc->created_at ? Carbon::parse($doc->created_at)->format('Y-m-d H:i:s') : null,
                ];
            })->values()->toArray() ?? [],
            'in_city_expense' => $this->inCityReport ? new InCityExpenseResource($this->inCityReport) : null,
            'out_city_expense' => $this->outCityReport ? new OutCityExpenseResource($this->outCityReport) : null,
            'travel_report' => $this->travelReport ? [
                'id' => $this->travelReport->id,
                'report_id' => $this->travelReport->report_id,
                'title' => $this->travelReport->title,
                'background' => $this->travelReport->background,
                'purpose_and_objectives' => $this->travelReport->purpose_and_objectives,
                'scope' => $this->travelReport->scope,
                'legal_basis' => $this->travelReport->legal_basis,
                'activities_conducted' => $this->travelReport->activities_conducted,
                'achievements' => $this->travelReport->achievements,
                'conclusions' => $this->travelReport->conclusions,
                'created_at' => $this->travelReport->created_at ? Carbon::parse($this->travelReport->created_at)->format('Y-m-d H:i:s') : null,
                'updated_at' => $this->travelReport->updated_at ? Carbon::parse($this->travelReport->updated_at)->format('Y-m-d H:i:s') : null,
            ] : null,

            'transportation_types' => $this->transportationTypes?->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'label' => $type->label,
                ];
            })->values()->toArray() ?? [],

        ];
    }
}


