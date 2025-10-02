import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileImage, Download, ZoomIn } from 'lucide-react';

interface ImagePreviewProps {
    src: string;
    alt?: string;
    className?: string;
    showDownload?: boolean;
    trigger?: React.ReactNode;
}

export function ImagePreview({ 
    src, 
    alt = 'Image preview', 
    className = '',
    showDownload = true,
    trigger 
}: ImagePreviewProps) {
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);

    const handleImageLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <ZoomIn className="h-4 w-4" />
                        Lihat Gambar
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="w-full md:max-w-5xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileImage className="h-5 w-5" />
                        Pratinjau Gambar
                    </DialogTitle>
                </DialogHeader>
                
                <div className="relative flex justify-center items-center bg-black/5 rounded-lg overflow-hidden">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}
                    
                    {hasError ? (
                        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                            <FileImage className="h-12 w-12 mb-4 opacity-50" />
                            <p>Gagal memuat gambar</p>
                        </div>
                    ) : (
                        <img
                            src={src}
                            alt={alt}
                            className={`max-h-[70vh] max-w-full object-contain rounded shadow-lg transition-opacity duration-300 ${
                                isLoading ? 'opacity-0' : 'opacity-100'
                            } ${className}`}
                            style={{
                                imageRendering: 'high-quality',
                                imageSmoothingQuality: 'high',
                                imageSmoothingEnabled: true,
                            }}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />
                    )}
                </div>

                {showDownload && !hasError && (
                    <div className="flex justify-center pt-4">
                        <a href={src} download target="_blank" rel="noopener noreferrer">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Unduh Gambar
                            </Button>
                        </a>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
