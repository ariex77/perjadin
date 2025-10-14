import { createColumns } from '@/components/sections/masters/fullboard-prices/columns';
import { DataTable } from '@/components/sections/masters/fullboard-prices/data-table';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { FullboardPriceResponse, FullboardPrice } from '@/types/masters/fullboard-price';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dasbor',
        href: '/dashboard',
    },
    {
        title: 'Kelola Uang Harian',
        href: '/masters/fullboard-prices',
    },
];

export default function FullboardPricePage({ FullboardPrices, search }: { FullboardPrices: FullboardPriceResponse; search?: string }) {
    const { data, meta } = FullboardPrices;
    const columns = createColumns(meta);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Harga Uang Harian" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Kelola Harga Uang Harian" subtitle="Daftar harga uang harian E-Perjadin" />
                <DataTable columns={columns} data={data as FullboardPrice[]} pagination={meta} search={search} />
            </div>
        </AppLayout>
    );
}
