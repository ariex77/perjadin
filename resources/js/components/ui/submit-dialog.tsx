import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SubmitDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSubmit: () => void;
    title?: string;
    description?: string;
    actionLabel?: string;
    cancelLabel?: string;
    disabled?: boolean;
    isProcessing?: boolean;
}

export function SubmitDialog({
    open,
    onOpenChange,
    onSubmit,
    title = 'Serahkan Laporan?',
    description = 'Laporan akan dikirim untuk review. Setelah diserahkan, laporan tidak dapat diedit lagi.',
    actionLabel = 'Serahkan',
    cancelLabel = 'Batal',
    disabled = false,
    isProcessing = false,
}: SubmitDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={disabled || isProcessing}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onSubmit}
                        className="bg-primary hover:bg-primary/90"
                        disabled={disabled || isProcessing}
                    >
                        {isProcessing ? 'Memproses..' : actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
