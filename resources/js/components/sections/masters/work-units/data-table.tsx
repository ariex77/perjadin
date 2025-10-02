import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableActions } from '@/components/ui/table-actions';
import type { WorkUnit } from '@/types/masters/work-unit';
import type { PaginationMeta } from '@/types/pagination';
import { router, useForm, usePage } from '@inertiajs/react';
import { useNavigation } from '@/lib/navigation';
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pagination?: PaginationMeta;
    search?: string;
}

export function DataTable<TData, TValue>({ columns, data, pagination, search = '' }: DataTableProps<TData, TValue>) {
    const { navigateToCreate, navigateToEdit, navigateWithQuery } = useNavigation();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [searchValue, setSearchValue] = React.useState(search);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState<number | null>(null);
    const [deleteType, setDeleteType] = React.useState<'single' | 'bulk'>('single');

    const {
        delete: deleteRequest,
        post,
        processing,
        setData,
    } = useForm({
        ids: [] as number[],
    });

    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string } | undefined;

    React.useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const handleBulkDelete = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const selectedIds = selectedRows.map((row) => (row.original as WorkUnit).id);
        setData('ids', selectedIds);
        setDeleteType('bulk');
        setIsDeleteDialogOpen(true);
    };

    const handleSingleDelete = (id: number) => {
        setSelectedId(id);
        setDeleteType('single');
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (deleteType === 'single' && selectedId) {
            deleteRequest(route('masters.work-units.destroy', selectedId), {
                onBefore: () => {
                    toast.loading('Sedang memproses...');
                },
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setRowSelection({});
                    setSelectedId(null);
                    table.resetRowSelection();
                    toast.dismiss();
                },
                onError: () => {
                    setIsDeleteDialogOpen(false);
                    setSelectedId(null);
                    toast.dismiss();
                    toast.error('Terjadi kesalahan saat menghapus unit kerja.');
                },
            });
        } else {
            post(route('masters.work-units.bulk-delete'), {
                onBefore: () => {
                    toast.loading('Sedang memproses...');
                },
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setRowSelection({});
                    setSelectedId(null);
                    table.resetRowSelection();
                    setData('ids', []);
                    toast.dismiss();
                },
                onError: () => {
                    setIsDeleteDialogOpen(false);
                    setSelectedId(null);
                    toast.dismiss();
                    setData('ids', []);
                    toast.error('Terjadi kesalahan saat menghapus unit kerja.');
                },
            });
        }
    };

    const handlePageChange = (page: number) => {
        const queryParams: { page?: number; search?: string } = {};
        if (page > 1) queryParams.page = page;
        if (searchValue) queryParams.search = searchValue;

        navigateWithQuery('masters.work-units.index', queryParams, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchValue = event.target.value;
        setSearchValue(newSearchValue);

        const queryParams: { search?: string } = {};
        if (newSearchValue) {
            queryParams.search = newSearchValue;
        }

        navigateWithQuery('masters.work-units.index', queryParams, {
            preserveState: true,
            replace: true,
        });
    };

    const clearSearch = () => {
        setSearchValue('');
        navigateWithQuery(
            'masters.work-units.index',
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const selectedRowsCount = table.getSelectedRowModel().rows.length;

    return (
        <div className="w-full space-y-4">
            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onDelete={confirmDelete}
                title={deleteType === 'single' ? 'Hapus unit kerja?' : 'Hapus unit kerja yang dipilih?'}
                description={
                    deleteType === 'single'
                        ? 'Tindakan ini tidak dapat dibatalkan. unit kerja ini akan dihapus secara permanen dari sistem.'
                        : `Tindakan ini tidak dapat dibatalkan. ${selectedRowsCount} unit kerja yang dipilih akan dihapus secara permanen dari sistem.`
                }
                disabled={processing}
            />

            {/* Action Bar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative w-full">
                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari unit kerja..."
                            value={searchValue}
                            onChange={handleSearchChange}
                            className="w-full pr-8 pl-8 md:w-[300px]"
                        />
                        {searchValue && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearSearch}
                                className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                                            <Button onClick={() => navigateToCreate('masters.work-units')}>
                            <Plus className="h-4 w-4" />
                            Tambah
                        </Button>
                    {selectedRowsCount > 0 && (
                        <Button variant="destructive" onClick={handleBulkDelete} disabled={processing}>
                            Hapus ({selectedRowsCount})
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={
                                            header.id === 'actions'
                                                ? 'w-[100px]'
                                                : header.id === 'no'
                                                  ? 'w-[50px]'
                                                  : header.id === 'select'
                                                    ? 'w-[32px]'
                                                    : undefined
                                        }
                                    >
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={
                                                cell.column.id === 'actions'
                                                    ? 'w-[100px]'
                                                    : cell.column.id === 'no'
                                                      ? 'w-[50px]'
                                                      : cell.column.id === 'select'
                                                        ? 'w-[32px]'
                                                        : undefined
                                            }
                                        >
                                            {cell.column.id === 'actions' ? (
                                                <TableActions
                                                    onEdit={() => navigateToEdit('masters.work-units', (row.original as WorkUnit).id)}
                                                    onDelete={() => handleSingleDelete((row.original as WorkUnit).id)}
                                                />
                                            ) : (
                                                flexRender(cell.column.columnDef.cell, cell.getContext())
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {searchValue ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <p>Tidak ada unit kerja yang ditemukan untuk pencarian "{searchValue}"</p>
                                            <Button variant="outline" size="sm" onClick={clearSearch}>
                                                Hapus pencarian
                                            </Button>
                                        </div>
                                    ) : (
                                        'unit kerja tidak tersedia.'
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination - Always show when there's data */}
            {data.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {pagination
                            ? searchValue
                                ? `Ditemukan ${pagination.total} hasil untuk "${searchValue}"`
                                : `Menampilkan ${pagination.from} - ${pagination.to} dari ${pagination.total} hasil`
                            : `Menampilkan ${data.length} hasil`}
                    </div>

                    {pagination && pagination.last_page > 1 && (
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-1">
                                {/* Show page numbers */}
                                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                    const pageNum = i + 1;
                                    if (pagination.last_page <= 5) {
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={pagination.current_page === pageNum ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum)}
                                                className="h-8 w-8 p-0"
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    }
                                    return null;
                                })}

                                {pagination.last_page > 5 && (
                                    <span className="px-2 text-sm text-muted-foreground">
                                        Page {pagination.current_page} of {pagination.last_page}
                                    </span>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
