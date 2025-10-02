export interface Employee {
    id: number;
    name: string;
    level: string;
    email?: string | null;
    username?: string | null;
    gender?: string | null;
    city?: string | null;
    province?: string | null;
    address?: string | null;
    number_phone?: string | null;
    nip?: string | null;
    work_unit_id: string;
    workUnit?: {
        id: number;
        name: string;
    };
    email_verified_at?: string | null;
    description: string;
    photo: File | string | null;
    created_at: string;
}

type EmployeeEditProps = {
    major: {
        id: number;
        name: string;
        level: string;
        nip: string;
        number_phone: string;
        email: string;
        gender: string;
        username: string;
        work_unit_id: string;
        photo: File | string | null;
    };
};

export type EmployeeFormData = Pick<Employee, 'name' | 'level' | 'nip' | 'number_phone' | 'username' | 'email' | 'work_unit_id' | 'photo' | 'city' | 'province' | 'address' | 'gender'>;

import type { PaginationMeta } from './pagination';

export interface EmployeeResponse {
    data: Employee[];
    meta: PaginationMeta;
}

export interface EmployeeForm {
    name: string;
    nip: string;
    email: string;
    username: string;
    gender: string | null;
    work_unit_id: string;
    photo: File | string | null;
    password: string;
    password_confirmation: string;
    [key: string]: string | File | null;
}
