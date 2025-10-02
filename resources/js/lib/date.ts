// src/dateUtils/index.ts
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatDate = (dateStr: string): string => {
    return format(new Date(dateStr), 'EEEE, dd MMMM yyyy', {
        locale: id,
    });
};

export const formatMoonYear = (dateStr: string): string => {
    return format(new Date(dateStr), 'MMMM yyyy', {
        locale: id,
    });
};

// ➕ Tambahan untuk jam:menit:detik
export const formatFullDateTime = (dateStr: string): string => {
    return format(new Date(dateStr), 'EEEE, dd MMMM yyyy HH:mm:ss', {
        locale: id,
    });
};

// ➕ Jika hanya jam:menit:detik saja
export const formatTimeOnly = (dateStr: string): string => {
    return format(new Date(dateStr), 'HH:mm:ss', {
        locale: id,
    });
};

// ➕ Format tanggal-bulan-tahun
export const formatDayMonthYear = (dateStr: string | null | undefined): string => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return '-';
    try {
        const date = parseDateTimeFromDatabase(String(dateStr));
        if (isNaN(date.getTime())) return '-';
        return format(date, 'dd-MM-yyyy');
    } catch (error) {
        console.warn('Error formatting day month year:', dateStr, error);
        return '-';
    }
};

// ➕ Format tanggal dengan bulan pendek (dd MMM yyyy)
export const formatDateShortMonth = (dateStr: string | null | undefined): string => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return '-';
    try {
        const date = parseDateTimeFromDatabase(String(dateStr));
        if (isNaN(date.getTime())) return '-';
        return format(date, 'dd MMM yyyy', {
            locale: id,
        });
    } catch (error) {
        console.warn('Error formatting date short month:', dateStr, error);
        return '-';
    }
};

// ➕ Format tanggal dengan bulan pendek dan jam (dd MMM yyyy HH:mm)
export const formatDateShortMonthWithTime = (dateStr: string | null | undefined): string => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return '-';
    try {
        const date = parseDateTimeFromDatabase(String(dateStr));
        if (isNaN(date.getTime())) return '-';
        return format(date, 'dd MMM yyyy HH:mm', {
            locale: id,
        });
    } catch (error) {
        console.warn('Error formatting date short with time:', dateStr, error);
        return '-';
    }
};

// ➕ Format tanggal dengan bulan panjang (dd MMMM yyyy)
export const formatDateLongMonth = (dateStr: string | null | undefined): string => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return '-';
    try {
        const date = parseDateTimeFromDatabase(String(dateStr));
        if (isNaN(date.getTime())) return '-';
        return format(date, 'dd MMMM yyyy', { locale: id });
    } catch (error) {
        console.warn('Error formatting date:', dateStr, error);
        return '-';
    }
};

// ➕ Format tanggal dengan bulan panjang dan jam (dd MMMM yyyy HH:mm)
export const formatDateLongMonthWithTime = (dateStr: string | null | undefined): string => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return '-';
    try {
        const date = parseDateTimeFromDatabase(String(dateStr));
        if (isNaN(date.getTime())) return '-';
        return format(date, 'dd MMMM yyyy HH:mm', { locale: id });
    } catch (error) {
        console.warn('Error formatting date with time:', dateStr, error);
        return '-';
    }
};

export function parseDateDMY(dateStr: string | null | undefined): number {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return 0;
    try {
        const [d, m, y] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d).getTime();
    } catch (error) {
        console.warn('Error parsing date DMY:', dateStr, error);
        return 0;
    }
}

// Konversi Date JS ke format YYYY-MM-DD lokal (bukan UTC)
export function toLocalYMD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function formatDateToLocal(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
  
    return `${year}-${month}-${day}`
  }
  
  /**
   * Parse date string (YYYY-MM-DD) ke Date object dengan timezone lokal
   */
  export function parseDateFromLocal(dateString: string | null | undefined): Date {
    if (!dateString) {
        return new Date();
    }
    try {
        const [year, month, day] = dateString.split("-").map(Number)
        return new Date(year, month - 1, day)
    } catch (error) {
        console.warn('Error parsing date from local:', dateString, error);
        return new Date();
    }
  }
  
  /**
   * Kombinasi date dan time string menjadi datetime string untuk database
   * @param date - Date object
   * @param time - Time string dalam format HH:MM:SS
   * @returns DateTime string dalam format YYYY-MM-DD HH:MM:SS
   */
  export function combineDateAndTime(date: Date, time: string): string {
    const dateStr = formatDateToLocal(date)
    return `${dateStr} ${time}`
  }
  
  /**
   * Parse datetime string dari database ke Date object
   * @param datetime - DateTime string dalam format YYYY-MM-DD HH:MM:SS
   * @returns Date object
   */
  export function parseDateTimeFromDatabase(datetime: string | null | undefined): Date {
    if (!datetime) {
        return new Date();
    }
    
    // Jika datetime sudah dalam format ISO, parse langsung
    if (datetime.includes("T")) {
      return new Date(datetime)
    }
  
    // Jika dalam format YYYY-MM-DD HH:MM:SS, parse manual
    const parts = datetime.split(" ")
    if (parts.length < 2) {
        // Jika hanya ada date tanpa time, tambahkan time default
        const datePart = parts[0]
        const [year, month, day] = datePart.split("-").map(Number)
        return new Date(year, month - 1, day, 0, 0, 0)
    }
    
    const [datePart, timePart] = parts
    const [year, month, day] = datePart.split("-").map(Number)
    const [hours, minutes, seconds] = timePart.split(":").map(Number)
  
    return new Date(year, month - 1, day, hours, minutes, seconds)
  }
  
  /**
   * Format deadline untuk ditampilkan ke user
   * @param deadline - DateTime string dari database
   * @returns Formatted string untuk display
   */
  export function formatDeadlineForDisplay(deadline: string | Date): string {
    const date = typeof deadline === "string" ? parseDateTimeFromDatabase(deadline) : deadline
  
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  
    return date.toLocaleDateString("id-ID", options)
  }
  
  /**
   * Extract date dan time dari datetime string untuk form editing
   * @param datetime - DateTime string dari database
   * @returns Object dengan date dan time terpisah
   */
  export function extractDateAndTime(datetime: string): { date: Date; time: string } {
    const dateObj = parseDateTimeFromDatabase(datetime)
  
    const hours = String(dateObj.getHours()).padStart(2, "0")
    const minutes = String(dateObj.getMinutes()).padStart(2, "0")
    const seconds = String(dateObj.getSeconds()).padStart(2, "0")
  
    return {
      date: dateObj,
      time: `${hours}:${minutes}:${seconds}`,
    }
  }
