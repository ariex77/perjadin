import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PaginationMeta } from '@/types/pagination';
import { router, usePage } from '@inertiajs/react';
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
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pagination?: PaginationMeta;
    search?: string;
    status?: string;
}

export function DataTable<TData, TValue>({ columns, data, pagination, search = '', status }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [searchValue, setSearchValue] = React.useState(search);

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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    });

    const handlePageChange = (page: number) => {
        const queryParams: { page?: number; search?: string; status?: string } = {};
        if (page > 1) queryParams.page = page;
        if (searchValue) queryParams.search = searchValue;
        
        // Get current status from props or parameter
        const currentStatus = status || (usePage().props.status as string);
        if (currentStatus && currentStatus !== 'all') queryParams.status = currentStatus;

        router.get(route('reports.index'), queryParams, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchChange = React.useCallback(
        React.useMemo(
            () => {
                let timeoutId: NodeJS.Timeout;
                return (event: React.ChangeEvent<HTMLInputElement>) => {
                    const newSearchValue = event.target.value;
                    setSearchValue(newSearchValue);

                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        const queryParams: { search?: string; status?: string } = {};
                        if (newSearchValue) {
                            queryParams.search = newSearchValue;
                        }
                        
                        // Get current status from props or parameter
                        const currentStatus = status || (usePage().props.status as string);
                        if (currentStatus && currentStatus !== 'all') queryParams.status = currentStatus;

                        router.get(route('reports.index'), queryParams, {
                            preserveState: true,
                            replace: true,
                        });
                    }, 300);
                };
            },
            []
        ),
        []
    );

    const clearSearch = () => {
        setSearchValue('');
        const queryParams: { status?: string } = {};
        
        // Get current status from props or parameter
        const currentStatus = status || (usePage().props.status as string);
        if (currentStatus && currentStatus !== 'all') queryParams.status = currentStatus;
        
        router.get(route('reports.index'), queryParams, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <div className="w-full space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap w-full gap-2 sm:flex-nowrap">
                    {/* Search */}
                    <div className="relative w-full">
                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari laporan perjalanan..."
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
                {/* Active Filters */}
                {searchValue && (
                    <div className="flex flex-wrap gap-2 mt-1">
                        <div className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                            <span>Cari: {searchValue}</span>
                            <Button variant="ghost" size="sm" onClick={clearSearch} className="h-4 w-4 p-0 hover:bg-transparent">
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                )}
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
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={
                                                cell.column.id === 'actions'
                                                    ? 'w-[100px]'
                                                    : cell.column.id === 'no'
                                                        ? 'w-[50px]'
                                                        : undefined
                                            }
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {searchValue ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <p>Tidak ada laporan yang ditemukan untuk pencarian "{searchValue}"</p>
                                            <Button variant="outline" size="sm" onClick={clearSearch}>
                                                Hapus pencarian
                                            </Button>
                                        </div>
                                    ) : (
                                        'Laporan tidak tersedia.'
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
