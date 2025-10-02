import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyIDR } from '@/lib/utils';
import type { InCityExpense } from '@/types/reports/report';
import { DollarSign, Edit } from 'lucide-react';
import { FileProofDisplay } from './file-proof-display';

interface InCityExpenseDetailsProps {
    expense: InCityExpense;
    onEdit: (expense: InCityExpense) => void;
    canEdit?: boolean;
    isEditable?: boolean;
    actualDuration: number;
}

export function InCityExpenseDetails({ expense, onEdit, canEdit = true, isEditable = true, actualDuration }: InCityExpenseDetailsProps) {
    const formatCurrency = (amount: number | null) => {
        if (amount === null || isNaN(amount)) return formatCurrencyIDR(0);
        return formatCurrencyIDR(amount);
    };

    const days = Number.isFinite(actualDuration) && actualDuration > 0 ? actualDuration : 0;

    const multiply = (amount: number | null) => {
        const base = amount || 0;
        return days > 0 ? base * days : base;
    };

    const formatWithDays = (amount: number | null) => {
        const base = amount || 0;
        if (days > 0) {
            return `${formatCurrency(base)} x ${days} hari = ${formatCurrency(base * days)}`;
        }
        return formatCurrency(base);
    };

    // For vehicle rental fee: show per-day calculation if days > 0
    const formatVehicleRentalFee = (total: number | null) => {
        const totalFee = total || 0;
        if (days > 0 && totalFee > 0) {
            const perDay = totalFee / days;
            return `${formatCurrency(perDay)} x ${days} hari = ${formatCurrency(totalFee)}`;
        }
        return formatCurrency(totalFee);
    };

    const calculateTotal = (expense: InCityExpense) => {
        const dailyAllowance = multiply(expense.daily_allowance);
        // Transport and actual expenses are NOT multiplied by days
        const transportationCost = expense.transportation_cost || 0;
        const vehicleRentalFee = expense.vehicle_rental_fee || 0;
        const actualExpense = expense.actual_expense || 0;

        return dailyAllowance + transportationCost + vehicleRentalFee + actualExpense;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Rincian Biaya Dalam Kota
                        </CardTitle>
                        <CardDescription>Rincian biaya untuk perjalanan dalam kota</CardDescription>
                        {days > 0 && (
                            <div className="mt-1 text-xs text-muted-foreground">Perhitungan menggunakan Durasi Asli Perjalanan: {days} hari</div>
                        )}
                    </div>
                    {canEdit && isEditable && (
                        <Button size="sm" variant="outline" onClick={() => onEdit(expense)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div>
                            <span className="text-muted-foreground">Uang Harian{days > 0 ? ' (per hari)' : ''}:</span>
                            <p className="font-medium">{formatWithDays(expense.daily_allowance)}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Biaya Transport:</span>
                            <p className="font-medium">{formatCurrency(expense.transportation_cost)}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Sewa Kendaraan{days > 0 ? ' (per hari)' : ''}:</span>
                            <p className="font-medium">{formatVehicleRentalFee(expense.vehicle_rental_fee)}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Pengeluaran Riil:</span>
                            <p className="font-medium">{formatCurrency(expense.actual_expense)}</p>
                        </div>
                    </div>

                    {/* File Bukti */}
                    {(expense.transportation_receipt || expense.vehicle_rental_receipt) && (
                        <div className="pt-3">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {expense.transportation_receipt && (
                                    <FileProofDisplay file={expense.transportation_receipt} label="Bukti Transport" iconColor="text-blue-600" />
                                )}

                                {expense.vehicle_rental_receipt && (
                                    <FileProofDisplay file={expense.vehicle_rental_receipt} label="Bukti Sewa Kendaraan" iconColor="text-green-600" />
                                )}
                            </div>
                        </div>
                    )}

                    <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Total Pengeluaran:</span>
                            <span className="text-lg font-bold">{formatCurrency(calculateTotal(expense))}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
