export interface Ticket {
    id: number;
    address: string;
    latitude: number;
    longitude: number;
    radius_m: number | null;
    user_id: number;
    user?: { id: number; name: string; photo?: string | null } | null;

    has_arrival_report: boolean;
    arrival_report?: {
        latitude: number;
        longitude: number;
        address: string;
        arrival_time: string;
        notes?: string | null;
        created_at: string;
    } | null;
    has_report: boolean;
    report?: {
        id: number;
        type: string;
        // Informasi Surat Tugas
        travel_order_number: string;
        destination_city: string;
        departure_date: string;
        return_date: string;
        travel_purpose: string;
        travel_order_file: string | null;
        spd_file: string | null;
        created_at: string;
        reviews?: {
            id: number;
            status: string;
            reviewer_type: string;
            notes?: string | null;
        }[];
    } | null;
    arrivals?: {
        id: number;
        arrival_time: string;
        is_within_radius: boolean;
        report?: {
            id: number;
            created_at: string;
            reviews?: {
                id: number;
                status: string;
                reviewer_type: string;
                notes?: string | null;
            }[];
        } | null;
    }[];
    created_at: string;
}

import type { PaginationMeta } from '../pagination';

export interface TicketResponse {
    data: Ticket[];
    meta: PaginationMeta;
}


