import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/ui/page-header';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { DatePicker } from '@/components/ui/date-picker';
import { Multiselect } from '@/components/ui/multiselect';
import InputError from '@/components/ui/input-error';

import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import * as React from 'react';
import { format } from 'date-fns';
import type { BreadcrumbItem } from '@/types';

type PageProps = {
    assignment: {
        id: number;
        purpose: string;
        destination: string;
        start_date: string;
        end_date: string;
        users?: Array<{ id: number; name: string; photo?: string; work_unit?: string }>;
        user_ids?: number[];
    };
    users: Array<{ value: number; label: string }>;
};

type AssignmentFormData = {
    purpose: string;
    destination: string;
    start_date: string;
    end_date: string;
    user_ids: (number | string)[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Penugasan', href: '/assignments' },
    { title: 'Edit Penugasan', href: '/assignments/edit' },
];

export default function EditAssignment({ assignment, users }: PageProps) {
    const { data, setData, put, processing, errors, reset } = useForm<AssignmentFormData>({
        purpose: assignment.purpose || '',
        destination: assignment.destination || '',
        start_date: assignment.start_date || '',
        end_date: assignment.end_date || '',
        user_ids: assignment.user_ids || [],
    });

    // Log untuk debug
    React.useEffect(() => {
        console.log('Assignment user_ids:', assignment.user_ids);
        console.log('Form data user_ids:', data.user_ids);
    }, [assignment.user_ids, data.user_ids]);

    const [startDate, setStartDate] = React.useState<Date | undefined>(
        data.start_date ? new Date(data.start_date) : undefined
    );
    const [endDate, setEndDate] = React.useState<Date | undefined>(
        data.end_date ? new Date(data.end_date) : undefined
    );

    const handleStartDateChange = (date: Date | undefined) => {
        setStartDate(date);
        setData('start_date', date ? format(date, 'yyyy-MM-dd') : '');
    };

    const handleEndDateChange = (date: Date | undefined) => {
        setEndDate(date);
        setData('end_date', date ? format(date, 'yyyy-MM-dd') : '');
    };

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        const updateAssignment = new Promise<{ name: string }>((resolve, reject) => {
            put(route('assignments.update', assignment.id), {
                onSuccess: () => {
                    resolve({ name: 'Penugasan' });
                },
                onError: (errors) => {
                    reject(errors?.error || 'Penugasan gagal diperbarui!');
                },
            });
        });

        toast.promise(updateAssignment, {
            loading: 'Memproses..',
            success: (data) => `${data.name} berhasil diperbarui.`,
            error: (error) => String(error),
        });
    }

    const handleReset = () => {
        reset();
        setStartDate(assignment.start_date ? new Date(assignment.start_date) : undefined);
        setEndDate(assignment.end_date ? new Date(assignment.end_date) : undefined);
        setData('user_ids', assignment.user_ids || []);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Edit Penugasan"
                    subtitle="Perbarui data penugasan dinas"
                />

                <div className="max-w-lg">
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="purpose">Tujuan Penugasan</Label>
                            <Textarea
                                id="purpose"
                                value={data.purpose}
                                onChange={(e) => setData('purpose', e.target.value)}
                                placeholder="Jelaskan tujuan dan maksud penugasan dinas"
                                rows={3}
                                required
                            />
                            <InputError message={errors.purpose} className="mt-1" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="destination">Tujuan Lokasi</Label>
                            <Input
                                id="destination"
                                value={data.destination}
                                onChange={(e) => setData('destination', e.target.value)}
                                placeholder="Masukkan lokasi tujuan penugasan"
                                required
                            />
                            <InputError message={errors.destination} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Tanggal Mulai</Label>
                                <DatePicker
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    placeholder="Pilih tanggal mulai"
                                    className="w-full"
                                />
                                <InputError message={errors.start_date} className="mt-1" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date">Tanggal Selesai</Label>
                                <DatePicker
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    placeholder="Pilih tanggal selesai"
                                    className="w-full"
                                />
                                <InputError message={errors.end_date} className="mt-1" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user_ids">Pegawai</Label>
                            <Multiselect
                                value={data.user_ids}
                                onChange={(value) => setData('user_ids', value)}
                                options={users}
                                placeholder="Pilih pegawai..."
                                className="w-full"
                            />
                            <InputError message={errors.user_ids} className="mt-1" />
                            <p className="text-xs text-muted-foreground">
                                Pilih satu atau lebih pegawai untuk ditugaskan
                            </p>
                        </div>

                        {/* Action Buttons */}
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
                                {processing ? 'Memproses...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
