import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, FormErrors } from '@/types';
import type { FullboardPriceFormData } from '@/types/masters/fullboard-price';
import { Head, useForm } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Kelola Harga Fullboard',
        href: '/masters/fullboard-prices',
    },
    {
        title: 'Tambah',
        href: '',
    },
];

export default function FullboardPriceForm() {
    const { data, setData, post, processing, errors, reset } = useForm<FullboardPriceFormData>({
        province_name: '',
        price: null,
    });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        const createFullboardPrice = new Promise<{ province_name: string }>((resolve, reject) => {
            post(route('masters.fullboard-prices.store'), {
                onSuccess: () => {
                    resolve({ province_name: 'Harga Fullboard' });
                    reset();
                },
                onError: (errors: FormErrors) => {
                    reject(errors?.error || 'Harga Fullboard gagal ditambahkan!');
                },
            });
        });

        toast.promise(createFullboardPrice, {
            loading: 'Memproses..',
            success: (data) => `${data.province_name} berhasil ditambahkan.`,
            error: (error) => String(error),
        });
    }

    const handleReset = () => {
        setData({
            province_name: '',
            price: null,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create FullboardPrice" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Buat Harga Fullboard" subtitle="Tambahkan Harga Fullboard baru untuk sistem Anda" />

                <div className="max-w-md">
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="province_name" className="text-sm font-medium">
                                Nama Provinsi
                            </Label>
                            <Input
                                id="province_name"
                                name="province_name"
                                value={data.province_name}
                                onChange={(e) => setData('province_name', e.target.value)}
                                placeholder="Jakarta"
                                className="w-full"
                            />
                            <InputError message={errors.province_name} className="mt-1" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-sm font-medium">
                                Harga
                            </Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                value={data.price || ''}
                                onChange={(e) => setData('price', e.target.value ? Number(e.target.value) : null)}
                                placeholder="5000000"
                                className="w-full"
                            />
                            <InputError message={errors.price} className="mt-1" />
                        </div>

                        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
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
            </div>
        </AppLayout>
    );
}
