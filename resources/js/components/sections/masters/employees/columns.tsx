import { Checkbox } from '@/components/ui/checkbox';
import { formatDayMonthYear } from '@/lib/date';
import { getUserPhotoUrl } from '@/lib/file';
import { getInitials } from '@/lib/initials';
import type { PaginationMeta } from '@/types/pagination';
import type { Employee } from '@/types/masters/employee';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export const createColumns = (meta: PaginationMeta): ColumnDef<Employee>[] => [
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
        header: 'Avatar',
        accessorKey: 'photo',
        cell: ({ row }) => {
            // Only use photo if it exists on the Teacher type
            const photo = (row.original as any).photo;
            const photoUrl = getUserPhotoUrl(photo);
            return photoUrl ? (
                <img src={photoUrl} alt={row.original.name} width={40} height={40} className="size-10 object-cover rounded-full" />
            ) : (
                <div className="size-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {getInitials(row.original.name)}
                </div>
            );
        },
    },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center px-0">
                Nama
                <ArrowUpDown className="ml-2 h-3 w-3" />
            </button>
        ),
        cell: ({ row }) => {
            const name = row.getValue('name') as string;
            const username = row.original.username;
            return (
                <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <span>{name}</span>
                        {username && <span className="text-xs">@{username}</span>}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'nip',
        header: 'NIP',
        cell: ({ row }) => {
            return <div>{row.getValue('nip')}</div>;
        },
    },
    {
        accessorKey: 'email',
        header: ({ column }) => (
            <button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center px-0">
                Email
                <ArrowUpDown className="ml-2 h-3 w-3" />
            </button>
        ),
        cell: ({ row }) => row.original.email ?? '-',
    },
    {
        header: "Unit Kerja",
        accessorKey: "workUnit.name",
        cell: ({ row }) => row.original.workUnit?.name ?? '-',
    },
    {
        accessorKey: 'created_at',
        header: 'Tanggal dibuat',
        cell: ({ row }) => {
            return <div>{formatDayMonthYear(row.getValue('created_at'))}</div>;
        },
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => null, // TableActions dihandle di DataTable
        enableSorting: false,
        enableHiding: false,
    },
];
