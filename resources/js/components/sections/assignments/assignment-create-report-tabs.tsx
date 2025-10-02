import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/ui/input-error';
import { FileText, CheckCircle, Eye } from 'lucide-react';
import { useForm, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import type { FormErrors } from '@/types';

interface AssignmentCreateReportTabsProps {
    assignment: any;
    transportation_types: Array<{ id: number; name: string; label: string }>;
}

export default function AssignmentCreateReportTabs({ assignment, transportation_types }: AssignmentCreateReportTabsProps) {
    const { data, setData, post, processing, errors } = useForm({
        assignment_id: assignment.id,
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
            assignment_id: assignment.id,
            travel_type: '',
            actual_duration: '',
            transportation_type_ids: [],
            travel_order_number: '',
            travel_order_file: null,
            spd_file: null,
        });
    };

    // Cek apakah sudah ada reports
    const hasReports = assignment.current_user_report;

    const report = assignment.current_user_report;


    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - Form atau Info Report */}
            <div className="lg:col-span-2">
                {hasReports ? (
                    // Tampilkan info jika sudah ada report
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Laporan Sudah Dibuat
                            </CardTitle>
                            <CardDescription>
                                Laporan perjalanan dinas untuk penugasan ini sudah dibuat
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {report && (
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Nomor Surat Tugas:</span>
                                        <span className="font-medium">
                                            {report.travel_order_number || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Jenis Perjalanan:</span>
                                        <span className="font-medium">
                                            {report.travel_type === 'in_city' ? 'Dalam Kota' :
                                                report.travel_type === 'out_city' ? 'Luar Kota' :
                                                    report.travel_type === 'out_country' ? 'Luar Negeri' : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <span className="font-medium capitalize-first">
                                            {report.status || 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Link href={route('reports.show', report?.id)}>
                                    <Button className="inline-flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Lihat Laporan
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    // Tampilkan form jika belum ada report
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Form Laporan Perjalanan
                            </CardTitle>
                            <CardDescription>
                                Buat laporan pertanggung jawaban perjalanan dinas
                            </CardDescription>
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
                                        Pilih minimal satu jenis transportasi yang digunakan (wajib)
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
                                        />
                                        <InputError message={errors.travel_order_number} />
                                    </div>
                                    {/* Travel Order Number */}
                                    <div className="space-y-2 w-full md:w-1/4">
                                        <Label htmlFor="actual_duration">Durasi Asli Perjalanan</Label>
                                        <Input
                                            id="actual_duration"
                                            type="number"
                                            min={1}
                                            value={data.actual_duration}
                                            onChange={(e) => setData('actual_duration', e.target.value)}
                                            placeholder="Durasi asli perjalanan"
                                        />
                                        <InputError message={errors.actual_duration} />
                                    </div>
                                </div>

                                {/* File Uploads */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="travel_order_file">File Surat Tugas</Label>
                                        <FileUpload
                                            value={data.travel_order_file}
                                            onChange={(file: string | File | null) => handleFileChange('travel_order_file', file)}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            maxSize={2} // 2MB
                                            placeholder="Seret dan letakkan file di sini atau "
                                        />
                                        <InputError message={errors.travel_order_file} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="spd_file">File SPD (Surat Perintah Dinas)</Label>
                                        <FileUpload
                                            value={data.spd_file}
                                            onChange={(file: string | File | null) => handleFileChange('spd_file', file)}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            maxSize={2} // 5MB
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
                )}
            </div>

            {/* Right Column - Info */}
            <div className="lg:col-span-1">
                {hasReports ? (
                    // Info untuk report yang sudah dibuat
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Laporan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                <p>Laporan perjalanan dinas sudah dibuat dan siap untuk ditinjau.</p>
                            </div>
                            <div className="text-sm">
                                <h4 className="font-medium mb-2">Langkah Selanjutnya:</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• Klik "Lihat Laporan" untuk melihat detail</li>
                                    <li>• Laporan akan ditinjau oleh PPK</li>
                                    <li>• Setelah disetujui PPK, akan ditinjau Pimpinan</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    // Info untuk form pembuatan report
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
                                <p className="text-muted-foreground">2MB per file</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
