import { Head } from '@inertiajs/react';
import { Building, Mail, MapPin, Phone, User, Users, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { AdminOrSuperadmin } from '@/components/role-guard';
import { AccessDenied } from '@/components/access-denied';
import { BreadcrumbItem } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { getInitials } from '@/lib/initials';
import { getUserPhotoUrl } from '@/lib/file';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dasbor',
        href: '/dashboard',
    },
    {
        title: 'Kelola Pegawai',
        href: '/masters/employees',
    },
    {
        title: 'Rincian Pegawai',
        href: '#',
    },
];

interface Employee {
    id: number;
    name: string;
    email: string;
    nip: string;
    number_phone: string;
    username: string;
    level: string;
    gender: string | null;
    work_unit_id: number | null;
    workUnit: {
        id: number;
        name: string;
    } | null;
    roles: Array<{
        id: number;
        name: string;
    }>;
    address: {
        id: number;
        address: string;
        city: string;
        province: string;
    } | null;
    photo: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    employee: {
        data: Employee;
    };
}

export default function Show({ employee }: Props) {
    const { data } = employee;




    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rincian Pegawai - ${data.name}`} />
            <AdminOrSuperadmin fallback={<AccessDenied />}>
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                    <PageHeader
                        title="Rincian Pegawai"
                        subtitle="Informasi lengkap pegawai"
                    />

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Profile Card */}
                        <Card className="lg:col-span-1 h-min">
                            <CardHeader className="text-center">
                                <div className="flex justify-center mb-4">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={getUserPhotoUrl(data.photo) || undefined} alt={data.name} />
                                        <AvatarFallback className="text-lg">
                                            {getInitials(data.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <CardTitle className="text-xl">{data.name}</CardTitle>
                                <CardDescription>{data.level}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{data.username}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{data.email}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{data.number_phone}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        {data.workUnit?.name || 'Tidak ada'}
                                    </span>
                                </div>
                                {data.gender && (
                                    <div className="flex items-center space-x-3">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{data.gender}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Details Cards */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* NIP & Roles */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Shield className="h-5 w-5" />
                                        <span>Informasi Kepegawaian</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">NIP</label>
                                        <p className="text-sm">{data.nip}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Jabatan</label>
                                        <p className="text-sm">{data.level}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Role</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {data.roles.length > 0 ? (
                                                data.roles.map((role) => (
                                                    <Badge key={role.id} variant="secondary">
                                                        {role.name}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Tidak ada role</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <MapPin className="h-5 w-5" />
                                        <span>Alamat</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {data.address ? (
                                        <>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Alamat Lengkap</label>
                                                <p className="text-sm">{data.address.address}</p>
                                            </div>
                                            <Separator />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-muted-foreground">Kota</label>
                                                    <p className="text-sm">{data.address.city}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-muted-foreground">Provinsi</label>
                                                    <p className="text-sm">{data.address.province}</p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Tidak ada data alamat</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </AdminOrSuperadmin>
        </AppLayout>
    );
}
