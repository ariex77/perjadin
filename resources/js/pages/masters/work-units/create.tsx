import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, FormErrors } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Kelola Unit Kerja',
        href: '/masters/work-units',
    },
    {
        title: 'Tambah',
        href: '',
    },
];

export default function WorkUnitForm({ leaders = [] }: { leaders: Array<{ value: number; label: string }> }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        description: '',
        head_id: '',
    });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        const createWorkUnit = new Promise<{ name: string }>((resolve, reject) => {
            post(route('masters.work-units.store'), {
                onSuccess: () => {
                    resolve({ name: 'Unit Kerja' });
                    reset();
                },
                onError: (errors: FormErrors) => {
                    reject(errors?.error || 'Unit Kerja gagal ditambahkan!');
                },
            });
        });

        toast.promise(createWorkUnit, {
            loading: 'Memproses..',
            success: (data) => `${data.name} berhasil ditambahkan.`,
            error: (error) => String(error),
        });
    }

    const handleReset = () => {
        reset();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create WorkUnit" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Buat Unit Kerja" subtitle="Tambahkan Unit Kerja baru untuk sistem Anda" />

                <div className="max-w-md">
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Nama Unit
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Masukkan nama unit"
                                className="w-full"
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code" className="text-sm font-medium">
                                Kode Unit
                            </Label>
                            <Input
                                id="code"
                                name="code"
                                type="number"
                                placeholder="Kode unit"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                className="w-full"
                            />
                            <InputError message={errors.code} className="mt-1" />
                        </div>

                        <div>
                            <Label>Keterangan</Label>
                            <Textarea
                                name="description"
                                value={data.description}
                                onChange={(e) => setData("description", e.target.value)}
                                placeholder="Keterangan"
                            />
                            <InputError message={errors.description} className="mt-1" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="head_id" className="text-sm font-medium">
                                Ketua TIM
                            </Label>
                            <Combobox
                                options={leaders.map((u) => ({ value: String(u.value), label: u.label }))}
                                value={data.head_id || undefined}
                                onValueChange={(v) => setData('head_id', v)}
                                placeholder="Pilih kepala unit"
                                searchPlaceholder="Cari leader..."
                                emptyText="Tidak ada leader tersedia."
                                disabled={processing}
                            />
                            <InputError message={errors.head_id as unknown as string} className="mt-1" />
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
