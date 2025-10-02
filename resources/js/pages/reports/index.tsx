import { Head, router } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ReportResponse } from '@/types/reports/report';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { getColumns } from '@/components/sections/reports/columns';
import { DataTable } from '@/components/sections/reports/data-table';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan Perjalanan', href: '' },
];

type Props = {
    reports: ReportResponse;
    isAdminOrSuperadmin: boolean;
    isLeader: boolean;
    isVerifikator: boolean;
    status: string;
    search: string;
    totals: {
        draft: number;
        submitted: number;
        rejected: number;
        approved: number;
    };
};

export default function ReportsIndex({ reports, isAdminOrSuperadmin, isLeader, isVerifikator, status, search = '', totals }: Props) {
    const { data, meta } = reports;
    const columns = getColumns({ isAdminOrSuperadmin, isLeader, isVerifikator, meta });

    // Redirect jika verificator/leader mencoba akses tab draft
    React.useEffect(() => {
        if ((isVerifikator || isLeader) && status === 'draft') {
            router.get(route('reports.index'), { status: 'submitted', search }, {
                preserveState: true,
                replace: true,
            });
        }
    }, [status, isVerifikator, isLeader, search]);

    // Validasi status yang valid untuk user role
    const validStatus = (isVerifikator || isLeader) && status === 'draft' ? 'submitted' : status;

    const handleTabChange = (value: string) => {
        const queryParams: { status: string; search?: string } = { status: value };
        if (search) queryParams.search = search;
        
        router.get(route('reports.index'), queryParams, {
            preserveState: true,
            replace: true,
        });
    };

    const getSubtitle = () => {
        if (isAdminOrSuperadmin) return "Daftar semua laporan pertanggung jawaban perjalanan";
        if (isVerifikator) return "Daftar laporan pertanggung jawaban perjalanan yang sudah lengkap";
        if (isLeader) return "Daftar laporan pertanggung jawaban perjalanan anggota unit kerja Anda yang sudah lengkap";
        return "Daftar semua laporan pertanggung jawaban perjalanan Anda";
    };

    const tabConfig = [
        // Verificator dan leader tidak bisa melihat tab draft
        ...(isVerifikator || isLeader ? [] : [{ value: 'draft', icon: FileText, label: 'Draft', count: totals.draft, bgColor: 'bg-gray-100', textColor: 'text-gray-800' }]),
        { value: 'submitted', icon: Clock, label: 'Submitted', count: totals.submitted, bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
        { value: 'approved', icon: CheckCircle, label: 'Approved', count: totals.approved, bgColor: 'bg-green-100', textColor: 'text-green-800' },
        { value: 'rejected', icon: XCircle, label: 'Rejected', count: totals.rejected, bgColor: 'bg-red-100', textColor: 'text-red-800' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Perjalanan" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Laporan Perjalanan"
                    subtitle={getSubtitle()}
                />

                <Tabs value={validStatus} onValueChange={handleTabChange} className="w-full">
                    <TabsList className={`grid w-full grid-cols-${tabConfig.length}`}>
                        {tabConfig.map(({ value, icon: Icon, label, count, bgColor, textColor }) => (
                            <TabsTrigger key={value} value={value} className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span className="hidden md:block">
                                    {label}
                                </span>
                                <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${bgColor} ${textColor}`}>
                                    {count}
                                </span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {tabConfig.map(({ value }) => (
                        <TabsContent key={value} value={value}>
                            <DataTable
                                columns={columns}
                                data={data}
                                pagination={meta}
                                search={search}
                                status={validStatus}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </AppLayout>
    );
}
