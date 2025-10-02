<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class FileHelper
{
    /**
     * Mendapatkan URL lengkap untuk file yang disimpan di storage
     * 
     * @param string|null $path Path file relatif dari storage
     * @param string|null $fallback Fallback URL jika file tidak ada
     * @return string|null URL lengkap untuk file atau null
     */
    public static function getFileUrl(?string $path, ?string $fallback = null): ?string
    {
        if (!$path) {
            return $fallback;
        }

        // Jika sudah URL lengkap, return langsung
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        // Cek apakah file ada di storage
        if (!Storage::disk('public')->exists($path)) {
            return $fallback;
        }

        // Return URL lengkap
        return Storage::url($path);
    }

    /**
     * Mendapatkan URL untuk foto user dengan fallback
     * 
     * @param string|null $photoPath Path foto user
     * @return string|null URL foto atau null
     */
    public static function getUserPhotoUrl(?string $photoPath): ?string
    {
        return self::getFileUrl($photoPath);
    }

    /**
     * Mendapatkan URL untuk file laporan dengan fallback
     * 
     * @param string|null $filePath Path file laporan
     * @return string|null URL file atau null
     */
    public static function getReportFileUrl(?string $filePath): ?string
    {
        return self::getFileUrl($filePath);
    }

    /**
     * Cek apakah file ada berdasarkan path
     * 
     * @param string|null $path Path file
     * @return bool
     */
    public static function fileExists(?string $path): bool
    {
        if (!$path) {
            return false;
        }

        return Storage::disk('public')->exists($path);
    }

    /**
     * Mendapatkan nama file dari path
     * 
     * @param string|null $path Path file
     * @return string|null Nama file atau null
     */
    public static function getFileName(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        // Hapus query parameters jika ada
        $cleanPath = explode('?', $path)[0];
        
        // Ambil nama file dari path
        return basename($cleanPath);
    }

    /**
     * Mendapatkan ekstensi file
     * 
     * @param string|null $path Path file
     * @return string|null Ekstensi file atau null
     */
    public static function getFileExtension(?string $path): ?string
    {
        $fileName = self::getFileName($path);
        if (!$fileName) {
            return null;
        }

        $extension = pathinfo($fileName, PATHINFO_EXTENSION);
        return $extension ? strtolower($extension) : null;
    }

    /**
     * Cek apakah file adalah gambar
     * 
     * @param string|null $path Path file
     * @return bool
     */
    public static function isImageFile(?string $path): bool
    {
        $extension = self::getFileExtension($path);
        if (!$extension) {
            return false;
        }

        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        return in_array($extension, $imageExtensions);
    }

    /**
     * Cek apakah file adalah PDF
     * 
     * @param string|null $path Path file
     * @return bool
     */
    public static function isPdfFile(?string $path): bool
    {
        $extension = self::getFileExtension($path);
        return $extension === 'pdf';
    }

    /**
     * Format ukuran file dalam bytes ke format yang mudah dibaca
     * 
     * @param int $bytes Ukuran file dalam bytes
     * @return string Format ukuran file
     */
    public static function formatFileSize(int $bytes): string
    {
        if ($bytes === 0) {
            return '0 Bytes';
        }

        $k = 1024;
        $sizes = ['Bytes', 'KB', 'MB', 'GB'];
        $i = floor(log($bytes) / log($k));

        return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
    }
}
