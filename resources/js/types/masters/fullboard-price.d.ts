export interface FullboardPrice {
    id: number;
    province_name: string;
    price: number | null;
    created_at: string;
    updated_at?: string;
}

export type FullboardPriceFormData = Pick<FullboardPrice, 'province_name' | 'price'>;

import type { PaginationMeta } from '../pagination';

export interface FullboardPriceResponse {
    data: FullboardPrice[];
    meta: PaginationMeta;
}
