import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { Info, Camera, FileText, ArrowLeft } from 'lucide-react';
import type { BreadcrumbItem, SharedData } from '@/types';
import type { DetailAssignment } from '@/types/assignments/assignment';
import { AssignmentDetailsTabs, AssignmentDocumentationTabs, AssignmentCreateReportTabs } from '@/components/sections/assignments';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Penugasan', href: '/assignments' },
  { title: 'Rincian', href: '' },
];

type PageProps = {
  assignment: DetailAssignment;
  transportation_types: Array<{ id: number; name: string; label: string }>;
};

export default function AssignmentShow({ assignment, transportation_types }: PageProps) {
  const { auth } = usePage<SharedData>().props;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Validasi data
  if (!assignment || !auth?.user) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Rincian Penugasan" />
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
          <PageHeader title="Rincian Penugasan" subtitle="Informasi lengkap penugasan perjalanan dinas" />
          <div className="p-4 text-center">
            <p className="text-destructive">Data tidak tersedia</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Role check
  const isEmployee = (auth.user.roles ?? []).some((role) => role.toLowerCase() === 'employee');

  // Parse tanggal & tentukan apakah sekarang < start_date
  const startDate = new Date(assignment.start_date as unknown as string); // jika tipe-nya string ISO
  const now = new Date();
  const isBeforeStart = now < startDate;

  // Ambil tab aktif dari flash (fallback 'details')
  const { props } = usePage();
  const flashTabs = (props as any)?.flash?.tabs;
  const [activeTab, setActiveTab] = useState<string>(flashTabs || 'details');

  // Helper: tab yang dilindungi sebelum start_date
  const protectedTabs = new Set(['documentation', 'create-report']);

  const handleTabChange = (value: string) => {
    if (!isMounted) return;

    // Jika belum masuk start_date & user coba buka tab terproteksi → cegah & tampilkan toast
    if (isEmployee && isBeforeStart && protectedTabs.has(value)) {
      toast.warning('Fitur ini baru bisa diakses saat penugasan sudah dimulai.');
      return;
    }

    // Cek jika tab yang dipilih adalah 'create-report' dan tidak ada dokumentasi
    if (value === 'create-report' && (!assignment.assignmentDocumentations || assignment.assignmentDocumentations.length === 0)) {
      toast.warning('Dokumentasi masih kosong. Silakan tambahkan dokumentasi terlebih dahulu.');
      return;
    }

    setActiveTab(value);
    router.get(
      route('assignments.show', assignment.id),
      { tabs: value },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  if (!isMounted) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Rincian Penugasan" />
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
          <PageHeader title="Rincian Penugasan" subtitle="Informasi lengkap penugasan perjalanan dinas" />
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Rincian Penugasan" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-end justify-between">
          <PageHeader title="Rincian Penugasan" subtitle="Informasi lengkap penugasan perjalanan dinas" />
          <Button variant="outline" asChild className="ml-4">
            <Link href={route('assignments.index')}>
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
        </div>

        {/* Conditional Layout based on User Role */}
        {isEmployee ? (
          // Employee: Tabs
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span className="hidden md:block">Rincian</span>
              </TabsTrigger>

              {/* Disable & beri title jika belum mulai */}
              <TabsTrigger
                value="documentation"
                className="flex items-center gap-2"
                disabled={isBeforeStart}
                title={isBeforeStart ? 'Dokumentasi bisa diakses saat penugasan sudah dimulai' : undefined}
              >
                <Camera className="h-4 w-4" />
                <span className="hidden md:block">Dokumentasi</span>
              </TabsTrigger>

              <TabsTrigger
                value="create-report"
                className="flex items-center gap-2"
                disabled={isBeforeStart || !assignment.assignmentDocumentations || assignment.assignmentDocumentations.length === 0}
                title={isBeforeStart ? 'Surat Tugas bisa diakses saat penugasan sudah dimulai' : !assignment.assignmentDocumentations || assignment.assignmentDocumentations.length === 0 ? 'Dokumentasi masih kosong' : undefined}
              >
                <FileText className="h-4 w-4" />
                <span className="hidden md:block">Surat Tugas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <AssignmentDetailsTabs assignment={assignment} auth={auth} />
            </TabsContent>

            <TabsContent value="documentation" className="space-y-4">
              <AssignmentDocumentationTabs
                assignment={assignment}
                documentations={assignment.assignmentDocumentations || []}
              />
            </TabsContent>

            <TabsContent value="create-report" className="space-y-4">
              <AssignmentCreateReportTabs
                assignment={assignment}
                transportation_types={transportation_types}
              />
            </TabsContent>
          </Tabs>
        ) : (
          // Leader/Superadmin/Verification: tanpa tabs
          <div className="space-y-4">
            <AssignmentDetailsTabs assignment={assignment} auth={auth} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
