import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapboxPicker } from '@/components/ui/mapbox-picker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Navigation, Ruler, CalendarDays } from 'lucide-react';
import { getInitials } from '@/lib/initials';
import { getUserPhotoUrl } from '@/lib/file';
import type { Ticket } from '@/types/tickets/ticket';
import { formatDateLongMonthWithTime } from '@/lib/date';

interface DetailTabsProps {
    ticket: Ticket;
}

export default function DetailTabs({ ticket }: DetailTabsProps) {


    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Lokasi Geofence
                    </CardTitle>
                    <CardDescription>
                        Peta menunjukkan lokasi dan radius geofence untuk pelaporan
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MapboxPicker
                        defaultCenter={[
                            typeof ticket.longitude === 'number' && !isNaN(ticket.longitude) ? ticket.longitude : 106.816666,
                            typeof ticket.latitude === 'number' && !isNaN(ticket.latitude) ? ticket.latitude : -6.2
                        ]}
                        defaultRadius={ticket.radius_m || 1000}
                        readOnly={true}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Informasi Tiket</CardTitle>
                </CardHeader>
                <CardContent >
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={getUserPhotoUrl(ticket.user?.photo) || undefined} alt={ticket.user?.name} />
                                <AvatarFallback className="text-xs">
                                    {ticket.user?.name ? getInitials(ticket.user.name) : '—'}
                                </AvatarFallback>
                            </Avatar>
                            {ticket.user?.name ?? '—'}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>Tujuan</span>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">
                                {ticket.address}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Navigation className="h-4 w-4 text-primary" />
                                <span>Koordinat</span>
                            </div>
                            <div className="text-sm text-muted-foreground pl-6 space-y-1">
                                <p>Latitude: {ticket.latitude}</p>
                                <p>Longitude: {ticket.longitude}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Ruler className="h-4 w-4 text-primary" />
                                <span>Radius</span>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">
                                {ticket.radius_m ?? '-'} meter
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <CalendarDays className="h-4 w-4 text-primary" />
                                <span>Dibuat</span>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">
                                {formatDateLongMonthWithTime(ticket.created_at)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
