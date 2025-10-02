<?php

namespace App\Http\Resources\Assignments;

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
        return [
            'id' => $this->id,
            'purpose' => $this->purpose,
            'destination' => $this->destination,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'status' => $this->status,
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'users' => $this->whenLoaded('users', function () {
                return $this->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'photo' => $user->photo,
                        'work_unit' => $user->workUnit?->name,
                    ];
                });
            }),
            'user_ids' => $this->whenLoaded('users', function () {
                return $this->users->pluck('id')->toArray();
            }),
            'users_count' => $this->whenLoaded('users', function () {
                return $this->users->count();
            }),
            'reports' => $this->whenLoaded('reports', function () {
                return $this->reports->map(function ($report) {
                    return [
                        'id' => $report->id,
                        'user_id' => $report->user_id,
                        'travel_type' => $report->travel_type?->value ?? $report->travel_type,
                        'travel_order_number' => $report->travel_order_number,
                        'destination_city' => $report->destination_city,
                        'status' => $report->status?->value ?? $report->status,
                        'created_at' => $report->created_at?->format('Y-m-d H:i:s'),
                        'in_city_reports' => $report->relationLoaded('inCityReport') ? ($report->inCityReport ? [['id' => $report->inCityReport->id]] : []) : [],
                        'out_city_reports' => $report->relationLoaded('outCityReport') ? ($report->outCityReport ? [['id' => $report->outCityReport->id]] : []) : [],
                        'out_country_reports' => $report->relationLoaded('outCountyReport') ? ($report->outCountyReport ? [['id' => $report->outCountyReport->id]] : []) : [],
                        'travel_reports' => $report->relationLoaded('travelReport') ? ($report->travelReport ? [['id' => $report->travelReport->id]] : []) : [],
                    ];
                });
            }),
            'assignment_documentations' => $this->whenLoaded('assignmentDocumentations', function () {
                return $this->assignmentDocumentations->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'photo' => $doc->photo,
                        'created_at' => $doc->created_at?->format('Y-m-d H:i:s'),
                    ];
                });
            }),
            'reports_count' => $this->whenLoaded('reports', function () {
                return $this->reports->count();
            }),
            'has_reports' => $this->whenLoaded('reports', function () {
                return $this->reports->count() > 0;
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
