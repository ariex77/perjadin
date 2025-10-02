import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle,
    FileText,
    CalendarDays,
    MapPin,
    Users,
    XCircle,
    CheckCircle2,
    X
} from 'lucide-react';
import { getUserPhotoUrl } from '@/lib/file';
import { getInitials } from '@/lib/initials';
import { formatDateLongMonth } from '@/lib/date';
import type { Assignment } from '@/types/assignments/assignment';
import { ReportStatus } from '@/types/enums';

interface AssignmentEmployeesModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignment: Assignment | null;
}



export function AssignmentEmployeesModal({ isOpen, onClose, assignment }: AssignmentEmployeesModalProps) {
    if (!assignment) return null;

    const users = assignment.users || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Daftar Pegawai Penugasan
                    </DialogTitle>
                    <DialogDescription>
                        {assignment.purpose}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[70vh]">
                    <div className="space-y-4 pr-2">
                        {/* Assignment Info */}
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{assignment.destination}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    {formatDateLongMonth(assignment.start_date)} - {formatDateLongMonth(assignment.end_date)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{users.length} Pegawai Ditugaskan</span>
                            </div>
                        </div>

                        <Separator />

                        {/* Employee List */}
                        <div className="space-y-3">
                            {users.map((user) => {
                                const userReport = assignment.reports?.find((report: any) => report.user_id === user.id);

                                const getStatusDisplay = () => {
                                    // Jika user belum memiliki report atau status draft
                                    if (!userReport || userReport.status === ReportStatus.DRAFT) {
                                        return (
                                            <div className="flex items-center gap-2 text-sm text-destructive">
                                                <X className="h-4 w-4" />
                                                <span>Draft</span>
                                            </div>
                                        );
                                    }

                                    // Jika status submitted
                                    if (userReport.status === ReportStatus.SUBMITTED) {
                                        return (
                                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>Submitted</span>
                                            </div>
                                        );
                                    }

                                    // Jika status approved
                                    if (userReport.status === ReportStatus.APPROVED) {
                                        return (
                                            <div className="flex items-center gap-2 text-sm text-green-600">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span>Approved</span>
                                            </div>
                                        );
                                    }

                                    // Jika status rejected
                                    if (userReport.status === ReportStatus.REJECTED) {
                                        return (
                                            <div className="flex items-center gap-2 text-sm text-destructive">
                                                <XCircle className="h-4 w-4" />
                                                <span>Rejected</span>
                                            </div>
                                        );
                                    }

                                    // Fallback
                                    return (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <X className="h-4 w-4" />
                                            <span>Unknown</span>
                                        </div>
                                    );
                                };

                                return (
                                    <div key={user.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-background">
                                                <AvatarImage
                                                    src={getUserPhotoUrl(user.photo) || undefined}
                                                    alt={user.name}
                                                />
                                                <AvatarFallback className="text-sm font-medium">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {user.work_unit || 'Unit Kerja tidak tersedia'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusDisplay()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
