import { type BreadcrumbItem, type SharedData, type FormErrors } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/ui/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { ImageUpload } from '@/components/ui/image-upload';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan Profil',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
    username?: string;
    nip?: string;
    number_phone?: string;
    level?: string;
    gender?: string;
    photo?: File | null;
    address?: string;
    city?: string;
    province?: string;
};

type Props = {
    user: {
        id: number;
        name: string;
        username?: string;
        email: string;
        nip?: string;
        number_phone?: string;
        level?: string;
        gender?: string;
        photo?: string | null;
        roles: Array<{
            id: number;
            name: string;
            guard_name: string;
        }>;
        address?: {
            id: number;
            address: string;
            city: string;
            province: string;
        } | null;
        workUnit?: {
            id: number;
            name: string;
        } | null;
    };
    mustVerifyEmail: boolean;
    status?: string;
};

export default function Profile({ user, mustVerifyEmail, status }: Props) {
    const { auth, errors } = usePage<SharedData>().props;
    
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    
    const { data, setData, processing, reset } = useForm<ProfileForm>({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        nip: user.nip || '',
        number_phone: user.number_phone || '',
        level: user.level || '',
        gender: user.gender || 'Male',
        photo: null,
        address: user.address?.address || '',
        city: user.address?.city || '',
        province: user.address?.province || '',
    });

    function handleImageChange(file: File | string | null) {
        setData('photo', file as File | null);
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        // Create FormData to handle images and data
        const formData = new FormData();
        formData.append('_method', 'patch');
        formData.append('name', data.name || '');
        formData.append('email', data.email || '');
        formData.append('username', data.username || '');
        formData.append('nip', data.nip || '');
        formData.append('number_phone', data.number_phone || '');
        formData.append('level', data.level || '');
        formData.append('gender', data.gender || '');
        formData.append('address', data.address || '');
        formData.append('city', data.city || '');
        formData.append('province', data.province || '');
        
        if (data.photo && typeof data.photo !== 'string') {
            formData.append('photo', data.photo);
        }
        
        const updateProfile = new Promise<{ name: string }>((resolve, reject) => {
            setIsSubmitting(true);
            router.post(route('profile.update'), formData, {
                onSuccess: () => {
                    resolve({ name: 'Profil' });
                    setIsSubmitting(false);
                },
                onError: (errors: FormErrors) => {
                    reject(errors?.error || 'Profil gagal diperbarui!');
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        });

        toast.promise(updateProfile, {
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
            <Head title="Pengaturan Profil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall 
                        title="Informasi Profil" 
                        description="Perbarui informasi profil lengkap Anda"
                    />

                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Profile Photo */}
                        <div className="flex justify-center mb-6">
                            <ImageUpload
                                value={data.photo}
                                onChange={handleImageChange}
                                placeholder="Pilih foto atau "
                                error={errors.photo}
                                aspectRatio="rounded"
                                existingImage={user.photo}
                            />
                        </div>
                        
                        {/* Basic Profile Information */}
                        <div className="grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Nama</Label>
                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        autoComplete="name"
                                        placeholder="Nama lengkap"
                                    />
                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="email">Alamat Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoComplete="username"
                                        placeholder="Alamat email"
                                    />
                                    <InputError className="mt-2" message={errors.email} />
                                </div>
                                
                                <div>
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={data.username || ''}
                                        onChange={(e) => setData('username', e.target.value)}
                                        placeholder="Username"
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.username} />
                                </div>
                                
                                <div>
                                    <Label htmlFor="nip">NIP</Label>
                                    <Input
                                        id="nip"
                                        type="number"
                                        value={data.nip || ''}
                                        onChange={(e) => setData('nip', e.target.value)}
                                        placeholder="NIP"
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.nip} />
                                </div>
                                
                                <div>
                                    <Label htmlFor="number_phone">No. HP</Label>
                                    <Input
                                        id="number_phone"
                                        type="number"
                                        value={data.number_phone || ''}
                                        onChange={(e) => setData('number_phone', e.target.value)}
                                        placeholder="No. HP"
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.number_phone} />
                                </div>
                                
                                <div>
                                    <Label htmlFor="level">Pangkat/Golongan</Label>
                                    <Input
                                        id="level"
                                        value={data.level || ''}
                                        onChange={(e) => setData('level', e.target.value)}
                                        placeholder="Pangkat/Golongan"
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.level} />
                                </div>
                                
                                <div>
                                    <Label htmlFor="gender">Jenis Kelamin</Label>
                                    <Combobox
                                        options={[
                                            { value: 'Male', label: 'Laki-laki' },
                                            { value: 'Female', label: 'Perempuan' }
                                        ]}
                                        value={data.gender}
                                        onValueChange={(value) => setData('gender', value)}
                                        placeholder="Pilih jenis kelamin"
                                        searchPlaceholder="Cari jenis kelamin..."
                                        emptyText="Tidak ada jenis kelamin ditemukan."
                                    />
                                    <InputError className="mt-2" message={errors.gender} />
                                </div>
                            </div>
                            
                            {/* Address Section */}
                            <Separator className="my-6" />
                            <HeadingSmall title="Informasi Alamat" description="Perbarui informasi alamat Anda" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="city">Kota</Label>
                                    <Input
                                        id="city"
                                        value={data.city || ''}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Kota"
                                    />
                                    <InputError className="mt-2" message={errors.city} />
                                </div>
                                
                                <div>
                                    <Label htmlFor="province">Provinsi</Label>
                                    <Input
                                        id="province"
                                        value={data.province || ''}
                                        onChange={(e) => setData('province', e.target.value)}
                                        placeholder="Provinsi"
                                    />
                                    <InputError className="mt-2" message={errors.province} />
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="address">Alamat Lengkap</Label>
                                <Textarea
                                    id="address"
                                    value={data.address || ''}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Alamat lengkap"
                                />
                                <InputError className="mt-2" message={errors.address} />
                            </div>
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Alamat email Anda belum terverifikasi.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Klik di sini untuk mengirim ulang email verifikasi.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        Tautan verifikasi baru telah dikirim ke alamat email Anda.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                disabled={isSubmitting}
                            >
                                Reset
                            </Button>
                            
                            <Button disabled={isSubmitting}>
                                {isSubmitting ? 'Memproses...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
