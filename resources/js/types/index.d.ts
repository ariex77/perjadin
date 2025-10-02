import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    // If set, clicking the item can open a PDF modal instead of navigation
    pdfSrc?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: string[];
    permissions?: string[];
    [key: string]: unknown; // This allows for additional properties...
}

export interface FormErrors {
    [key: string]: string | string[];
}

// Ticket Types
export interface Ticket {
    id: number;
    address: string;
    latitude: number;
    longitude: number;
    radius_m: number | null;
    user_id: number;
    created_at: string;
    user: {
        id: number;
        name: string;
        photo?: string | null;
    };
    arrivals?: {
        id: number;
        arrival_time: string;
        is_within_radius: boolean;
    }[];
}
