<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileStorageService
{
    /**
     * Store file to public disk using a consistent naming scheme:
     * "<original-name-sanitized>-<userId>-<YmdHis>.<ext>"
     * Returns the relative path (directory/filename).
     */
    public static function storePublicOriginal(UploadedFile $file, string $directory, int $userId, ?string $baseNameOverride = null): string
    {
        $originalName = $baseNameOverride ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $safeBase = Str::slug($originalName);
        $filename = $safeBase . '-' . $userId . '-' . now()->format('YmdHis') . '.' . $extension;
        Storage::disk('public')->putFileAs($directory, $file, $filename);
        return trim($directory, '/') . '/' . $filename;
    }

    /** Delete a file from public disk if present */
    public static function deletePublicIfExists(?string $path): void
    {
        if (!$path) {
            return;
        }
        Storage::disk('public')->delete($path);
    }
}


