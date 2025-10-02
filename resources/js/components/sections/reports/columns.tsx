import type { ColumnDef } from '@tanstack/react-table';
import type { Report } from '@/types/reports/report';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDateShortMonth } from '@/lib/date';
import { getInitials } from '@/lib/initials';
import { getUserPhotoUrl } from '@/lib/file';
import { router } from '@inertiajs/react';
import { Clock, CheckCircle, XCircle, FileText, MapPin } from 'lucide-react';
import type { PaginationMeta } from '@/types/pagination';

interface GetColumnsProps {
    isAdminOrSuperadmin: boolean;
    isLeader: boolean;
    isVerifikator: boolean;
    meta?: PaginationMeta;
}

export function getColumns({ meta, isLeader, isVerifikator }: GetColumnsProps): ColumnDef<Report>[] {
    return [
        {
            id: 'no',
            header: () => <div className="text-center">No</div>,
            cell: ({ row }) => {
                return <div className="text-center">{meta ? meta.from + row.index : row.index + 1}</div>;
            },
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'user',
            header: 'Pegawai',
            cell: ({ row }) => {
                const report = row.original;
                const user = report.user;

                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage
                                src={getUserPhotoUrl(user.photo) || undefined}
                                alt={user.name}
                            />
                            <AvatarFallback className="text-sm font-medium">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {user.workUnit?.name || '-'}
                            </p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'travel_purpose',
            header: 'Maksud Perjalanan',
            size: 200,
            cell: ({ row }) => {
                const report = row.original;
                return (
                    <div className="max-w-sm break-words text-wrap">
                        <p className="text-sm line-clamp-3">
                            {report.travel_purpose}
                        </p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'travel_info',
            header: 'Informasi Perjalanan',
            size: 300,
            cell: ({ row }) => {
                const report = row.original;
                return (
                    <div className="space-y-1">
                        <div className="text-xs font-medium">
                            <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {report.travel_order_number}
                            </div>
                        </div>
                        <div className="text-xs text-foreground">
                            <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {report.destination_city}
                            </div>
                        </div>
                        <div className="text-xs text-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDateShortMonth(report.departure_date)} - {formatDateShortMonth(report.return_date)}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'pimpinan_review',
            header: () => (
                <div className="flex items-center gap-1">
                    <span>Ketua TIM</span>
                </div>
            ),
            cell: ({ row }) => {
                const report = row.original;
                const reviews = report.reviews || [];
                const pimpinanReview = reviews.find(review => review.reviewer_type === 'section_head');

                if (!pimpinanReview) {
                    return <Clock className="h-4 w-4 text-blue-500" />;
                } else if (pimpinanReview.status === 'approved') {
                    return <CheckCircle className="h-4 w-4 text-green-500" />;
                } else {
                    return <XCircle className="h-4 w-4 text-red-500" />;
                }
            },
        },
        {
            accessorKey: 'ppk_review',
            header: () => (
                <div className="flex items-center gap-1">
                    <span>PPK</span>
                </div>
            ),
            cell: ({ row }) => {
                const report = row.original;
                const reviews = report.reviews || [];
                const ppkReview = reviews.find(review => review.reviewer_type === 'commitment_officer');

                if (!ppkReview) {
                    return <Clock className="h-4 w-4 text-blue-500" />;
                } else if (ppkReview.status === 'approved') {
                    return <CheckCircle className="h-4 w-4 text-green-500" />;
                } else {
                    return <XCircle className="h-4 w-4 text-red-500" />;
                }
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const report = row.original;
                const status = report.status;

                let buttonText = 'Lanjutkan';
                let buttonVariant: 'default' | 'outline' = 'default';
                let buttonClass = 'bg-green-600 hover:bg-green-700 text-white hover:text-white';

                if (status === 'approved') {
                    buttonText = 'Lihat';
                    buttonVariant = 'outline';
                    buttonClass = 'border-green-600 text-green-600 hover:bg-green-700 hover:text-white';
                } else if (status === 'rejected') {
                    // Untuk role leader atau verificator, tombol pada status ditolak menjadi "Lihat"
                    buttonText = (isLeader || isVerifikator) ? 'Lihat' : 'Perbaiki';
                    buttonVariant = 'outline';
                    buttonClass = 'border-red-600 text-destructive hover:bg-red-700 hover:text-white';
                } else if (status === 'submitted') {
                    buttonText = 'Lihat';
                    buttonVariant = 'outline';
                    buttonClass = 'border-blue-600 text-blue-600 hover:bg-blue-700 hover:text-white';
                }

                return (
                    <Button
                        variant={buttonVariant}
                        size="sm"
                        className={buttonClass}
                        onClick={() => router.get(route('reports.show', { report: report.id }))}
                    >
                        {buttonText}
                    </Button>
                );
            },
        },
    ];
}
