<?php

namespace App\Http\Resources\Reports;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;
use App\Helpers\FileHelper;

class OutCityExpenseResource extends JsonResource
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
            'fullboard_price_id' => $this->fullboard_price_id,
            'fullboard_price' => $this->whenLoaded('fullboardPrice', function () {
                return [
                    'id' => $this->fullboardPrice->id,
                    'province_name' => $this->fullboardPrice->province_name,
                    'price' => (float) $this->fullboardPrice->price,
                ];
            }),
            'origin_transport_cost' => $this->origin_transport_cost ? (float) $this->origin_transport_cost : null,
            'custom_daily_allowance' => $this->custom_daily_allowance ? (float) $this->custom_daily_allowance : null,
            'origin_transport_receipt' => FileHelper::getFileUrl($this->origin_transport_receipt),
            'local_transport_cost' => $this->local_transport_cost ? (float) $this->local_transport_cost : null,
            'local_transport_receipt' => FileHelper::getFileUrl($this->local_transport_receipt),
            'lodging_cost' => $this->lodging_cost ? (float) $this->lodging_cost : null,
            'lodging_receipt' => FileHelper::getFileUrl($this->lodging_receipt),
            'destination_transport_cost' => $this->destination_transport_cost ? (float) $this->destination_transport_cost : null,
            'destination_transport_receipt' => FileHelper::getFileUrl($this->destination_transport_receipt),
            'round_trip_ticket_cost' => $this->round_trip_ticket_cost ? (float) $this->round_trip_ticket_cost : null,
            'round_trip_ticket_receipt' => FileHelper::getFileUrl($this->round_trip_ticket_receipt),
            'actual_expense' => $this->actual_expense ? (float) $this->actual_expense : null,
            'created_at' => $this->created_at ? Carbon::parse($this->created_at)->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? Carbon::parse($this->updated_at)->format('Y-m-d H:i:s') : null,
        ];
    }
}
