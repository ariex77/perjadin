export interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions_count?: number;
    users_count?: number;
    permissions?: Permission[];
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

export type RoleFormData = {
    name: string;
    guard_name: string;
    permissions: string[];
};

import type { PaginationMeta } from './pagination';

export interface RoleResponse {
    data: Role[];
    meta: PaginationMeta;
}
