import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface LocationData {
    latitude: number;
    longitude: number;
    address: string;
}

interface UseDocumentationUploadReturn {
    isLoading: boolean;
    uploadDocumentation: (photo: Blob, location: LocationData, reportId: number, type?: 'report' | 'assignment') => Promise<void>;
}

export function useDocumentationUpload(): UseDocumentationUploadReturn {
    const [isLoading, setIsLoading] = useState(false);

    const uploadDocumentation = async (
        photo: Blob,
        location: LocationData,
        reportId: number,
        type: 'report' | 'assignment' = 'report'
    ): Promise<void> => {
        try {
            setIsLoading(true);

            // Create form data
            const formData = new FormData();
            formData.append('photo', photo, 'documentation.jpg');
            formData.append('address', location.address);
            formData.append('latitude', location.latitude.toString());
            formData.append('longitude', location.longitude.toString());

            // Upload to server using Inertia
            const routeName = type === 'assignment' ? 'assignments.documentation.store' : 'reports.documentation.store';
            await new Promise<void>((resolve, reject) => {
                router.post(route(routeName, reportId), formData, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Dokumentasi berhasil disimpan');
                        resolve();
                    },
                    onError: (errors) => {
                        console.error('Upload errors:', errors);
                        const errorMessage = errors.photo || errors.address || errors.latitude || errors.longitude || 'Gagal mengunggah dokumentasi';
                        toast.error(errorMessage);
                        reject(new Error(errorMessage));
                    },
                    onFinish: () => {
                        setIsLoading(false);
                    }
                });
            });
        } catch (error) {
            console.error('Error uploading:', error);
            toast.error('Gagal mengunggah dokumentasi');
            setIsLoading(false);
            throw error;
        }
    };

    return {
        isLoading,
        uploadDocumentation
    };
}
