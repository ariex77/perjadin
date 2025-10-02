export interface ArrivalFormData {
    latitude: string;
    longitude: string;
    address: string;
    notes: string;
    ticket_id: number;
    [key: string]: string | number;
}

export interface LocationResult {
    is_within_radius: boolean;
    distance: number;
    radius: number;
    ticket_location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    user_location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    message: string;
}

export interface ArrivalError {
    error?: string;
    [key: string]: string[] | string | undefined;
}
