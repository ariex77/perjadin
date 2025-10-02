import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export default function AppLogo() {
    const { name } = usePage<SharedData>().props;

    return (
        <>
            <div className="flex items-center justify-center w-8 h-8 min-w-8 md:w-10 md:h-10 rounded-md text-sidebar-primary-foreground overflow-hidden">
                <img src="/logo.png" alt="Logo" className="w-6 h-6 md:w-8 md:h-8 object-center object-contain" loading="lazy" />
            </div>
            <div className=" hidden md:grid flex-1 min-w-0 text-left text-sm">
                <span className="mb-0.5 text-lg truncate leading-tight font-semibold">{name}</span>
            </div>
        </>
    );
}
