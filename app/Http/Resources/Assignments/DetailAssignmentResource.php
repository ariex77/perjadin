<?php

namespace App\Http\Resources\Assignments;

use Illuminate\Http\Request;
use App\Helpers\FileHelper;
use Illuminate\Http\Resources\Json\JsonResource;

class DetailAssignmentResource extends JsonResource
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
                        'email' => $user->email,
                        'workUnit' => $user->workUnit ? [
                            'id' => $user->workUnit->id,
                            'name' => $user->workUnit->name,
                            'head' => $user->workUnit->head ? [
                                'id' => $user->workUnit->head->id,
                                'name' => $user->workUnit->head->name,
                            ] : null,
                        ] : null,
                    ];
                });
            }),
            'reports' => $this->whenLoaded('reports', function () {
                return $this->reports->map(function ($report) {
                    return [
                        'id' => $report->id,
                        'user_id' => $report->user_id,
                        'user_name' => $report->user?->name,
                        'created_at' => $report->created_at?->format('Y-m-d H:i:s'),
                        'travel_type' => $report->travel_type?->value,
                        'travel_order_number' => $report->travel_order_number,
                        'destination_city' => $report->destination_city,
                        'status' => $report->status?->value ?? $report->status,
                        'has_travel_order' => !empty($report->travel_order_number),
                        'in_city_report' => (bool) $report->inCityReport,
                        'out_city_report' => (bool) $report->outCityReport,
                        'out_country_report' => (bool) $report->outCountyReport,
                        'travel_report' => (bool) $report->travelReport,
                    ];
                });
            }),
            'current_user_report' => $this->whenLoaded('reports', function () {
                $userReport = $this->reports->where('user_id', auth()->id())->first();
                if (!$userReport) {
                    return null;
                }
                return [
                    'id' => $userReport->id,
                    'user_id' => $userReport->user_id,
                    'user_name' => $userReport->user?->name,
                    'created_at' => $userReport->created_at?->format('Y-m-d H:i:s'),
                    'travel_type' => $userReport->travel_type?->value,
                    'travel_order_number' => $userReport->travel_order_number,
                    'destination_city' => $userReport->destination_city,
                    'status' => $userReport->status?->value ?? $userReport->status,
                    'has_travel_order' => !empty($userReport->travel_order_number),
                    'in_city_report' => (bool) $userReport->inCityReport,
                    'out_city_report' => (bool) $userReport->outCityReport,
                    'out_country_report' => (bool) $userReport->outCountyReport,
                    'travel_report' => (bool) $userReport->travelReport,
                ];
            }),
            'assignmentDocumentations' => $this->whenLoaded('assignmentDocumentations', function () {
                return $this->assignmentDocumentations->map(function ($documentation) {
                    return [
                        'id' => $documentation->id,
                        'photo' => FileHelper::getUserPhotoUrl($documentation->photo) ?? 'https://api.dicebear.com/9.x/initials/svg?seed=' . str_replace(' ', '-', $documentation->name),
                        'address' => $documentation->address,
                        'latitude' => $documentation->latitude,
                        'longitude' => $documentation->longitude,
                        'created_at' => $documentation->created_at?->format('Y-m-d H:i:s'),
                    ];
                });
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
