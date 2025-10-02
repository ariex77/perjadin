import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TableActions } from '@/components/ui/table-actions';
import type { AssignmentDocumentation, DetailAssignment } from '@/types/assignments/assignment';
import { MapPin } from 'lucide-react';

interface DocumentationListProps {
    documentations: AssignmentDocumentation[];
    assignment: DetailAssignment;
    onShowLocation: (doc: AssignmentDocumentation) => void;
    onDownload: (doc: AssignmentDocumentation) => void;
    onDelete: (doc: AssignmentDocumentation) => void;
}

export function DocumentationList({ documentations, assignment, onShowLocation, onDownload, onDelete }: DocumentationListProps) {
    if (documentations.length === 0) {
        return (
            <Card className="h-min">
                <CardHeader>
                    <CardTitle>Dokumentasi Lokasi</CardTitle>
                    <CardDescription>Belum ada dokumentasi lokasi yang diambil</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="py-8 text-center text-muted-foreground">
                        <MapPin className="mx-auto mb-4 size-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Mulai ambil foto untuk dokumentasi lokasi. Ambil 2 atau 4 foto agar rapi di laporan perjalanan.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Check if any report is submitted or approved
    const isReportLocked = assignment?.reports?.some((r) => r.status === 'submitted' || r.status === 'approved');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dokumentasi Lokasi</CardTitle>
                <CardDescription>{documentations.length} foto dokumentasi lokasi</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {documentations.map((doc) => (
                        <Card key={doc.id} className="relative overflow-hidden p-0 shadow-none">
                            {/* Photo */}
                            {doc.photo ? (
                                <img src={doc.photo} alt="Dokumentasi lokasi" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                    <MapPin className="h-8 w-8" />
                                </div>
                            )}
                            {!isReportLocked && (
                                <div className="absolute top-2 right-2">
                                    <TableActions
                                        onShow={() => onShowLocation(doc)}
                                        onDownload={() => onDownload(doc)}
                                        onDelete={() => onDelete(doc)}
                                        className="bg-background/90 hover:bg-background"
                                    />
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
