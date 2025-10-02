/**
 * Utility functions untuk menangani inisial nama
 */

/**
 * Mengambil inisial dari nama lengkap
 * @param name - Nama lengkap (bisa null/undefined)
 * @param maxLength - Maksimal panjang inisial (default: 2)
 * @returns String inisial dalam huruf kapital
 * 
 * Contoh:
 * - "John Doe" → "JD"
 * - "Ahmad Fauzi Rahman" → "AR" 
 * - "Budi" → "B"
 * - null/undefined → "NA"
 */
export function getInitials(name: string | null | undefined, maxLength: number = 2): string {
  if (!name || name.trim() === '') return 'NA';
  
  const names = name.trim().split(' ').filter(word => word.length > 0);
  
  if (names.length === 0) return 'NA';
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  // Ambil inisial dari kata pertama dan terakhir
  const firstInitial = names[0].charAt(0);
  const lastInitial = names[names.length - 1].charAt(0);
  
  let initials = `${firstInitial}${lastInitial}`.toUpperCase();
  
  // Jika ada kata tengah dan masih ada ruang untuk inisial tambahan
  if (names.length > 2 && maxLength > 2) {
    const middleNames = names.slice(1, -1);
    for (const middleName of middleNames) {
      if (initials.length < maxLength) {
        initials += middleName.charAt(0).toUpperCase();
      }
    }
  }
  
  return initials.slice(0, maxLength);
}

/**
 * Mengambil inisial dengan format yang berbeda (semua kata)
 * @param name - Nama lengkap (bisa null/undefined)
 * @param maxLength - Maksimal panjang inisial (default: 2)
 * @returns String inisial dari semua kata
 * 
 * Contoh:
 * - "John Doe" → "JD"
 * - "Ahmad Fauzi Rahman" → "AFR"
 * - "Budi" → "B"
 */
export function getAllInitials(name: string | null | undefined, maxLength: number = 2): string {
  if (!name || name.trim() === '') return 'NA';
  
  const names = name.trim().split(' ').filter(word => word.length > 0);
  
  if (names.length === 0) return 'NA';
  
  const initials = names
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, maxLength);
  
  return initials;
}

/**
 * Mengambil inisial dengan fallback yang dapat dikustomisasi
 * @param name - Nama lengkap (bisa null/undefined)
 * @param fallback - Fallback text jika nama kosong (default: 'NA')
 * @param maxLength - Maksimal panjang inisial (default: 2)
 * @returns String inisial atau fallback
 */
export function getInitialsWithFallback(
  name: string | null | undefined, 
  fallback: string = 'NA',
  maxLength: number = 2
): string {
  if (!name || name.trim() === '') return fallback;
  
  const names = name.trim().split(' ').filter(word => word.length > 0);
  
  if (names.length === 0) return fallback;
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  const firstInitial = names[0].charAt(0);
  const lastInitial = names[names.length - 1].charAt(0);
  
  let initials = `${firstInitial}${lastInitial}`.toUpperCase();
  
  if (names.length > 2 && maxLength > 2) {
    const middleNames = names.slice(1, -1);
    for (const middleName of middleNames) {
      if (initials.length < maxLength) {
        initials += middleName.charAt(0).toUpperCase();
      }
    }
  }
  
  return initials.slice(0, maxLength);
}
