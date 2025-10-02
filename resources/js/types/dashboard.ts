export interface DashboardProps {
    // Core statistics
    totalAssignments: number;
    totalDocumentations: number;
    assignmentsThisMonth: number;
    reportsThisMonth: number;
    reportsLastMonth: number;

    // New core statistics
    approvedReports: number;
    submittedReports: number;
    rejectedReports: number;
    totalReports: number;

    // Employee statistics
    myAssignments: number;
    myReports: number;
    myReportsDisetujui: number;
    myReportsDitolak: number;
    myReportsThisMonth: number;
    myAssignmentsThisMonth: number;

    // Role flags
    isAdminOrSuperadmin?: boolean;
    isLeader?: boolean;
    isVerificator?: boolean;
    isEmployee?: boolean;

    // Admin statistics
    totalWorkUnits?: number;
    totalEmployees?: number;
    totalFullboardPrices?: number;
    pendingReviews?: number;
    approvedReviews?: number;
    rejectedReviews?: number;

    // Leader/Verificator statistics
    managedAssignments?: number;
    managedAssignmentsThisMonth?: number;
    myPendingReviews?: number;
    myApprovedReviews?: number;
    myRejectedReviews?: number;
    totalReviewsAssigned?: number;

    // Recent activities
    recentAssignments?: Array<{
        id: number;
        purpose: string;
        destination: string;
        start_date: string;
        end_date: string;
        created_at: string;
        users?: Array<{ id: number; name: string }>;
    }>;
    recentReports?: Array<{
        id: number;
        user_id?: number;
        assignment_id?: number;
        travel_type: string;
        created_at: string;
        user?: { id: number; name: string };
        assignment?: { id: number; purpose: string; destination: string };
    }>;
}
