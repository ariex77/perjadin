import { SidebarProvider } from '@/components/ui/sidebar';
import { MaximizeProvider } from '@/contexts/maximize-context';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;

    if (variant === 'header') {
        return (
            <MaximizeProvider>
                <div className="flex min-h-screen w-full flex-col">{children}</div>
            </MaximizeProvider>
        );
    }

    return (
        <MaximizeProvider>
            <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>
        </MaximizeProvider>
    );
}
