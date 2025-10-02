import { Head, useForm } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/ui/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, FormErrors } from '@/types';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Penugasan', href: '/assignments' },
    { title: 'Buat Laporan', href: '' },
];

type Props = {
    assignment_id?: number;
    assignment?: {
        id: number;
        purpose: string;
        destination: string;
        start_date: string;
        end_date: string;
    };
    transportation_types: Array<{ id: number; name: string; label: string }>;
};

export default function CreateReport({ assignment_id, assignment, transportation_types }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        assignment_id: assignment_id || '',
        travel_type: '',
        actual_duration: '',
        transportation_type_ids: [] as number[],
        travel_order_number: '',
        travel_order_file: null as File | null,
        spd_file: null as File | null,
    });

    // Handler untuk transportation type checkbox
    const handleTransportationTypeChange = (typeId: number, checked: boolean) => {
        if (checked) {
            // Tambahkan ke array jika belum ada
            if (!data.transportation_type_ids.includes(typeId)) {
                const newIds = [...data.transportation_type_ids, typeId];
                setData('transportation_type_ids', newIds);
            }
        } else {
            // Hapus dari array jika ada
            const newIds = data.transportation_type_ids.filter(id => id !== typeId);
            setData('transportation_type_ids', newIds);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const createReport = new Promise<{ name: string }>((resolve, reject) => {
            post(route('reports.store'), {
                onSuccess: () => {
                    resolve({ name: 'Laporan' });
                },
                onError: (errors: FormErrors) => {
                    reject(errors?.error || 'Laporan gagal dibuat!');
                },
            });
        });

        toast.promise(createReport, {
            loading: 'Memproses..',
            success: (data) => `${data.name} berhasil dibuat.`,
            error: (error) => String(error),
        });
    };

    const handleFileChange = (field: string, file: string | File | null) => {
        setData(field as keyof typeof data, file);
    };

    const handleReset = () => {
        setData({
            assignment_id: assignment_id || '',
            travel_type: '',
            actual_duration: '',
            transportation_type_ids: [],
            travel_order_number: '',
            travel_order_file: null,
            spd_file: null,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Laporan Perjalanan" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader
                    title="Buat Laporan Perjalanan"
                    subtitle="Buat laporan pertanggung jawaban perjalanan dinas"
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Form Laporan Perjalanan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">

                                    {/* Travel Type */}
                                    <div className="space-y-2">
                                        <Label htmlFor="travel_type">Tipe Perjalanan</Label>
                                        <Select
                                            value={data.travel_type}
                                            onValueChange={(value) => setData('travel_type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih tipe perjalanan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="in_city">Dalam Kota</SelectItem>
                                                <SelectItem value="out_city">Luar Kota</SelectItem>
                                                <SelectItem value="out_country">Luar Negeri</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.travel_type} />
                                    </div>

                                    {/* Transportation Types */}
                                    <div className="space-y-2">
                                        <Label htmlFor="transportation_type_ids">Jenis Transportasi</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {transportation_types && Array.isArray(transportation_types) && transportation_types.length > 0 ? (
                                                transportation_types.map((type) => (
                                                    <div key={type.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`transportation_${type.id}`}
                                                            checked={data.transportation_type_ids.includes(type.id)}
                                                            onCheckedChange={(checked) => handleTransportationTypeChange(type.id, checked as boolean)}
                                                        />
                                                        <Label htmlFor={`transportation_${type.id}`} className="text-sm font-normal cursor-pointer">
                                                            {type.label}
                                                        </Label>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-3">
                                                    <p className="text-sm text-gray-500">
                                                        {!transportation_types ? 'Memuat jenis transportasi...' : 'Tidak ada jenis transportasi tersedia'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <InputError message={errors.transportation_type_ids} />
                                        <p className="text-xs text-muted-foreground">
                                            Pilih satu atau lebih jenis transportasi yang digunakan
                                        </p>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Travel Order Number */}
                                        <div className="space-y-2 w-full md:w-3/4">
                                            <Label htmlFor="travel_order_number">Nomor Surat Tugas</Label>
                                            <Input
                                                id="travel_order_number"
                                                value={data.travel_order_number}
                                                onChange={(e) => setData('travel_order_number', e.target.value)}
                                                placeholder="Masukkan nomor surat tugas"
                                                required
                                            />
                                            <InputError message={errors.travel_order_number} />
                                        </div>
                                        {/* Actual Duration */}
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
                                            <InputError message={errors.actual_duration} />
                                        </div>
                                    </div>

                                    {/* Assignment Info Display */}
                                    {assignment && (
                                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                            <h3 className="font-medium text-gray-900">Informasi Penugasan</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Tujuan:</span>
                                                    <p className="text-gray-600">{assignment.destination}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Maksud:</span>
                                                    <p className="text-gray-600">{assignment.purpose}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Tanggal Mulai:</span>
                                                    <p className="text-gray-600">{assignment.start_date}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Tanggal Selesai:</span>
                                                    <p className="text-gray-600">{assignment.end_date}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* File Uploads */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="travel_order_file">File Surat Tugas</Label>
                                            <FileUpload
                                                value={data.travel_order_file}
                                                onChange={(file: string | File | null) => handleFileChange('travel_order_file', file)}
                                                accept=".pdf,.doc,.docx"
                                                maxSize={5} // 5MB
                                                placeholder="Seret dan letakkan file di sini atau jelajahi"
                                            />
                                            <InputError message={errors.travel_order_file} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="spd_file">File SPD (Surat Perintah Dinas)</Label>
                                            <FileUpload
                                                value={data.spd_file}
                                                onChange={(file: string | File | null) => handleFileChange('spd_file', file)}
                                                accept=".pdf,.doc,.docx"
                                                maxSize={5} // 5MB
                                                placeholder="Seret dan letakkan file di sini atau "
                                            />
                                            <InputError message={errors.spd_file} />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleReset}
                                        >
                                            Reset
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Menyimpan...' : 'Simpan Laporan'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Info */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    <p>Pastikan semua informasi yang dimasukkan sudah benar dan lengkap.</p>
                                </div>
                                <div className="text-sm">
                                    <h4 className="font-medium mb-2">File yang Diperlukan:</h4>
                                    <ul className="space-y-1 text-muted-foreground">
                                        <li>• Surat Tugas (PDF/DOC)</li>
                                        <li>• SPD - Surat Perintah Dinas (PDF/DOC)</li>
                                    </ul>
                                </div>
                                <div className="text-sm">
                                    <h4 className="font-medium mb-2">Ukuran Maksimal:</h4>
                                    <p className="text-muted-foreground">5MB per file</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
