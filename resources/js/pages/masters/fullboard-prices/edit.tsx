import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, FormErrors } from '@/types';
import type { FullboardPrice, FullboardPriceFormData } from '@/types/masters/fullboard-price';
import { Head, useForm, usePage } from '@inertiajs/react';
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
        title: 'Edit',
        href: '',
    },
];

export default function EditFullboardPrice({ fullboardPrice }: { fullboardPrice: FullboardPrice }) {
    const { errors } = usePage().props;
    const { data, setData, put, processing} = useForm<FullboardPriceFormData>({
        province_name: fullboardPrice.province_name || '',
        price: fullboardPrice.price || null,
    });

    const handleReset = () => {
        setData({
            province_name: fullboardPrice.province_name || '',
            price: fullboardPrice.price || null,
        });
    };

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const updateFullboardPrice = new Promise<{ province_name: string }>((resolve, reject) => {
            put(route('masters.fullboard-prices.update', fullboardPrice.id), {
                onSuccess: () => {
                    resolve({ province_name: 'fullboardPrice' });
                },
                onError: (errors: FormErrors) => {
                    reject(errors?.error || 'Harga Fullboard gagal diupdate!');
                },
            });
        });
        toast.promise(updateFullboardPrice, {
            loading: 'Processing..',
            success: (data) => `${data.province_name} berhasil diupdate.`,
            error: (error) => String(error),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perbarui Harga Fullboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Perbarui Harga Fullboard" subtitle="Perbarui Harga Fullboard untuk sistem Anda" />
                <div className="max-w-md">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <Label>Nama Provinsi</Label>
                            <Input
                                name="province_name"
                                value={data.province_name}
                                onChange={(e) => setData('province_name', e.target.value)}
                                placeholder="Nama Harga Fullboard"
                            />
                            <InputError message={errors.province_name} className="mt-1" />
                        </div>
                        <div>
                            <Label>Harga</Label>
                            <Input name="price" value={data.price || ''} onChange={(e) => setData('price', e.target.value ? Number(e.target.value) : null)} placeholder="Harga" />
                            <InputError message={errors.price} className="mt-1" />
                        </div>
                        <div className="flex w-full justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleReset}>
                                Reset
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Memproses...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
