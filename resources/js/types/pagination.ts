export interface PaginationMeta {
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page?: number;
}
