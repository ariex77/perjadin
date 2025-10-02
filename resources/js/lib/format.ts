/**
 * Utility functions untuk formatting data
 */
import { format as formatDateFns } from 'date-fns';

/**
 * Format tanggal dan waktu ke format Indonesia
 * @param date - Date object atau string
 * @param options - Intl.DateTimeFormatOptions
 * @returns String format tanggal dan waktu
 */
export function formatDateTime(
  date: Date | string, 
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  return dateObj.toLocaleString('id-ID', { ...defaultOptions, ...options });
}

/**
 * Format tanggal ke format Indonesia
 * @param date - Date object atau string
 * @param format - Format pattern (contoh: 'yyyy-MM-dd')
 * @returns String format tanggal
 */
export function formatDate(date: string | Date, format: string = 'PPP'): string {
    if (typeof date === 'string') {
        date = new Date(date);
    }

    // Format tanggal menggunakan date-fns jika format pattern disediakan
    if (format.includes('yyyy') || format.includes('MM') || format.includes('dd')) {
        return formatDateFns(date, format);
    }
    
    // Fallback ke format default menggunakan toLocaleString
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    return date.toLocaleDateString('id-ID', options);
}

/**
 * Format waktu ke format Indonesia
 * @param date - Date object atau string
 * @param options - Intl.DateTimeFormatOptions
 * @returns String format waktu
 */
export function formatTime(
  date: Date | string, 
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  return dateObj.toLocaleTimeString('id-ID', { ...defaultOptions, ...options });
}

/**
 * Format angka ke format Indonesia
 * @param number - Angka yang akan diformat
 * @param options - Intl.NumberFormatOptions
 * @returns String format angka
 */
export function formatNumber(
  number: number, 
  options: Intl.NumberFormatOptions = {}
): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };

  return number.toLocaleString('id-ID', { ...defaultOptions, ...options });
}

/**
 * Format persentase ke format Indonesia
 * @param number - Angka yang akan diformat (0-1)
 * @param options - Intl.NumberFormatOptions
 * @returns String format persentase
 */
export function formatPercentage(
  number: number, 
  options: Intl.NumberFormatOptions = {}
): string {
  const percentage = number * 100;
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };

  return percentage.toLocaleString('id-ID', { ...defaultOptions, ...options });
}

/**
 * Format file size ke format yang mudah dibaca
 * @param bytes - Ukuran file dalam bytes
 * @param locale - Locale untuk formatting
 * @returns String format ukuran file
 */
export function formatFileSize(bytes: number, locale: string = 'id-ID'): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${size.toLocaleString(locale)} ${sizes[i]}`;
}

/**
 * Format durasi dalam detik ke format yang mudah dibaca
 * @param seconds - Durasi dalam detik
 * @returns String format durasi
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)} detik`;
  }
  
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes} menit ${remainingSeconds} detik`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${hours} jam ${minutes} menit ${remainingSeconds} detik`;
}

/**
 * Format nomor telepon ke format Indonesia
 * @param phone - Nomor telepon
 * @returns String format nomor telepon
 */
export function formatPhoneNumber(phone: string): string {
  // Hapus semua karakter non-digit
  const cleaned = phone.replace(/\D/g, '');
  
  // Jika dimulai dengan 0, ganti dengan +62
  if (cleaned.startsWith('0')) {
    return '+62' + cleaned.substring(1);
  }
  
  // Jika dimulai dengan 62, tambahkan +
  if (cleaned.startsWith('62')) {
    return '+' + cleaned;
  }
  
  // Jika tidak ada prefix, tambahkan +62
  return '+62' + cleaned;
}

/**
 * Format nama ke format yang proper (capitalize)
 * @param name - Nama yang akan diformat
 * @returns String format nama
 */
export function formatName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format text ke format yang aman untuk URL (slug)
 * @param text - Text yang akan diformat
 * @returns String format slug
 */
export function formatSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter khusus
    .replace(/\s+/g, '-') // Ganti spasi dengan dash
    .replace(/-+/g, '-') // Hapus dash berulang
    .trim();
}
