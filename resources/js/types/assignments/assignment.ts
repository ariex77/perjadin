export interface Assignment {
    id: number;
    purpose: string;
    destination: string;
    start_date: string;
    end_date: string;
    status: string;
    creator?: {
        id: number;
        name: string;
    };
    review_status?: 'ditinjau' | 'disetujui' | 'ditolak';
    users?: AssignmentUser[];
    users_count?: number;
    reports?: AssignmentReport[];
    reports_count?: number;
    has_reports?: boolean;
    created_at: string;
    updated_at: string;
}

export interface AssignmentUser {
    id: number;
    name: string;
    photo?: string;
    email?: string;
    work_unit?: string;
    workUnit?: {
        id: number;
        name: string;
        head?: {
            id: number;
            name: string;
        } | null;
    } | null;
    reports?: AssignmentReport[];
}

export interface AssignmentReport {
    id: number;
    user_id: number;
    assignment_id: number;
    user_name?: string;
    created_at: string;
    status?: 'draft' | 'submitted' | 'approved' | 'rejected';
    type?: string;
    travel_type?: string;
    travel_order_number?: string;
    destination_city?: string;
    has_travel_order?: boolean;
    in_city_report?: boolean;
    out_city_report?: boolean;
    out_country_report?: boolean;
    travel_report?: boolean;
    reviews?: AssignmentReportReview[];
}

export interface AssignmentReportReview {
    id: number;
    report_id: number;
    reviewer_type: string;
    status: string;
    notes?: string;
    created_at: string;
}

export interface AssignmentDocumentation {
    id: number;
    assignment_id: number;
    photo: string;
    address: string;
    latitude: number;
    longitude: number;
    created_at: string;
}

export interface DetailAssignment extends Assignment {
    users: AssignmentUser[];
    reports?: AssignmentReport[];
    current_user_report?: AssignmentReport;
    assignmentDocumentations?: AssignmentDocumentation[];
}

export interface AssignmentResponse {
    data: Assignment[];
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
    };
}
