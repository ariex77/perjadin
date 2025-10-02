import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, ExternalLink, FileText, Shield, Users, Award } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome - E-Perjadin" />
            <div className="flex min-h-screen flex-col items-center bg-background p-12">
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow">
                    <main className="flex w-full flex-col-reverse space-y-6 lg:max-w-6xl lg:flex-row lg:gap-12">
                        <div className="w-full md:w-1/2">
                            <div className="mb-6">
                                <Badge variant="secondary" className="mb-3">
                                    <Shield className="h-4 w-4" />
                                    Sistem E-Lapor Dinas
                                </Badge>
                                <CardTitle className="text-3xl font-bold mb-3">
                                    Selamat Datang di E-Lapor Dinas
                                </CardTitle>
                                <CardDescription className="text-lg leading-relaxed">
                                    Platform Digital Untuk Dokumentasi Perjalanan Dinas Pusat Data dan Sistem Informasi KHIT
                                    <br />
                                    <span className="text-sm text-muted-foreground mt-2 block">
                                        Kelola perjalanan dinas dengan efisien, akuntabel, dan terintegrasi.
                                    </span>
                                </CardDescription>
                            </div>

                            {/* Fitur Utama */}
                            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="p-3 shadow-none border-0 border-l rounded-none border-l-primary">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">Pengajuan Dinas</div>
                                            <div className="text-xs text-muted-foreground">Ajukan perjalanan dinas</div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-3 shadow-none border-0 border-l rounded-none border-l-green-600">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600/10">
                                            <Users className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">Review & Approval</div>
                                            <div className="text-xs text-muted-foreground">Proses persetujuan</div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-3 shadow-none border-0 border-l rounded-none border-l-sky-600">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600/10">
                                            <Award className="h-5 w-5 text-sky-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">Laporan</div>
                                            <div className="text-xs text-muted-foreground">Monitoring & evaluasi</div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* CTA Button */}
                            <div className="flex gap-3">
                                {!auth.user ? (
                                    <Button asChild className="flex-1">
                                        <Link href={route('login')}>
                                            <Shield className="h-4 w-4" />
                                            Mulai Sekarang
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button asChild variant="secondary" className="flex-1">
                                        <Link href={route('dashboard')}>
                                            <Users className="h-4 w-4" />
                                            Ke Dasbor
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Gambar Utama */}
                        <Card className="hidden md:flex items-center justify-center mb-8 w-full md:mb-0 md:w-1/2">

                            <CardContent className="flex flex-col gap-4 items-center justify-center">
                                <img
                                    src="/logo.png"
                                    alt="Badan Karantina Indonesia"
                                    className="w-64 object-cover"
                                />
                            </CardContent>
                            <CardFooter>
                                <p className='text-xl'>Pusat Data dan Sistem Informasi KHIT</p>
                            </CardFooter>
                        </Card>
                    </main>
                </div>
            </div>
        </>
    );
}
