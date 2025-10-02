import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FileUpload } from '@/components/ui/file-upload';
import InputError from '@/components/ui/input-error';
import { FileText, BookOpen, ArrowLeft } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Link } from '@inertiajs/react';
import * as React from 'react';
import type { BreadcrumbItem } from '@/types';

interface EditReportProps {
    report: {
        id: number;
        travel_type: string;
        // Informasi Surat Tugas
        travel_order_number: string;
        actual_duration: number;
        travel_order_file: string | null;
        spd_file: string | null;
        ticket: {
            id: number;
            address: string;
            user: {
                id: number;
                name: string;
            };
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Laporan Perjalanan', href: '/reports' },
    { title: 'Edit Laporan', href: '' },
];

type ReportFormData = {
    travel_type: string;
    // Informasi Surat Tugas
    travel_order_number: string;
    actual_duration: string;
    travel_order_file: File | string | null;
    spd_file: File | string | null;
};

export default function EditReport({ report }: EditReportProps) {
    const { data, setData, put, processing, errors } = useForm<ReportFormData>({
        travel_type: report.travel_type,
        // Informasi Surat Tugas
        travel_order_number: report.travel_order_number,
        actual_duration: report.actual_duration?.toString() || '',
        travel_order_file: null,
        spd_file: null,
    });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        const updateReport = new Promise<{ name: string }>((resolve, reject) => {
            put(route('reports.update', report.id), {
                onSuccess: () => {
                    resolve({ name: 'Laporan Perjalanan' });
                },
                onError: (errors) => {
                    reject(errors?.error || 'Laporan perjalanan gagal diperbarui!');
                },
            });
        });

        toast.promise(updateReport, {
            loading: 'Memproses..',
            success: (data) => `${data.name} berhasil diperbarui.`,
            error: (error) => String(error),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <PageHeader title="Edit Laporan Perjalanan" subtitle="Perbarui laporan perjalanan dinas" />
                    <Link href={route('reports.show', report.id)}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6">
                    <form onSubmit={onSubmit}>
                        {/* Informasi Surat Tugas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Informasi Surat Tugas
                                </CardTitle>
                                <CardDescription>
                                    Informasi dasar surat tugas perjalanan dinas
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="travel_type">Jenis Perjalanan</Label>
                                        <Select value={data.travel_type} onValueChange={(value) => setData('travel_type', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih jenis perjalanan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="in_city">Dalam Kota</SelectItem>
                                                <SelectItem value="out_city">Luar Kota</SelectItem>
                                                <SelectItem value="out_country">Luar Negeri</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.travel_type} className="mt-1" />
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="space-y-2 w-full md:w-3/4">
                                            <Label htmlFor="travel_order_number">Nomor Surat Tugas</Label>
                                            <Input
                                                id="travel_order_number"
                                                value={data.travel_order_number}
                                                onChange={(e) => setData('travel_order_number', e.target.value)}
                                                placeholder="Contoh: ST-001/01/2024"
                                                required
                                            />
                                            <InputError message={errors.travel_order_number} className="mt-1" />
                                        </div>
                                        
                                        <div className="space-y-2 w-full md:w-1/4">
                                            <Label htmlFor="actual_duration">Durasi Asli Perjalanan</Label>
                                            <Input
                                                id="actual_duration"
                                                type="number"
                                                min={1}
                                                value={data.actual_duration}
                                                onChange={(e) => setData('actual_duration', e.target.value)}
                                                placeholder="Durasi asli perjalanan"
                                                required
                                            />
                                            <InputError message={errors.actual_duration} className="mt-1" />
                                        </div>
                                    </div>
                                </div>



                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                        <Label htmlFor="travel_order_file">File Surat Tugas</Label>
                                        <FileUpload
                                            value={data.travel_order_file}
                                            onChange={(file: File | string | null) => setData('travel_order_file', file)}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            maxSize={2}
                                            error={errors.travel_order_file}
                                            existingFile={report.travel_order_file}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Format: PDF, JPG, JPEG, PNG (Maks. 2MB)
                                            {report.travel_order_file && (
                                                <span className="block text-green-600">
                                                    File saat ini: {report.travel_order_file}
                                                </span>
                                            )}
                                        </p>
                                </div>

                                <div className="space-y-2">
                                        <Label htmlFor="spd_file">File SPD</Label>
                                        <FileUpload
                                            value={data.spd_file}
                                            onChange={(file: File | string | null) => setData('spd_file', file)}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            maxSize={2}
                                            error={errors.spd_file}
                                            existingFile={report.spd_file}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Format: PDF, JPG, JPEG, PNG (Maks. 2MB)
                                            {report.spd_file && (
                                                <span className="block text-green-600">
                                                    File saat ini: {report.spd_file}
                                                </span>
                                            )}
                                        </p>
                                </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex max-w-3xl flex-col gap-3 pt-4 sm:flex-row">
                            <Link href={route('reports.show', report.id)} className="flex-1 sm:flex-none">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full bg-transparent"
                                    disabled={processing}
                                >
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing} className="flex-1 sm:flex-none">
                                {processing ? 'Memproses...' : 'Perbarui Laporan'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
