export interface WorkUnit {
    id: number;
    name: string;
    code: string;
    description: string;
    head_id?: number | null;
    head_name?: string | null;
    created_at: string;
}

export type InertiaFormValue = string | number | boolean | null | File | File[] | Blob | Blob[] | Date | undefined;

export interface WorkUnitFormData extends Record<string, InertiaFormValue> {
    name: string;
    code: string;
    description: string;
    head_id: string;
}

import type { PaginationMeta } from '../pagination';

export interface WorkUnitResponse {
    data: WorkUnit[];
    meta: PaginationMeta;
}
