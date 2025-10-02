import { SidebarInset } from '@/components/ui/sidebar';
import { useMaximizeContext } from '@/contexts/maximize-context';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ variant = 'header', children, className, ...props }: AppContentProps) {
    const { isMaximized } = useMaximizeContext();

    if (variant === 'sidebar') {
        return (
            <SidebarInset 
                className={cn(
                    isMaximized && 'max-w-none rounded-none',
                    className
                )}
                {...props}
            >
                {children}
            </SidebarInset>
        );
    }

    return (
        <main 
            className={cn(
                'mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl',
                isMaximized && 'max-w-none rounded-none',
                className
            )} 
            {...props}
        >
            {children}
        </main>
    );
}
