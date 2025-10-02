
import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

import type { Report, TravelReport, TravelReportFormData } from '@/types/reports/report';
import { TravelReportForm, TravelReportDetails } from './travel-report-tabs/index';

interface TravelReportTabsProps {
    report: Report;
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

export default function TravelReportTabs({ report, auth, isEditable = true }: TravelReportTabsProps) {
    console.log(report);
    
    const [travelReport, setTravelReport] = useState<TravelReport | null>(null);
    const [isEditingTravelReport, setIsEditingTravelReport] = useState(false);
    const [editingTravelReport, setEditingTravelReport] = useState<TravelReport | null>(null);
    const [showTravelReportForm, setShowTravelReportForm] = useState(true);

    const { data: travelReportData, setData: setTravelReportData, post, put, processing: travelReportProcessing, errors: travelReportErrors, reset: resetTravelReport } = useForm<TravelReportFormData>({
        report_id: report.id,
        title: '',
        background: '',
        purpose_and_objectives: '',
        scope: '',
        legal_basis: '',
        activities_conducted: '',
        achievements: '',
        conclusions: '',
    });

    // Load existing travel report
    useEffect(() => {
        if (report.travel_report) {
            setTravelReport(report.travel_report);
            setShowTravelReportForm(false);
        } else {
            setTravelReport(null);
            setShowTravelReportForm(true);
        }
    }, [report]);



    const handleTravelReportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditingTravelReport && editingTravelReport) {
            // Update existing travel report
            put(route('reports.travel-reports.update', [report.id, editingTravelReport.id]), {
                onSuccess: () => {
                    toast.success('Laporan Perjalanan Dinas berhasil diperbarui.');
                    resetTravelReport();
                    setIsEditingTravelReport(false);
                    setEditingTravelReport(null);
                    setShowTravelReportForm(false);
                    // Refresh data
                    router.reload();
                },
                onError: (errors: any) => {
                    if (errors?.error) {
                        toast.error(errors.error);
                    }
                },
            });
        } else {
            // Create new travel report
            post(route('reports.travel-reports.store', [report.id]), {
                onSuccess: () => {
                    toast.success('Laporan Perjalanan Dinas berhasil disimpan.');
                    resetTravelReport();
                    setIsEditingTravelReport(false);
                    setEditingTravelReport(null);
                    setShowTravelReportForm(false);
                    // Refresh data
                    router.reload();
                },
                onError: (errors: any) => {
                    if (errors?.error) {
                        toast.error(errors.error);
                    }
                },
            });
        }
    };

    const handleTravelReportEdit = (travelReport: TravelReport) => {
        setIsEditingTravelReport(true);
        setEditingTravelReport(travelReport);
        setTravelReportData({
            report_id: report.id,
            title: travelReport.title || '',
            background: travelReport.background || '',
            purpose_and_objectives: travelReport.purpose_and_objectives || '',
            scope: travelReport.scope || '',
            legal_basis: travelReport.legal_basis || '',
            activities_conducted: travelReport.activities_conducted || '',
            achievements: travelReport.achievements || '',
            conclusions: travelReport.conclusions || '',
        });
    };

    const handleTravelReportReset = () => {
        if (isEditingTravelReport && editingTravelReport) {
            // Jika sedang edit, kembalikan ke data asli
            setTravelReportData({
                report_id: report.id,
                title: editingTravelReport.title || '',
                background: editingTravelReport.background || '',
                purpose_and_objectives: editingTravelReport.purpose_and_objectives || '',
                scope: editingTravelReport.scope || '',
                legal_basis: editingTravelReport.legal_basis || '',
                activities_conducted: editingTravelReport.activities_conducted || '',
                achievements: editingTravelReport.achievements || '',
                conclusions: editingTravelReport.conclusions || '',
            });
            setEditingTravelReport(null);
            setIsEditingTravelReport(false);
            setShowTravelReportForm(false);
        } else {
            // Jika sedang create baru, reset manual ke nilai default
            setTravelReportData({
                report_id: report.id,
                title: '',
                background: '',
                purpose_and_objectives: '',
                scope: '',
                legal_basis: '',
                activities_conducted: '',
                achievements: '',
                conclusions: '',
            });
        }
    };

    // Fungsi untuk mengecek apakah user bisa edit
    const canEdit = () => {
        const userRoles = auth.user.roles.map(role => role.name);
        const currentUserId = auth.user.id;
        const reportUserId = report.user?.id;

        // Superadmin, admin, verificator, dan leader tidak boleh edit
        if (userRoles.includes('superadmin') || 
            userRoles.includes('admin') || 
            userRoles.includes('verificator') || 
            userRoles.includes('leader')) {
            return false;
        }

        // Hanya pemilik report yang bisa edit
        return currentUserId === reportUserId;
    };

    return (
        <div className="space-y-6">
            {/* Travel Report Form Section */}
            {(showTravelReportForm || isEditingTravelReport) && canEdit() && isEditable && (
                <TravelReportForm
                    data={travelReportData}
                    setData={setTravelReportData}
                    errors={travelReportErrors}
                    isEditing={isEditingTravelReport}
                    editingReport={editingTravelReport}
                    isSubmitting={travelReportProcessing}
                    onSubmit={handleTravelReportSubmit}
                    onReset={handleTravelReportReset}
                />
            )}

            {/* Existing Travel Report Display */}
            {travelReport && !isEditingTravelReport && (
                <TravelReportDetails
                    report={travelReport}
                    onEdit={handleTravelReportEdit}
                    canEdit={canEdit()}
                    isEditable={isEditable}
                />
            )}

            {/* Empty State - No Travel Report (only for users who can't edit) */}
            {!travelReport && !showTravelReportForm && !isEditingTravelReport && !canEdit() && (
                <div className="text-center py-12">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Eye className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">Tidak Ada Laporan Perjalanan</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Laporan perjalanan dinas belum dibuat oleh pemilik laporan.
                    </p>
                </div>
            )}
        </div>
    );
}
