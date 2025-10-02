<?php

namespace App\Http\Requests\Reports;

use Illuminate\Foundation\Http\FormRequest;

class OutCityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
   public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        $base = [
            'fullboard_price_id' => [
                'nullable',
                'integer',
                'exists:fullboard_prices,id',
                // minimal satu diisi: jika custom kosong, fullboard wajib
                'required_without:custom_daily_allowance',
                // jika custom DIISI (tidak null), maka fullboard harus null
                'prohibited_unless:custom_daily_allowance,null',
            ],
            'custom_daily_allowance' => [
                'nullable',
                'numeric',
                'min:0.01',
                // minimal satu diisi: jika fullboard kosong, custom wajib
                'required_without:fullboard_price_id',
                // jika fullboard DIISI (tidak null), maka custom harus null
                'prohibited_unless:fullboard_price_id,null',
            ],
            'origin_transport_cost' => 'nullable|numeric|min:0',
            'local_transport_cost' => 'nullable|numeric|min:0',
            'lodging_cost' => 'nullable|numeric|min:0',
            'destination_transport_cost' => 'nullable|numeric|min:0',
            'round_trip_ticket_cost' => 'nullable|numeric|min:0',
            'actual_expense' => 'nullable|numeric',
        ];

        if ($isUpdate) {
            // update: bukti tidak wajib
            return array_merge($base, [
                'origin_transport_receipt' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
                'local_transport_receipt' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
                'lodging_receipt' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
                'destination_transport_receipt' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
                'round_trip_ticket_receipt' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            ]);
        }

        // create: bukti wajib jika biaya diisi
        return array_merge($base, [
            'origin_transport_receipt' => 'required_with:origin_transport_cost|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'local_transport_receipt' => 'required_with:local_transport_cost|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'lodging_receipt' => 'required_with:lodging_cost|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'destination_transport_receipt' => 'required_with:destination_transport_cost|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'round_trip_ticket_receipt' => 'required_with:round_trip_ticket_cost|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);
    }
    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            // Messages for update - receipts are optional
            return [
                'origin_transport_receipt.file' => 'Bukti transport asal harus berupa file.',
                'local_transport_receipt.file' => 'Bukti transport lokal harus berupa file.',
                'lodging_receipt.file' => 'Bukti penginapan harus berupa file.',
                'destination_transport_receipt.file' => 'Bukti transport tujuan harus berupa file.',
                'round_trip_ticket_receipt.file' => 'Bukti tiket PP harus berupa file.',
            ];
        }

        // Messages for create - receipts are required_with
        return [
            'origin_transport_receipt.required_with' => 'Bukti transport asal wajib diisi jika biaya transport asal diisi.',
            'local_transport_receipt.required_with' => 'Bukti transport lokal wajib diisi jika biaya transport lokal diisi.',
            'lodging_receipt.required_with' => 'Bukti penginapan wajib diisi jika biaya penginapan diisi.',
            'destination_transport_receipt.required_with' => 'Bukti transport tujuan wajib diisi jika biaya transport tujuan diisi.',
            'round_trip_ticket_receipt.required_with' => 'Bukti tiket PP wajib diisi jika biaya tiket PP diisi.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     *
     * @return array
     */
    public function attributes(): array
    {
        return [
            'fullboard_price_id' => 'harga fullboard',
            'custom_daily_allowance' => 'uang harian custom',
            'origin_transport_cost' => 'biaya transport asal',
            'origin_transport_receipt' => 'bukti transport asal',
            'local_transport_cost' => 'biaya transport lokal',
            'local_transport_receipt' => 'bukti transport lokal',
            'lodging_cost' => 'biaya penginapan',
            'lodging_receipt' => 'bukti penginapan',
            'destination_transport_cost' => 'biaya transport tujuan',
            'destination_transport_receipt' => 'bukti transport tujuan',
            'round_trip_ticket_cost' => 'biaya tiket PP',
            'round_trip_ticket_receipt' => 'bukti tiket PP',
            'actual_expense' => 'pengeluaran riil',
        ];
    }
}
