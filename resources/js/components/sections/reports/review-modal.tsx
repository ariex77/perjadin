import InputError from '@/components/ui/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Report } from '@/types/reports/report';

interface ReportReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    report: Pick<Report, 'id' | 'travel_order_number' | 'destination_city' | 'travel_purpose' | 'user'>;
    reviewerType: 'commitment_officer' | 'section_head';
}



export function ReportReviewModal({ open, onOpenChange, report, reviewerType }: ReportReviewModalProps) {
    const { data, setData, processing, errors, reset, clearErrors, post } = useForm({
        reviewer_type: reviewerType,
        status: 'approved' as 'approved' | 'rejected',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!report) {
            toast.error('Data laporan tidak valid');
            return;
        }

        // Kirim request untuk review
        post(route('reports.review', report.id), {
            onSuccess: () => {
                toast.success('Review laporan berhasil disimpan');
                onOpenChange(false);
                reset();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
                } else {
                    toast.error('Terjadi kesalahan saat menyimpan review');
                }
            },
        });
    };

    const handleChange = (field: string, value: string) => {
        setData(field as keyof typeof data, value);
        if (errors[field as keyof typeof errors]) {
            clearErrors(field as keyof typeof errors);
        }
    };



    const resetForm = () => {
        reset();
        clearErrors();
    };

    React.useEffect(() => {
        if (open && report) {
            setData({
                reviewer_type: reviewerType,
                status: 'approved',
                notes: '',
            });
        }
    }, [open, report, reviewerType, setData]);

    // Don't render if report is null
    if (!report) {
        return null;
    }

    const reviewerTitle = reviewerType === 'commitment_officer' ? 'PPK' : 'Kasi';

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
                if (!isOpen) resetForm();
            }}
        >
            <DialogContent className="max-w-md">
                <DialogHeader className='pl-1'>
                    <DialogTitle>Review Laporan Perjalanan</DialogTitle>
                    <DialogDescription>
                        Berikan review sebagai {reviewerTitle} untuk laporan {report.user.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Report Info */}
                    <div className="rounded-md bg-muted/50 p-3">
                        <span className="font-medium">{report.user.name}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Nomor Surat Tugas:</span>
                            <span>{report.travel_order_number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Tujuan:</span>
                            <span>{report.destination_city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Maksud:</span>
                            <span className="truncate">{report.travel_purpose}</span>
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                disabled={processing}
                                variant={data.status === 'approved' ? 'default' : 'outline'}
                                onClick={() => handleChange('status', 'approved')}
                                className="flex-1"
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Setujui
                            </Button>
                            <Button
                                type="button"
                                disabled={processing}
                                variant={data.status === 'rejected' ? 'destructive' : 'outline'}
                                onClick={() => handleChange('status', 'rejected')}
                                className="flex-1"
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                Tolak
                            </Button>
                        </div>
                    </div>

                    {/* Notes Textarea */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Catatan (opsional)</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Berikan catatan atau saran untuk laporan ini..."
                            rows={3}
                            maxLength={500}
                            className={errors.notes ? 'border-red-500' : ''}
                        />
                        <div className="flex justify-between items-center">
                            <InputError message={errors.notes} />
                            <span className="text-xs text-muted-foreground">
                                {data.notes.length}/500 karakter
                            </span>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className={data.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            {processing ? 'Menyimpan...' : `Simpan`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
