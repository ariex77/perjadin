<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WorkUnit;
use App\Models\FullboardPrice;
use App\Models\Assignment;
use App\Models\Report;
use App\Models\ReportReview;
use App\Models\AssignmentDocumentation;
use App\Enums\ReportStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Cache TTL untuk dashboard data
     */
    private const CACHE_TTL = 10; // 5 menit

    /**
     * Display dashboard dengan statistik yang relevan berdasarkan role user
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $userRoles = $user?->roles->pluck('name')->toArray() ?? [];

        // Determine user type for conditional data
        $isAdminOrSuperadmin = in_array('admin', $userRoles) || in_array('superadmin', $userRoles);
        $isLeader = in_array('leader', $userRoles);
        $isVerificator = in_array('verificator', $userRoles);
        $isEmployee = in_array('employee', $userRoles);

        // Get cached dashboard data
        $dashboardData = $this->getDashboardData($user, $isAdminOrSuperadmin, $isLeader, $isVerificator, $isEmployee);

        return Inertia::render('dashboard', $dashboardData);
    }

    /**
     * Get dashboard data with intelligent caching
     */
    private function getDashboardData($user, bool $isAdminOrSuperadmin, bool $isLeader, bool $isVerificator, bool $isEmployee): array
    {
        $cacheKey = "dashboard:user_{$user->id}_" . md5(serialize([$isAdminOrSuperadmin, $isLeader, $isVerificator, $isEmployee]));

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($user, $isAdminOrSuperadmin, $isLeader, $isVerificator, $isEmployee) {
            $data = [
                'isAdminOrSuperadmin' => $isAdminOrSuperadmin,
                'isLeader' => $isLeader,
                'isVerificator' => $isVerificator,
                'isEmployee' => $isEmployee,
            ];

            // Core statistics for all users
            $data = array_merge($data, $this->getCoreStatistics());

            // Pisahkan statistik untuk masing-masing role
            if ($isAdminOrSuperadmin) {
                $data = array_merge($data, $this->getAdminStatistics());
                // Statistik laporan & penugasan khusus admin/superadmin (global, prefix admin)
                $data = array_merge($data, $this->getAdminSuperadminReportAssignmentStats());
            }

            if ($isLeader) {
                $data = array_merge($data, $this->getLeaderStatistics($user));
            }

            if ($isVerificator) {
                $data = array_merge($data, $this->getVerificatorStatistics());
            }

            if ($isEmployee) {
                $data = array_merge($data, $this->getEmployeeStatistics($user));
            }

            // Recent activities
            $data = array_merge($data, $this->getRecentActivities($user, $isAdminOrSuperadmin, $isLeader, $isVerificator, $isEmployee));

            return $data;
        });
    }

    /**
     * Statistik laporan & penugasan khusus admin/superadmin (global, prefix admin)
     */
    private function getAdminSuperadminReportAssignmentStats(): array
    {
        $now = Carbon::now();
        $currentMonth = $now->month;
        $currentYear = $now->year;

        // Statistik laporan per bulan (global, tanpa filter unit kerja)
        $reportsDisetujuiBulanIni = Report::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->where('status', ReportStatus::APPROVED)
            ->count();
        $reportsDisubmitBulanIni = Report::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->where('status', ReportStatus::SUBMITTED)
            ->count();
        $reportsDitolakBulanIni = Report::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->where('status', ReportStatus::REJECTED)
            ->count();
        $reportsDraftBulanIni = Report::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->where('status', ReportStatus::DRAFT)
            ->count();
        $reportsTotalBulanIni = Report::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->count();

        // Statistik penugasan (global)
        $assignmentsTotalBulanIni = Assignment::whereMonth('start_date', $currentMonth)
            ->whereYear('start_date', $currentYear)
            ->count();

        $assignmentsTotalTahunIni = Assignment::whereYear('start_date', $currentYear)
            ->count();

        return [
            'adminReportsDisetujuiBulanIni' => $reportsDisetujuiBulanIni,
            'adminReportsDisubmitBulanIni' => $reportsDisubmitBulanIni,
            'adminReportsDitolakBulanIni' => $reportsDitolakBulanIni,
            'adminReportsDraftBulanIni' => $reportsDraftBulanIni,
            'adminReportsTotalBulanIni' => $reportsTotalBulanIni,
            'adminAssignmentsTotalBulanIni' => $assignmentsTotalBulanIni,
            'adminAssignmentsTotalTahunIni' => $assignmentsTotalTahunIni,
        ];
    }
    /**
     * Get verificator statistics (same keys as leader, but global, no unit kerja filter)
     */
    private function getVerificatorStatistics(): array
    {
        $now = Carbon::now();
        $currentMonth = $now->month;
        $currentYear = $now->year;

        // Statistik laporan per bulan (global, tanpa filter unit kerja)
        $reportsDisetujuiBulanIni = Report::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->where('status', ReportStatus::APPROVED)
            ->count();
        $reportsDisubmitBulanIni = Report::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->where('status', ReportStatus::SUBMITTED)
            ->count();
        $reportsDitolakBulanIni = Report::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->where('status', ReportStatus::REJECTED)
            ->count();
        $reportsDraftBulanIni = Report::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->where('status', ReportStatus::DRAFT)
            ->count();
        $reportsTotalBulanIni = Report::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->count();

        // Statistik penugasan (global)
        $assignmentsTotalBulanIni = Assignment::whereMonth('start_date', $currentMonth)
            ->whereYear('start_date', $currentYear)
            ->count();

        $assignmentsTotalTahunIni = Assignment::whereYear('start_date', $currentYear)
            ->count();

        return [
            'leaderReportsDisetujuiBulanIni' => $reportsDisetujuiBulanIni,
            'leaderReportsDisubmitBulanIni' => $reportsDisubmitBulanIni,
            'leaderReportsDitolakBulanIni' => $reportsDitolakBulanIni,
            'leaderReportsDraftBulanIni' => $reportsDraftBulanIni,
            'leaderReportsTotalBulanIni' => $reportsTotalBulanIni,
            'leaderAssignmentsTotalBulanIni' => $assignmentsTotalBulanIni,
            'leaderAssignmentsTotalTahunIni' => $assignmentsTotalTahunIni,
        ];
    }

    /**
     * Get core statistics for all users
     */
    private function getCoreStatistics(): array
    {
        return Cache::remember('dashboard:core_stats', self::CACHE_TTL, function () {
            $now = Carbon::now();
            $lastMonth = $now->copy()->subMonth();

            return [
                'totalAssignments' => Assignment::count(),
                'totalDocumentations' => AssignmentDocumentation::count(),
                'assignmentsThisMonth' => Assignment::whereMonth('created_at', $now->month)
                    ->whereYear('created_at', $now->year)
                    ->count(),
                'reportsThisMonth' => Report::whereMonth('created_at', $now->month)
                    ->whereYear('created_at', $now->year)
                    ->count(),
                'reportsLastMonth' => Report::whereMonth('created_at', $lastMonth->month)
                    ->whereYear('created_at', $lastMonth->year)
                    ->count(),
                // Core statistics for all users
                'approvedReports' => Report::where('status', ReportStatus::APPROVED)->count(),
                'submittedReports' => Report::where('status', ReportStatus::SUBMITTED)->count(),
                'rejectedReports' => Report::where('status', ReportStatus::REJECTED)->count(),
                'totalReports' => Report::whereIn('status', [ReportStatus::APPROVED, ReportStatus::SUBMITTED, ReportStatus::REJECTED])->count(),
            ];
        });
    }

    /**
     * Get admin-specific statistics
     */
    private function getAdminStatistics(): array
    {
        return Cache::remember('dashboard:admin_stats', self::CACHE_TTL, function () {
            return [
                'totalWorkUnits' => WorkUnit::count(),
                'totalEmployees' => User::whereHas('roles', function ($query) {
                    $query->whereNotIn('name', ['superadmin', 'admin']);
                })->count(),
                'totalFullboardPrices' => FullboardPrice::count(),
                'reportsDraft' => Report::where('status', ReportStatus::DRAFT)->count(),
                'reportsSubmitted' => Report::where('status', ReportStatus::SUBMITTED)->count(),
                'reportsApproved' => Report::where('status', ReportStatus::APPROVED)->count(),
                'reportsRejected' => Report::where('status', ReportStatus::REJECTED)->count(),
                'totalReviews' => ReportReview::count(),
                'approvedReviews' => ReportReview::where('status', 'approved')->count(),
                'rejectedReviews' => ReportReview::where('status', 'rejected')->count(),
            ];
        });
    }

    /**
     * Get leader/verificator statistics
     */
    private function getLeaderVerificatorStatistics($user): array
    {
        $cacheKey = "dashboard:leader_verificator_stats_{$user->id}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($user) {
            $userRoles = $user->roles->pluck('name')->toArray();
            $isLeader = in_array('leader', $userRoles);
            $isVerificator = in_array('verificator', $userRoles);

            // Query untuk reports yang bisa di-review
            $reviewableReportsQuery = Report::where('status', ReportStatus::SUBMITTED);

            // Jika leader, hanya reports dari work unit yang dipimpinnya
            if ($isLeader) {
                $reviewableReportsQuery->whereHas('user.workUnit', function ($query) use ($user) {
                    $query->where('head_id', $user->id);
                });
            }
            // Verificator bisa lihat semua reports

            // Query untuk assignments yang mereka kelola (bukan yang mereka ikuti)
            $managedAssignmentsQuery = Assignment::query();
            $managedAssignmentsThisMonthQuery = Assignment::query();

            if ($isLeader) {
                // Leader: assignments dari anggota unit kerjanya
                $managedAssignmentsQuery->whereHas('users.workUnit', function ($query) use ($user) {
                    $query->where('head_id', $user->id);
                });
                $managedAssignmentsThisMonthQuery->whereHas('users.workUnit', function ($query) use ($user) {
                    $query->where('head_id', $user->id);
                });
            }
            // Verificator bisa lihat semua assignments

            $now = Carbon::now();
            $managedAssignmentsThisMonthQuery->whereMonth('start_date', $now->month)
                ->whereYear('start_date', $now->year);

            return [
                'managedAssignments' => $managedAssignmentsQuery->count(),
                'managedAssignmentsThisMonth' => $managedAssignmentsThisMonthQuery->count(),
                'reportsToReview' => $reviewableReportsQuery->count(),
                'reportsDraft' => Report::where('status', ReportStatus::DRAFT)->count(),
                'reportsSubmitted' => Report::where('status', ReportStatus::SUBMITTED)->count(),
                'reportsApproved' => Report::where('status', ReportStatus::APPROVED)->count(),
                'reportsRejected' => Report::where('status', ReportStatus::REJECTED)->count(),
                'myApprovedReviews' => ReportReview::where('reviewer_id', $user->id)
                    ->where('status', 'approved')
                    ->count(),
                'myRejectedReviews' => ReportReview::where('reviewer_id', $user->id)
                    ->where('status', 'rejected')
                    ->count(),
            ];
        });
    }

    /**
     * Get employee-specific statistics
     */
    private function getEmployeeStatistics($user): array
    {
        $cacheKey = "dashboard:employee_stats_{$user->id}";
        $now = Carbon::now();
        $currentMonth = $now->month;
        $currentYear = $now->year;
        $currentMonthStart = $now->copy()->startOfMonth();
        $currentMonthEnd = $now->copy()->endOfMonth();

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($user, $now, $currentMonth, $currentYear, $currentMonthStart, $currentMonthEnd) {
            // Assignments
            $assignmentsTotalBulanIni = Assignment::whereHas('users', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
                ->whereMonth('start_date', $currentMonth)
                ->whereYear('start_date', $currentYear)
                ->count();

            $assignmentsTotalTahunIni = Assignment::whereHas('users', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
                ->whereYear('start_date', $currentYear)
                ->count();

            // Reports
            $reportsDisetujuiBulanIni = Report::where('user_id', $user->id)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->where('status', ReportStatus::APPROVED)
                ->count();
            $reportsDisubmitBulanIni = Report::where('user_id', $user->id)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->where('status', ReportStatus::SUBMITTED)
                ->count();
            $reportsDraftBulanIni = Report::where('user_id', $user->id)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->where('status', ReportStatus::DRAFT)
                ->count();
            $reportsDitolakBulanIni = Report::where('user_id', $user->id)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->where('status', ReportStatus::REJECTED)
                ->count();
            $reportsTotalBulanIni = Report::where('user_id', $user->id)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->count();

            return [
                // Statistik laporan per bulan
                'myReportsDisetujuiBulanIni' => $reportsDisetujuiBulanIni,
                'myReportsDisubmitBulanIni' => $reportsDisubmitBulanIni,
                'myReportsDraftBulanIni' => $reportsDraftBulanIni,
                'myReportsDitolakBulanIni' => $reportsDitolakBulanIni,
                'myReportsTotalBulanIni' => $reportsTotalBulanIni,
                // Statistik penugasan
                'myAssignmentsTotalBulanIni' => $assignmentsTotalBulanIni,
                'myAssignmentsTotalTahunIni' => $assignmentsTotalTahunIni,
            ];
        });
    }

    /**
     * Get recent activities
     */
    private function getRecentActivities($user, bool $isAdminOrSuperadmin, bool $isLeader = false, bool $isVerificator = false, bool $isEmployee = false): array
    {
        $cacheKey = "dashboard:recent_activities_{$user->id}_" . md5(serialize([$isAdminOrSuperadmin, $isLeader, $isVerificator, $isEmployee]));

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($user, $isAdminOrSuperadmin, $isLeader, $isVerificator, $isEmployee) {
            $activities = [];

            if ($isAdminOrSuperadmin) {
                // Admin/Superadmin: recent reports dan recent assignments (global)
                $activities['recentReports'] = Report::with(['user:id,name', 'assignment:id,purpose,destination'])
                    ->latest()
                    ->limit(5)
                    ->get(['id', 'user_id', 'assignment_id', 'travel_type', 'created_at']);

                $activities['recentAssignments'] = Assignment::latest()
                    ->with(['users:id,name'])
                    ->limit(5)
                    ->get(['id', 'purpose', 'destination', 'start_date', 'end_date', 'created_at']);
            } else if ($isEmployee) {
                // Employee: recent assignments dan recent reports
                $activities['recentAssignments'] = Assignment::whereHas('users', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                    ->with(['users:id,name'])
                    ->latest()
                    ->limit(5)
                    ->get(['id', 'purpose', 'destination', 'start_date', 'end_date', 'created_at']);

                $activities['recentReports'] = Report::where('user_id', $user->id)
                    ->with(['assignment:id,purpose,destination'])
                    ->latest()
                    ->limit(5)
                    ->get(['id', 'assignment_id', 'travel_type', 'created_at']);
            } else {
                // Leader/Verificator: recent reports dan recent assignments sesuai relevansi
                if ($isLeader) {
                    // Leader: get unit kerja and employee IDs first
                    $workUnit = WorkUnit::where('head_id', $user->id)->first();
                    $employeeIds = [];
                    if ($workUnit) {
                        $employeeIds = User::where('work_unit_id', $workUnit->id)
                            ->whereHas('roles', function ($query) {
                                $query->where('name', 'employee');
                            })
                            ->pluck('id');
                    }

                    // Laporan Terbaru: menampilkan semua laporan terbaru dari unitnya saja (semua pegawai di unitnya)
                    $activities['recentReports'] = Report::with(['user:id,name', 'assignment:id,purpose,destination'])
                        ->whereIn('user_id', $employeeIds)
                        ->latest()
                        ->limit(5)
                        ->get(['id', 'user_id', 'assignment_id', 'travel_type', 'created_at']);

                    // Penugasan Terbaru: leader melihat semua assignment (global, sama seperti admin/superadmin/verificator)
                    $activities['recentAssignments'] = Assignment::latest()
                        ->with(['users:id,name'])
                        ->limit(5)
                        ->get(['id', 'purpose', 'destination', 'start_date', 'end_date', 'created_at']);
                } else if ($isVerificator) {
                    // Verificator: global view for both reports and assignments
                    $activities['recentReports'] = Report::with(['user:id,name', 'assignment:id,purpose,destination'])
                        ->latest()
                        ->limit(5)
                        ->get(['id', 'user_id', 'assignment_id', 'travel_type', 'created_at']);

                    $activities['recentAssignments'] = Assignment::latest()
                        ->with(['users:id,name'])
                        ->limit(5)
                        ->get(['id', 'purpose', 'destination', 'start_date', 'end_date', 'created_at']);
                }
            }

            return $activities;
        });
    }



    /**
     * Clear dashboard cache (useful for cache invalidation)
     */
    public function clearCache(): void
    {
        Cache::flush();
    }

    /**
     * Get leader-specific statistics (laporan & penugasan employee unit kerja dia)
     */
    private function getLeaderStatistics($user): array
    {
        $cacheKey = "dashboard:leader_stats_{$user->id}";
        $now = Carbon::now();
        $currentMonth = $now->month;
        $currentYear = $now->year;

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($user, $currentMonth, $currentYear) {
            // Ambil unit kerja Leader
            $workUnit = WorkUnit::where('head_id', $user->id)->first();
            $employeeIds = [];
            if ($workUnit) {
                $employeeIds = User::where('work_unit_id', $workUnit->id)
                    ->whereHas('roles', function ($query) {
                        $query->where('name', 'employee');
                    })
                    ->pluck('id');
            }

            // Ambil semua assignment bulan ini milik employee unit kerja Leader
            $assignmentIdsBulanIni = Assignment::whereHas('users', function ($query) use ($employeeIds) {
                $query->whereIn('user_id', $employeeIds);
            })
                ->whereMonth('start_date', $currentMonth)
                ->whereYear('start_date', $currentYear)
                ->pluck('id');

            // Statistik laporan per bulan (hanya report yang assignment_id-nya assignment unit kerja Leader)
            $reportsDisetujuiBulanIni = Report::whereIn('user_id', $employeeIds)
                ->whereIn('assignment_id', $assignmentIdsBulanIni)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->where('status', ReportStatus::APPROVED)
                ->count();
            $reportsDisubmitBulanIni = Report::whereIn('user_id', $employeeIds)
                ->whereIn('assignment_id', $assignmentIdsBulanIni)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->where('status', ReportStatus::SUBMITTED)
                ->count();
            $reportsDitolakBulanIni = Report::whereIn('user_id', $employeeIds)
                ->whereIn('assignment_id', $assignmentIdsBulanIni)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->where('status', ReportStatus::REJECTED)
                ->count();
            $reportsDraftBulanIni = Report::whereIn('user_id', $employeeIds)
                ->whereIn('assignment_id', $assignmentIdsBulanIni)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->where('status', ReportStatus::DRAFT)
                ->count();
            $reportsTotalBulanIni = Report::whereIn('user_id', $employeeIds)
                ->whereIn('assignment_id', $assignmentIdsBulanIni)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->count();

            // Statistik penugasan: leader melihat semua assignment (global, tidak filter unit kerja)
            $assignmentsTotalBulanIni = Assignment::whereMonth('start_date', $currentMonth)
                ->whereYear('start_date', $currentYear)
                ->count();

            $assignmentsTotalTahunIni = Assignment::whereYear('start_date', $currentYear)
                ->count();

            return [
                'leaderReportsDisetujuiBulanIni' => $reportsDisetujuiBulanIni,
                'leaderReportsDisubmitBulanIni' => $reportsDisubmitBulanIni,
                'leaderReportsDitolakBulanIni' => $reportsDitolakBulanIni,
                'leaderReportsDraftBulanIni' => $reportsDraftBulanIni,
                'leaderReportsTotalBulanIni' => $reportsTotalBulanIni,
                'leaderAssignmentsTotalBulanIni' => $assignmentsTotalBulanIni,
                'leaderAssignmentsTotalTahunIni' => $assignmentsTotalTahunIni,
            ];
        });
    }
}
