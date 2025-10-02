import { createColumns } from '@/components/sections/systems/roles/columns';
import { DataTable } from '@/components/sections/systems/roles/data-table';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { RoleResponse, Role } from '@/types/systems/role';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dasbor',
        href: '/dashboard',
    },
    {
        title: 'Kelola Role',
        href: '/systems/roles',
    },
];

export default function RolePage({ roles, search }: { roles: RoleResponse; search?: string }) {
    const { data, meta } = roles;
    const columns = createColumns(meta);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Role" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Kelola Role" subtitle="Daftar role di sistem E-Lapor Dinas" />
                <DataTable columns={columns} data={data as Role[]} pagination={meta} search={search} />
            </div>
        </AppLayout>
    );
}
