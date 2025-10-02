<?php

namespace App\Http\Requests\Reports;

use Illuminate\Foundation\Http\FormRequest;

class InCityRequest extends FormRequest
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
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            // Rules for update (PUT/PATCH)
            return [
                'daily_allowance' => 'required|numeric|min:0',
                'transportation_cost' => 'nullable|numeric|min:0',
                'vehicle_rental_fee' => 'nullable|numeric|min:0',
                'actual_expense' => 'nullable|numeric',
                // Receipt becomes optional for updates
                'transportation_receipt' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
                'vehicle_rental_receipt' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            ];
        }

        // Rules for create (POST)
        return [
            'daily_allowance' => 'required|numeric|min:0',
            'transportation_cost' => 'nullable|numeric|min:0',
            'vehicle_rental_fee' => 'nullable|numeric|min:0',
            'actual_expense' => 'nullable|numeric',
            // Receipt becomes required when corresponding cost is provided
            'transportation_receipt' => 'required_with:transportation_cost|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'vehicle_rental_receipt' => 'required_with:vehicle_rental_fee|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ];
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
                'transportation_receipt.file' => 'Bukti transport harus berupa file.',
                'vehicle_rental_receipt.file' => 'Bukti sewa kendaraan harus berupa file.',
            ];
        }

        // Messages for create - receipts are required_with
        return [
            'transportation_receipt.required_with' => 'Bukti transport wajib diisi jika biaya transport diisi.',
            'vehicle_rental_receipt.required_with' => 'Bukti sewa kendaraan wajib diisi jika sewa kendaraan diisi.',
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
            'daily_allowance' => 'uang harian',
            'transportation_cost' => 'biaya transport',
            'vehicle_rental_fee' => 'sewa kendaraan',
            'actual_expense' => 'pengeluaran riil',
            'transportation_receipt' => 'bukti transport',
            'vehicle_rental_receipt' => 'bukti sewa kendaraan',
        ];
    }
}
