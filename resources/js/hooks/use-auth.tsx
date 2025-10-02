import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export function useAuth() {
    const { auth } = usePage<SharedData>().props;
    const userRoles = auth.user?.roles || [];

    const isSuperadmin = userRoles.includes('superadmin');
    const isAdmin = userRoles.includes('admin');
    const isRegularUser = !isSuperadmin && !isAdmin;

    const hasRole = (role: string) => userRoles.includes(role);
    const hasAnyRole = (roles: string[]) => roles.some(role => userRoles.includes(role));
    const hasAllRoles = (roles: string[]) => roles.every(role => userRoles.includes(role));

    return {
        user: auth.user,
        roles: userRoles,
        isSuperadmin,
        isAdmin,
        isRegularUser,
        hasRole,
        hasAnyRole,
        hasAllRoles,
    };
}
