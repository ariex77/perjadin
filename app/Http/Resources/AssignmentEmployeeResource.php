<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssignmentEmployeeResource extends JsonResource
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
            'assignment_id' => $this->assignment_id,
            'user_id' => $this->user_id,
            'assignment' => $this->whenLoaded('assignment', function () {
                return [
                    'id' => $this->assignment->id,
                    'purpose' => $this->assignment->purpose,
                    'destination' => $this->assignment->destination,
                    'start_date' => $this->assignment->start_date?->format('Y-m-d'),
                    'end_date' => $this->assignment->end_date?->format('Y-m-d'),
                    'status' => $this->assignment->status,
                ];
            }),
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                    'photo' => $this->user->photo,
                    'work_unit' => $this->user->workUnit?->name,
                ];
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
