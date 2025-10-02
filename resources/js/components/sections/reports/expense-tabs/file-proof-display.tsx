import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, FileImage } from 'lucide-react';

interface FileProofDisplayProps {
    file: string;
    label: string;
    iconColor: string;
}

export function FileProofDisplay({ file, label, iconColor }: FileProofDisplayProps) {
    // Deteksi apakah file adalah gambar berdasarkan ekstensi
    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file);
    const fileName = file.split('/').pop() || '';
    
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{label}</label>
            <div className="flex gap-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            {isImage ? (
                                <FileImage className="h-4 w-4" />
                            ) : (
                                <FileText className="h-4 w-4" />
                            )}
                            Lihat
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full md:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Pratinjau {label}</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center items-center">
                            {isImage ? (
                                <img 
                                    src={file} 
                                    alt={fileName}
                                    className="max-h-[75vh] max-w-full object-contain rounded shadow-lg"
                                    style={{ 
                                        imageRendering: 'crisp-edges' as any
                                    }}
                                />
                            ) : (
                                <iframe 
                                    src={file} 
                                    className="h-[75vh] w-full rounded border" 
                                    title={fileName}
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
                <a href={file} download target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm">
                        <Download className="h-4 w-4" />
                        Unduh
                    </Button>
                </a>
            </div>
        </div>
    );
}
