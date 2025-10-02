<?php

namespace App\Http\Resources\Masters;

use App\Helpers\FileHelper;
use App\Enums\Gender;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class DetailEmployeeResource extends JsonResource
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
            'name' => $this->name ?? null,
            'email' => $this->email ?? null,
            'nip' => $this->nip ?? null,
            'number_phone' => $this->number_phone ?? null,
            'username' => $this->username ?? null,
            'level' => $this->level ?? null,
            'gender' => $this->gender ? Gender::from($this->gender)->getLabel() : null,
            'work_unit_id' => $this->work_unit_id ?? null,
            'workUnit' => [
                'id' => $this->workUnit?->id ?? null,
                'name' => $this->workUnit?->name ?? null,
            ],
            'roles' => $this->roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                ];
            }),
            'address' => $this->address ? [
                'id' => $this->address->id,
                'address' => $this->address->address,
                'city' => $this->address->city,
                'province' => $this->address->province,
            ] : null,
            'photo' => FileHelper::getUserPhotoUrl($this->photo) ?? 'https://api.dicebear.com/9.x/initials/svg?seed=' . str_replace(' ', '-', $this->name),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
