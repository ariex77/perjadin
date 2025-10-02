import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface CameraStartProps {
    onStartCamera: () => void;
}

export function CameraStart({ onStartCamera }: CameraStartProps) {
    return (
        <div className="text-center py-8">
            <Camera className="size-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground mb-2">
                Mulai Dokumentasi
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
                Klik tombol di bawah untuk mengaktifkan kamera dan GPS
            </p>
            <Button onClick={onStartCamera} className="w-full sm:w-auto">
                Mulai Kamera
            </Button>
        </div>
    );
}
