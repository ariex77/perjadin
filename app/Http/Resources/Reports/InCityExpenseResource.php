<?php

namespace App\Http\Resources\Reports;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;
use App\Helpers\FileHelper;

class InCityExpenseResource extends JsonResource
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
            'report_id' => $this->report_id,
            'daily_allowance' => $this->daily_allowance ? (float) $this->daily_allowance : null,
            'transportation_cost' => $this->transportation_cost ? (float) $this->transportation_cost : null,
            'vehicle_rental_fee' => $this->vehicle_rental_fee ? (float) $this->vehicle_rental_fee : null,
            'actual_expense' => $this->actual_expense ? (float) $this->actual_expense : null,
            'transportation_receipt' => FileHelper::getFileUrl($this->transportation_receipt),
            'vehicle_rental_receipt' => FileHelper::getFileUrl($this->vehicle_rental_receipt),
            'created_at' => $this->created_at ? Carbon::parse($this->created_at)->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? Carbon::parse($this->updated_at)->format('Y-m-d H:i:s') : null,
        ];
    }
}
