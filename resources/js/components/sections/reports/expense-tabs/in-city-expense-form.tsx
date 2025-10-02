import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import InputError from '@/components/ui/input-error';
import { FileProofEditDisplay } from './file-proof-edit-display';
import type { InCityExpense } from '@/types/reports/report';
import type { FormErrors } from '@/types';

type InCityExpenseFormData = {
    report_id: number;
    daily_allowance: string;
    transportation_cost: string;
    vehicle_rental_fee: string;
    actual_expense: string;
    transportation_receipt: File | string | null;
    vehicle_rental_receipt: File | string | null;
};

interface InCityExpenseFormProps {
    data: InCityExpenseFormData;
    setData: (key: keyof InCityExpenseFormData, value: any) => void;
    errors: FormErrors;
    isEditing: boolean;
    editingExpense: InCityExpense | null;
}

export function InCityExpenseForm({
    data,
    setData,
    errors,
    isEditing,
    editingExpense
}: InCityExpenseFormProps) {
    const getError = (key: keyof InCityExpenseFormData | string): string | undefined => {
        const value = (errors as Record<string, string | string[] | undefined>)[key as string];
        if (Array.isArray(value)) return value.join(', ');
        return value ?? undefined;
    };
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="daily_allowance">Uang Harian</Label>
                    <Input
                        id="daily_allowance"
                        type="number"
                        value={data.daily_allowance}
                        onChange={(e) => setData('daily_allowance', e.target.value)}
                        placeholder="0"
                        step="0.01"
                    />
                    <InputError message={getError('daily_allowance')} className="mt-1" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="transportation_cost">Total Biaya Transport</Label>
                    <Input
                        id="transportation_cost"
                        type="number"
                        value={data.transportation_cost}
                        onChange={(e) => setData('transportation_cost', e.target.value)}
                        placeholder="0"
                        step="0.01"
                    />
                    <InputError message={getError('transportation_cost')} className="mt-1" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="vehicle_rental_fee">Total Sewa Kendaraan</Label>
                    <Input
                        id="vehicle_rental_fee"
                        type="number"
                        value={data.vehicle_rental_fee}
                        onChange={(e) => setData('vehicle_rental_fee', e.target.value)}
                        placeholder="0"
                        step="0.01"
                    />
                    <InputError message={getError('vehicle_rental_fee')} className="mt-1" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="actual_expense">Pengeluaran Riil (Tanpa Bukti)</Label>
                    <Input
                        id="actual_expense"
                        type="number"
                        value={data.actual_expense}
                        onChange={(e) => setData('actual_expense', e.target.value)}
                        placeholder="0"
                        step="0.01"
                    />
                    <InputError message={getError('actual_expense')} className="mt-1" />
                    <p className="text-xs text-muted-foreground">
                        Contoh: uang saku untuk isi bensin, makan, dll
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="transportation_receipt">Bukti Transport</Label>
                    <FileUpload
                        key={`transportation_receipt_${data.report_id}`}
                        value={data.transportation_receipt}
                        onChange={(file: File | string | null) => setData('transportation_receipt', file)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={2}
                        error={getError('transportation_receipt') ?? null}
                    />
                    <p className="text-xs text-muted-foreground">
                        Format: PDF, JPG, JPEG, PNG (Maks. 2MB)
                    </p>

                    {isEditing && editingExpense?.transportation_receipt && (
                        <FileProofEditDisplay
                            file={editingExpense.transportation_receipt}
                            label="Bukti Transport"
                            iconColor="text-blue-600"
                        />
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="vehicle_rental_receipt">Bukti Sewa Kendaraan</Label>
                    <FileUpload
                        key={`vehicle_rental_receipt_${data.report_id}`}
                        value={data.vehicle_rental_receipt}
                        onChange={(file: File | string | null) => setData('vehicle_rental_receipt', file)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={2}
                        error={getError('vehicle_rental_receipt') ?? null}
                    />
                    <p className="text-xs text-muted-foreground">
                        Format: PDF, JPG, JPEG, PNG (Maks. 2MB)
                    </p>

                    {isEditing && editingExpense?.vehicle_rental_receipt && (
                        <FileProofEditDisplay
                            file={editingExpense.vehicle_rental_receipt}
                            label="Bukti Sewa Kendaraan"
                            iconColor="text-green-600"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
