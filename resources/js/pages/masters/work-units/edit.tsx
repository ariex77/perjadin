import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, FormErrors } from '@/types';
import type { WorkUnit } from '@/types/masters/work-unit';
import { Head, useForm, usePage } from '@inertiajs/react';
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
        title: 'Edit',
        href: '',
    },
];

export default function EditWorkUnit({ workUnit, leaders = [] }: { workUnit: WorkUnit; leaders: Array<{ value: number; label: string }> }) {
    const { errors } = usePage().props;
    const { data, setData, put, processing, reset } = useForm({
        name: workUnit.name || '',
        code: workUnit.code || '',
        description: workUnit.description || '',
        head_id: ((workUnit as unknown as { head_id?: number | null }).head_id ?? null)?.toString() ?? '',
    });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const updateFullboardPrice = new Promise<{ name: string }>((resolve, reject) => {
            put(route('masters.work-units.update', workUnit.id), {
                onSuccess: () => {
                    resolve({ name: 'workUnit' });
                },
                onError: (errors: FormErrors) => {
                    reject(errors?.error || 'Unit Kerja gagal diupdate!');
                },
            });
        });
        toast.promise(updateFullboardPrice, {
            loading: 'Processing..',
            success: (data) => `${data.name} berhasil diupdate.`,
            error: (error) => String(error),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perbarui Unit Kerja" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Perbarui Unit Kerja" subtitle="Perbarui Unit Kerja untuk sistem Anda" />
                <div className="max-w-md">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <Label>Nama Unit</Label>
                            <Input
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nama Unit Kerja"
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
                        <div className="flex w-full justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => reset()}>
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
