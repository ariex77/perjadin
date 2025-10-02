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

interface DeleteDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onDelete: () => void;
    title?: string;
    description?: string;
    actionLabel?: string;
    cancelLabel?: string;
    disabled?: boolean;
}

export function DeleteDialog({
    open,
    onOpenChange,
    onDelete,
    title = 'Are you sure?',
    description = 'This action cannot be undone. This will permanently delete this item and remove its data from our servers.',
    actionLabel = 'Delete',
    cancelLabel = 'Cancel',
    disabled = false,
}: DeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={disabled}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onDelete}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={disabled}
                    >
                        {actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
