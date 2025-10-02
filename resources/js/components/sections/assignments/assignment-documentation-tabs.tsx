import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { useCamera } from '@/hooks/useCamera';
import { useDocumentationUpload } from '@/hooks/useDocumentationUpload';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { AssignmentDocumentation, DetailAssignment } from '@/types/assignments/assignment';
import { downloadImage } from '@/utils/imageDownload';
import { useForm, usePage } from '@inertiajs/react';
import { Camera, CameraOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CameraCapture } from '../reports/camera-capture';
import { CameraStart } from '../reports/camera-start';
import { LocationStatus } from '../reports/location-status';
import { DocumentationList } from './documentation-list';

interface AssignmentDocumentationTabsProps {
    assignment: DetailAssignment;
    documentations: AssignmentDocumentation[];
}

export default function AssignmentDocumentationTabs({ assignment, documentations: initialDocumentations }: AssignmentDocumentationTabsProps) {
    const [documentations, setDocumentations] = useState<AssignmentDocumentation[]>(initialDocumentations || []);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedDocumentation, setSelectedDocumentation] = useState<AssignmentDocumentation | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Check if report status is submitted or approved
    const isReportLocked = assignment?.reports?.some((r) => r.status === 'submitted' || r.status === 'approved');

    // Custom hooks
    const { currentLocation, locationError, getCurrentLocation, clearLocation } = useGeolocation();
    const { isCapturing, videoRef, canvasRef, startCamera, stopCamera, capturePhoto, flipCamera, isMobile } = useCamera();
    const { isLoading, uploadDocumentation } = useDocumentationUpload();

    const { delete: deleteRequest, processing } = useForm();

    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string } | undefined;

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Update documentations when initialDocumentations changes
    useEffect(() => {
        setDocumentations(initialDocumentations || []);
    }, [initialDocumentations]);

    // Event handlers
    const handleStartCamera = async () => {
        if (isReportLocked) {
            toast.warning('Dokumentasi tidak dapat diakses setelah laporan disubmit/approved.');
            return;
        }
        try {
            setIsGettingLocation(true);
            await getCurrentLocation();
            await startCamera();
        } catch (error) {
            console.error('Error starting camera:', error);
            if (error instanceof Error) {
                if (error.message.includes('lokasi')) {
                    // Location error is handled by the hook
                } else {
                    toast.error('Tidak dapat mengakses kamera');
                }
            }
        } finally {
            setIsGettingLocation(false);
        }
    };

    const handleStopCamera = () => {
        stopCamera();
        clearLocation();
    };

    const handleCapturePhoto = async () => {
        if (isReportLocked) {
            toast.warning('Dokumentasi tidak dapat diakses setelah laporan disubmit/approved.');
            return;
        }
        if (!currentLocation) {
            toast.error('Lokasi tidak tersedia');
            return;
        }

        try {
            // Pass location data to capturePhoto for overlay
            const photoBlob = await capturePhoto(currentLocation);
            if (photoBlob) {
                await uploadDocumentation(photoBlob, currentLocation, assignment.id, 'assignment');
                handleStopCamera();
            }
        } catch (error) {
            console.error('Error capturing photo:', error);
            toast.error('Gagal mengambil foto');
        }
    };

    const handleFlipCamera = async () => {
        if (isReportLocked) {
            toast.warning('Dokumentasi tidak dapat diakses setelah laporan disubmit/approved.');
            return;
        }
        try {
            await flipCamera();
        } catch (error) {
            console.error('Error flipping camera:', error);
            toast.error('Tidak dapat membalik kamera');
        }
    };

    // Action handlers for documentation list
    const handleShowLocation = (doc: AssignmentDocumentation) => {
        const lat = Number(doc.latitude);
        const lng = Number(doc.longitude);
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(url, '_blank');
    };

    const handleDownloadCard = async (doc: AssignmentDocumentation) => {
        await downloadImage(doc.photo, doc);
    };

    const handleDeleteDocumentation = (doc: AssignmentDocumentation) => {
        if (isReportLocked) {
            toast.warning('Dokumentasi tidak dapat dihapus setelah laporan disubmit/approved.');
            return;
        }
        setSelectedDocumentation(doc);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteDocumentation = () => {
        if (!selectedDocumentation) return;
        if (isReportLocked) {
            toast.warning('Dokumentasi tidak dapat dihapus setelah laporan disubmit/approved.');
            setIsDeleteDialogOpen(false);
            setSelectedDocumentation(null);
            return;
        }
        deleteRequest(route('assignments.documentation.destroy', [assignment.id, selectedDocumentation.id]), {
            onBefore: () => {
                toast.loading('Sedang memproses...');
            },
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedDocumentation(null);
                toast.dismiss();
                // Flash message akan ditangani oleh useEffect di atas
            },
            onError: () => {
                setIsDeleteDialogOpen(false);
                setSelectedDocumentation(null);
                toast.dismiss();
                // Flash message akan ditangani oleh useEffect di atas
            },
        });
    };

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Delete Dialog */}
            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onDelete={confirmDeleteDocumentation}
                title="Hapus dokumentasi?"
                description="Tindakan ini tidak dapat dibatalkan. Dokumentasi ini akan dihapus secara permanen dari sistem."
                actionLabel="Hapus"
                cancelLabel="Batal"
                disabled={processing}
            />

            {/* Camera Section - Left Column */}
            <Card className="h-min">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Dokumentasi Lokasi
                    </CardTitle>
                    <CardDescription>Ambil foto 2 atau 4 foto dan catat lokasi untuk dokumentasi penugasan perjalanan dinas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isReportLocked ? (
                        <div className="flex flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
                            <CameraOff className="mx-auto mb-4 size-10 text-muted-foreground" />
                            <span>Dokumentasi tidak dapat diakses setelah laporan disubmit/approved.</span>
                        </div>
                    ) : !isCapturing ? (
                        <CameraStart onStartCamera={handleStartCamera} />
                    ) : (
                        <div className="space-y-4">
                            <LocationStatus locationError={locationError} currentLocation={currentLocation} isGettingLocation={isGettingLocation} />
                            <CameraCapture
                                videoRef={videoRef}
                                canvasRef={canvasRef}
                                isLoading={isLoading}
                                hasLocation={!!currentLocation}
                                isMobile={isMobile}
                                currentLocation={currentLocation}
                                onStopCamera={handleStopCamera}
                                onCapturePhoto={handleCapturePhoto}
                                onFlipCamera={handleFlipCamera}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Documentation List - Right Column */}
            <DocumentationList
                documentations={documentations}
                assignment={assignment}
                onShowLocation={handleShowLocation}
                onDownload={handleDownloadCard}
                onDelete={handleDeleteDocumentation}
            />
        </div>
    );
}
