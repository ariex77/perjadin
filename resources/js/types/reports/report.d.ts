export interface Report {
    id: number;
    travel_type: 'in_city' | 'out_city' | 'out_country';
    status: 'draft' | 'submitted' | 'rejected' | 'approved';
    can_resubmit?: boolean;
    travel_order_number: string;
    destination_city: string;
    departure_date: string;
    return_date: string;
    actual_duration: number;    
    travel_purpose: string;
    travel_order_file?: string;
    travel_order_file_url?: string | null;
    spd_file?: string;
    spd_file_url?: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        photo?: string;
        workUnit?: {
            id: number;
            name: string;
            head?: {
                id: number;
                name: string;
            };
        };
    };
    assignment?: {
        id: number;
        purpose: string;
        destination: string;
        start_date: string;
        end_date: string;
        assignmentDocumentations?: AssignmentDocumentation[];
    };
    ticket: {
        id: number;
        address: string;
        latitude: number;
        longitude: number;
        radius_m: number;
        user_id: number;
        created_at: string;
        user: {
            id: number;
            name: string;
        } | null;
        arrivals: Array<{
            id: number;
            arrival_time: string;
            latitude: number;
            longitude: number;
            address: string;
            notes?: string;
            created_at: string;
        }>;
    } | null;
    reviews: Array<{
        id: number;
        reviewer_type: string;
        status: string;
        notes?: string;
        created_at: string;
    }>;
    assignmentDocumentations: AssignmentDocumentation[];
    in_city_expense?: InCityExpense;
    out_city_expense?: OutCityExpense;
    travel_report?: TravelReport;
    transportation_types: Array<{
        id: number;
        name: string;
        label: string;
    }>;
}

export interface ReportReview {
    id: number;
    reviewer_type: string;
    status: string;
    notes?: string;
    created_at: string;
}

export interface ReportResponse {
    data: Report[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url?: string;
            label: string;
            active: boolean;
        }>;
    };
}

export interface ReportsIndexProps {
    reports: ReportResponse;
    isAdminOrSuperadmin: boolean;
    status: string;
    search?: string;
    totals: {
        ditinjau: number;
        disetujui: number;
        ditolak: number;
    };
}

export interface ReportShowProps {
    report: {
        data: Report;
    };
    tabData?: {
        in_city_expense?: InCityExpense;
    };
    activeTab?: string;
    fullboardPrices?: FullboardPrice[];
    transportationTypes?: Array<{
        id: number;
        name: string;
        label: string;
    }>;
    auth: {
        user: {
            id: number;
            name: string;
            roles: Array<{
                name: string;
            }>;
        };
    };
}

export interface AssignmentDocumentation {
    id: number;
    assignment_id: number;
    photo: string;
    photo_path: string;
    address: string;
    latitude: number | string;
    longitude: number | string;
    created_at: string;
    updated_at: string;
}

export interface AssignmentDocumentationResponse {
    success: boolean;
    data: AssignmentDocumentation[];
}

export interface AssignmentDocumentationStoreResponse {
    success: boolean;
    message: string;
    data: AssignmentDocumentation;
}

export interface InCityExpense {
    id: number;
    report_id: number;
    daily_allowance: number | null;
    transportation_cost: number | null;
    vehicle_rental_fee: number | null;
    actual_expense: number | null;
    transportation_receipt: string | null;
    vehicle_rental_receipt: string | null;
    created_at: string;
    updated_at: string;
}

export interface OutCityExpense {
    id: number;
    report_id: number;
    fullboard_price_id: number | null;
    custom_daily_allowance: number | null;
    fullboard_price?: {
        id: number;
        province_name: string;
        price: number;
    };
    origin_transport_cost: number | null;
    origin_transport_receipt: string | null;
    local_transport_cost: number | null;
    local_transport_receipt: string | null;
    lodging_cost: number | null;
    lodging_receipt: string | null;
    destination_transport_cost: number | null;
    destination_transport_receipt: string | null;
    round_trip_ticket_cost: number | null;
    round_trip_ticket_receipt: string | null;
    actual_expense: number | null;
    created_at: string;
    updated_at: string;
}

export interface FullboardPrice {
    id: number;
    province_name: string;
    price: string;
    created_at: string;
    updated_at: string;
}

export interface TravelReport {
    id: number;
    report_id: number;
    title?: string;
    background?: string;
    purpose_and_objectives?: string;
    scope?: string;
    legal_basis?: string;
    activities_conducted?: string;
    achievements?: string;
    conclusions?: string;
    created_at: string;
    updated_at: string;
}

export interface TravelReportFormData {
    report_id: number;
    title: string;
    background: string;
    purpose_and_objectives: string;
    scope: string;
    legal_basis: string;
    activities_conducted: string;
    achievements: string;
    conclusions: string;
    [key: string]: any;
}
