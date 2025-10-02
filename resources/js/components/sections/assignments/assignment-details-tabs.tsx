import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateLongMonth } from '@/lib/date';
import { getUserPhotoUrl } from '@/lib/file';
import { getInitials } from '@/lib/initials';
import type { SharedData } from '@/types';
import type { AssignmentReport, AssignmentUser, DetailAssignment } from '@/types/assignments/assignment';
import { router } from '@inertiajs/react';
import { CalendarDays, Check, Eye, FileText, MapPin, Search, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';

// ==================== Types & Helpers ==================== //
type TravelType = 'in_city' | 'out_city' | 'out_country';
type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
type UserRole = { name: string } | string;

interface AssignmentDetailsTabsProps {
    assignment: DetailAssignment;
    auth: SharedData['auth'];
}

const getStatusBadgeVariant = (status: ReportStatus): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
        case 'approved':
            return 'default';
        case 'submitted':
            return 'secondary';
        case 'rejected':
            return 'destructive';
        case 'draft':
        default:
            return 'secondary';
    }
};

const getStatusBadgeClass = (status: ReportStatus): string => {
    switch (status) {
        case 'approved':
            return 'bg-green-100 text-green-800';
        case 'submitted':
            return 'bg-blue-100 text-blue-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        case 'draft':
        default:
            return '';
    }
};

const getStatusLabel = (status: ReportStatus): string => {
    switch (status) {
        case 'approved':
            return 'Approved';
        case 'submitted':
            return 'Submiited';
        case 'rejected':
            return 'Rejected';
        case 'draft':
            return 'Draft';
        default:
            return 'Draft';
    }
};

const getBiayaStatus = (report: AssignmentReport): boolean => {
    if (report.travel_type === 'in_city') return !!report.in_city_report;
    if (report.travel_type === 'out_city') return !!report.out_city_report;
    if (report.travel_type === 'out_country') return !!report.out_country_report;
    return false;
};

const getBiayaLabel = (report: AssignmentReport): string => {
    if (report.travel_type === 'in_city') return 'Dalam Kota';
    if (report.travel_type === 'out_city') return 'Luar Kota';
    if (report.travel_type === 'out_country') return 'Luar Negeri';
    return 'N/A';
};

const getTravelReportStatus = (userReport: AssignmentReport): 'ada' | 'belum' => {
    if (!userReport) return 'belum';
    return userReport.travel_report ? 'ada' : 'belum';
};

const canViewReport = (reportUser: AssignmentUser, userReport: AssignmentReport | undefined, auth: SharedData['auth']): boolean => {
    if (!userReport || userReport.status === 'draft') return false;
    if (reportUser.id === auth.user.id) return true;
    const userRoles: UserRole[] = auth.user.roles ?? [];
    const isLeader = userRoles.some((role) => (typeof role === 'string' ? role === 'leader' : role.name === 'leader'));
    if (isLeader && reportUser.workUnit?.head?.id === auth.user.id) return true;
    const isPrivileged = userRoles.some((role) => {
        const roleName = typeof role === 'string' ? role : role.name;
        return ['superadmin', 'admin', 'verificator'].includes(roleName);
    });
    if (isPrivileged) return true;
    return false;
};

function ParticipantRow({
    user,
    index,
    assignment,
    auth,
}: {
    user: AssignmentUser;
    index: number;
    assignment: DetailAssignment;
    auth: SharedData['auth'];
}) {
    const userReport = assignment.reports?.find((report) => report.user_id === user.id);
    const hasReport = !!userReport;
    const workUnitText = user.workUnit?.name || 'Unit Kerja tidak tersedia';
    return (
        <TableRow key={user.id}>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={getUserPhotoUrl(user.photo) || undefined} alt={user.name} />
                        <AvatarFallback className="text-xs font-medium">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email || 'Email tidak tersedia'}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell>{workUnitText}</TableCell>
            <TableCell>
                {userReport ? (
                    <Badge
                        variant={getBiayaStatus(userReport) ? 'default' : 'secondary'}
                        className={getBiayaStatus(userReport) ? 'bg-green-100 text-green-800' : ''}
                    >
                        {getBiayaStatus(userReport) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {getBiayaLabel(userReport)}
                    </Badge>
                ) : (
                    <Badge variant="outline">-</Badge>
                )}
            </TableCell>
            <TableCell>
                {userReport ? (
                    getTravelReportStatus(userReport) === 'ada' ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                            <Check className="h-3 w-3" />
                            Ada
                        </Badge>
                    ) : (
                        <Badge variant="secondary">
                            <X className="h-3 w-3" />
                            Belum
                        </Badge>
                    )
                ) : (
                    <Badge variant="outline">-</Badge>
                )}
            </TableCell>
            <TableCell>
                {hasReport ? (
                    <Badge
                        variant={getStatusBadgeVariant(userReport.status as ReportStatus)}
                        className={getStatusBadgeClass(userReport.status as ReportStatus)}
                    >
                        <FileText className="h-3 w-3" />
                        {getStatusLabel(userReport.status as ReportStatus)}
                    </Badge>
                ) : (
                    <Badge variant="secondary">Belum Lapor</Badge>
                )}
            </TableCell>
            <TableCell className="text-center">
                {hasReport && canViewReport(user, userReport, auth) ? (
                    userReport.status === 'draft' ? (
                        <Button variant="outline" size="sm" disabled className="cursor-not-allowed opacity-50">
                            <Eye className="h-4 w-4" />
                            Draft
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => router.get(route('reports.show', userReport!.id))}>
                            <Eye className="h-4 w-4" />
                            Lihat
                        </Button>
                    )
                ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                )}
            </TableCell>
        </TableRow>
    );
}

// ==================== Component ==================== //
export default function AssignmentDetailsTabs({ assignment, auth }: AssignmentDetailsTabsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const filteredParticipants = useMemo<AssignmentUser[]>(() => {
        const users = assignment.users ?? [];
        const query = searchQuery.trim().toLowerCase();
        if (!query) return users;
        return users.filter((u: AssignmentUser) => u.name.toLowerCase().includes(query));
    }, [assignment.users, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Assignment Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Informasi Penugasan
                    </CardTitle>
                    <CardDescription>Detail lengkap penugasan perjalanan dinas</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Maksud Perjalanan Dinas */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Maksud Perjalanan Dinas</label>
                            <p className="mt-1 text-lg break-words whitespace-normal">{assignment.purpose}</p>
                        </div>
                        {/* Lokasi & Tanggal */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{assignment.destination}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                    {formatDateLongMonth(assignment.start_date)} - {formatDateLongMonth(assignment.end_date)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Participants */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Daftar Peserta
                    </CardTitle>
                    <CardDescription>Daftar peserta penugasan perjalanan dinas</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="relative mb-4 w-full md:w-[280px]">
                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-8 pl-10"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchQuery('')}
                                className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">No</TableHead>
                                        <TableHead>Nama Peserta</TableHead>
                                        <TableHead>Unit Kerja</TableHead>
                                        <TableHead>Biaya</TableHead>
                                        <TableHead>Laporan Perjalanan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredParticipants.map((user, index) => (
                                        <ParticipantRow key={user.id} user={user} index={index} assignment={assignment} auth={auth} />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* No Results */}
                    {searchQuery.trim() && filteredParticipants.length === 0 && (
                        <div className="py-4 text-center text-muted-foreground">
                            <Search className="mx-auto mb-2 h-6 w-6 opacity-50" />
                            <p className="text-sm">Tidak ada peserta yang cocok dengan pencarian "{searchQuery}"</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
