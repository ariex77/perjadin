<?php

namespace App\Http\Requests\Masters;

use App\Enums\Gender;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Aturan validasi:
     * - nip, email, number_phone: unik DI DALAM role yang sama (berdasarkan irisannya)
     * - username: unik GLOBAL
     */
    public function rules(): array
    {
        /** @var \App\Models\User|null $routeUser */
        $routeUser = $this->route('user'); // model binding untuk update
        $userId    = $routeUser?->id;

        // Kalau update → pakai role existing dari user tsb; kalau create → pakai input 'roles'
        $roleNames = $routeUser
            ? $routeUser->roles->pluck('name')->toArray()
            : (array) $this->input('roles', []);

        /**
         * Closure validator: pastikan $field unik di antara user yang punya
         * minimal salah satu role pada $roleNames. Abaikan current user saat update.
         */
        $uniqueInSameRoles = function (string $field) use ($roleNames, $userId) {
            return function (string $attribute, $value, \Closure $fail) use ($field, $roleNames, $userId) {
                if (empty($roleNames)) {
                    return; // jika belum pilih role, lewati cek "unik per role"
                }

                $exists = User::query()
                    ->where($field, $value)
                    ->whereHas('roles', function ($q) use ($roleNames) {
                        $q->whereIn('name', $roleNames);
                    })
                    ->when($userId, fn ($q) => $q->where('id', '!=', $userId))
                    ->exists();

                if ($exists) {
                    $fail('Kolom :attribute sudah terdaftar untuk pengguna dengan role yang sama.');
                }
            };
        };

        // ===== UPDATE (PUT/PATCH) =====
        if ($this->isMethod('put') || $this->isMethod('patch')) {
            return [
                'name'          => ['required','string','max:100'],
                'nip'           => ['required','numeric','digits:18', $uniqueInSameRoles('nip')],
                'number_phone'  => ['required','numeric','digits_between:10,13', $uniqueInSameRoles('number_phone')],
                'username'      => ['required','string','max:50', Rule::unique('users','username')->ignore($userId)], // unik global
                'email'         => ['required','email','max:100', $uniqueInSameRoles('email')],
                'level'         => ['required','string','max:100'], // jika field ini masih dipakai di form kamu
                'gender'        => ['nullable','string','in:'.implode(',', array_column(Gender::cases(), 'value'))],
                'work_unit_id'  => ['required','exists:work_units,id'],
                'photo'         => ['nullable','image','max:2048'],
                'address'       => ['nullable','string','max:255'],
                'city'          => ['nullable','string','max:100','regex:/^[a-zA-Z\s]+$/'],
                'province'      => ['nullable','string','max:100','regex:/^[a-zA-Z\s]+$/'],
                'roles'         => ['required','array','min:1'],
                'roles.*'       => ['string','exists:roles,name','not_in:superadmin,admin'],
                'password'      => ['nullable','string','min:8','confirmed'],
            ];
        }

        // ===== STORE (POST) =====
        return [
            'name'          => ['required','string','max:100'],
            'nip'           => ['required','numeric','digits:18', $uniqueInSameRoles('nip')],
            'number_phone'  => ['required','numeric','digits_between:10,13', $uniqueInSameRoles('number_phone')],
            'username'      => ['required','string','max:50', Rule::unique('users','username')], // unik global
            'email'         => ['required','email','max:100', $uniqueInSameRoles('email')],
            'level'         => ['required','string','max:100'], // jika masih digunakan
            'gender'        => ['nullable','string','in:'.implode(',', array_column(Gender::cases(), 'value'))],
            'work_unit_id'  => ['required','exists:work_units,id'],
            'photo'         => ['nullable','image','max:2048'],
            'address'       => ['nullable','string','max:255'],
            'city'          => ['nullable','string','max:100','regex:/^[a-zA-Z\s]+$/'],
            'province'      => ['nullable','string','max:100','regex:/^[a-zA-Z\s]+$/'],
            'roles'         => ['required','array','min:1'],
            'roles.*'       => ['string','exists:roles,name','not_in:superadmin,admin'],
            'password'      => ['required','string','min:8','confirmed'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name'          => 'nama',
            'nip'           => 'NIP',
            'number_phone'  => 'nomor telepon',
            'username'      => 'username',
            'email'         => 'email',
            'level'         => 'level',
            'gender'        => 'gender',
            'work_unit_id'  => 'unit kerja',
            'photo'         => 'foto',
            'password'      => 'password',
            'roles'         => 'role',
            'address'       => 'alamat',
            'city'          => 'kota',
            'province'      => 'provinsi',
        ];
    }

    public function messages(): array
    {
        return [
            'city.regex'     => 'Kota hanya boleh berisi huruf dan spasi.',
            'province.regex' => 'Provinsi hanya boleh berisi huruf dan spasi.',
        ];
    }
}
