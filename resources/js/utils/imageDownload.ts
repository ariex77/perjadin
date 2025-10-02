import { toast } from 'sonner';

export interface DocumentationData {
    id: number;
    photo: string;
    address: string;
    latitude: number | string;
    longitude: number | string;
    created_at: string;
}

/**
 * Download original image file with proper filename
 */
export async function downloadImage(photoUrl: string, doc: DocumentationData): Promise<void> {
    try {
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename with date and location
        const date = new Date(doc.created_at);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const locationStr = doc.address.split(',')[0].replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        const filename = `dokumentasi_${dateStr}_${locationStr}.jpg`;
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Gambar berhasil diunduh');
    } catch (error) {
        console.error('Error downloading image:', error);
        toast.error('Gagal mengunduh gambar');
        throw error;
    }
}
