<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use App\Enums\Gender;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();
        
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($user->id),
            ],
            'username' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique(User::class)->ignore($user->id),
            ],
            'nip' => [
                'required',
                'string',
                'max:255',
                Rule::unique(User::class)->ignore($user->id),
            ],
            'number_phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique(User::class)->ignore($user->id),
            ],
            'level' => ['required', 'string', 'max:255'],
            'gender' => ['required', Rule::in(array_column(Gender::cases(), 'value'))],
            'photo' => [
                'nullable',
                File::image()
                    ->max(2048) // 2MB max
                    ->types(['jpeg', 'jpg', 'png', 'webp'])
            ],
            // Address fields
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:255'],
        ];
    }
}
