import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface RoleGuardProps {
    children: ReactNode;
    roles?: string[];
    fallback?: ReactNode;
    requireAll?: boolean;
}

export function RoleGuard({ 
    children, 
    roles = [], 
    fallback = null, 
    requireAll = false 
}: RoleGuardProps) {
    const { hasRole, hasAnyRole, hasAllRoles } = useAuth();

    if (roles.length === 0) {
        return <>{children}</>;
    }

    const hasAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

// Convenience components for common role checks
export function SuperadminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    return (
        <RoleGuard roles={['superadmin']} fallback={fallback}>
            {children}
        </RoleGuard>
    );
}

export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    return (
        <RoleGuard roles={['admin']} fallback={fallback}>
            {children}
        </RoleGuard>
    );
}

export function AdminOrSuperadmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    return (
        <RoleGuard roles={['admin', 'superadmin']} fallback={fallback}>
            {children}
        </RoleGuard>
    );
}
