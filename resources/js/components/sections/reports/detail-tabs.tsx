import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { formatDateLongMonth } from '@/lib/date';
import { FormErrors } from '@/types';
import type { Report } from '@/types/reports/report';
import { router, useForm } from '@inertiajs/react';
import { Download, Edit, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FileProofEditDisplay } from './expense-tabs/file-proof-edit-display';

interface DetailTabsProps {
    report: Report;
    transportationTypes?: Array<{
        id: number;
        name: string;
        label: string;
    }>;
    auth: {
        user: {
            id: number;
            name: string;
            roles: Array<{
                name: string;
            }>;
        };
    };
    isEditable?: boolean;
}

export function DetailTabs({ report, transportationTypes, auth, isEditable = true }: DetailTabsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { data, setData, errors, reset } = useForm({
        travel_type: report.travel_type || 'in_city',
        transportation_type_ids: (report.transportation_types || []).map((type) => type.id),
        travel_order_number: report.travel_order_number || '',
        actual_duration: (report.actual_duration ?? null) as number | null,
        travel_order_file: null as File | string | null,
        spd_file: null as File | string | null,
    });

    // Reset form data ketika report berubah (setelah update)
    useEffect(() => {
        setData({
            travel_type: report.travel_type || 'in_city',
            transportation_type_ids: (report.transportation_types || []).map((type) => type.id),
            travel_order_number: report.travel_order_number || '',
            actual_duration: (report.actual_duration ?? null) as number | null,
            travel_order_file: null,
            spd_file: null,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        // spoof method
        formData.append('_method', 'PUT');

        // fields sederhana
        formData.append('travel_type', String(data.travel_type || ''));
        formData.append('travel_order_number', String(data.travel_order_number || ''));

        // number / nullable
        if (data.actual_duration !== null && data.actual_duration !== undefined) {
            formData.append('actual_duration', String(data.actual_duration));
        } else {
            // biarkan kosong jika ingin diperlakukan null oleh backend
            formData.append('actual_duration', '');
        }

        // array checkbox: gunakan nama field dengan [] agar Laravel treat sebagai array
        (data.transportation_type_ids || []).forEach((id) => {
            formData.append('transportation_type_ids[]', String(id));
        });

        // files: hanya kirim kalau ada File baru
        if (data.travel_order_file instanceof File) {
            formData.append('travel_order_file', data.travel_order_file);
        }
        if (data.spd_file instanceof File) {
            formData.append('spd_file', data.spd_file);
        }

        const updateReport = new Promise<{ name: string }>((resolve, reject) => {
            router.post(route('reports.update', report.id), formData, {
                forceFormData: true,
                onStart: () => {
                    setSubmitting(true);
                },
                onSuccess: () => {
                    setIsEditing(false);
                    reset();
                    resolve({ name: 'Laporan' });
                },
                onError: (errs: Record<string, string>) => {
                    // compat dengan tipe FormErrors yang kamu pakai
                    const fe: FormErrors = { ...errs, error: 'Laporan gagal diperbarui!' } as unknown as FormErrors; 
                    reject(fe?.error || 'Laporan gagal diperbarui!');
                },
                onFinish: () => {
                    setSubmitting(false);
                },
                // penting: karena kita sudah pakai FormData manual, tidak perlu forceFormData
                // preserveScroll bisa dipakai sesuai kebutuhan:
                preserveScroll: true,
            });
        });

        toast.promise(updateReport, {
            loading: 'Memproses...',
            success: (d) => `${d.name} berhasil diperbarui.`,
            error: (err) => String(err),
        });
    };

    const isPreviewable = (url?: string | null): boolean => {
        if (!url) return false;
        try {
            const lower = url.toLowerCase();
            return (
                lower.endsWith('.pdf') ||
                lower.endsWith('.png') ||
                lower.endsWith('.jpg') ||
                lower.endsWith('.jpeg') ||
                lower.includes('mime=application/pdf') ||
                lower.includes('mime=image/')
            );
        } catch {
            return false;
        }
    };

    // Handler untuk transportation type checkbox
    const handleTransportationTypeChange = (typeId: number, checked: boolean) => {
        if (checked) {
            if (!data.transportation_type_ids.includes(typeId)) {
                const newIds = [...data.transportation_type_ids, typeId];
                setData('transportation_type_ids', newIds);
            }
        } else {
            const newIds = data.transportation_type_ids.filter((id) => id !== typeId);
            setData('transportation_type_ids', newIds);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        reset();
    };

    // Fungsi untuk mengecek apakah user bisa edit report
    const canEdit = () => {
        const userRoles = auth.user.roles.map((role) => role.name);
        const currentUserId = auth.user.id;
        const reportUserId = report.user?.id;

        // Superadmin, admin, verificator, dan leader tidak boleh edit
        if (userRoles.includes('superadmin') || userRoles.includes('admin') || userRoles.includes('verificator') || userRoles.includes('leader')) {
            return false;
        }

        // Hanya pemilik report yang bisa edit
        return currentUserId === reportUserId;
    };

    return (
        <div className="space-y-6">
            {isEditing ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Perbarui Informasi Surat Tugas
                        </CardTitle>
                        <CardDescription>Perbarui detail surat tugas perjalanan dinas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="travel_type">Jenis Perjalanan *</Label>
                                <Select
                                    value={data.travel_type}
                                    onValueChange={(value) => setData('travel_type', value as 'in_city' | 'out_city' | 'out_country')}
                                >
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

                            {/* Transportation Types */}
                            <div className="space-y-2">
                                <Label htmlFor="transportation_type_ids">Jenis Transportasi</Label>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                    {transportationTypes && Array.isArray(transportationTypes) && transportationTypes.length > 0 ? (
                                        transportationTypes.map((type: { id: number; name: string; label: string }) => (
                                            <div key={type.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`transportation_${type.id}`}
                                                    checked={data.transportation_type_ids.includes(type.id)}
                                                    onCheckedChange={(checked) => handleTransportationTypeChange(type.id, checked as boolean)}
                                                />
                                                <Label htmlFor={`transportation_${type.id}`} className="cursor-pointer text-sm font-normal">
                                                    {type.label}
                                                </Label>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-3">
                                            <p className="text-sm text-gray-500">
                                                {!transportationTypes ? 'Memuat jenis transportasi...' : 'Tidak ada jenis transportasi tersedia'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.transportation_type_ids} className="mt-1" />
                                <p className="text-xs text-muted-foreground">Pilih satu atau lebih jenis transportasi yang digunakan</p>
                            </div>

                            <div className="flex flex-col items-center gap-4 md:flex-row">
                                <div className="w-full space-y-2 md:w-3/4">
                                    <Label htmlFor="travel_order_number">Nomor Surat Tugas *</Label>
                                    <Input
                                        id="travel_order_number"
                                        value={data.travel_order_number}
                                        onChange={(e) => setData('travel_order_number', e.target.value)}
                                        placeholder="Masukkan nomor surat tugas"
                                    />
                                    <InputError message={errors.travel_order_number} className="mt-1" />
                                </div>

                                <div className="w-full space-y-2 md:w-1/4">
                                    <Label htmlFor="actual_duration">Durasi Asli (hari) *</Label>
                                    <Input
                                        id="actual_duration"
                                        type="number"
                                        min={0}
                                        value={(data.actual_duration ?? '') as number | string}
                                        onChange={(e) => setData('actual_duration', e.target.value ? Number(e.target.value) : null)}
                                        placeholder="Masukkan durasi asli perjalanan"
                                    />
                                    <InputError message={errors.actual_duration} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="travel_order_file">File Surat Tugas</Label>
                                    <FileUpload
                                        value={data.travel_order_file}
                                        onChange={(file: File | string | null) => setData('travel_order_file', file)}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        maxSize={5}
                                        error={errors.travel_order_file}
                                    />
                                    <p className="text-xs text-muted-foreground">Format: PDF, JPG, JPEG, PNG (Maks. 5MB)</p>
                                    {report.travel_order_file && (
                                        <div className="space-y-2">
                                            <FileProofEditDisplay
                                                file={(report.travel_order_file_url || '') as string}
                                                label="Surat Tugas"
                                                iconColor="text-blue-600"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="spd_file">File SPD</Label>
                                    <FileUpload
                                        value={data.spd_file}
                                        onChange={(file: File | string | null) => setData('spd_file', file)}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        maxSize={5}
                                        error={errors.spd_file}
                                    />
                                    <p className="text-xs text-muted-foreground">Format: PDF, JPG, JPEG, PNG (Maks. 5MB)</p>
                                    {report.spd_file && (
                                        <div className="space-y-2">
                                            <FileProofEditDisplay
                                                file={(report.spd_file_url || '') as string}
                                                label="SPD"
                                                iconColor="text-green-600"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Memproses...' : 'Perbarui'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                <CardTitle>Informasi Surat Tugas</CardTitle>
                            </div>
                            {canEdit() && isEditable && (
                                <Button variant="outline" size="sm" onClick={handleEdit}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <CardDescription>Detail surat tugas perjalanan dinas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Jenis Perjalanan</label>
                                <div className="text-sm text-foreground">
                                    {report?.travel_type === 'in_city'
                                        ? 'Dalam Kota'
                                        : report?.travel_type === 'out_city'
                                          ? 'Luar Kota'
                                          : report?.travel_type === 'out_country'
                                            ? 'Luar Negeri'
                                            : 'N/A'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Jenis Transportasi</label>
                                <div className="text-sm text-foreground">
                                    {report?.transportation_types && report.transportation_types.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {report.transportation_types.map((type: { id: number; name: string; label: string }, index: number) => (
                                                <div key={type.id} className="flex items-center gap-1">
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                                        {type.label}
                                                    </span>
                                                    {index < report.transportation_types.length - 1 && <span className="text-gray-400">→</span>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Tidak ada data</span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Nomor Surat Tugas</label>
                                <div className="text-sm text-foreground">{report?.travel_order_number || 'N/A'}</div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Kota Tujuan</label>
                                <div className="text-sm text-foreground">{report?.destination_city || 'N/A'}</div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Periode</label>
                                <div className="text-sm text-foreground">
                                    {formatDateLongMonth(report?.departure_date)} - {formatDateLongMonth(report?.return_date)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Durasi Asli Perjalanan</label>
                                <div className="text-sm text-foreground">{report?.actual_duration ? `${report.actual_duration} hari` : '-'}</div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Maksud Perjalanan</label>
                                <p className="text-sm break-words text-foreground">{report?.travel_purpose || 'N/A'}</p>
                            </div>
                        </div>

                        <Separator />
                        <div className="space-y-3">
                            <h4 className="font-medium">Dokumen</h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {report?.travel_order_file && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">File Surat Tugas</label>
                                        <div className="flex gap-2">
                                            {isPreviewable(report?.travel_order_file_url) ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            <FileText className="mr-1 h-4 w-4" />
                                                            Lihat
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="w-full md:max-w-4xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Pratinjau Surat Tugas</DialogTitle>
                                                        </DialogHeader>
                                                        <iframe
                                                            src={(report?.travel_order_file_url || '') as string}
                                                            className="h-[75vh] w-full rounded"
                                                        />
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <a href={report?.travel_order_file_url || '#'} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="outline" size="sm">
                                                        <FileText className="mr-1 h-4 w-4" />
                                                        Lihat
                                                    </Button>
                                                </a>
                                            )}
                                            <a href={report?.travel_order_file_url || '#'} download target="_blank" rel="noopener noreferrer">
                                                <Button variant="secondary" size="sm">
                                                    <Download className="mr-1 h-4 w-4" />
                                                    Unduh
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {report?.spd_file && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">File SPD</label>
                                        <div className="flex gap-2">
                                            {isPreviewable(report?.spd_file_url) ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            <FileText className="mr-1 h-4 w-4" />
                                                            Lihat
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="w-full md:max-w-4xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Pratinjau SPD</DialogTitle>
                                                        </DialogHeader>
                                                        <iframe src={(report?.spd_file_url || '') as string} className="h-[75vh] w-full rounded" />
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <a href={report?.spd_file_url || '#'} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="outline" size="sm">
                                                        <FileText className="mr-1 h-4 w-4" />
                                                        Lihat
                                                    </Button>
                                                </a>
                                            )}
                                            <a href={report?.spd_file_url || '#'} download target="_blank" rel="noopener noreferrer">
                                                <Button variant="secondary" size="sm">
                                                    <Download className="mr-1 h-4 w-4" />
                                                    Unduh
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
