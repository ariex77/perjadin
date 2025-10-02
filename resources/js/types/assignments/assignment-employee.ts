export interface AssignmentEmployee {
    id: number;
    assignment_id: number;
    user_id: number;
    assignment?: {
        id: number;
        purpose: string;
        destination: string;
        start_date: string;
        end_date: string;
        status: string;
    };
    user?: {
        id: number;
        name: string;
        email: string;
        photo?: string;
        work_unit?: string;
    };
    created_at: string;
    updated_at: string;
}

export interface AssignmentEmployeeResponse {
    data: AssignmentEmployee[];
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
    };
}
