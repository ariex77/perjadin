import { formatDayMonthYear } from '@/lib/date';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import type { Role } from '@/types/systems/role';
import type { PaginationMeta } from '@/types/pagination';

export const createColumns = (meta: PaginationMeta): ColumnDef<Role>[] => [
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
                Nama Role
                <ArrowUpDown className="ml-2 h-3 w-3" />
            </button>
        ),
    },
    {
        accessorKey: 'guard_name',
        header: 'Guard Name',
        cell: ({ row }) => {
            return <div className="font-mono text-sm">{row.original.guard_name}</div>;
        },
    },
    {
        accessorKey: 'permissions_count',
        header: () => <div className="text-center">Jumlah Permission</div>,
        cell: ({ row }) => {
            return <div className="text-center">{row.original.permissions_count || 0}</div>;
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Tanggal Dibuat',
        cell: ({ row }) => {
            return <div>{formatDayMonthYear(row.getValue('created_at'))}</div>;
        },
    },
];
