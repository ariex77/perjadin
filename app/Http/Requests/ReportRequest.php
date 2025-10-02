<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportRequest extends FormRequest
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
            return [
                'travel_type' => 'required|in:in_city,out_city,out_country',
                'transportation_type_ids' => 'required|array|min:1',
                'transportation_type_ids.*' => 'exists:transportation_types,id',
                'travel_order_number' => 'required|string|max:255',
                'actual_duration' => 'required|integer',
                'travel_order_file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048',
                'spd_file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048',
            ];
        }
        
        return [
            'assignment_id' => 'required|exists:assignments,id',
            'travel_type' => 'required|in:in_city,out_city,out_country',
            'transportation_type_ids' => 'required|array|min:1',
            'transportation_type_ids.*' => 'exists:transportation_types,id',
            'travel_order_number' => 'required|string|max:255',
            'actual_duration' => 'required|integer',
            'travel_order_file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048',
            'spd_file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048',
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
            'assignment_id' => 'ID penugasan',
            'travel_type' => 'tipe perjalanan',
            'transportation_type_ids' => 'jenis transportasi',
            'travel_order_number' => 'nomor surat tugas',
            'actual_duration' => 'durasi asli perjalanan',
            'travel_order_file' => 'file surat tugas',
            'spd_file' => 'file SPD',
        ];
    }
}
