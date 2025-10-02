import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InputError from '@/components/ui/input-error';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { FileText } from 'lucide-react';

import type { TravelReport, TravelReportFormData } from '@/types/reports/report';
import { Textarea } from '@/components/ui/textarea';

interface TravelReportFormProps {
    data: TravelReportFormData;
    setData: (data: TravelReportFormData) => void;
    errors: Record<string, string>;
    isEditing?: boolean;
    editingReport?: TravelReport | null;
    isSubmitting?: boolean;
    onSubmit?: (e: React.FormEvent) => void;
    onReset?: () => void;
}

export function TravelReportForm({
    data,
    setData,
    errors,
    isEditing = false,
    editingReport = null,
    isSubmitting = false,
    onSubmit,
    onReset
}: TravelReportFormProps) {
    const handleInputChange = (field: keyof TravelReportFormData, value: string) => {
        setData({
            ...data,
            [field]: value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {isEditing ? 'Edit Laporan Perjalanan Dinas' : 'Tambah Laporan Perjalanan Dinas'}
                    </CardTitle>
                    <CardDescription>
                        Form laporan detail perjalanan dinas sesuai dengan struktur yang ditentukan
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* A. PENDAHULUAN */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">JUDUL</h3>
                        <Label htmlFor="title" className="text-sm font-medium">
                            Judul Laporan Perjalanan
                        </Label>
                        <Textarea
                            id="title"
                            rows={2}
                            maxLength={255}
                            value={data.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="Judul laporan perjalanan..."
                            className={errors.title ? 'border-destructive' : ''}
                        />
                        <InputError message={errors.title} className="mt-1" />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">A. PENDAHULUAN</h3>

                        {/* 1. Latar Belakang */}
                        <div className="space-y-2">
                            <Label htmlFor="background" className="text-sm font-medium">
                                1. Latar Belakang
                            </Label>
                            <RichTextEditor
                                value={data.background}
                                onChange={(value) => handleInputChange('background', value)}
                                placeholder="Jelaskan latar belakang perjalanan dinas..."
                                className={errors.background ? 'border-destructive' : ''}
                            />
                            <InputError message={errors.background} className="mt-1" />
                        </div>

                        {/* 2. Maksud dan Tujuan */}
                        <div className="space-y-2">
                            <Label htmlFor="purpose_and_objectives" className="text-sm font-medium">
                                2. Maksud dan Tujuan
                            </Label>
                            <RichTextEditor
                                value={data.purpose_and_objectives}
                                onChange={(value) => handleInputChange('purpose_and_objectives', value)}
                                placeholder="Jelaskan maksud dan tujuan perjalanan dinas..."
                                className={errors.purpose_and_objectives ? 'border-destructive' : ''}
                            />
                            <InputError message={errors.purpose_and_objectives} className="mt-1" />
                        </div>

                        {/* 3. Ruang Lingkup */}
                        <div className="space-y-2">
                            <Label htmlFor="scope" className="text-sm font-medium">
                                3. Ruang Lingkup
                            </Label>
                            <RichTextEditor
                                value={data.scope}
                                onChange={(value) => handleInputChange('scope', value)}
                                placeholder="Jelaskan ruang lingkup kegiatan..."
                                className={errors.scope ? 'border-destructive' : ''}
                            />
                            <InputError message={errors.scope} className="mt-1" />
                        </div>

                        {/* 4. Dasar Pelaksanaan */}
                        <div className="space-y-2">
                            <Label htmlFor="legal_basis" className="text-sm font-medium">
                                4. Dasar Pelaksanaan
                            </Label>
                            <RichTextEditor
                                value={data.legal_basis}
                                onChange={(value) => handleInputChange('legal_basis', value)}
                                placeholder="Jelaskan dasar hukum/pelaksanaan kegiatan..."
                                className={errors.legal_basis ? 'border-destructive' : ''}
                            />
                            <InputError message={errors.legal_basis} className="mt-1" />
                        </div>
                    </div>

                    {/* B. KEGIATAN YANG DILAKSANAKAN */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">B. KEGIATAN YANG DILAKSANAKAN</h3>

                        <div className="space-y-2">
                            <Label htmlFor="activities_conducted" className="text-sm font-medium">
                                Deskripsi Kegiatan
                            </Label>
                            <RichTextEditor
                                value={data.activities_conducted}
                                onChange={(value) => handleInputChange('activities_conducted', value)}
                                placeholder="Jelaskan detail kegiatan yang dilaksanakan..."
                                className={errors.activities_conducted ? 'border-destructive' : ''}
                            />
                            <InputError message={errors.activities_conducted} className="mt-1" />
                        </div>
                    </div>

                    {/* C. HASIL YANG DICAPAI */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">C. HASIL YANG DICAPAI</h3>

                        <div className="space-y-2">
                            <Label htmlFor="achievements" className="text-sm font-medium">
                                Hasil yang Dicapai
                            </Label>
                            <RichTextEditor
                                value={data.achievements}
                                onChange={(value) => handleInputChange('achievements', value)}
                                placeholder="Jelaskan hasil yang dicapai dari perjalanan dinas..."
                                className={errors.achievements ? 'border-destructive' : ''}
                            />
                            <InputError message={errors.achievements} className="mt-1" />
                        </div>
                    </div>

                    {/* D. KESIMPULAN DAN SARAN */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">D. KESIMPULAN DAN SARAN</h3>

                        <div className="space-y-2">
                            <Label htmlFor="conclusions" className="text-sm font-medium">
                                Kesimpulan dan Saran
                            </Label>
                            <RichTextEditor
                                value={data.conclusions}
                                onChange={(value) => handleInputChange('conclusions', value)}
                                placeholder="Berikan kesimpulan dan saran dari perjalanan dinas..."
                                className={errors.conclusions ? 'border-destructive' : ''}
                            />
                            <InputError message={errors.conclusions} className="mt-1" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onReset}
                            disabled={isSubmitting}
                        >
                            {isEditing ? 'Batal' : 'Reset'}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Memproses...' : (isEditing ? 'Perbarui' : 'Simpan')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
