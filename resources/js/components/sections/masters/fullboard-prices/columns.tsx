import { Checkbox } from '@/components/ui/checkbox';
import { formatDayMonthYear } from '@/lib/date';
import { formatNumber } from '@/lib/format';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import type { FullboardPrice } from '@/types/masters/fullboard-price';
import type { PaginationMeta } from '@/types/pagination';

export const createColumns = (meta: PaginationMeta): ColumnDef<FullboardPrice>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'no',
        header: () => <div className="text-center">No</div>,
        cell: ({ row }) => {
            return <div className="text-center">{meta.from + row.index}</div>;
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'province_name',
        header: ({ column }) => (
            <button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center px-0">
                Provinsi
                <ArrowUpDown className="ml-2 h-3 w-3" />
            </button>
        ),
    },

    {
        accessorKey: 'price',
        header: ({ column }) => (
            <button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center px-0">
                Harga
                <ArrowUpDown className="ml-2 h-3 w-3" />
            </button>
        ),
        cell: ({ row }) => {
            const value = row.getValue<number>('price');
            return <div className="tabular-nums">Rp {formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>;
        },
    },

    {
        accessorKey: 'created_at',
        header: 'Tanggal Dibuat',
        cell: ({ row }) => {
            return <div>{formatDayMonthYear(row.getValue('created_at'))}</div>;
        },
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: () => {
            return null;
        },
        enableSorting: false,
        enableHiding: false,
    },
];
