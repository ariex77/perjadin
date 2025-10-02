import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TravelReport } from '@/types/reports/report';
import { Edit, FileText } from 'lucide-react';

interface TravelReportDetailsProps {
    report: TravelReport;
    onEdit: (travelReport: TravelReport) => void;
    canEdit: boolean;
    isEditable?: boolean;
}

export function TravelReportDetails({ report, onEdit, canEdit, isEditable = true }: TravelReportDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <CardTitle>Laporan Perjalanan Dinas</CardTitle>
                    </div>
                    {canEdit && isEditable && (
                        <Button variant="outline" size="sm" onClick={() => onEdit(report)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <CardDescription>Rincian laporan perjalanan dinas yang telah dibuat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <h1 className="font-medium text-muted-foreground">Judul</h1>
                    <div className="prose prose-sm max-w-none text-justify text-wrap break-words text-foreground">{report.title}</div>
                </div>

                {/* A. PENDAHULUAN */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">A. PENDAHULUAN</h3>

                    {/* 1. Latar Belakang */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">1. Latar Belakang</h4>
                        <div
                            className="prose prose-sm max-w-none text-justify text-wrap break-words text-foreground"
                            dangerouslySetInnerHTML={{ __html: report.background || 'Tidak ada data' }}
                        />
                    </div>

                    {/* 2. Maksud dan Tujuan */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">2. Maksud dan Tujuan</h4>
                        <div
                            className="prose prose-sm max-w-none text-justify text-wrap break-words text-foreground"
                            dangerouslySetInnerHTML={{ __html: report.purpose_and_objectives || 'Tidak ada data' }}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">B. RUANG LINGKUP</h3>
                        <div
                            className="prose prose-sm max-w-none text-justify text-wrap break-words text-foreground"
                            dangerouslySetInnerHTML={{ __html: report.scope || 'Tidak ada data' }}
                        />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">C. DASAR PELAKSANAAN</h3>
                        <div
                            className="prose prose-sm max-w-none text-justify text-wrap break-words text-foreground"
                            dangerouslySetInnerHTML={{ __html: report.legal_basis || 'Tidak ada data' }}
                        />
                    </div>
                </div>

                {/* D. KEGIATAN YANG DILAKSANAKAN */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">D. KEGIATAN YANG DILAKSANAKAN</h3>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Deskripsi Kegiatan</h4>
                        <div
                            className="prose prose-sm max-w-none text-justify text-wrap break-words text-foreground"
                            dangerouslySetInnerHTML={{ __html: report.activities_conducted || 'Tidak ada data' }}
                        />
                    </div>
                </div>

                {/* E. HASIL YANG DICAPAI */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">E. HASIL YANG DICAPAI</h3>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Hasil yang Dicapai</h4>
                        <div
                            className="prose prose-sm max-w-none text-justify text-wrap break-words text-foreground"
                            dangerouslySetInnerHTML={{ __html: report.achievements || 'Tidak ada data' }}
                        />
                    </div>
                </div>

                {/* F. KESIMPULAN DAN SARAN */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">F. KESIMPULAN DAN SARAN</h3>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Kesimpulan dan Saran</h4>
                        <div
                            className="prose prose-sm max-w-none text-justify text-wrap break-words text-foreground"
                            dangerouslySetInnerHTML={{ __html: report.conclusions || 'Tidak ada data' }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
