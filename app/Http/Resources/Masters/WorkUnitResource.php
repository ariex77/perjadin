<?php

namespace App\Http\Resources\Masters;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkUnitResource extends JsonResource
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
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'head_id' => $this->head_id,
            'head_name' => optional($this->whenLoaded('head'))->name,
            'created_at' => $this->created_at,
        ];
    }
}
