import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Edit, MapPin } from 'lucide-react';
import type { AssignmentDocumentation } from '@/types/reports/report';
import { formatDateTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

interface DocumentationTabsProps {
    report: any;
    documentations: AssignmentDocumentation[];
    auth: any;
    isEditable?: boolean;
}

export function DocumentationTabs({ report, documentations, auth, isEditable }: DocumentationTabsProps) {
    // Action handlers for documentation list
    const handleShowLocation = (doc: AssignmentDocumentation) => {
        const lat = Number(doc.latitude);
        const lng = Number(doc.longitude);
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(url, '_blank');
    };

    const handleDownloadCard = async (doc: AssignmentDocumentation) => {
        // TODO: Implement download functionality
        console.log('Download documentation:', doc);
    };

    const handleDeleteDocumentation = (doc: AssignmentDocumentation) => {
        // TODO: Implement delete functionality if needed
        console.log('Delete documentation:', doc);
    };

    const handleEdit = () => {
        // Redirect ke assignments show page dengan tab documentation
        if (report.assignment?.id) {
            router.get(route('assignments.show', report.assignment.id), { 
                tabs: 'documentation' 
            });
        }
    };

    const canEdit = () => {
        const userRoles = auth.user.roles.map((role: any) => role.name);
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
        <div className="space-y-4">
            <DocumentationList
                documentations={documentations}
                onShowLocation={handleShowLocation}
                onDownload={handleDownloadCard}
                onDelete={handleDeleteDocumentation}
                canEdit={canEdit()}
                isEditable={isEditable}
                onEdit={handleEdit}
            />
        </div>
    );
}

interface DocumentationListProps {
    documentations: AssignmentDocumentation[];
    onShowLocation: (doc: AssignmentDocumentation) => void;
    onDownload: (doc: AssignmentDocumentation) => void;
    onDelete: (doc: AssignmentDocumentation) => void;
    canEdit: boolean;
    isEditable?: boolean;
    onEdit: () => void;
}

function DocumentationList({
    documentations,
    onShowLocation,
    onDownload,
    onDelete,
    canEdit,
    isEditable,
    onEdit
}: DocumentationListProps) {
    if (documentations.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            <CardTitle>Dokumentasi Lokasi</CardTitle>
                        </div>
                        {canEdit && isEditable && (
                            <Button variant="outline" size="sm" onClick={onEdit}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        )}
                    </div>
                    <CardDescription>
                        Belum ada dokumentasi lokasi yang diambil
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Dokumentasi lokasi akan ditampilkan di sini</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        <CardTitle>Dokumentasi Lokasi</CardTitle>
                    </div>
                    {canEdit && isEditable && (
                        <Button variant="outline" size="sm" onClick={onEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    )}
                </div>
                <CardDescription>
                    {documentations.length} foto dokumentasi lokasi
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documentations.map((doc) => (
                        <Card key={doc.id} className="p-0 shadow-none relative overflow-hidden">
                            {/* Photo */}
                            {doc.photo ? (
                                <img
                                    src={doc.photo}
                                    alt="Dokumentasi lokasi"
                                    className="w-full h-full object-cover aspect-3/2"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <MapPin className="h-8 w-8" />
                                </div>
                            )}

                            {/* Info - Absolute positioned di dalam gambar */}
                            <div className="space-y-2 text-white absolute bottom-0 left-0 right-0 p-3 bg-black/50 h-min">
                                <p className="text-sm line-clamp-1 w-full">{doc.address}</p>
                                <div className="flex items-center gap-2 text-xs">
                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                    <span className="line-clamp-1 w-full">{formatDateTime(doc.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="line-clamp-1 w-full">
                                        {Number(doc.latitude).toFixed(6)}, {Number(doc.longitude).toFixed(6)}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
