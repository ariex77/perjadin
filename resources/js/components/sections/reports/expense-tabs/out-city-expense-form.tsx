import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import { Combobox } from '@/components/ui/combobox';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/ui/input-error';
import { FileProofEditDisplay } from './file-proof-edit-display';
import type { OutCityExpense, FullboardPrice } from '@/types/reports/report';
import { formatCurrencyIDR } from '@/lib/utils';
import type { FormErrors } from '@/types';
import { useState, useRef } from 'react';
import type { CheckedState } from "@radix-ui/react-checkbox";

type OutCityExpenseFormData = {
    report_id: number;
    fullboard_price_id: string;
    custom_daily_allowance: string;
    origin_transport_cost: string;
    origin_transport_receipt: File | string | null;
    local_transport_cost: string;
    local_transport_receipt: File | string | null;
    lodging_cost: string;
    lodging_receipt: File | string | null;
    destination_transport_cost: string;
    destination_transport_receipt: File | string | null;
    round_trip_ticket_cost: string;
    round_trip_ticket_receipt: File | string | null;
    actual_expense: string;
};

interface OutCityExpenseFormProps {
    data: OutCityExpenseFormData;
    setData: (key: keyof OutCityExpenseFormData, value: any) => void;
    errors: FormErrors;
    isEditing: boolean;
    editingExpense: OutCityExpense | null;
    fullboardPrices: FullboardPrice[];
}

export function OutCityExpenseForm({
    data,
    setData,
    errors,
    isEditing,
    editingExpense,
    fullboardPrices
}: OutCityExpenseFormProps) {
    // Determine if using custom amount based on original data
    // In edit mode: check if original data has custom_daily_allowance AND no fullboard_price_id
    // This ensures proper initialization based on what was actually saved
    const [useCustomAmount, setUseCustomAmount] = useState<boolean>(
        isEditing && editingExpense
            ? (editingExpense.custom_daily_allowance !== null && editingExpense.custom_daily_allowance !== undefined && editingExpense.fullboard_price_id === null)
            : false
    );

    // Store original values to restore when switching back
    // Only store the value that was actually used in the original data
    const originalFullboardPriceId = useRef<string>(
        isEditing && editingExpense?.fullboard_price_id
            ? editingExpense.fullboard_price_id.toString()
            : ''
    );
    const originalCustomDailyAllowance = useRef<string>(
        isEditing && editingExpense?.custom_daily_allowance
            ? editingExpense.custom_daily_allowance.toString()
            : ''
    );

    const getError = (key: keyof OutCityExpenseFormData | string): string | undefined => {
        const value = (errors as Record<string, string | string[] | undefined>)[key as string];
        if (Array.isArray(value)) return value.join(', ');
        return value ?? undefined;
    };

    const handleCustomAmountToggle = (checked: boolean) => {
        setUseCustomAmount(checked);
        if (checked) {
            // Save current fullboard price before switching to custom
            if (data.fullboard_price_id) {
                originalFullboardPriceId.current = data.fullboard_price_id;
            }
            // Clear fullboard price when using custom
            setData('fullboard_price_id', '');
            // Start with empty custom field - don't restore any previous value
            setData('custom_daily_allowance', '');
        } else {
            // Save current custom amount before switching to fullboard
            if (data.custom_daily_allowance) {
                originalCustomDailyAllowance.current = data.custom_daily_allowance;
            }
            // Clear custom daily allowance when using fullboard
            setData('custom_daily_allowance', '');
            // Restore fullboard price if exists
            const fullboardValue = originalFullboardPriceId.current || '';
            setData('fullboard_price_id', fullboardValue);
        }
    };
    return (
        <div className="space-y-6">
            {/* Daily Allowance Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Label (span 2 kolom) */}
                <Label
                    htmlFor={`${useCustomAmount ? 'custom_daily_allowance' : 'fullboard_price_id'}`}
                    className="text-sm -mb-4 font-medium md:col-span-2"
                >
                    {!useCustomAmount ? "Pilih Harga Uang Harian" : "Uang Harian Custom"}
                </Label>

                {/* Input kiri */}
                <div className="space-y-2">
                    {!useCustomAmount ? (
                        <Combobox
                            value={data.fullboard_price_id}
                            onValueChange={(value) => {
                                setData('fullboard_price_id', value);
                                // Update stored original value when user manually changes fullboard price
                                originalFullboardPriceId.current = value;
                            }}
                            placeholder="Pilih uang harian"
                            options={fullboardPrices.map((price) => ({
                                value: price.id.toString(),
                                label: `${price.province_name} - ${formatCurrencyIDR(price.price)}`
                            }))}
                        />
                    ) : (
                        <Input
                            id="custom_daily_allowance"
                            type="number"
                            value={data.custom_daily_allowance}
                            onChange={(e) => {
                                setData('custom_daily_allowance', e.target.value);
                                // Update stored original value when user manually changes custom amount
                                originalCustomDailyAllowance.current = e.target.value;
                            }}
                            placeholder="Masukkan jumlah uang harian custom"
                            step="0.01"
                        />
                    )}

                    {/* Error di bawah input (kolom kiri) */}
                    {!useCustomAmount ? (
                        <InputError message={getError('fullboard_price_id')} className="mt-1" />
                    ) : (
                        <InputError message={getError('custom_daily_allowance')} className="mt-1" />
                    )}
                </div>

                {/* Checkbox kanan */}
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="use-custom-amount"
                        checked={useCustomAmount}
                        onCheckedChange={handleCustomAmountToggle}
                    />
                    <Label htmlFor="use-custom-amount" className="text-sm font-medium">
                        Uang Harian Custom
                    </Label>
                </div>
            </div>

            {/* Transport Costs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="origin_transport_cost">Total Transport Tempat Asal</Label>
                    <Input
                        id="origin_transport_cost"
                        type="number"
                        value={data.origin_transport_cost}
                        onChange={(e) => setData('origin_transport_cost', e.target.value)}
                        placeholder="0"
                        step="0.01"
                    />
                    <InputError message={getError('origin_transport_cost')} className="mt-1" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="local_transport_cost">Total Transport Lokal</Label>
                    <Input
                        id="local_transport_cost"
                        type="number"
                        value={data.local_transport_cost}
                        onChange={(e) => setData('local_transport_cost', e.target.value)}
                        placeholder="0"
                        step="0.01"
                    />
                    <InputError message={getError('local_transport_cost')} className="mt-1" />
                </div>
            </div>

            {/* Lodging Cost & Destination Transport Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="lodging_cost">Total Biaya Penginapan/Hotel</Label>
                    <Input
                        id="lodging_cost"
                        type="number"
                        value={data.lodging_cost}
                        onChange={(e) => setData('lodging_cost', e.target.value)}
                        placeholder="0"
                        step="0.01"
                    />
                    <InputError message={getError('lodging_cost')} className="mt-1" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="destination_transport_cost">Total Transport Daerah Tujuan</Label>
                    <Input
                        id="destination_transport_cost"
                        type="number"
                        value={data.destination_transport_cost}
                        onChange={(e) => setData('destination_transport_cost', e.target.value)}
                        placeholder="0"
                        step="0.01"
                    />
                    <InputError message={getError('destination_transport_cost')} className="mt-1" />
                </div>
            </div>

            {/* Round Trip Ticket Cost & Actual Expense */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="round_trip_ticket_cost">Total Tiket Pesawat/Transport PP</Label>
                    <Input
                        id="round_trip_ticket_cost"
                        type="number"
                        value={data.round_trip_ticket_cost}
                        onChange={(e) => setData('round_trip_ticket_cost', e.target.value)}
                        placeholder="0"
                        step="0.01"
                    />
                    <InputError message={getError('round_trip_ticket_cost')} className="mt-1" />
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

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="origin_transport_receipt">Bukti Transport Asal</Label>
                    <FileUpload
                        key={`origin_transport_receipt_${data.report_id}`}
                        value={data.origin_transport_receipt}
                        onChange={(file: File | string | null) => setData('origin_transport_receipt', file)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={2}
                        error={getError('origin_transport_receipt') ?? null}
                    />
                    <p className="text-xs text-muted-foreground">
                        Format: PDF, JPG, JPEG, PNG (Maks. 2MB)
                    </p>

                    {isEditing && editingExpense?.origin_transport_receipt && (
                        <FileProofEditDisplay
                            file={editingExpense.origin_transport_receipt}
                            label="Bukti Transport Asal"
                            iconColor="text-blue-600"
                        />
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="local_transport_receipt">Bukti Transport Lokal</Label>
                    <FileUpload
                        key={`local_transport_receipt_${data.report_id}`}
                        value={data.local_transport_receipt}
                        onChange={(file: File | string | null) => setData('local_transport_receipt', file)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={2}
                        error={getError('local_transport_receipt') ?? null}
                    />
                    <p className="text-xs text-muted-foreground">
                        Format: PDF, JPG, JPEG, PNG (Maks. 2MB)
                    </p>

                    {isEditing && editingExpense?.local_transport_receipt && (
                        <FileProofEditDisplay
                            file={editingExpense.local_transport_receipt}
                            label="Bukti Transport Lokal"
                            iconColor="text-green-600"
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="lodging_receipt">Bukti Penginapan/Hotel</Label>
                    <FileUpload
                        key={`lodging_receipt_${data.report_id}`}
                        value={data.lodging_receipt}
                        onChange={(file: File | string | null) => setData('lodging_receipt', file)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={2}
                        error={getError('lodging_receipt') ?? null}
                    />
                    <p className="text-xs text-muted-foreground">
                        Format: PDF, JPG, JPEG, PNG (Maks. 2MB)
                    </p>

                    {isEditing && editingExpense?.lodging_receipt && (
                        <FileProofEditDisplay
                            file={editingExpense.lodging_receipt}
                            label="Bukti Penginapan/Hotel"
                            iconColor="text-purple-600"
                        />
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="destination_transport_receipt">Bukti Transport Tujuan</Label>
                    <FileUpload
                        key={`destination_transport_receipt_${data.report_id}`}
                        value={data.destination_transport_receipt}
                        onChange={(file: File | string | null) => setData('destination_transport_receipt', file)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={2}
                        error={getError('destination_transport_receipt') ?? null}
                    />
                    <p className="text-xs text-muted-foreground">
                        Format: PDF, JPG, JPEG, PNG (Maks. 2MB)
                    </p>

                    {isEditing && editingExpense?.destination_transport_receipt && (
                        <FileProofEditDisplay
                            file={editingExpense.destination_transport_receipt}
                            label="Bukti Transport Tujuan"
                            iconColor="text-orange-600"
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="round_trip_ticket_receipt">Bukti Tiket Pesawat/Transport PP</Label>
                    <FileUpload
                        key={`round_trip_ticket_receipt_${data.report_id}`}
                        value={data.round_trip_ticket_receipt}
                        onChange={(file: File | string | null) => setData('round_trip_ticket_receipt', file)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={2}
                        error={getError('round_trip_ticket_receipt') ?? null}
                    />
                    <p className="text-xs text-muted-foreground">
                        Format: PDF, JPG, JPEG, PNG (Maks. 2MB)
                    </p>

                    {isEditing && editingExpense?.round_trip_ticket_receipt && (
                        <FileProofEditDisplay
                            file={editingExpense.round_trip_ticket_receipt}
                            label="Bukti Tiket Pesawat/Transport PP"
                            iconColor="text-destructive"
                        />
                    )}
                </div>

                <div className="space-y-2">
                    {/* Empty space untuk balance layout */}
                </div>
            </div>
        </div>
    );
}
