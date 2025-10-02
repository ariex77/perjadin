import { useState, useRef, useCallback } from 'react';
import { formatDateLongMonthWithTime } from '@/lib/date';

interface UseCameraReturn {
    isCapturing: boolean;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    currentCameraMode: 'front' | 'back';
    isMobile: boolean;
    startCamera: () => Promise<void>;
    stopCamera: () => void;
    capturePhoto: (locationData?: { latitude: number; longitude: number; address: string }) => Promise<Blob | null>;
    flipCamera: () => Promise<void>;
}

/**
 * Add metadata overlay to canvas with location and timestamp information
 */
function addMetadataOverlay(
    context: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    locationData: { latitude: number; longitude: number; address: string }
) {
    const overlayHeight = Math.min(120, canvas.height * 0.3); // Responsive height
    const overlayY = canvas.height - overlayHeight;
    
    // Create gradient for better text readability
    const gradient = context.createLinearGradient(0, overlayY, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    
    context.fillStyle = gradient;
    context.fillRect(0, overlayY, canvas.width, overlayHeight);
    
    // Set text properties
    context.fillStyle = 'white';
    context.textAlign = 'left';
    
    // Calculate font sizes based on canvas size
    const baseFontSize = Math.max(12, Math.min(16, canvas.width / 40));
    const smallFontSize = Math.max(10, Math.min(14, canvas.width / 50));
    
    // Add address with proper text wrapping
    context.font = `500 ${baseFontSize}px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
    
    const maxWidth = canvas.width - 40;
    const words = locationData.address.split(' ');
    let line = '';
    let y = overlayY + baseFontSize + 10;
    
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
            context.fillText(line.trim(), 20, y);
            line = words[i] + ' ';
            y += baseFontSize + 2;
        } else {
            line = testLine;
        }
    }
    context.fillText(line.trim(), 20, y);
    
    // Add coordinates with location pin symbol
    context.font = `400 ${smallFontSize}px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    context.fillText(`📍 ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`, 20, y + smallFontSize + 10);
    
    // Add timestamp with calendar symbol
    const currentTime = new Date().toISOString();
    context.fillText(`📅 ${formatDateLongMonthWithTime(currentTime)}`, 20, y + (smallFontSize + 10) * 2);
}

export function useCamera(): UseCameraReturn {
    const [isCapturing, setIsCapturing] = useState(false);
    const [currentCameraMode, setCurrentCameraMode] = useState<'front' | 'back'>('back');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const startCamera = useCallback(async (): Promise<void> => {
        try {
            setIsCapturing(true);

            // Start camera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: currentCameraMode === 'back' ? 'environment' : 'user',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Error starting camera:', error);
            setIsCapturing(false);
            throw error;
        }
    }, [currentCameraMode]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCapturing(false);
    }, []);

    const flipCamera = useCallback(async (): Promise<void> => {
        if (!isCapturing || !isMobile) return;

        try {
            // Stop current stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            // Switch camera mode
            const newMode = currentCameraMode === 'back' ? 'front' : 'back';
            setCurrentCameraMode(newMode);

            // Start new stream with different camera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: newMode === 'back' ? 'environment' : 'user',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Error flipping camera:', error);
            // Revert to previous mode if flip fails
            setCurrentCameraMode(currentCameraMode);
            throw error;
        }
    }, [isCapturing, currentCameraMode, isMobile]);

    const capturePhoto = useCallback(async (locationData?: { latitude: number; longitude: number; address: string }): Promise<Blob | null> => {
        if (!videoRef.current || !canvasRef.current) {
            throw new Error('Kamera tidak siap');
        }

        return new Promise((resolve, reject) => {
            try {
                const video = videoRef.current!;
                const canvas = canvasRef.current!;
                const context = canvas.getContext('2d');

                if (!context) {
                    reject(new Error('Tidak dapat mengakses canvas'));
                    return;
                }

                // Set canvas size to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Draw video frame to canvas
                context.drawImage(video, 0, 0);

                // Add metadata overlay if location data is provided
                if (locationData) {
                    addMetadataOverlay(context, canvas, locationData);
                }

                // Convert canvas to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Tidak dapat mengambil foto'));
                    }
                }, 'image/jpeg', 0.8);
            } catch (error) {
                reject(error);
            }
        });
    }, []);

    return {
        isCapturing,
        videoRef,
        canvasRef,
        currentCameraMode,
        isMobile,
        startCamera,
        stopCamera,
        capturePhoto,
        flipCamera
    };
}
