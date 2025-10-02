import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import type { FormErrors } from '@/types';

import type { Report, InCityExpense, OutCityExpense, FullboardPrice } from '@/types/reports/report';
import { InCityExpenseForm } from './expense-tabs/in-city-expense-form';
import { OutCityExpenseForm } from './expense-tabs/out-city-expense-form';
import { OutCountryExpenseForm } from './expense-tabs/out-country-expense-form';
import { InCityExpenseDetails } from './expense-tabs/in-city-expense-details';
import { OutCityExpenseDetails } from './expense-tabs/out-city-expense-details';

interface ExpenseTabsProps {
    report: Report;
    fullboardPrices?: FullboardPrice[];
    auth: {
        user: {
            id: number;
            name: string;
            roles: Array<{
                name: string;
            }>;
        };
    };
    isEditable?: boolean;
}

type InCityExpenseFormData = {
    report_id: number;
    daily_allowance: string;
    transportation_cost: string;
    vehicle_rental_fee: string;
    actual_expense: string;
    transportation_receipt: File | string | null;
    vehicle_rental_receipt: File | string | null;
};

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

export default function ExpenseTabs({ report, fullboardPrices = [], auth, isEditable = true }: ExpenseTabsProps) {
    const [inCityExpenses, setInCityExpenses] = useState<InCityExpense[]>([]);
    const [outCityExpenses, setOutCityExpenses] = useState<OutCityExpense[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingInCityExpense, setEditingInCityExpense] = useState<InCityExpense | null>(null);
    const [editingOutCityExpense, setEditingOutCityExpense] = useState<OutCityExpense | null>(null);
    const [showForm, setShowForm] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: inCityData, setData: setInCityData, processing: inCityProcessing, errors: inCityErrors, reset: resetInCity, setError: setInCityError, clearErrors: clearInCityErrors } = useForm<InCityExpenseFormData>({
        report_id: report.id,
        daily_allowance: '',
        transportation_cost: '',
        vehicle_rental_fee: '',
        actual_expense: '',
        transportation_receipt: null,
        vehicle_rental_receipt: null,
    });

    const { data: outCityData, setData: setOutCityData, processing: outCityProcessing, errors: outCityErrors, reset: resetOutCity, setError: setOutCityError, clearErrors: clearOutCityErrors } = useForm<OutCityExpenseFormData>({
        report_id: report.id,
        fullboard_price_id: '',
        custom_daily_allowance: '',
        origin_transport_cost: '',
        origin_transport_receipt: null,
        local_transport_cost: '',
        local_transport_receipt: null,
        lodging_cost: '',
        lodging_receipt: null,
        destination_transport_cost: '',
        destination_transport_receipt: null,
        round_trip_ticket_cost: '',
        round_trip_ticket_receipt: null,
        actual_expense: '',
    });

    // Valid field lists for safe error mapping
    const inCityFieldKeys: Array<keyof InCityExpenseFormData> = [
        'report_id',
        'daily_allowance',
        'transportation_cost',
        'vehicle_rental_fee',
        'actual_expense',
        'transportation_receipt',
        'vehicle_rental_receipt',
    ];
    const outCityFieldKeys: Array<keyof OutCityExpenseFormData> = [
        'report_id',
        'fullboard_price_id',
        'custom_daily_allowance',
        'origin_transport_cost',
        'origin_transport_receipt',
        'local_transport_cost',
        'local_transport_receipt',
        'lodging_cost',
        'lodging_receipt',
        'destination_transport_cost',
        'destination_transport_receipt',
        'round_trip_ticket_cost',
        'round_trip_ticket_receipt',
        'actual_expense',
    ];

    // Load existing expense berdasarkan travel_type
    useEffect(() => {
        if (report.travel_type === 'in_city' && report.in_city_expense) {
            setInCityExpenses([report.in_city_expense]);
            setShowForm(false);
        } else if (report.travel_type === 'out_city' && report.out_city_expense) {
            setOutCityExpenses([report.out_city_expense]);
            setShowForm(false);
        }
        // TODO: Handle out_country expenses
    }, [report]);

    // Reset form data ketika report berubah (setelah update)
    useEffect(() => {
        if (report.travel_type === 'in_city' && report.in_city_expense) {
            setInCityData({
                report_id: report.id,
                daily_allowance: report.in_city_expense.daily_allowance?.toString() || '',
                transportation_cost: report.in_city_expense.transportation_cost?.toString() || '',
                vehicle_rental_fee: report.in_city_expense.vehicle_rental_fee?.toString() || '',
                actual_expense: report.in_city_expense.actual_expense?.toString() || '',
                transportation_receipt: null,
                vehicle_rental_receipt: null,
            });
        } else if (report.travel_type === 'out_city' && report.out_city_expense) {
            // Determine which mode was originally used based on the data
            const wasUsingCustom = report.out_city_expense.custom_daily_allowance !== null && 
                                 report.out_city_expense.custom_daily_allowance !== undefined && 
                                 report.out_city_expense.fullboard_price_id === null;
            
            setOutCityData({
                report_id: report.id,
                // Only set fullboard_price_id if it was originally used (not custom)
                fullboard_price_id: wasUsingCustom ? '' : (report.out_city_expense.fullboard_price_id?.toString() || ''),
                // Only set custom_daily_allowance if it was originally used (custom mode)
                custom_daily_allowance: wasUsingCustom ? (report.out_city_expense.custom_daily_allowance?.toString() || '') : '',
                origin_transport_cost: report.out_city_expense.origin_transport_cost?.toString() || '',
                origin_transport_receipt: null,
                local_transport_cost: report.out_city_expense.local_transport_cost?.toString() || '',
                local_transport_receipt: null,
                lodging_cost: report.out_city_expense.lodging_cost?.toString() || '',
                lodging_receipt: null,
                destination_transport_cost: report.out_city_expense.destination_transport_cost?.toString() || '',
                destination_transport_receipt: null,
                round_trip_ticket_cost: report.out_city_expense.round_trip_ticket_cost?.toString() || '',
                round_trip_ticket_receipt: null,
                actual_expense: report.out_city_expense.actual_expense?.toString() || '',
            });
        }
    }, [report]);

    const handleOutCitySubmit = () => {
        setIsSubmitting(true);
        
        if (isEditing && editingOutCityExpense) {
            // Update existing expense
            const formData = new FormData();
            formData.append('_method', 'put');
            formData.append('report_id', report.id.toString());
            formData.append('fullboard_price_id', outCityData.fullboard_price_id.toString());
            formData.append('custom_daily_allowance', outCityData.custom_daily_allowance.toString());
            formData.append('origin_transport_cost', outCityData.origin_transport_cost || '');
            formData.append('local_transport_cost', outCityData.local_transport_cost || '');
            formData.append('lodging_cost', outCityData.lodging_cost || '');
            formData.append('destination_transport_cost', outCityData.destination_transport_cost || '');
            formData.append('round_trip_ticket_cost', outCityData.round_trip_ticket_cost || '');
            formData.append('actual_expense', outCityData.actual_expense || '');
            
            // Handle file uploads
            const fileFields = [
                'origin_transport_receipt',
                'local_transport_receipt',
                'lodging_receipt',
                'destination_transport_receipt',
                'round_trip_ticket_receipt'
            ];

            fileFields.forEach(field => {
                const file = outCityData[field as keyof OutCityExpenseFormData];
                if (file && typeof file !== 'string') {
                    formData.append(field, file as File);
                }
            });

            router.post(route('reports.out-city-reports.update', [report.id, editingOutCityExpense.id]), formData, {
                onStart: () => setIsSubmitting(true),
                onSuccess: () => {
                    toast.success('Pengeluaran Luar Kota berhasil diperbarui.');
                    resetOutCity();
                    setIsEditing(false);
                    setEditingOutCityExpense(null);
                    setShowForm(false);
                    setIsSubmitting(false);
                },
                onError: (errors: FormErrors) => {
                    // Map server validation errors into useForm error bag so InputError renders
                    clearOutCityErrors();
                    if (errors && typeof errors === 'object') {
                        outCityFieldKeys.forEach((field) => {
                            const message = (errors as Record<string, unknown>)[field as string];
                            if (typeof message === 'string') setOutCityError(field, message);
                        });
                    }
                    toast.error((errors && (errors as FormErrors).error) || 'Pengeluaran gagal disimpan!');
                    setIsSubmitting(false);
                },
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            // Create new expense
            const formData = new FormData();
            formData.append('report_id', report.id.toString());
            formData.append('fullboard_price_id', outCityData.fullboard_price_id.toString());
            formData.append('custom_daily_allowance', outCityData.custom_daily_allowance.toString());
            formData.append('origin_transport_cost', outCityData.origin_transport_cost || '');
            formData.append('local_transport_cost', outCityData.local_transport_cost || '');
            formData.append('lodging_cost', outCityData.lodging_cost || '');
            formData.append('destination_transport_cost', outCityData.destination_transport_cost || '');
            formData.append('round_trip_ticket_cost', outCityData.round_trip_ticket_cost || '');
            formData.append('actual_expense', outCityData.actual_expense || '');
            
            // Handle file uploads
            const fileFields = [
                'origin_transport_receipt',
                'local_transport_receipt',
                'lodging_receipt',
                'destination_transport_receipt',
                'round_trip_ticket_receipt'
            ];

            fileFields.forEach(field => {
                const file = outCityData[field as keyof OutCityExpenseFormData];
                if (file && typeof file !== 'string') {
                    formData.append(field, file as File);
                }
            });

            router.post(route('reports.out-city-reports.store', [report.id]), formData, {
                onStart: () => setIsSubmitting(true),
                onSuccess: () => {
                    toast.success('Pengeluaran Luar Kota berhasil disimpan.');
                    resetOutCity();
                    setIsEditing(false);
                    setEditingOutCityExpense(null);
                    setShowForm(false);
                    setIsSubmitting(false);
                },
                onError: (errors: FormErrors) => {
                    clearOutCityErrors();
                    if (errors && typeof errors === 'object') {
                        outCityFieldKeys.forEach((field) => {
                            const message = (errors as Record<string, unknown>)[field as string];
                            if (typeof message === 'string') setOutCityError(field, message);
                        });
                    }
                    toast.error((errors && (errors as FormErrors).error) || 'Pengeluaran luar kota gagal disimpan!');
                    setIsSubmitting(false);
                },
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Handle berdasarkan travel_type
        if (report.travel_type === 'in_city') {
            handleInCitySubmit();
        } else if (report.travel_type === 'out_city') {
            handleOutCitySubmit();
        }
        // TODO: Handle out_country
    };

    const handleInCitySubmit = () => {
        setIsSubmitting(true);
        
        if (isEditing && editingInCityExpense) {
            // Update existing expense
            const formData = new FormData();
            formData.append('_method', 'put');
            formData.append('report_id', report.id.toString());
            formData.append('daily_allowance', inCityData.daily_allowance || '');
            formData.append('transportation_cost', inCityData.transportation_cost || '');
            formData.append('vehicle_rental_fee', inCityData.vehicle_rental_fee || '');
            formData.append('actual_expense', inCityData.actual_expense || '');
            
            if (inCityData.transportation_receipt && typeof inCityData.transportation_receipt !== 'string') {
                formData.append('transportation_receipt', inCityData.transportation_receipt);
            }
            if (inCityData.vehicle_rental_receipt && typeof inCityData.vehicle_rental_receipt !== 'string') {
                formData.append('vehicle_rental_receipt', inCityData.vehicle_rental_receipt);
            }

            router.post(route('reports.in-city-reports.update', [report.id, editingInCityExpense.id]), formData, {
                onStart: () => setIsSubmitting(true),
                onSuccess: () => {
                    toast.success('Pengeluaran Dalam Kota berhasil diperbarui.');
                    resetInCity();
                    setIsEditing(false);
                    setEditingInCityExpense(null);
                    setShowForm(false);
                    setIsSubmitting(false);
                },
                onError: (errors: FormErrors) => {
                    // Map server validation errors into useForm error bag
                    clearInCityErrors();
                    if (errors && typeof errors === 'object') {
                        inCityFieldKeys.forEach((field) => {
                            const message = (errors as Record<string, unknown>)[field as string];
                            if (typeof message === 'string') setInCityError(field, message);
                        });
                    }
                    toast.error((errors && (errors as FormErrors).error) || 'Pengeluaran gagal disimpan!');
                    setIsSubmitting(false);
                },
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            // Create new expense
            const formData = new FormData();
            formData.append('report_id', report.id.toString());
            formData.append('daily_allowance', inCityData.daily_allowance || '');
            formData.append('transportation_cost', inCityData.transportation_cost || '');
            formData.append('vehicle_rental_fee', inCityData.vehicle_rental_fee || '');
            formData.append('actual_expense', inCityData.actual_expense || '');
            
            if (inCityData.transportation_receipt && typeof inCityData.transportation_receipt !== 'string') {
                formData.append('transportation_receipt', inCityData.transportation_receipt);
            }
            if (inCityData.vehicle_rental_receipt && typeof inCityData.vehicle_rental_receipt !== 'string') {
                formData.append('vehicle_rental_receipt', inCityData.vehicle_rental_receipt);
            }

            router.post(route('reports.in-city-reports.store', [report.id]), formData, {
                onStart: () => setIsSubmitting(true),
                onSuccess: () => {
                    toast.success('Pengeluaran Dalam Kota berhasil disimpan.');
                    resetInCity();
                    setIsEditing(false);
                    setEditingInCityExpense(null);
                    setShowForm(false);
                    setIsSubmitting(false);
                },
                onError: (errors: FormErrors) => {
                    clearInCityErrors();
                    if (errors && typeof errors === 'object') {
                        inCityFieldKeys.forEach((field) => {
                            const message = (errors as Record<string, unknown>)[field as string];
                            if (typeof message === 'string') setInCityError(field, message);
                        });
                    }
                    toast.error((errors && (errors as FormErrors).error) || 'Pengeluaran dalam kota gagal disimpan!');
                    setIsSubmitting(false);
                },
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    const handleInCityEdit = (expense: InCityExpense) => {
        setIsEditing(true);
        setEditingInCityExpense(expense);
        setInCityData({
            report_id: report.id,
            daily_allowance: expense.daily_allowance?.toString() || '',
            transportation_cost: expense.transportation_cost?.toString() || '',
            vehicle_rental_fee: expense.vehicle_rental_fee?.toString() || '',
            actual_expense: expense.actual_expense?.toString() || '',
            transportation_receipt: expense.transportation_receipt,
            vehicle_rental_receipt: expense.vehicle_rental_receipt,
        });
    };

    const handleOutCityEdit = (expense: OutCityExpense) => {
        setIsEditing(true);
        setEditingOutCityExpense(expense);
        
        // Determine which mode was originally used based on the data
        const wasUsingCustom = expense.custom_daily_allowance !== null && expense.custom_daily_allowance !== undefined && expense.fullboard_price_id === null;
        
        setOutCityData({
            report_id: report.id,
            // Only set fullboard_price_id if it was originally used (not custom)
            fullboard_price_id: wasUsingCustom ? '' : (expense.fullboard_price_id?.toString() || ''),
            // Only set custom_daily_allowance if it was originally used (custom mode)
            custom_daily_allowance: wasUsingCustom ? (expense.custom_daily_allowance?.toString() || '') : '',
            origin_transport_cost: expense.origin_transport_cost?.toString() || '',
            origin_transport_receipt: expense.origin_transport_receipt,
            local_transport_cost: expense.local_transport_cost?.toString() || '',
            local_transport_receipt: expense.local_transport_receipt,
            lodging_cost: expense.lodging_cost?.toString() || '',
            lodging_receipt: expense.lodging_receipt,
            destination_transport_cost: expense.destination_transport_cost?.toString() || '',
            destination_transport_receipt: expense.destination_transport_receipt,
            round_trip_ticket_cost: expense.round_trip_ticket_cost?.toString() || '',
            round_trip_ticket_receipt: expense.round_trip_ticket_receipt,
            actual_expense: expense.actual_expense?.toString() || '',
        });
    };

    const handleReset = () => {
        if (report.travel_type === 'in_city') {
            resetInCity();
            setEditingInCityExpense(null);
            clearInCityErrors();
        } else if (report.travel_type === 'out_city') {
            resetOutCity();
            setEditingOutCityExpense(null);
            clearOutCityErrors();
        }
        setIsEditing(false);
        if (isEditing) {
            setShowForm(false);
        }
    };

    // Fungsi untuk mengecek apakah user bisa edit expense
    const canEdit = () => {
        const userRoles = auth.user.roles.map(role => role.name);
        const currentUserId = auth.user.id;
        const reportUserId = report.user?.id;

        // Superadmin, admin, verificator, dan leader tidak boleh edit
        if (userRoles.includes('superadmin') || 
            userRoles.includes('admin') || 
            userRoles.includes('verificator') || 
            userRoles.includes('leader')) {
            return false;
        }

        // Hanya pemilik report yang bisa edit
        return currentUserId === reportUserId;
    };

    // Render berdasarkan travel_type
    const renderExpenseForm = () => {
        switch (report.travel_type) {
            case 'in_city':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                {isEditing ? 'Edit Pengeluaran Dalam Kota' : 'Tambah Pengeluaran Dalam Kota'}
                            </CardTitle>
                            <CardDescription>
                                Form pengeluaran untuk perjalanan dalam kota
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <InCityExpenseForm
                                    data={inCityData}
                                    setData={setInCityData}
                                    errors={inCityErrors}
                                    isEditing={isEditing}
                                    editingExpense={editingInCityExpense}
                                />

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        disabled={isSubmitting}
                                    >
                                        {isEditing ? 'Batal' : 'Reset'}
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Memproses...' : (isEditing ? 'Perbarui' : 'Simpan')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                );
            case 'out_city':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Pengeluaran Luar Kota
                            </CardTitle>
                            <CardDescription>
                                Form pengeluaran untuk perjalanan luar kota
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <OutCityExpenseForm
                                    data={outCityData}
                                    setData={setOutCityData}
                                    errors={outCityErrors}
                                    isEditing={isEditing}
                                    editingExpense={editingOutCityExpense}
                                    fullboardPrices={fullboardPrices}
                                />

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        disabled={isSubmitting}
                                    >
                                        {isEditing ? 'Batal' : 'Reset'}
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Memproses...' : (isEditing ? 'Perbarui' : 'Simpan')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                );
            case 'out_country':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Pengeluaran Luar Negeri
                            </CardTitle>
                            <CardDescription>
                                Form pengeluaran untuk perjalanan luar negeri
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OutCountryExpenseForm />
                        </CardContent>
                    </Card>
                );
            default:
                return (
                    <Card>
                        <CardContent>
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">Travel type tidak valid</p>
                            </div>
                        </CardContent>
                    </Card>
                );
        }
    };

    const renderExpenseDetails = () => {
        switch (report.travel_type) {
            case 'in_city':
                return inCityExpenses.length > 0 && !isEditing && inCityExpenses.map((expense) => (
                    <InCityExpenseDetails
                        key={expense.id}
                        expense={expense}
                        onEdit={handleInCityEdit}
                        canEdit={canEdit()}
                        isEditable={isEditable}
                        actualDuration={report.actual_duration}
                    />
                ));
            case 'out_city':
                return outCityExpenses.length > 0 && !isEditing && outCityExpenses.map((expense) => (
                    <OutCityExpenseDetails
                        key={expense.id}
                        expense={expense}
                        onEdit={handleOutCityEdit}
                        canEdit={canEdit()}
                        isEditable={isEditable}
                        actualDuration={report.actual_duration}
                    />
                ));
            case 'out_country':
                return (
                    <Card>
                        <CardContent>
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">Detail Out-Country Reports akan segera tersedia</p>
                            </div>
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Form Section - hanya tampil jika showForm true atau sedang edit, dan user bisa edit */}
            {(showForm || isEditing) && canEdit() && isEditable && renderExpenseForm()}

            {/* Existing Expense Display */}
            {renderExpenseDetails()}
        </div>
    );
}
