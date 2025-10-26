import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { RemotePagination } from '@/components/ui/remote-pagination';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { TableActions } from '@/components/ui/table-actions';
import AppLayout from '@/layouts/app-layout';
import { useConfirmation } from '@/lib/confirmation';
import { formatDateLongMonth, formatDateShortMonth, toLocalYMD } from '@/lib/date';
import { getUserPhotoUrl } from '@/lib/file';
import { getInitials } from '@/lib/initials';
import { useNavigation } from '@/lib/navigation';
import type { BreadcrumbItem } from '@/types';
import type { Assignment, AssignmentReport, AssignmentResponse, AssignmentUser } from '@/types/assignments/assignment';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Briefcase, CalendarDays, Edit, Eye, MapPin, Plus, RotateCcw, Search, Users, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { AssignmentEmployeesModal } from '@/components/modals/assignment-employees-modal';
import { DatePicker } from '@/components/ui/date-picker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ReportStatus } from '@/types/enums';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Penugasan', href: '/assignments' },
];

type PageProps = {
    assignments: AssignmentResponse;
    search?: string;
    date?: string;
    has_reports?: string;
    isAdminOrSuperadmin: boolean;
    isLeader: boolean;
    isVerifikator: boolean;
};

export default function AssignmentsIndex({
    assignments,
    search = '',
    date = '',
    has_reports = '',
    isAdminOrSuperadmin,
    isLeader,
    isVerifikator,
}: PageProps) {
    const { data, meta } = assignments;
    const [searchValue, setSearchValue] = React.useState(search);
    const [dateValue, setDateValue] = React.useState<Date | undefined>(date ? new Date(date) : undefined);
    const [hasReportsValue, setHasReportsValue] = React.useState(has_reports || 'all');

    type BackendAssignment = Assignment & {
        reports?: (AssignmentReport & {
            in_city_reports?: unknown[];
            out_city_reports?: unknown[];
            out_country_reports?: unknown[];
            travel_reports?: unknown[];
        })[];
    };

    const [selectedAssignment, setSelectedAssignment] = React.useState<BackendAssignment | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const { confirmDelete, deleteState, handleDeleteCancel } = useConfirmation();
    const { navigateToCreate, navigateToEdit, navigateToShow, navigateWithQuery } = useNavigation();
    const { delete: deleteRequest } = useForm();
    const { props } = usePage();

    // Ambil current user id dari shared props inertia (sesuaikan kalau key berbeda)
    const auth = props.auth as { user?: { id: number } } | undefined;
    const currentUserId = auth?.user?.id;

    const flash = props.flash as { success?: string; error?: string } | undefined;

    // Handle flash messages
    React.useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const buildQuery = () => {
        const query: Record<string, string | number> = {};
        if (searchValue) query.search = searchValue;
        if (dateValue) query.date = toLocalYMD(dateValue);
        if (hasReportsValue && hasReportsValue !== 'all') query.has_reports = hasReportsValue;
        return query;
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchValue(val);
        const query = buildQuery();
        if (val) {
            query.search = val;
        } else {
            delete query.search;
        }
        navigateWithQuery('assignments.index', query, { preserveState: true, replace: true });
    };

    const clearSearch = () => {
        setSearchValue('');
        const query = buildQuery();
        delete query.search;
        navigateWithQuery('assignments.index', query, { preserveState: true, replace: true });
    };

    const goPage = (pageNum: number) => {
        const query = buildQuery();
        if (pageNum > 1) query.page = pageNum;
        else delete query.page;
        navigateWithQuery('assignments.index', query, { preserveState: true, replace: true });
    };

    const handleChangeDate = (date: Date | undefined) => {
        setDateValue(date);
        const query = buildQuery();
        if (date) query.date = toLocalYMD(date);
        else delete query.date;
        navigateWithQuery('assignments.index', query, { preserveState: true, replace: true });
    };

    const handleChangeHasReports = (val: string) => {
        setHasReportsValue(val);
        const query = buildQuery();
        if (val === 'all') delete query.has_reports;
        else query.has_reports = val;
        navigateWithQuery('assignments.index', query, { preserveState: true, replace: true });
    };

    const resetAllFilters = () => {
        setSearchValue('');
        setDateValue(undefined);
        setHasReportsValue('all');
        navigateWithQuery('assignments.index', {}, { preserveState: true, replace: true });
    };

    const handleShowEmployees = (assignment: BackendAssignment) => {
        setSelectedAssignment(assignment);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAssignment(null);
    };

    const handleDeleteAssignment = (assignmentId: number) => {
        deleteRequest(route('assignments.destroy', assignmentId), {
            onBefore: () => {
                toast.loading('Memproses...');
            },
            onSuccess: () => {
                toast.dismiss();
                toast.success('Penugasan berhasil dihapus.');
            },
            onError: (errors) => {
                toast.dismiss();
                toast.error((errors as any)?.message || 'Terjadi kesalahan saat menghapus penugasan.');
            },
        });
    };

    const isAssignmentFullyApproved = (assignment: BackendAssignment) => {
        const users: AssignmentUser[] = assignment.users || [];
        if (users.length === 0) return false;
        const reports = assignment.reports || [];
        const approvedUserIds = new Set(reports.filter((r) => r.status === ReportStatus.APPROVED).map((r) => r.user_id));
        return users.every((u: AssignmentUser) => approvedUserIds.has(u.id));
    };

    const renderAvatarGroup = (users: AssignmentUser[] = []) => {
        const maxAvatars = 5;
        const visibleUsers = users.slice(0, maxAvatars);
        const remainingCount = users.length - maxAvatars;

        return (
            <div className="flex items-center gap-2">
                <div className="flex -space-x-3">
                    {visibleUsers.map((user) => (
                        <Tooltip key={user.id}>
                            <TooltipTrigger asChild>
                                <Avatar className="h-8 w-8 cursor-pointer border-2 border-background transition-all hover:z-10">
                                    <AvatarImage src={getUserPhotoUrl(user.photo) || undefined} alt={user.name} />
                                    <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent className="border bg-background">
                                <div className="text-center">
                                    <div className="text-sm font-medium text-foreground">{user.name}</div>
                                    <div className="text-xs text-muted-foreground">{user.work_unit || 'Unit Kerja tidak tersedia'}</div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                    {remainingCount > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-muted">
                                    <span className="text-xs font-medium text-muted-foreground">+{remainingCount}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="border bg-background">
                                <div className="text-center text-xs text-foreground">{remainingCount} Pegawai Lainnya</div>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <span className="text-xs text-muted-foreground">{users.length} pegawai</span>
            </div>
        );
    };

    return (
        <TooltipProvider>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Kelola Penugasan" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <PageHeader
                        title="Kelola Penugasan"
                        subtitle={
                            isAdminOrSuperadmin
                                ? 'Daftar semua penugasan dinas'
                                : isLeader
                                  ? 'Daftar penugasan dinas anggota unit kerja Anda'
                                  : isVerifikator
                                    ? 'Daftar semua penugasan dinas'
                                    : 'Daftar penugasan dinas Anda'
                        }
                    />

                    <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="relative w-full">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={isAdminOrSuperadmin || isLeader || isVerifikator ? 'Cari tujuan/nama pegawai...' : 'Cari tujuan...'}
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    className="pr-8 pl-8"
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
                            <div className="w-full">
                                <DatePicker value={dateValue} onChange={handleChangeDate} placeholder="Filter Tanggal..." />
                            </div>
                            <div className="w-full">
                                <Select value={hasReportsValue} onValueChange={handleChangeHasReports}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status Laporan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="all">Semua Status</SelectItem>
                                            <SelectItem value="true">Sudah Lapor</SelectItem>
                                            <SelectItem value="false">Belum Lapor</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            {(searchValue || dateValue || hasReportsValue !== 'all') && (
                                <Button variant="outline" onClick={resetAllFilters} className="flex w-min items-center gap-2">
                                    <RotateCcw className="h-4 w-4" />
                                    Reset Filter
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {/* tombol tambah tetap mengikuti kebijakanmu (opsional) */}
                            <Button onClick={() => navigateToCreate('assignments')}>
                                <Plus className="h-4 w-4" />
                                Tambah
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {data.length > 0 ? (
                            data.map((assignment) => {
                                // hanya pembuat assignment yang boleh melihat & menggunakan TableActions
                                const canUseTableActions = assignment?.creator?.id && currentUserId ? assignment.creator.id === currentUserId : false;

                                return (
                                    <Card
                                        key={assignment.id}
                                        className={`relative border-t-3 ${isAssignmentFullyApproved(assignment) ? 'border-t-green-500' : 'border-t-gray-400'}`}
                                    >
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <CalendarDays className="h-3 w-3" />
                                                        {formatDateShortMonth(assignment.created_at)}
                                                    </div>
                                                </div>

                                                {canUseTableActions && (
                                                    <TableActions
                                                        onEdit={() => navigateToEdit('assignments', assignment.id)}
                                                        onDelete={async () => {
                                                            const confirmed = await confirmDelete('penugasan ini');
                                                            if (confirmed) {
                                                                handleDeleteAssignment(assignment.id);
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <CardDescription className="line-clamp-3">{assignment.purpose}</CardDescription>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4" />
                                                <span>{assignment.destination}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <CalendarDays className="h-4 w-4" />
                                                <span>
                                                    {formatDateLongMonth(assignment.start_date)} - {formatDateLongMonth(assignment.end_date)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Users className="h-4 w-4" />
                                                {renderAvatarGroup(assignment.users)}
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Edit className="h-4 w-4" />
                                                {assignment.creator?.name ?? 'Pembuat tidak tersedia'}
                                            </div>
                                        </CardContent>

                                        <CardFooter className="flex gap-2">
                                            <Button onClick={() => handleShowEmployees(assignment)} className="w-1/3" variant="outline">
                                                <Users className="h-4 w-4" />
                                                Info
                                            </Button>
                                            <Button onClick={() => navigateToShow('assignments', assignment.id)} className="w-2/3">
                                                <Eye className="h-4 w-4" />
                                                Rincian
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="col-span-full">
                                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                                    <Briefcase className="h-10 w-10 text-muted-foreground" />
                                    <p className="font-medium">Tidak ada data</p>
                                    <p className="text-sm text-muted-foreground">
                                        {searchValue
                                            ? isAdminOrSuperadmin || isVerifikator
                                                ? `Tidak ada penugasan dengan tujuan atau nama pegawai "${searchValue}"`
                                                : `Tidak ada penugasan dengan tujuan "${searchValue}"`
                                            : isAdminOrSuperadmin || isVerifikator
                                              ? 'Belum ada penugasan yang dibuat.'
                                              : 'Penugasan Anda belum dibuat. Silahkan hubungi admin untuk membuat penugasan.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {data.length > 0 && (
                        <RemotePagination
                            current={meta.current_page}
                            last={meta.last_page}
                            from={meta.from}
                            to={meta.to}
                            total={meta.total}
                            search={searchValue}
                            onChange={goPage}
                        />
                    )}

                    <AssignmentEmployeesModal isOpen={isModalOpen} onClose={handleCloseModal} assignment={selectedAssignment} />

                    <DeleteDialog
                        open={deleteState.isOpen}
                        onOpenChange={handleDeleteCancel}
                        onDelete={deleteState.onConfirm}
                        title={deleteState.title}
                        description={deleteState.description}
                        actionLabel={deleteState.actionLabel}
                        cancelLabel={deleteState.cancelLabel}
                    />
                </div>
            </AppLayout>
        </TooltipProvider>
    );
}
