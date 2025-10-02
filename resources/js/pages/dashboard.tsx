import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import AppLayout from '@/layouts/app-layout';
import { getTravelTypeLabel } from '@/lib/utils';
import { type BreadcrumbItem, type DashboardProps } from '@/types';
import type { AssignmentReport, Assignment as AssignmentType, AssignmentUser } from '@/types/assignments/assignment';
import { Head } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, FileText, Target, TrendingUp, XCircle } from 'lucide-react';

import { formatDate } from '@/lib/format';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard(props: DashboardProps) {
    const {
        // Core statistics
        totalAssignments,
        totalDocumentations,
        assignmentsThisMonth,
        reportsThisMonth,
        reportsLastMonth,

        // New core statistics
        approvedReports,
        submittedReports,
        rejectedReports,
        totalReports,

        // Role flags
        isAdminOrSuperadmin = false,
        isLeader = false,
        isVerificator = false,
        isEmployee = false,

        // Admin statistics
        totalWorkUnits = 0,
        totalEmployees = 0,
        totalFullboardPrices = 0,
        pendingReviews = 0,
        approvedReviews = 0,
        rejectedReviews = 0,

        // Leader/Verificator statistics
        managedAssignments = 0,
        managedAssignmentsThisMonth = 0,
        myPendingReviews = 0,
        myApprovedReviews = 0,
        myRejectedReviews = 0,
        totalReviewsAssigned = 0,

        // Employee statistics
        myAssignments = 0,
        myReports = 0,
        myReportsDisetujui = 0,
        myReportsDitolak = 0,
        myAssignmentsThisMonth = 0,
        myReportsThisMonth = 0,

        // Recent activities
        recentAssignments = [],
        recentReports = [],
    } = props;

    // Verificator statistics (mirroring leader, but no unit kerja filter)
    const verificatorStats = [
        {
            title: 'Laporan Disetujui Bulan Ini',
            value: props.leaderReportsDisetujuiBulanIni ?? 0,
            icon: <CheckCircle className="h-5 w-5 text-white" />,
            containerClassName: 'bg-green-600 text-white border-t-2 border-t-green-600',
        },
        {
            title: 'Laporan Disubmit Bulan Ini',
            value: props.leaderReportsDisubmitBulanIni ?? 0,
            icon: <TrendingUp className="h-5 w-5 text-white" />,
            containerClassName: 'bg-amber-600 text-white border-t-2 border-t-amber-600',
        },
        {
            title: 'Laporan Ditolak Bulan Ini',
            value: props.leaderReportsDitolakBulanIni ?? 0,
            icon: <XCircle className="h-5 w-5 text-white" />,
            containerClassName: 'bg-red-600 text-white border-t-2 border-t-red-600',
        },
        {
            title: 'Laporan Draft Bulan Ini',
            value: props.leaderReportsDraftBulanIni ?? 0,
            icon: <Clock className="h-5 w-5 text-white" />,
            containerClassName: 'bg-gray-600 text-white border-t-2 border-t-gray-600',
        },
        {
            title: 'Total Laporan Bulan Ini',
            value:
                (props.leaderReportsDisetujuiBulanIni ?? 0) +
                (props.leaderReportsDisubmitBulanIni ?? 0) +
                (props.leaderReportsDitolakBulanIni ?? 0) +
                (props.leaderReportsDraftBulanIni ?? 0),
            icon: <FileText className="h-5 w-5 text-white" />,
            containerClassName: 'bg-blue-600 text-white border-t-2 border-t-blue-600',
        },
        {
            title: 'Total Penugasan Bulan Ini',
            value: props.leaderAssignmentsTotalBulanIni ?? 0,
            icon: <Calendar className="h-5 w-5 text-white" />,
            containerClassName: 'bg-amber-600 text-white border-t-2 border-t-amber-600',
        },
        {
            title: 'Total Penugasan Tahun Ini',
            value: props.leaderAssignmentsTotalTahunIni ?? 0,
            icon: <Calendar className="h-5 w-5 text-white" />,
            containerClassName: 'bg-indigo-600 text-white border-t-2 border-t-indigo-600',
        },
    ];

    // Admin/Superadmin statistics: use adminReports... and adminAssignments... props
    const adminSuperadminStats = isAdminOrSuperadmin
        ? [
              {
                  title: 'Laporan Disetujui Bulan Ini',
                  value: props.adminReportsDisetujuiBulanIni ?? 0,
                  icon: <CheckCircle className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-green-600 text-white border-t-2 border-t-green-600',
              },
              {
                  title: 'Laporan Disubmit Bulan Ini',
                  value: props.adminReportsDisubmitBulanIni ?? 0,
                  icon: <TrendingUp className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-amber-600 text-white border-t-2 border-t-amber-600',
              },
              {
                  title: 'Laporan Ditolak Bulan Ini',
                  value: props.adminReportsDitolakBulanIni ?? 0,
                  icon: <XCircle className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-red-600 text-white border-t-2 border-t-red-600',
              },
              {
                  title: 'Laporan Draft Bulan Ini',
                  value: props.adminReportsDraftBulanIni ?? 0,
                  icon: <Clock className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-gray-600 text-white border-t-2 border-t-gray-600',
              },
              {
                  title: 'Total Laporan Bulan Ini',
                  value:
                      (props.adminReportsDisetujuiBulanIni ?? 0) +
                      (props.adminReportsDisubmitBulanIni ?? 0) +
                      (props.adminReportsDitolakBulanIni ?? 0) +
                      (props.adminReportsDraftBulanIni ?? 0),
                  icon: <FileText className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-blue-600 text-white border-t-2 border-t-blue-600',
              },
              {
                  title: 'Total Penugasan Bulan Ini',
                  value: props.adminAssignmentsTotalBulanIni ?? 0,
                  icon: <Calendar className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-amber-600 text-white border-t-2 border-t-amber-600',
              },
              {
                  title: 'Total Penugasan Tahun Ini',
                  value: props.adminAssignmentsTotalTahunIni ?? 0,
                  icon: <Calendar className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-indigo-600 text-white border-t-2 border-t-indigo-600',
              },
          ]
        : [];

    // Statistik Admin (original) tetap tampil untuk Admin/Superadmin
    const adminStats = isAdminOrSuperadmin
        ? [
              {
                  title: 'Total Unit Kerja',
                  value: totalWorkUnits,
                  icon: <Calendar className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-slate-600 text-white border-t-2 border-t-slate-600',
              },
              {
                  title: 'Total Pegawai',
                  value: totalEmployees,
                  icon: <CheckCircle className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-violet-600 text-white border-t-2 border-t-violet-600',
              },
              {
                  title: 'Total Harga Fullboard',
                  value: totalFullboardPrices,
                  icon: <FileText className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-rose-600 text-white border-t-2 border-t-rose-600',
              },
          ]
        : [];

    // Leader statistics: laporan tetap filter unit kerja, penugasan total pakai data global
    const leaderStats = isLeader
        ? [
              {
                  title: 'Laporan Disetujui Bulan Ini (Unit Kerja)',
                  value: props.leaderReportsDisetujuiBulanIni ?? 0,
                  icon: <CheckCircle className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-green-600 text-white border-t-2 border-t-green-600',
              },
              {
                  title: 'Laporan Disubmit Bulan Ini (Unit Kerja)',
                  value: props.leaderReportsDisubmitBulanIni ?? 0,
                  icon: <TrendingUp className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-amber-600 text-white border-t-2 border-t-amber-600',
              },
              {
                  title: 'Laporan Ditolak Bulan Ini (Unit Kerja)',
                  value: props.leaderReportsDitolakBulanIni ?? 0,
                  icon: <XCircle className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-red-600 text-white border-t-2 border-t-red-600',
              },
              {
                  title: 'Laporan Draft Pegawai Bulan Ini (Unit Kerja)',
                  value: props.leaderReportsDraftBulanIni ?? 0,
                  icon: <Clock className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-gray-600 text-white border-t-2 border-t-gray-600',
              },
              {
                  title: 'Total Laporan Bulan Ini (Unit Kerja)',
                  value:
                      (props.leaderReportsDisetujuiBulanIni ?? 0) +
                      (props.leaderReportsDisubmitBulanIni ?? 0) +
                      (props.leaderReportsDitolakBulanIni ?? 0) +
                      (props.leaderReportsDraftBulanIni ?? 0),
                  icon: <FileText className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-blue-600 text-white border-t-2 border-t-blue-600',
              },
              {
                  title: 'Total Penugasan Bulan Ini',
                  value: props.adminAssignmentsTotalBulanIni ?? props.leaderAssignmentsTotalBulanIni ?? 0,
                  icon: <Calendar className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-amber-600 text-white border-t-2 border-t-amber-600',
              },
              {
                  title: 'Total Penugasan Tahun Ini',
                  value: props.adminAssignmentsTotalTahunIni ?? props.leaderAssignmentsTotalTahunIni ?? 0,
                  icon: <Calendar className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-indigo-600 text-white border-t-2 border-t-indigo-600',
              },
          ]
        : [];

    // Verificator statistics (mirroring leader, but no unit kerja filter)

    // Employee statistics (only for role Employee)
    const employeeStats = isEmployee
        ? [
              {
                  title: 'Laporan Disetujui Bulan Ini',
                  value: props.myReportsDisetujuiBulanIni ?? 0,
                  icon: <CheckCircle className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-green-600 text-white border-t-2 border-t-green-600',
              },
              {
                  title: 'Laporan Disubmit Bulan Ini',
                  value: props.myReportsDisubmitBulanIni ?? 0,
                  icon: <TrendingUp className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-amber-600 text-white border-t-2 border-t-amber-600',
              },
              {
                  title: 'Laporan Draft Bulan Ini',
                  value: props.myReportsDraftBulanIni ?? 0,
                  icon: <Clock className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-gray-600 text-white border-t-2 border-t-gray-600',
              },
              {
                  title: 'Laporan Ditolak Bulan Ini',
                  value: props.myReportsDitolakBulanIni ?? 0,
                  icon: <XCircle className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-red-600 text-white border-t-2 border-t-red-600',
              },
              {
                  title: 'Total Laporan Bulan Ini',
                  value: props.myReportsTotalBulanIni ?? 0,
                  icon: <FileText className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-blue-600 text-white border-t-2 border-t-blue-600',
              },
              {
                  title: 'Total Penugasan Bulan Ini',
                  value: props.myAssignmentsTotalBulanIni ?? 0,
                  icon: <Calendar className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-amber-600 text-white border-t-2 border-t-amber-600',
              },
              {
                  title: 'Total Penugasan Tahun Ini',
                  value: props.myAssignmentsTotalTahunIni ?? 0,
                  icon: <Calendar className="h-5 w-5 text-white" />,
                  containerClassName: 'bg-indigo-600 text-white border-t-2 border-t-indigo-600',
              },
          ]
        : [];

    // Recent activities statistics
    const recentActivitiesStats = [
        {
            title: 'Laporan Disetujui',
            value: approvedReports,
            icon: <FileText className="h-5 w-5 text-white" />,
            containerClassName: 'bg-green-600 text-white',
        },
        {
            title: 'Laporan Submitted',
            value: submittedReports,
            icon: <TrendingUp className="h-5 w-5 text-white" />,
            containerClassName: 'bg-amber-600 text-white border-t-2 border-t-amber-600',
        },
        {
            title: 'Laporan Ditolak',
            value: rejectedReports,
            icon: <XCircle className="h-5 w-5 text-white" />,
            containerClassName: 'bg-red-600 text-white border-t-2 border-t-red-600',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - E-Perjadin" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Statistics based on user role */}
                {isEmployee ? (
                    // Employee: Show only personal statistics
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {employeeStats.map((item, index) => (
                                <StatCard
                                    key={`employee-${index}`}
                                    title={item.title}
                                    value={item.value}
                                    icon={item.icon}
                                    containerClassName={item.containerClassName}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    // Admin/Superadmin/Leader/Verificator: Show all statistics
                    <>
                        {/* Admin/Superadmin Statistics (verificator-style) */}
                        {isAdminOrSuperadmin && adminSuperadminStats.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">Statistik Laporan & Penugasan (Admin/Superadmin)</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                    {adminSuperadminStats.map((item, index) => (
                                        <StatCard
                                            key={`adminsuperadmin-${index}`}
                                            title={item.title}
                                            value={item.value}
                                            icon={item.icon}
                                            containerClassName={item.containerClassName}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Statistik Admin (original) tetap tampil untuk Admin/Superadmin */}
                        {isAdminOrSuperadmin && adminStats.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">Statistik Admin</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                    {adminStats.map((item, index) => (
                                        <StatCard
                                            key={`admin-${index}`}
                                            title={item.title}
                                            value={item.value}
                                            icon={item.icon}
                                            containerClassName={item.containerClassName}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Verificator Statistics */}
                        {isVerificator && verificatorStats.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">Statistik Laporan & Penugasan (Verifikator)</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                    {verificatorStats.map((item, index) => (
                                        <StatCard
                                            key={`verificator-${index}`}
                                            title={item.title}
                                            value={item.value}
                                            icon={item.icon}
                                            containerClassName={item.containerClassName}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Leader Statistics */}
                        {isLeader && leaderStats.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">Statistik Laporan & Penugasan Pegawai dalam Unit Kerja</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                    {leaderStats.map((item, index) => (
                                        <StatCard
                                            key={`leader-${index}`}
                                            title={item.title}
                                            value={item.value}
                                            icon={item.icon}
                                            containerClassName={item.containerClassName}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Recent Activities */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Assignments */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Penugasan Terbaru
                            </CardTitle>
                            <CardDescription>Penugasan yang baru-baru ini dibuat</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentAssignments.length > 0 ? (
                                <div className="space-y-3">
                                    {/* Untuk leader, pastikan recentAssignments sudah global dari backend. Jika belum, filter di sini. */}
                                    {recentAssignments.map((assignment: AssignmentType) => (
                                        <div key={assignment.id} className="rounded-lg border p-3">
                                            <div className="space-y-1">
                                                <CardTitle className="line-clamp-2 overflow-hidden font-medium break-words whitespace-normal">
                                                    {assignment.purpose}
                                                </CardTitle>
                                                <CardDescription>
                                                    {assignment.destination} • {formatDate(assignment.start_date)} - {formatDate(assignment.end_date)}
                                                </CardDescription>
                                                {assignment.users && (
                                                    <div className="flex gap-1">
                                                        {assignment.users.slice(0, 3).map((user: AssignmentUser) => (
                                                            <Badge key={user.id} variant="secondary" className="text-xs">
                                                                {user.name}
                                                            </Badge>
                                                        ))}
                                                        {assignment.users.length > 3 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{assignment.users.length - 3} lainnya
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-muted-foreground">Belum ada penugasan terbaru</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Reports */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Laporan Terbaru
                            </CardTitle>
                            <CardDescription>Laporan yang baru-baru ini dibuat</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentReports.length > 0 ? (
                                <div className="space-y-3">
                                    {recentReports.map((report: AssignmentReport) => (
                                        <div key={report.id} className="rounded-lg border p-3">
                                            <div className="space-y-1">
                                                <CardTitle className="line-clamp-2 overflow-hidden font-medium break-words whitespace-normal">
                                                    {report.assignment?.purpose || `Laporan #${report.id}`}
                                                </CardTitle>
                                                <CardDescription>
                                                    {report.user?.name || 'User'} • {getTravelTypeLabel(report.travel_type)} •{' '}
                                                    {report.assignment?.destination}
                                                </CardDescription>
                                                <p className="text-xs text-muted-foreground">{formatDate(report.created_at)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-muted-foreground">Belum ada laporan terbaru</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
