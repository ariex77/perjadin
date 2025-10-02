import { AlertTriangle, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AccessDeniedProps {
    title?: string;
    message?: string;
    variant?: 'default' | 'destructive' | 'warning';
}

export function AccessDenied({ 
    title = 'Akses Ditolak', 
    message = 'Anda tidak memiliki izin untuk mengakses halaman ini.',
}: AccessDeniedProps) {
    return (
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 rounded-xl p-4">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-destructive/10 p-4">
                    <Lock className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-destructive">{title}</h2>
                    <p className="text-destructive max-w-md">{message}</p>
                </div>
            </div>
            
            <Alert variant="destructive" className="max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Izin Diperlukan</AlertTitle>
                <AlertDescription>
                    Hubungi administrator untuk mendapatkan akses ke fitur ini.
                </AlertDescription>
            </Alert>
        </div>
    );
}
