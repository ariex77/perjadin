<?php

namespace App\Http\Requests\Reports;

use Illuminate\Foundation\Http\FormRequest;

class TravelReportRequest extends FormRequest
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
        return [
            'title' => 'required|string|min:10|max:255',
            'background' => 'required|string|max:65535',
            'purpose_and_objectives' => 'required|string|max:65535',
            'scope' => 'required|string|max:65535',
            'legal_basis' => 'required|string|max:65535',
            'activities_conducted' => 'required|string|max:65535',
            'achievements' => 'required|string|max:65535',
            'conclusions' => 'required|string|max:65535',
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
            'title' => 'judul',
            'background' => 'latar belakang',
            'purpose_and_objectives' => 'maksud dan tujuan',
            'scope' => 'ruang lingkup',
            'legal_basis' => 'dasar pelaksanaan',
            'activities_conducted' => 'kegiatan yang dilaksanakan',
            'achievements' => 'hasil yang dicapai',
            'conclusions' => 'kesimpulan dan saran',
        ];
    }
}