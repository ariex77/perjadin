import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export function useAuth() {
    const { auth } = usePage<SharedData>().props;

    const can = (ability: string): boolean => {
        return auth.user?.permissions?.includes(ability) || false;
    };

    const hasRole = (role: string | string[]): boolean => {
        const roles = Array.isArray(role) ? role : [role];
        return auth.user?.roles?.some(r => roles.includes(r)) || false;
    };

    const hasAnyRole = (roles: string[]): boolean => {
        return auth.user?.roles?.some(r => roles.includes(r)) || false;
    };

    return {
        user: auth.user,
        roles: auth.user?.roles || [],
        permissions: auth.user?.permissions || [],
        can,
        hasRole,
        hasAnyRole,
    };
}

// Helper functions untuk authorization
export const canManageTickets = (): boolean => {
    const { hasAnyRole } = useAuth();
    return hasAnyRole(['admin', 'superadmin']);
};

export const canViewTickets = (): boolean => {
    return true; // Semua user yang sudah login bisa lihat
};

export const canCreateTickets = (): boolean => {
    const { hasAnyRole } = useAuth();
    return hasAnyRole(['admin', 'superadmin']);
};

export const canEditTickets = (): boolean => {
    const { hasAnyRole } = useAuth();
    return hasAnyRole(['admin', 'superadmin']);
};

export const canDeleteTickets = (): boolean => {
    const { hasAnyRole } = useAuth();
    return hasAnyRole(['admin', 'superadmin']);
};
