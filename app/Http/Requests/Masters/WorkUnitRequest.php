<?php

namespace App\Http\Requests\Masters;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WorkUnitRequest extends FormRequest
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
        $workUnitId = $this->route('work_unit');

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            return [
                'name' => 'required|string|max:255',
                'code' => [
                    'required',
                    'numeric',
                    Rule::unique('work_units', 'code')->ignore($workUnitId),
                ],
                'description' => 'nullable|string|max:255',
                'head_id' => [
                    'nullable',
                    'integer',
                    'exists:users,id',
                    Rule::unique('work_units', 'head_id')->ignore($workUnitId),
                ],
            ];
        }

        return [
            'name' => 'required|string|max:255',
            'code' => 'required|numeric|unique:work_units,code',
            'description' => 'nullable|string|max:255',
            'head_id' => 'nullable|integer|exists:users,id|unique:work_units,head_id',
        ];
    }
}
