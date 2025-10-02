<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\InCityRequest;
use App\Models\InCityReport;
use App\Models\Report;
use App\Services\FileStorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class InCityReportController extends Controller
{
    /**
     * Store a newly created in city report in storage.
     */
    public function store(InCityRequest $request, Report $report): RedirectResponse
    {
        try {
            $validated = $request->validated();

            // Cek apakah report milik user yang sedang login
            if ($report->user_id !== auth()->id()) {
                throw ValidationException::withMessages([
                    'error' => 'Anda tidak memiliki akses ke laporan ini.',
                ]);
            }

            // Handle file uploads
            $transportationReceipt = null;
            $vehicleRentalReceipt = null;

            $userId = (int) auth()->id();

            if ($request->hasFile('transportation_receipt')) {
                $transportationReceipt = FileStorageService::storePublicOriginal(
                    $request->file('transportation_receipt'),
                    'files/in-city-reports',
                    $userId
                );
            }

            if ($request->hasFile('vehicle_rental_receipt')) {
                $vehicleRentalReceipt = FileStorageService::storePublicOriginal(
                    $request->file('vehicle_rental_receipt'),
                    'files/in-city-reports',
                    $userId
                );
            }

            // Convert empty strings to null for numeric fields
            $numericFields = ['daily_allowance', 'transportation_cost', 'vehicle_rental_fee', 'actual_expense'];
            foreach ($numericFields as $field) {
                if (isset($validated[$field]) && $validated[$field] === '') {
                    $validated[$field] = null;
                }
            }

            InCityReport::create([
                'report_id' => $report->id,
                'daily_allowance' => $validated['daily_allowance'],
                'transportation_cost' => $validated['transportation_cost'],
                'vehicle_rental_fee' => $validated['vehicle_rental_fee'],
                'actual_expense' => $validated['actual_expense'],
                'transportation_receipt' => $transportationReceipt,
                'vehicle_rental_receipt' => $vehicleRentalReceipt,
            ]);

            return redirect()->back()
                ->with('success', 'Pengeluaran dalam kota berhasil disimpan.');

        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menyimpan pengeluaran dalam kota. Silakan coba lagi.'])
                ->withInput();
        }
    }

    /**
     * Update the specified in city report in storage.
     */
    public function update(InCityRequest $request, Report $report, InCityReport $inCityReport): RedirectResponse
    {
        try {
            $validated = $request->validated();

            // Cek apakah report milik user yang sedang login
            if ($report->user_id !== auth()->id()) {
                throw ValidationException::withMessages([
                    'error' => 'Anda tidak memiliki akses untuk mengedit pengeluaran ini.',
                ]);
            }

            // Cek apakah in_city_report milik report yang benar
            if ($inCityReport->report_id !== $report->id) {
                throw ValidationException::withMessages([
                    'error' => 'Pengeluaran tidak ditemukan.',
                ]);
            }

            // Handle file uploads
            $userId = (int) auth()->id();

            if ($request->hasFile('transportation_receipt')) {
                FileStorageService::deletePublicIfExists($inCityReport->transportation_receipt);
                $validated['transportation_receipt'] = FileStorageService::storePublicOriginal(
                    $request->file('transportation_receipt'),
                    'files/in-city-reports',
                    $userId
                );
            }

            if ($request->hasFile('vehicle_rental_receipt')) {
                FileStorageService::deletePublicIfExists($inCityReport->vehicle_rental_receipt);
                $validated['vehicle_rental_receipt'] = FileStorageService::storePublicOriginal(
                    $request->file('vehicle_rental_receipt'),
                    'files/in-city-reports',
                    $userId
                );
            }

            // Convert empty strings to null for numeric fields
            $numericFields = ['daily_allowance', 'transportation_cost', 'vehicle_rental_fee', 'actual_expense'];
            foreach ($numericFields as $field) {
                if (isset($validated[$field]) && $validated[$field] === '') {
                    $validated[$field] = null;
                }
            }

            $inCityReport->update($validated);

            return redirect()->back()
                ->with('success', 'Pengeluaran dalam kota berhasil diperbarui.');

        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat memperbarui pengeluaran dalam kota. Silakan coba lagi.'])
                ->withInput();
        }
    }


}
