import { createColumns } from '@/components/sections/masters/employees/columns';
import { DataTable } from '@/components/sections/masters/employees/data-table';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { EmployeeResponse, Employee } from '@/types/masters/employee';
import { AdminOrSuperadmin } from '@/components/role-guard';
import { AccessDenied } from '@/components/access-denied';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dasbor',
        href: '/dashboard',
    },
    {
        title: 'Kelola Pegawai',
        href: '/masters/employees',
    },
];

export default function EmployeePage({ 
    employees, 
    search, 
    workUnits, 
    workUnitId 
}: { 
    employees: EmployeeResponse; 
    search?: string;
    workUnits: { value: string; label: string }[];
    workUnitId?: string;
}) {
    const { data, meta } = employees;
    const columns = createColumns(meta);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Pegawai" />
            <AdminOrSuperadmin fallback={<AccessDenied />}>
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <PageHeader title="Kelola Pegawai" subtitle="Daftar pegawai di E-Perjadin" />
                    <DataTable 
                        columns={columns} 
                        data={data as Employee[]} 
                        pagination={meta} 
                        search={search}
                        workUnits={workUnits}
                        workUnitId={workUnitId}
                    />
                </div>
            </AdminOrSuperadmin>
        </AppLayout>
    );
}
