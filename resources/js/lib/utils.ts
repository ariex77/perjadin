import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Get travel type label based on enum value
 */
export function getTravelTypeLabel(travelType: string): string {
    const travelTypeLabels: Record<string, string> = {
        'in_city': 'Dalam Kota',
        'out_city': 'Luar Kota',
        'out_country': 'Luar Negeri',
    };
    
    return travelTypeLabels[travelType] || travelType;
}


export type CurrencyFormatOptions = {
    withSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
};

export function formatCurrencyIDR(amount: number | string, options: CurrencyFormatOptions = {}): string {
    const { withSymbol = true, minimumFractionDigits = 0, maximumFractionDigits = 0 } = options;

    const numericAmount = typeof amount === 'string' ? Number(amount) : amount;
    if (!Number.isFinite(numericAmount)) return withSymbol ? 'Rp 0' : '0';

    if (withSymbol) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits,
            maximumFractionDigits,
        }).format(numericAmount);
    }

    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(numericAmount);
}
