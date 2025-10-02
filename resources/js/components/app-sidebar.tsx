import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Building, CreditCard, FileText, LayoutGrid, Shield, Target, Users } from 'lucide-react';
import AppLogo from './app-logo';
import { NavMaster } from './nav-master';
import { NavSetting } from './nav-setting';
import { NavReport } from './nav-report';
import { AdminOrSuperadmin, SuperadminOnly } from './role-guard';
import { NavSecondary } from './nav-secondary';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
];

const masterNavItems: NavItem[] = [
    {
        title: 'Unit Kerja',
        href: '/masters/work-units',
        icon: Building,
    },
    {
        title: 'Pegawai',
        href: '/masters/employees',
        icon: Users,
    },
    {
        title: 'Harga Uang Harian',
        href: '/masters/fullboard-prices',
        icon: CreditCard,
    },
];

const reportNavItems: NavItem[] = [
    {
        title: 'Penugasan',
        href: '/assignments',
        icon: Target,
    },
    {
        title: 'Laporan',
        href: '/reports',
        icon: FileText,
    },
];

const settingNavItems: NavItem[] = [
    {
        title: 'Role',
        href: '/systems/roles',
        icon: Shield,
    },
];

const secondaryNavItems: NavItem[] = [
    {
        title: 'PMK No. 113 Thn 2012',
        href: '#',
        icon: FileText,
        pdfSrc: '/files/2012 PMK 113.pdf',
    },
    {
        title: 'PMK No. 119 Thn 2023',
        href: '#',
        icon: FileText,
        pdfSrc: '/files/PMK No. 119 Tahun 2023.pdf',
    },
    {
        title: 'SBU Thn 2025',
        href: '#',
        icon: FileText,
        pdfSrc: '/files/STANDAR BIAYA MASUKAN TAHUN ANGGARAN 2025.pdf',
    },
];



export function AppSidebar() {
    
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Dashboard - visible to all users */}
                <NavMain items={mainNavItems} />
                
                {/* Reports - visible to all users */}
                <NavReport items={reportNavItems} />
                
                {/* Master data - only visible to superadmin and admin */}
                <AdminOrSuperadmin>
                    <NavMaster items={masterNavItems} />
                </AdminOrSuperadmin>
                
                {/* Settings - only visible to superadmin */}
                <SuperadminOnly>
                    <NavSetting items={settingNavItems} />
                </SuperadminOnly>

            </SidebarContent>

            <SidebarFooter>
                <NavSecondary items={secondaryNavItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
