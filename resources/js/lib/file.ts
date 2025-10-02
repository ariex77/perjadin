/**
 * Utility functions untuk menangani file URLs dan storage
 */

/**
 * Mendapatkan URL lengkap untuk file yang disimpan di storage
 * @param path - Path file relatif dari storage
 * @param fallback - Fallback URL jika file tidak ada
 * @returns URL lengkap untuk file
 */
export function getFileUrl(path: string | null | undefined, fallback?: string): string | null {
  if (!path) return fallback || null;
  
  // Jika sudah URL lengkap, return langsung
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Jika path relatif, tambahkan base URL
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${baseUrl}/storage/${path}`;
}

/**
 * Mendapatkan URL untuk foto user dengan fallback
 * @param photoPath - Path foto user
 * @returns URL foto atau null
 */
export function getUserPhotoUrl(photoPath: string | null | undefined): string | null {
  return getFileUrl(photoPath);
}

/**
 * Mendapatkan URL untuk file laporan dengan fallback
 * @param filePath - Path file laporan
 * @returns URL file atau null
 */
export function getReportFileUrl(filePath: string | null | undefined): string | null {
  return getFileUrl(filePath);
}

/**
 * Cek apakah file ada berdasarkan path
 * @param path - Path file
 * @returns Promise<boolean>
 */
export async function fileExists(path: string | null | undefined): Promise<boolean> {
  if (!path) return false;
  
  try {
    const url = getFileUrl(path);
    if (!url) return false;
    
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Mendapatkan nama file dari path
 * @param path - Path file
 * @returns Nama file atau null
 */
export function getFileName(path: string | null | undefined): string | null {
  if (!path) return null;
  
  // Hapus query parameters jika ada
  const cleanPath = path.split('?')[0];
  
  // Ambil nama file dari path
  const fileName = cleanPath.split('/').pop();
  return fileName || null;
}

/**
 * Mendapatkan ekstensi file
 * @param path - Path file
 * @returns Ekstensi file atau null
 */
export function getFileExtension(path: string | null | undefined): string | null {
  const fileName = getFileName(path);
  if (!fileName) return null;
  
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || null : null;
}

/**
 * Cek apakah file adalah gambar
 * @param path - Path file
 * @returns boolean
 */
export function isImageFile(path: string | null | undefined): boolean {
  const extension = getFileExtension(path);
  if (!extension) return false;
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return imageExtensions.includes(extension);
}

/**
 * Cek apakah file adalah PDF
 * @param path - Path file
 * @returns boolean
 */
export function isPdfFile(path: string | null | undefined): boolean {
  const extension = getFileExtension(path);
  return extension === 'pdf';
}

/**
 * Format ukuran file dalam bytes ke format yang mudah dibaca
 * @param bytes - Ukuran file dalam bytes
 * @returns String format ukuran file
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
