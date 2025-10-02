import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Multiselect } from '@/components/ui/multiselect';
import { PageHeader } from '@/components/ui/page-header';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, FormErrors } from '@/types';
import type { EmployeeFormData } from '@/types/masters/employee';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Kelola Pegawai',
        href: '/masters/employees',
    },
    {
        title: 'Edit',
        href: '',
    },
];

type EmployeeCategoryOption = {
    value: string;
    label: string;
};

type RoleOption = {
    id: number | string;
    name: string;
};

type Props = {
    user: {
        id: number | string;
        name: string;
        username: string;
        email: string;
        nip: string;
        gender: string;
        number_phone: string;
        level: string;
        work_unit_id: string | number;
        photo?: string | null;
        roles: Array<{
            id: number | string;
            name: string;
            guard_name: string;
        }>;
        address?: {
            id: number;
            address: string;
            city: string;
            province: string;
        } | null;
    };
    workUnits: EmployeeCategoryOption[];
    roles: RoleOption[];
};

export default function EditEmployee({ user, workUnits, roles }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const { errors } = usePage().props;

    const { data, setData, processing, reset } = useForm<
        EmployeeFormData & { password: string; password_confirmation: string; roles: string[]; city?: string; province?: string; address?: string }
    >({
        name: user.name || '',
        level: user.level || '',
        nip: user.nip || '',
        number_phone: user.number_phone || '',
        email: user.email || '',
        gender: user.gender || '',
        username: user.username || '',
        work_unit_id: user.work_unit_id ? user.work_unit_id.toString() : '',
        photo: null,
        password: '',
        password_confirmation: '',
        roles: user.roles?.map((role) => role.name) || [],
        address: user.address?.address || '',
        city: user.address?.city || '',
        province: user.address?.province || '',
    });

    function handleImageChange(file: File | string | null) {
        setData('photo', file);
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Create FormData to handle images and data
        const formData = new FormData();
        formData.append('_method', 'put');
        formData.append('name', data.name || '');
        formData.append('nip', data.nip || '');
        formData.append('number_phone', data.number_phone || '');
        formData.append('email', data.email || '');
        formData.append('username', data.username || '');
        formData.append('level', data.level || '');
        formData.append('work_unit_id', data.work_unit_id || '');
        formData.append('address', data.address || '');
        formData.append('city', data.city || '');
        formData.append('province', data.province || '');

        // Append roles array
        data.roles.forEach((role) => {
            formData.append('roles[]', role);
        });

        if (data.password) {
            formData.append('password', data.password);
            formData.append('password_confirmation', data.password_confirmation);
        }

        if (data.photo && typeof data.photo !== 'string') {
            formData.append('photo', data.photo);
        }

        const updateEmployee = new Promise<{ name: string }>((resolve, reject) => {
            router.post(route('masters.employees.update', user.id), formData, {
                onSuccess: () => {
                    resolve({ name: 'Pegawai' });
                },
                onError: (errors: FormErrors) => {
                    reject(errors?.error || 'Pegawai gagal diperbarui!');
                },
            });
        });

        toast.promise(updateEmployee, {
            loading: 'Memproses..',
            success: (data) => `${data.name} berhasil diperbarui.`,
            error: (error) => String(error),
        });
    }

    const handleReset = () => {
        reset();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Pegawai" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Edit pegawai" subtitle="Perbarui data pegawai untuk E-Lapor Dinas" />
                <form onSubmit={onSubmit}>
                    <div className="flex w-full flex-col gap-4 md:flex-row">
                        {/* Kiri: Kategori Pegawai & Foto */}
                        <div className="w-full space-y-4 md:w-2/3">
                            <div className="flex w-full justify-center">
                                <ImageUpload
                                    value={data.photo}
                                    onChange={handleImageChange}
                                    placeholder="Pilih atau "
                                    error={errors.photo}
                                    aspectRatio="rounded"
                                    existingImage={user.photo}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Nama</Label>
                                    <Input
                                        name="name"
                                        value={data.name || ''}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Nama Pegawai"
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>
                                <div>
                                    <Label>NIP</Label>
                                    <Input
                                        type="number"
                                        name="nip"
                                        value={data.nip || ''}
                                        onChange={(e) => setData('nip', e.target.value)}
                                        placeholder="NIP"
                                    />
                                    <InputError message={errors.nip} className="mt-1" />
                                </div>
                                <div>
                                    <Label>Username</Label>
                                    <Input
                                        name="username"
                                        value={data.username || ''}
                                        onChange={(e) => setData('username', e.target.value)}
                                        placeholder="Username"
                                    />
                                    <InputError message={errors.username} className="mt-1" />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        name="email"
                                        value={data.email || ''}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Email"
                                    />
                                    <InputError message={errors.email} className="mt-1" />
                                </div>
                                <div>
                                    <Label>No. HP</Label>
                                    <Input
                                        type="number"
                                        name="number_phone"
                                        value={data.number_phone || ''}
                                        onChange={(e) => setData('number_phone', e.target.value)}
                                        placeholder="No. HP"
                                    />
                                    <InputError message={errors.number_phone} className="mt-1" />
                                </div>
                                <div>
                                    <Label>Pangkat/Golongan</Label>
                                    <Input
                                        name="level"
                                        value={data.level || ''}
                                        onChange={(e) => setData('level', e.target.value)}
                                        placeholder="Pangkat/Golongan"
                                    />
                                    <InputError message={errors.level} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="gender">Jenis Kelamin</Label>
                                    <Combobox
                                        options={[
                                            { value: 'Male', label: 'Laki-laki' },
                                            { value: 'Female', label: 'Perempuan' },
                                        ]}
                                        value={data.gender}
                                        onValueChange={(value) => setData('gender', value)}
                                        placeholder="Pilih jenis kelamin"
                                        searchPlaceholder="Cari jenis kelamin..."
                                        emptyText="Tidak ada jenis kelamin ditemukan."
                                    />
                                    <InputError className="mt-2" message={errors.gender} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="work_unit_id" className="text-sm font-medium">
                                        Unit Kerja
                                    </Label>
                                    <Combobox
                                        options={workUnits.map((cat) => ({ value: cat.value, label: cat.label }))}
                                        value={data.work_unit_id || undefined}
                                        onValueChange={(value) => setData('work_unit_id', value)}
                                        placeholder="Pilih unit kerja"
                                        searchPlaceholder="Cari unit kerja..."
                                        emptyText="Tidak ada unit kerja ditemukan."
                                    />
                                    <InputError message={errors.work_unit_id} className="mt-1" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="roles" className="text-sm font-medium">
                                        Role
                                    </Label>
                                    <Multiselect
                                        value={data.roles}
                                        onChange={(value) => setData('roles', value)}
                                        options={roles.map((role) => ({
                                            value: role.name || '',
                                            label: role.name === 'employee' ? 'Pegawai' : role.name === 'leader' ? 'Pimpinan' : role.name || '',
                                        }))}
                                        placeholder="Pilih role"
                                        className="w-full"
                                    />
                                    <InputError message={errors.roles} className="mt-1" />
                                    {data.roles.includes('leader') && (
                                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-600">
                                            <strong>Info:</strong> Jika unit kerja sudah memiliki pimpinan, pimpinan baru akan menggantikan pimpinan
                                            lama. Pimpinan lama tetap dapat mengakses data historis review yang sudah dilakukan.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Kota</Label>
                                    <Input name="city" value={data.city || ''} onChange={(e) => setData('city', e.target.value)} placeholder="Kota" />
                                    <InputError message={errors.city} className="mt-1" />
                                </div>
                                <div>
                                    <Label>Provinsi</Label>
                                    <Input
                                        name="province"
                                        value={data.province || ''}
                                        onChange={(e) => setData('province', e.target.value)}
                                        placeholder="Provinsi"
                                    />
                                    <InputError message={errors.province} className="mt-1" />
                                </div>
                            </div>
                            <div>
                                <Label>Alamat Lengkap</Label>
                                <Textarea
                                    name="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Alamat Lengkap"
                                />
                                <InputError message={errors.address} className="mt-1" />
                            </div>
                            <Separator />
                            <div className="grid w-full grid-cols-2 gap-4 space-y-4">
                                <div>
                                    <Label>Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password || ''}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-1" />
                                </div>
                                <div>
                                    <Label>Konfirmasi Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password_confirmation"
                                            value={data.password_confirmation || ''}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Konfirmasi Password"
                                        />
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex max-w-3xl flex-col gap-3 pt-4 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            className="flex-1 bg-transparent sm:flex-none"
                            disabled={processing}
                        >
                            Reset
                        </Button>
                        <Button type="submit" disabled={processing} className="flex-1 sm:flex-none">
                            {processing ? 'Memproses...' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
