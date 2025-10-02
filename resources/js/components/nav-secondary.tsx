import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function NavSecondary({ items = [], className }: { items: NavItem[]; className?: string }) {
    const page = usePage();
    const [open, setOpen] = useState(false);
    const [currentTitle, setCurrentTitle] = useState<string | null>(null);
    const [currentPdf, setCurrentPdf] = useState<string | null>(null);

    const handleClick = (e: React.MouseEvent, item: NavItem) => {
        if (item.pdfSrc) {
            e.preventDefault();
            setCurrentTitle(item.title);
            setCurrentPdf(item.pdfSrc);
            setOpen(true);
        }
    };

    return (
        <SidebarGroup className={`mt-auto px-2 py-0 ${className ?? ''}`}>
            <SidebarGroupLabel>Informasi</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={page.url.startsWith(item.href)} tooltip={{ children: item.title }}>
                            <Link href={item.href} prefetch onClick={(e) => handleClick(e, item)}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="w-full md:max-w-5xl h-min">
                    <DialogHeader>
                        <DialogTitle>{currentTitle ?? 'Pratinjau Dokumen'}</DialogTitle>
                    </DialogHeader>
                    {currentPdf && (
                        <div className="w-full h-[80vh]">
                            <iframe
                                src={currentPdf}
                                className="w-full h-full rounded-sm border"
                                title={currentTitle ?? 'PDF'}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </SidebarGroup>
    );
}
