<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\OutCityRequest;
use App\Models\OutCityReport;
use App\Models\Report;
use App\Services\FileStorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class OutCityReportController extends Controller
{
    /**
     * Normalisasi payload dan enforce mutual-exclusive (fullboard vs custom)
     */
    private function normalizeOutCity(array $validated): array
    {
        // ubah '' -> null
        $toNullIfEmpty = [
            'fullboard_price_id',
            'origin_transport_cost','local_transport_cost','lodging_cost',
            'destination_transport_cost','round_trip_ticket_cost',
            'actual_expense','custom_daily_allowance',
        ];
        foreach ($toNullIfEmpty as $field) {
            if (array_key_exists($field, $validated) && $validated[$field] === '') {
                $validated[$field] = null;
            }
        }

        // cast id ke int bila ada
        if (array_key_exists('fullboard_price_id', $validated)) {
            $validated['fullboard_price_id'] = $validated['fullboard_price_id'] !== null
                ? (int) $validated['fullboard_price_id']
                : null;
        }

        // mutual exclusive
        $hasFullboard = !is_null($validated['fullboard_price_id'] ?? null);
        $hasCustom    = !is_null($validated['custom_daily_allowance'] ?? null);

        if ($hasFullboard && $hasCustom) {
            // seharusnya UI sudah clear salah satu; jika keduanya ada, prioritaskan fullboard
            $validated['custom_daily_allowance'] = null;
        } elseif (!$hasFullboard && !$hasCustom) {
            // keduanya kosong -> simpan null (boleh sesuai rule)
            $validated['fullboard_price_id'] = null;
            $validated['custom_daily_allowance'] = null;
        }

        return $validated;
    }

    /**
     * Store a newly created out city report in storage.
     */
    public function store(OutCityRequest $request, Report $report): RedirectResponse
    {
        try {
            $validated = $request->validated();

            // Cek kepemilikan report
            if ($report->user_id !== auth()->id()) {
                throw ValidationException::withMessages([
                    'error' => 'Anda tidak memiliki akses ke laporan ini.',
                ]);
            }

            // Handle file uploads
            $userId = (int) auth()->id();
            $fileFields = [
                'origin_transport_receipt',
                'local_transport_receipt',
                'lodging_receipt',
                'destination_transport_receipt',
                'round_trip_ticket_receipt',
            ];

            foreach ($fileFields as $field) {
                if ($request->hasFile($field)) {
                    $validated[$field] = FileStorageService::storePublicOriginal(
                        $request->file($field),
                        'files/out-city-reports',
                        $userId
                    );
                }
            }

            // Normalisasi & mutual-exclusive
            $validated = $this->normalizeOutCity($validated);

            OutCityReport::create([
                'report_id'                   => $report->id,
                'fullboard_price_id'          => $validated['fullboard_price_id'] ?? null,
                'custom_daily_allowance'      => $validated['custom_daily_allowance'] ?? null,

                'origin_transport_cost'       => $validated['origin_transport_cost'] ?? null,
                'origin_transport_receipt'    => $validated['origin_transport_receipt'] ?? null,

                'local_transport_cost'        => $validated['local_transport_cost'] ?? null,
                'local_transport_receipt'     => $validated['local_transport_receipt'] ?? null,

                'lodging_cost'                => $validated['lodging_cost'] ?? null,
                'lodging_receipt'             => $validated['lodging_receipt'] ?? null,

                'destination_transport_cost'  => $validated['destination_transport_cost'] ?? null,
                'destination_transport_receipt'=> $validated['destination_transport_receipt'] ?? null,

                'round_trip_ticket_cost'      => $validated['round_trip_ticket_cost'] ?? null,
                'round_trip_ticket_receipt'   => $validated['round_trip_ticket_receipt'] ?? null,

                'actual_expense'              => $validated['actual_expense'] ?? null,
            ]);

            return redirect()->back()
                ->with('success', 'Pengeluaran luar kota berhasil disimpan.');

        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menyimpan pengeluaran luar kota. Silakan coba lagi.'])
                ->withInput();
        }
    }

    /**
     * Update the specified out city report in storage.
     */
    public function update(OutCityRequest $request, Report $report, OutCityReport $outCityReport): RedirectResponse
    {
        try {
            $validated = $request->validated();

            // Cek kepemilikan report
            if ($report->user_id !== auth()->id()) {
                throw ValidationException::withMessages([
                    'error' => 'Anda tidak memiliki akses untuk mengedit pengeluaran ini.',
                ]);
            }

            // Cek relasi out_city_report
            if ($outCityReport->report_id !== $report->id) {
                throw ValidationException::withMessages([
                    'error' => 'Pengeluaran tidak ditemukan.',
                ]);
            }

            // Handle file uploads
            $userId = (int) auth()->id();
            $fileFields = [
                'origin_transport_receipt',
                'local_transport_receipt',
                'lodging_receipt',
                'destination_transport_receipt',
                'round_trip_ticket_receipt',
            ];

            foreach ($fileFields as $field) {
                if ($request->hasFile($field)) {
                    if ($outCityReport->$field) {
                        FileStorageService::deletePublicIfExists($outCityReport->$field);
                    }
                    $validated[$field] = FileStorageService::storePublicOriginal(
                        $request->file($field),
                        'files/out-city-reports',
                        $userId
                    );
                }
            }

            // Normalisasi & mutual-exclusive
            $validated = $this->normalizeOutCity($validated);

            $outCityReport->update($validated);

            return redirect()->back()
                ->with('success', 'Pengeluaran luar kota berhasil diperbarui.');

        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat memperbarui pengeluaran luar kota. Silakan coba lagi.'])
                ->withInput();
        }
    }
}
