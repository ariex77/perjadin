import { Button } from '@/components/ui/button';
import { Camera, FlipHorizontal, MapPin, Calendar } from 'lucide-react';
import { formatDateLongMonthWithTime } from '@/lib/date';

interface CameraCaptureProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    isLoading: boolean;
    hasLocation: boolean;
    isMobile: boolean;
    currentLocation?: { latitude: number; longitude: number; address: string } | null;
    onStopCamera: () => void;
    onCapturePhoto: () => void;
    onFlipCamera: () => void;
}

export function CameraCapture({
    videoRef,
    canvasRef,
    isLoading,
    hasLocation,
    isMobile,
    currentLocation,
    onStopCamera,
    onCapturePhoto,
    onFlipCamera
}: CameraCaptureProps) {
    return (
        <div className="space-y-4">
            {/* Camera Preview */}
            <div className="relative w-full">
                <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover rounded-lg border"
                    />
                    
                    {/* Metadata Preview Overlay */}
                    {currentLocation && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/50 text-white rounded-b-lg">
                            <div className="space-y-1">
                                <p className="text-sm line-clamp-2 font-medium">{currentLocation.address}</p>
                                <div className="flex items-center gap-2 text-xs opacity-90">
                                    <MapPin className="h-3 w-3" />
                                    <span>{currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs opacity-90">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDateLongMonthWithTime(new Date().toISOString())}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera Controls */}
                <div className="flex justify-center gap-4 mt-4">
                    <Button
                        variant="outline"
                        onClick={onStopCamera}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    {isMobile && (
                        <Button
                            variant="outline"
                            onClick={onFlipCamera}
                            disabled={isLoading}
                            size="icon"
                        >
                            <FlipHorizontal className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        onClick={onCapturePhoto}
                        disabled={isLoading || !hasLocation}
                    >
                        {isLoading ? 'Menyimpan...' : 'Ambil Foto'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
