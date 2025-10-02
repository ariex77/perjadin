import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ReportShowProps } from '@/types/reports/report';
import {
    CheckCircle,
    Clock,
    Plane,
    FileText,
    Send,
    CreditCard,
    Camera,
    ArrowLeft,
} from 'lucide-react';
import { ReportReviewModal } from '@/components/sections/reports/review-modal';
import { DetailTabs, DocumentationTabs } from '@/components/sections/reports';
import * as React from 'react';
import ExpenseTabs from '@/components/sections/reports/expense-tabs';
import { formatDateLongMonthWithTime } from '@/lib/date';
import TravelReportTabs from '@/components/sections/reports/travel-report-tabs';
import { SubmitDialog } from '@/components/ui/submit-dialog';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan Perjalanan', href: '/reports' },
    { title: 'Rincian Laporan', href: '' },
];

type Props = ReportShowProps;

export default function ReportShow({ report, activeTab: initialActiveTab, auth, fullboardPrices, transportationTypes }: Props) {
    const [reviewModalOpen, setReviewModalOpen] = React.useState(false);
    const [submitDialogOpen, setSubmitDialogOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { props } = usePage();

    // Ambil tabs dari flash message jika ada
    const flashTabs = (props.flash as any)?.tabs;
    const [activeTab, setActiveTab] = React.useState(flashTabs || initialActiveTab || 'details');

    // Destruct data dari report
    const { data: reportData } = report;

    // Helper functions
    const getUserRoles = () => auth.user.roles.map(role => role.name);
    const canViewAllTabs = () => {
        // Semua role bisa melihat Status Review tab
        return true;
    };

    const canViewDraftReports = () => {
        const userRoles = getUserRoles();
        // Verificator dan leader tidak bisa melihat laporan draft
        return !userRoles.includes('verificator') && !userRoles.includes('leader');
    };

    // Set default tab jika user tidak bisa melihat status-review atau draft
    React.useEffect(() => {
        if (!canViewAllTabs() && activeTab === 'status-review') {
            setActiveTab('details');
        }
        // Jika user tidak bisa melihat draft dan laporan berstatus draft, redirect ke halaman lain
        if (!canViewDraftReports() && reportData.status === 'draft') {
            router.get(route('reports.index'), { status: 'submitted' });
        }
    }, [activeTab, reportData.status]);

    // Validasi data untuk mencegah error
    if (!reportData) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Rincian Laporan Perjalanan" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Data laporan tidak ditemukan</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Validasi akses untuk verificator dan leader
    if (!canViewDraftReports() && reportData.status === 'draft') {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Akses Ditolak" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Anda tidak memiliki akses untuk melihat laporan draft</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const getReviewerType = () => {
        const userRoles = getUserRoles();
        if (userRoles.includes('verificator')) return 'commitment_officer';
        if (userRoles.includes('leader')) return 'section_head';
        return null;
    };

    const canReview = () => {
        const userRoles = getUserRoles();
        const reviewerType = getReviewerType();

        // Harus punya tipe reviewer yang valid
        if (!reviewerType) return false;

        // Hanya boleh review saat status submitted atau rejected (bukan approved/draft)
        const allowedStatuses = ['submitted', 'rejected'];
        if (!allowedStatuses.includes(reportData.status)) return false;

        // Cegah duplikasi: jika reviewer ini sudah pernah mereview
        const hasReviewed = reportData?.reviews?.some((review: any) =>
            review.reviewer_type === reviewerType
        );
        if (hasReviewed) return false;

        // Validasi role & scope
        if (userRoles.includes('verificator')) return true; // PPK
        if (userRoles.includes('leader')) {
            // Ketua TIM hanya untuk anggota unitnya
            return reportData?.user?.workUnit?.head?.id === auth.user.id;
        }
        return false;
    };

    const handleReview = () => setReviewModalOpen(true);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.get(
            route('reports.show', reportData.id),
            { tabs: value },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    // Validasi kelengkapan sebelum submit
    const hasExpense = Boolean(reportData?.in_city_expense || reportData?.out_city_expense);
    const hasTravelReport = Boolean(reportData?.travel_report);
    const isReadyToSubmit = hasExpense && hasTravelReport;

    const guardSubmit = () => {
        if (isReadyToSubmit) {
            setSubmitDialogOpen(true);
            return;
        }

        // Susun pesan dan arahkan ke tab yang kurang
        const missingParts: string[] = [];
        let redirectTab = activeTab;
        if (!hasExpense) {
            missingParts.push('Biaya');
            redirectTab = 'expenses';
        }
        if (!hasTravelReport) {
            missingParts.push('Laporan Perjalanan');
            // Jika biaya sudah ada tapi laporan perjalanan belum, arahkan ke laporan perjalanan
            if (hasExpense) redirectTab = 'travel-reports';
        }

        const message = `Tidak dapat menyerahkan laporan. Lengkapi ${missingParts.join(' dan ')} terlebih dahulu.`;
        toast.error(message);
        handleTabChange(redirectTab);
    };

    const getReviewStatus = () => {
        const reviews = reportData?.reviews || [];
        const approvedReviews = reviews.filter((r: any) => r.status === 'approved').length;
        const rejectedReviews = reviews.filter((r: any) => r.status === 'rejected').length;

        if (rejectedReviews > 0) return 'rejected';
        if (approvedReviews >= 2) return 'approved';
        return 'pending';
    };

    const getTabsBackgroundColor = () => {
        const status = getReviewStatus();
        switch (status) {
            case 'approved': return 'bg-green-600/60';
            case 'rejected': return 'bg-destructive/60';
            default: return null;
        }
    };

    const isFormEditable = () => {
        const status = reportData.status;
        // Verificator dan leader tidak bisa edit laporan draft
        if (status === 'draft' && !canViewDraftReports()) {
            return false;
        }
        return status === 'draft' || status === 'rejected';
    };

    const DownloadButtons = () => (
        reportData.status === 'approved' && (
            <div className="flex flex-wrap gap-2">
                <Button
                    variant="outline"
                    onClick={() => {
                        window.open(route('reports.download-expense', reportData.id), '_blank');
                    }}

                >
                    <CreditCard className="h-4 w-4" />
                    Unduh
                </Button>

                <Button
                    variant="outline"
                    onClick={() => {
                        window.open(route('reports.download-travel', reportData.id), '_blank');
                    }}
                >
                    <Plane className="h-4 w-4" />
                    Unduh
                </Button>
            </div>
        )
    );

    const ReviewCard = ({ reviewerType, title, waitingMessage }: { reviewerType: string; title: string; waitingMessage: string }) => {
        const review = reportData?.reviews?.find((r: any) => r.reviewer_type === reviewerType);

        return (
            <Card className="relative">
                <CardContent>
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-gray-900">{title}</h5>
                        {!review ? (
                            <Badge variant="secondary" className="absolute top-0 rounded-br-none rounded-tl-none right-0 text-xs bg-gray-100 text-gray-600">
                                <Clock className="h-3 w-3 mr-1" />
                                Ditinjau
                            </Badge>
                        ) : (
                            <Badge
                                variant={review.status === 'approved' ? 'default' : 'destructive'}
                                className={review.status === 'approved'
                                    ? 'absolute top-0 rounded-br-none rounded-tl-none right-0 text-xs bg-green-100 text-green-700'
                                    : 'absolute top-0 rounded-br-none rounded-tl-none right-0 text-xs bg-red-100 text-red-700'
                                }
                            >
                                {review.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                            </Badge>
                        )}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                        {review ? formatDateLongMonthWithTime(review.created_at) : '-'}
                    </div>
                    <div className="text-xs text-gray-600">
                        {!review ? waitingMessage : (review.notes || "Tidak ada catatan tambahan.")}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rincian Laporan Perjalanan" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex md:items-end flex-col md:flex-row justify-between gap-4">
                    <PageHeader title="Rincian Laporan Perjalanan" subtitle="Informasi lengkap laporan perjalanan dinas" />

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {(reportData.status === 'draft') && reportData.user?.id === auth.user.id && canViewDraftReports() && (
                            <Button variant="default" onClick={guardSubmit} disabled={!isReadyToSubmit}>
                                <Send className="h-4 w-4" />
                                Serahkan
                            </Button>
                        )}
                        {(reportData.status === 'rejected') && reportData.user?.id === auth.user.id && (
                            <Button
                                variant="default"
                                onClick={() => {
                                    if (!reportData.can_resubmit) {
                                        toast.error('Belum ada perubahan setelah penolakan. Perbarui data terlebih dahulu.');
                                        return;
                                    }
                                    guardSubmit();
                                }}
                                disabled={!isReadyToSubmit || !reportData.can_resubmit}
                            >
                                <Send className="h-4 w-4" />
                                Serahkan Kembali
                            </Button>
                        )}

                        {canReview() && (
                            <Button onClick={handleReview}>
                                <CheckCircle className="h-4 w-4" />
                                Tinjau
                            </Button>
                        )}

                        <DownloadButtons />
                        <Button variant="outline" asChild className="ml-4">
                            <Link href={route('reports.index')}>
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Tabs Layout */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className={`grid w-full ${canViewAllTabs() ? 'grid-cols-5' : 'grid-cols-4'} ${getTabsBackgroundColor()}`}>
                        <TabsTrigger value="documentations" className="flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            <span className="hidden md:block">Dokumentasi</span>
                        </TabsTrigger>
                        <TabsTrigger value="details" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="hidden md:block">Surat Tugas</span>
                        </TabsTrigger>
                        <TabsTrigger value="expenses" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="hidden md:block">Biaya</span>
                        </TabsTrigger>
                        <TabsTrigger value="travel-reports" className="flex items-center gap-2">
                            <Plane className="h-4 w-4" />
                            <span className="hidden md:block">Laporan Perjalanan</span>
                        </TabsTrigger>
                        {canViewAllTabs() && (
                            <TabsTrigger value="status-review" className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                <span className="hidden md:block">Status Review</span>
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="documentations" className="space-y-4">
                        <DocumentationTabs
                            report={reportData}
                            documentations={reportData.assignmentDocumentations || []}
                            auth={auth}
                            isEditable={isFormEditable()}
                        />
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4">
                        <DetailTabs
                            report={reportData}
                            transportationTypes={transportationTypes}
                            auth={auth}
                            isEditable={isFormEditable()}
                        />
                    </TabsContent>

                    <TabsContent value="expenses" className="space-y-4">
                        <ExpenseTabs
                            report={reportData}
                            fullboardPrices={fullboardPrices || []}
                            auth={auth}
                            isEditable={isFormEditable()}
                        />
                    </TabsContent>

                    <TabsContent value="travel-reports" className="space-y-4">
                        <TravelReportTabs
                            report={reportData}
                            auth={auth}
                            isEditable={isFormEditable()}
                        />
                    </TabsContent>

                    <TabsContent value="status-review" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <ReviewCard
                                reviewerType="section_head"
                                title="Ketua TIM"
                                waitingMessage="Menunggu review dari Ketua TIM."
                            />
                            <ReviewCard
                                reviewerType="commitment_officer"
                                title="PPK"
                                waitingMessage="Menunggu review dari Pejabat Pembuat Komitmen (PPK)."
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Review Modal */}
                <ReportReviewModal
                    open={reviewModalOpen}
                    onOpenChange={setReviewModalOpen}
                    report={reportData}
                    reviewerType={getReviewerType()!}
                />

                {/* Submit Dialog */}
                <SubmitDialog
                    open={submitDialogOpen}
                    onOpenChange={setSubmitDialogOpen}
                    isProcessing={isSubmitting}
                    onSubmit={() => {
                        setIsSubmitting(true);
                        const submitReport = new Promise<{ name: string }>((resolve, reject) => {
                            router.post(route('reports.submit', reportData.id), {}, {
                                onSuccess: () => {
                                    resolve({ name: 'Laporan' });
                                    setSubmitDialogOpen(false);
                                    setIsSubmitting(false);
                                },
                                onError: (errors: any) => {
                                    reject(errors?.error || 'Laporan gagal diserahkan!');
                                    setIsSubmitting(false);
                                },
                            });
                        });

                        toast.promise(submitReport, {
                            loading: 'Memproses..',
                            success: (data: { name: string }) => `${data.name} berhasil diserahkan.`,
                            error: (error: any) => String(error),
                        });
                    }}
                />
            </div>
        </AppLayout>
    );
}


