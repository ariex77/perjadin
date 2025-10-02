import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Edit } from 'lucide-react';
import { FileProofDisplay } from './file-proof-display';
import { formatCurrencyIDR } from '@/lib/utils';
import type { OutCityExpense } from '@/types/reports/report';

interface OutCityExpenseDetailsProps {
    expense: OutCityExpense;
    onEdit: (expense: OutCityExpense) => void;
    canEdit?: boolean;
    isEditable?: boolean;
    actualDuration: number;
}

export function OutCityExpenseDetails({ expense, onEdit, canEdit = true, isEditable = true, actualDuration }: OutCityExpenseDetailsProps) {
    console.log(expense);
    
    const formatCurrency = (amount: number | null) => {
        if (amount === null || isNaN(amount)) return formatCurrencyIDR(0);
        return formatCurrencyIDR(amount);
    };

    const days = Number.isFinite(actualDuration) && actualDuration > 0 ? actualDuration : 0;
    const nights = days > 0 ? Math.max(days - 1, 0) : 0;

    const multiplyByDays = (amount: number | null) => {
        const base = amount || 0;
        return days > 0 ? base * days : base;
    };

    const multiplyByNights = (amount: number | null) => {
        const base = amount || 0;
        return nights > 0 ? base * nights : base;
    };

    const fmtWithDays = (amount: number | null) => {
        const base = amount || 0;
        return days > 0 ? `${formatCurrency(base)} x ${days} hari = ${formatCurrency(base * days)}` : formatCurrency(base);
    };

    const fmtWithNights = (amount: number | null) => {
        const base = amount || 0;
        if (nights > 0) {
            const perNight = base / nights;
            return `${formatCurrency(base)} (${formatCurrency(perNight)} x ${nights} malam)`;
        }
        return formatCurrency(base);
    };

    const calculateTotal = (expense: OutCityExpense) => {
        // Daily allowance - either from fullboard price or custom amount, multiplied by actual_duration
        let dailyAllowanceCost = 0;
        if (expense.fullboard_price) {
            dailyAllowanceCost = multiplyByDays(expense.fullboard_price.price);
        } else if (expense.custom_daily_allowance) {
            dailyAllowanceCost = multiplyByDays(expense.custom_daily_allowance);
        }
        
        // Transport costs - NOT multiplied by actual_duration
        const originTransportCost = expense.origin_transport_cost || 0;
        const localTransportCost = expense.local_transport_cost || 0;
        const destinationTransportCost = expense.destination_transport_cost || 0;
        
        // Lodging cost - total penginapan sudah total, tidak dikali hari/malam
        const lodgingCost = expense.lodging_cost || 0;
        
        // Round trip ticket - tiket PP biasanya tidak dikali hari
        const roundTripTicketCost = expense.round_trip_ticket_cost || 0;
        
        // Actual expense - NOT multiplied by actual_duration
        const actualExpense = expense.actual_expense || 0;

        return dailyAllowanceCost + originTransportCost + localTransportCost + lodgingCost + destinationTransportCost + roundTripTicketCost + actualExpense;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Rincian Biaya Luar Kota
                        </CardTitle>
                        <CardDescription>
                            Rincian biaya untuk perjalanan luar kota
                        </CardDescription>
                        {(days > 0) && (
                            <div className="text-xs text-muted-foreground mt-1">
                                Perhitungan menggunakan Durasi Asli Perjalanan: {days} hari (penginapan dihitung {nights} malam)
                            </div>
                        )}
                    </div>
                    {canEdit && isEditable && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(expense)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {expense.fullboard_price ? (
                            <div>
                                <span className="text-muted-foreground">Uang Harian ({expense.fullboard_price.province_name}):</span>
                                <p className="font-medium">{fmtWithDays(expense.fullboard_price.price)}</p>
                            </div>
                        ) : expense.custom_daily_allowance ? (
                            <div>
                                <span className="text-muted-foreground">Uang Harian (Custom):</span>
                                <p className="font-medium">{fmtWithDays(expense.custom_daily_allowance)}</p>
                            </div>
                        ) : null}
                        <div>
                            <span className="text-muted-foreground">Transport Asal:</span>
                            <p className="font-medium">{formatCurrency(expense.origin_transport_cost)}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Transport Lokal:</span>
                            <p className="font-medium">{formatCurrency(expense.local_transport_cost)}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Penginapan/Hotel:</span>
                            <p className="font-medium">{fmtWithNights(expense.lodging_cost)}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Transport Tujuan:</span>
                            <p className="font-medium">{formatCurrency(expense.destination_transport_cost)}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Tiket PP:</span>
                            <p className="font-medium">{formatCurrency(expense.round_trip_ticket_cost)}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Pengeluaran Riil:</span>
                            <p className="font-medium">{formatCurrency(expense.actual_expense)}</p>
                        </div>
                    </div>

                    {/* File Bukti */}
                    {(expense.origin_transport_receipt || expense.local_transport_receipt || 
                      expense.lodging_receipt || expense.destination_transport_receipt || 
                      expense.round_trip_ticket_receipt) && (
                        <div className="pt-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {expense.origin_transport_receipt && (
                                    <FileProofDisplay
                                        file={expense.origin_transport_receipt}
                                        label="Bukti Transport Asal"
                                        iconColor="text-blue-600"
                                    />
                                )}

                                {expense.local_transport_receipt && (
                                    <FileProofDisplay
                                        file={expense.local_transport_receipt}
                                        label="Bukti Transport Lokal"
                                        iconColor="text-green-600"
                                    />
                                )}

                                {expense.lodging_receipt && (
                                    <FileProofDisplay
                                        file={expense.lodging_receipt}
                                        label="Bukti Penginapan/Hotel"
                                        iconColor="text-purple-600"
                                    />
                                )}

                                {expense.destination_transport_receipt && (
                                    <FileProofDisplay
                                        file={expense.destination_transport_receipt}
                                        label="Bukti Transport Tujuan"
                                        iconColor="text-orange-600"
                                    />
                                )}

                                {expense.round_trip_ticket_receipt && (
                                    <FileProofDisplay
                                        file={expense.round_trip_ticket_receipt}
                                        label="Bukti Tiket Pesawat/Transport PP"
                                        iconColor="text-destructive"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Total Pengeluaran:</span>
                            <span className="font-bold text-lg">{formatCurrency(calculateTotal(expense))}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
