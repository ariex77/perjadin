<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Services\FileStorageService;
use App\Helpers\FileHelper;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $user->load(['workUnit', 'address', 'roles']);

        return Inertia::render('settings/profile', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'nip' => $user->nip,
                'number_phone' => $user->number_phone,
                'level' => $user->level,
                'gender' => $user->gender,
                'work_unit_id' => $user->work_unit_id,
                'photo' => FileHelper::getUserPhotoUrl($user->photo),
                'roles' => $user->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name
                ])->toArray(),
                'address' => $user->address ? [
                    'id' => $user->address->id,
                    'address' => $user->address->address,
                    'city' => $user->address->city,
                    'province' => $user->address->province,
                ] : null,
                'workUnit' => $user->workUnit ? [
                    'id' => $user->workUnit->id,
                    'name' => $user->workUnit->name,
                ] : null,
            ],
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            FileStorageService::deletePublicIfExists($user->photo);

            $imagePath = FileStorageService::storePublicOriginal(
                $request->file('photo'),
                'images/employees',
                $user->id,
                'user'
            );
            $user->photo = $imagePath;
        }

        // Update user data (excluding photo which is handled separately)
        $userFields = collect($validated)->except('photo')->toArray();
        $user->fill($userFields);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // Handle address for all users
        $addressData = [
            'address' => $validated['address'] ?? '',
            'city' => $validated['city'] ?? '',
            'province' => $validated['province'] ?? '',
        ];

        if ($user->address) {
            $user->address->update($addressData);
        } else {
            $user->address()->create($addressData);
        }

        return to_route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    // public function destroy(Request $request): RedirectResponse
    // {
    //     $request->validate([
    //         'password' => ['required', 'current_password'],
    //     ]);

    //     $user = $request->user();

    //     Auth::logout();

    //     $user->delete();

    //     $request->session()->invalidate();
    //     $request->session()->regenerateToken();

    //     return redirect('/');
    // }
}
