<?php

namespace App\Http\Resources\Masters;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FullboardPriceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'province_name' => $this->province_name,
            'price' => $this->price,
            'created_at' => $this->created_at,
        ];
    }
}
