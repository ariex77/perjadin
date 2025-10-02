import { Eye, MoreHorizontal, Pencil, Trash, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TableActionsProps {
    onEdit?: () => void;
    onDelete?: () => void;
    onShow?: () => void;
    onDownload?: () => void;
    className?: string;
}

export function TableActions({ onEdit, onDelete, onShow, onDownload, className }: TableActionsProps) {
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn("h-8 w-8 p-0", className)}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {onShow && (
                    <DropdownMenuItem onClick={() => {
                        setOpen(false);
                        onShow();
                    }}>
                        <Eye className="h-4 w-4" />
                        Lihat
                    </DropdownMenuItem>
                )}
                {onEdit && (
                    <DropdownMenuItem onClick={() => {
                        setOpen(false);
                        onEdit();
                    }}>
                        <Pencil className="h-4 w-4" />
                        Ubah
                    </DropdownMenuItem>
                )}
                {onDownload && (
                    <DropdownMenuItem onClick={() => {
                        setOpen(false);
                        onDownload();
                    }}>
                        <Download className="h-4 w-4" />
                        Unduh
                    </DropdownMenuItem>
                )}
                {onDelete && (
                    <DropdownMenuItem
                        onClick={() => {
                            setOpen(false);
                            onDelete();
                        }}
                        variant="destructive"
                    >
                        <Trash className="h-4 w-4" />
                        Hapus
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
