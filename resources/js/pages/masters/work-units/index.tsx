import { createColumns } from '@/components/sections/masters/work-units/columns';
import { DataTable } from '@/components/sections/masters/work-units/data-table';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { WorkUnitResponse, WorkUnit } from '@/types/masters/work-unit';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dasbor',
        href: '/dashboard',
    },
    {
        title: 'Kelola Unit Kerja',
        href: '/masters/work-units',
    },
];

export default function WorkUnitPage({ workUnits, search }: { workUnits: WorkUnitResponse; search?: string }) {
    const { data, meta } = workUnits;
    const columns = createColumns(meta);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Unit Kerja" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Kelola Unit Kerja" subtitle="Daftar unit kerja di E-Lapor Dinas" />
                <DataTable columns={columns} data={data as WorkUnit[]} pagination={meta} search={search} />
            </div>
        </AppLayout>
    );
}
