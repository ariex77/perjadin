import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableActions } from '@/components/ui/table-actions';
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
import { Plus, Search, Upload, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Filter, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pagination?: PaginationMeta;
    search?: string;
    workUnits: { value: string; label: string }[];
    workUnitId?: string;
}

interface TeacherData {
    id: number;
    name: string;
    username: string;
    email: string;
    email_verified_at?: string;
    nip?: string;
    work_unit_id?: number;
    workUnit?: {
        id: number;
        name: string;
    };
    photo?: string | null;
    created_at: string;
    roles?: string[];
}

export function DataTable<TData, TValue>({ columns, data, pagination, search = '', workUnits = [], workUnitId }: DataTableProps<TData, TValue>) {
    const { navigateToCreate, navigateToShow, navigateToEdit, navigateWithQuery } = useNavigation();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [searchValue, setSearchValue] = React.useState(search);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState<number | null>(null);
    const [deleteType, setDeleteType] = React.useState<'single' | 'bulk'>('single');

    // State untuk filter unit kerja
    const [selectedWorkUnit, setSelectedWorkUnit] = React.useState<string>(workUnitId || "");
    const [workUnitOpen, setWorkUnitOpen] = React.useState(false);
    const [workUnitSearchValue, setWorkUnitSearchValue] = React.useState("");

    // Filtered data
    const filteredWorkUnits = React.useMemo(() => {
        if (!workUnitSearchValue) return workUnits;
        return workUnits.filter((w) => w.label.toLowerCase().includes(workUnitSearchValue.toLowerCase()));
    }, [workUnits, workUnitSearchValue]);
    
    const selectedWorkUnitLabel = React.useMemo(() => {
        if (!selectedWorkUnit) return 'Pilih Unit Kerja';
        const w = workUnits.find((x) => String(x.value) === String(selectedWorkUnit));
        return w ? w.label : 'Pilih Unit Kerja';
    }, [selectedWorkUnit, workUnits]);

    // Handler apply filter
    const applyFilters = React.useCallback((overrides: { search?: string; work_unit_id?: string; page?: number } = {}) => {
        const queryParams: Record<string, any> = {};
        const finalSearch = overrides.search !== undefined ? overrides.search : searchValue;
        const finalWorkUnit = overrides.work_unit_id !== undefined ? overrides.work_unit_id : selectedWorkUnit;
        const finalPage = overrides.page !== undefined ? overrides.page : 1;
        if (finalSearch) queryParams.search = finalSearch;
        if (finalWorkUnit) queryParams.work_unit_id = finalWorkUnit;
        if (finalPage > 1) queryParams.page = finalPage;
        navigateWithQuery('masters.employees.index', queryParams, { preserveState: true, replace: true });
    }, [searchValue, selectedWorkUnit]);

    // Handler perubahan filter
    const handleWorkUnitChange = (value: string) => {
        setSelectedWorkUnit(value);
        setWorkUnitOpen(false);
        setWorkUnitSearchValue("");
        applyFilters({ work_unit_id: value, page: 1 });
    };
    
    const clearWorkUnitFilter = () => {
        setSelectedWorkUnit("");
        applyFilters({ work_unit_id: "", page: 1 });
    };
    
    const clearAllFilters = () => {
        setSearchValue("");
        setSelectedWorkUnit("");
        setWorkUnitSearchValue("");
        navigateWithQuery('masters.employees.index', {}, { preserveState: true, replace: true });
    };


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
        const selectedIds = selectedRows.map((row) => (row.original as TeacherData).id);
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
            deleteRequest(route('masters.employees.destroy', { user: selectedId }), {
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
                    toast.error('Terjadi kesalahan saat menghapus pegawai.');
                },
            });
        } else {
            post(route('masters.employees.bulk-delete'), {
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
                    toast.error('Terjadi kesalahan saat menghapus pegawai.');
                },
            });
        }
    };

    const handlePageChange = (page: number) => {
        const queryParams: { page?: number; search?: string; work_unit_id?: string } = {};
        if (page > 1) queryParams.page = page;
        if (searchValue) queryParams.search = searchValue;
        if (selectedWorkUnit) queryParams.work_unit_id = selectedWorkUnit;

        navigateWithQuery('masters.employees.index', queryParams, {
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
                        const queryParams: { search?: string; work_unit_id?: string } = {};
                        if (newSearchValue) {
                            queryParams.search = newSearchValue;
                        }
                        if (selectedWorkUnit) {
                            queryParams.work_unit_id = selectedWorkUnit;
                        }

                        navigateWithQuery('masters.employees.index', queryParams, {
                            preserveState: true,
                            replace: true,
                        });
                    }, 300);
                };
            },
            [selectedWorkUnit, navigateWithQuery]
        ),
        [selectedWorkUnit, navigateWithQuery]
    );

    const clearSearch = () => {
        setSearchValue('');
        const queryParams: { work_unit_id?: string } = {};
        if (selectedWorkUnit) queryParams.work_unit_id = selectedWorkUnit;
        
        router.get(
            route('masters.employees.index'),
            queryParams,
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
                title={deleteType === 'single' ? 'Hapus pegawai?' : 'Hapus pegawai yang dipilih?'}
                description={
                    deleteType === 'single'
                        ? 'Tindakan ini tidak dapat dibatalkan. Pegawai ini akan dihapus secara permanen dari sistem.'
                        : `Tindakan ini tidak dapat dibatalkan. ${selectedRowsCount} pegawai yang dipilih akan dihapus secara permanen dari sistem.`
                }
                disabled={processing}
            />

            {/* Filter Bar */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap w-full gap-2 sm:flex-nowrap">
                    {/* Filter Section - 2/3 width */}
                    <div className="grid grid-cols-2 gap-2 w-full sm:w-2/3">
                        {/* Search */}
                        <div className="relative w-full md:w-full">
                            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari pegawai..."
                                value={searchValue}
                                onChange={handleSearchChange}
                                className="w-full pr-8 pl-8"
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
                        {/* Work Unit Filter */}
                        <div className="w-full flex-shrink-0">
                            <Popover open={workUnitOpen} onOpenChange={setWorkUnitOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={workUnitOpen} className="w-full flex items-center bg-transparent justify-between">
                                        <span className="truncate text-left flex-1">{selectedWorkUnitLabel}</span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-sm p-0" align="end">
                                    <Command>
                                        <CommandInput placeholder="Cari unit kerja..." value={workUnitSearchValue} onValueChange={setWorkUnitSearchValue} />
                                        <CommandList>
                                            <CommandEmpty>Unit kerja tidak ditemukan.</CommandEmpty>
                                            <CommandGroup>
                                                {filteredWorkUnits.map((workUnit) => (
                                                    <CommandItem key={workUnit.value} value={workUnit.label} onSelect={() => handleWorkUnitChange(String(workUnit.value))}>
                                                        <Check className={cn('mr-2 h-4 w-4', selectedWorkUnit === String(workUnit.value) ? 'opacity-100' : 'opacity-0')} />
                                                        {workUnit.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    {/* Action Buttons Section - 1/3 width */}
                    <div className="flex gap-2 w-full sm:w-1/3 sm:justify-end">
                        <Button onClick={() => navigateToCreate('masters.employees')} className="w-full sm:w-auto" variant="outline">
                            <Upload className="h-4 w-4" />
                            Import 
                        </Button>
                        <Button onClick={() => navigateToCreate('masters.employees')} className="w-full sm:w-auto">
                            <Plus className="h-4 w-4" />
                            Tambah
                        </Button>
                        {selectedRowsCount > 0 && (
                            <Button variant="destructive" onClick={handleBulkDelete} disabled={processing} className="w-full sm:w-auto">
                                Hapus ({selectedRowsCount})
                                <span className="sm:hidden"><X className="h-4 w-4" /></span>
                            </Button>
                        )}
                    </div>
                </div>
                {/* Active Filters */}
                {(searchValue || selectedWorkUnit) && (
                    <div className="flex flex-wrap gap-2 mt-1">
                        {searchValue && (
                            <div className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                                <span>Cari: {searchValue}</span>
                                <Button variant="ghost" size="sm" onClick={clearSearch} className="h-4 w-4 p-0 hover:bg-transparent">
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                        {selectedWorkUnit && (
                            <div className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm max-w-full">
                                <span className="truncate">Unit Kerja: {selectedWorkUnitLabel}</span>
                                <Button variant="ghost" size="sm" onClick={clearWorkUnitFilter} className="h-4 w-4 p-0 hover:bg-transparent flex-shrink-0">
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                        {(searchValue || selectedWorkUnit) && (
                            <Button variant="outline" onClick={clearAllFilters} className="ml-2">
                                Reset Filter
                            </Button>
                        )}
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
                                                                                    onShow={() => router.get(route('masters.employees.show', { user: (row.original as TeacherData).id }))}
                                onEdit={() => router.get(route('masters.employees.edit', { user: (row.original as TeacherData).id }))}
                                                    onDelete={() => handleSingleDelete((row.original as TeacherData).id)}
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
                                    {searchValue || selectedWorkUnit ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <p>
                                                Tidak ada pegawai yang ditemukan
                                                {searchValue && ` untuk pencarian "${searchValue}"`}
                                                {selectedWorkUnit && ` di unit kerja "${selectedWorkUnitLabel}"`}
                                            </p>
                                            <Button variant="outline" size="sm" onClick={clearAllFilters}>
                                                Hapus semua filter
                                            </Button>
                                        </div>
                                    ) : (
                                        'Pegawai tidak tersedia.'
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
                            ? searchValue || selectedWorkUnit
                                ? `Ditemukan ${pagination.total} hasil${
                                    searchValue ? ` untuk pencarian "${searchValue}"` : ''
                                  }${
                                    selectedWorkUnit ? ` di unit kerja "${selectedWorkUnitLabel}"` : ''
                                  }`
                                : `Menampilkan ${pagination.from} - ${pagination.to} dari ${pagination.total} entri`
                            : `Menampilkan ${data.length} entri`}
                    </div>

                    {pagination && pagination.last_page > 1 && (
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                            >
                                Sebelumnya
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
                                        Halaman {pagination.current_page} dari {pagination.last_page}
                                    </span>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
