import { useCallback, useState } from 'react';
import * as React from 'react';

interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface DeleteConfirmationState {
  isOpen: boolean;
  title: string;
  description: string;
  actionLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
}

/**
 * Hook untuk menangani confirmation dialog yang konsisten
 */
export function useConfirmation() {
  const [deleteState, setDeleteState] = useState<DeleteConfirmationState>({
    isOpen: false,
    title: '',
    description: '',
    actionLabel: 'Hapus',
    cancelLabel: 'Batal',
    onConfirm: () => {},
  });

  const confirm = useCallback((options: ConfirmationOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Jika options adalah string, gunakan sebagai message
      const config = typeof options === 'string' 
        ? { message: options } 
        : options;

      const {
        title = 'Konfirmasi',
        message,
        confirmText = 'Ya',
        cancelText = 'Batal',
        type = 'info'
      } = config;

      // Gunakan browser confirm sebagai fallback
      const result = window.confirm(`${title}\n\n${message}`);
      resolve(result);
    });
  }, []);

  const confirmDelete = useCallback((itemName?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const title = 'Konfirmasi Hapus';
      const description = itemName 
        ? `Apakah Anda yakin ingin menghapus ${itemName}? Tindakan ini tidak dapat dibatalkan.`
        : 'Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.';
      
      setDeleteState({
        isOpen: true,
        title,
        description,
        actionLabel: 'Hapus',
        cancelLabel: 'Batal',
        onConfirm: () => {
          setDeleteState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
      });

      // Store the resolve function to be called on cancel
      (setDeleteState as any)._resolve = resolve;
    });
  }, []);

  const confirmUpdate = useCallback((itemName?: string): Promise<boolean> => {
    const message = itemName 
      ? `Apakah Anda yakin ingin memperbarui ${itemName}?`
      : 'Apakah Anda yakin ingin memperbarui item ini?';
    
    return confirm({
      title: 'Konfirmasi Perbarui',
      message,
      confirmText: 'Perbarui',
      cancelText: 'Batal',
      type: 'warning'
    });
  }, [confirm]);

  const confirmAction = useCallback((action: string, itemName?: string): Promise<boolean> => {
    const message = itemName 
      ? `Apakah Anda yakin ingin ${action} ${itemName}?`
      : `Apakah Anda yakin ingin ${action} item ini?`;
    
    return confirm({
      title: `Konfirmasi ${action}`,
      message,
      confirmText: 'Ya',
      cancelText: 'Batal',
      type: 'warning'
    });
  }, [confirm]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteState(prev => ({ ...prev, isOpen: false }));
    // Call resolve with false when cancelled
    if ((setDeleteState as any)._resolve) {
      (setDeleteState as any)._resolve(false);
      (setDeleteState as any)._resolve = null;
    }
  }, []);

  return {
    confirm,
    confirmDelete,
    confirmUpdate,
    confirmAction,
    deleteState,
    handleDeleteCancel,
  };
}
