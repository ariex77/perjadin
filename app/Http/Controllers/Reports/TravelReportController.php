<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\TravelReportRequest;
use App\Models\TravelReport;
use App\Models\Report;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class TravelReportController extends Controller
{
    /**
     * Store a newly created travel report in storage.
     */
    public function store(TravelReportRequest $request, Report $report): RedirectResponse
    {
        try {
            $validated = $request->validated();

            // Cek apakah report milik user yang sedang login
            if ($report->user_id !== auth()->id()) {
                throw ValidationException::withMessages([
                    'error' => 'Anda tidak memiliki akses ke laporan ini.',
                ]);
            }

            // Cek apakah sudah ada travel report untuk report ini
            if ($report->travelReport) {
                throw ValidationException::withMessages([
                    'error' => 'Laporan perjalanan dinas sudah ada untuk laporan ini.',
                ]);
            }

            TravelReport::create([
                'title' => $report->title,
                'report_id' => $report->id,
                'title' => $validated['title'],
                'background' => $validated['background'],
                'purpose_and_objectives' => $validated['purpose_and_objectives'],
                'scope' => $validated['scope'],
                'legal_basis' => $validated['legal_basis'],
                'activities_conducted' => $validated['activities_conducted'],
                'achievements' => $validated['achievements'],
                'conclusions' => $validated['conclusions'],
            ]);

            return redirect()->back()
                ->with('success', 'Laporan perjalanan dinas berhasil disimpan.');

        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menyimpan laporan perjalanan dinas. Silakan coba lagi.'])
                ->withInput();
        }
    }

    /**
     * Update the specified travel report in storage.
     */
    public function update(TravelReportRequest $request, Report $report, TravelReport $travelReport): RedirectResponse
    {
        try {
            $validated = $request->validated();

            // Cek apakah report milik user yang sedang login
            if ($report->user_id !== auth()->id()) {
                throw ValidationException::withMessages([
                    'error' => 'Anda tidak memiliki akses untuk mengedit laporan ini.',
                ]);
            }

            // Cek apakah travel report milik report yang benar
            if ($travelReport->report_id !== $report->id) {
                throw ValidationException::withMessages([
                    'error' => 'Laporan perjalanan dinas tidak ditemukan.',
                ]);
            }

            $travelReport->update([
                'title' => $validated['title'],
                'background' => $validated['background'],
                'purpose_and_objectives' => $validated['purpose_and_objectives'],
                'scope' => $validated['scope'],
                'legal_basis' => $validated['legal_basis'],
                'activities_conducted' => $validated['activities_conducted'],
                'achievements' => $validated['achievements'],
                'conclusions' => $validated['conclusions'],
            ]);

            return redirect()->back()
                ->with('success', 'Laporan perjalanan dinas berhasil diperbarui.');

        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat memperbarui laporan perjalanan dinas. Silakan coba lagi.'])
                ->withInput();
        }
    }
}
