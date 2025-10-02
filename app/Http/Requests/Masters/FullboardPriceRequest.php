<?php

namespace App\Http\Requests\Masters;

use Illuminate\Foundation\Http\FormRequest;

class FullboardPriceRequest extends FormRequest
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
        $fullboardPriceId = $this->route('fullboard_price')?->id;

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            return [
                'province_name' => 'required|string|max:255|regex:/^[a-zA-Z\s]+$/|unique:fullboard_prices,province_name,' . $fullboardPriceId,
                'price' => 'required|numeric|min:0',
            ];
        }

        return [
            'province_name' => 'required|string|max:255|regex:/^[a-zA-Z\s]+$/|unique:fullboard_prices,province_name',
            'price' => 'required|numeric|min:0',
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
            'province_name' => 'nama provinsi',
            'price' => 'harga',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'province_name.regex' => 'Nama provinsi hanya boleh berisi huruf dan spasi.',
        ];
    }
}