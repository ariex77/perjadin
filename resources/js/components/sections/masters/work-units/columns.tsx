import { Checkbox } from '@/components/ui/checkbox';
import { formatDayMonthYear } from '@/lib/date';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import type { WorkUnit } from '@/types/masters/work-unit';
import type { PaginationMeta } from '@/types/pagination';

export const createColumns = (meta: PaginationMeta): ColumnDef<WorkUnit>[] => [
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
        accessorKey: 'name',
        header: ({ column }) => (
            <button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center px-0">
                Nama Unit
                <ArrowUpDown className="ml-2 h-3 w-3" />
            </button>
        ),
    },
    {
        accessorKey: 'code',
        header: 'Kode',
        cell: ({ row }) => {
            return <div>{row.original.code}</div>;
        },
    },
    {
        accessorKey: 'description',
        header: 'Keterangan',
        cell: ({ row }) => {
            return <div className='max-w-sm line-clamp-5 text-wrap'>{row.original.description}</div>;
        },
    },
    {
        accessorKey: 'head_name',
        header: 'Ketua TIM',
        cell: ({ row }) => {
            return <div>{row.original.head_name ?? '-'}</div>;
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
