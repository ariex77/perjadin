<?php

namespace App\Http\Controllers\Reports;

use App\Enums\ReviewerType;
use App\Enums\ReviewStatus;
use App\Enums\ReportStatus;
use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Assignment;
use App\Http\Resources\Reports\ReportResource;
use App\Http\Resources\Reports\DetailReportResource;
use App\Models\ReportReview;
use App\Models\FullboardPrice;
use App\Models\TransportationType as TransportationTypeModel;
use App\Http\Resources\Masters\FullboardPriceResource;
use App\Http\Requests\ReportRequest;
use Illuminate\Http\Request;
use App\Services\FileStorageService;
use App\Services\ExpenseWordService;
use App\Services\TravelReportWordService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\TransportationType;
class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $user = auth()->user();
        $isAdminOrSuperadmin = $user->hasAnyRole(['admin', 'superadmin']);
        $isVerifikator = $user->hasRole('verificator');
        $isLeader = $user->hasRole('leader');
        
        // Default status berdasarkan role
        $defaultStatus = ($isVerifikator || $isLeader) ? 'submitted' : 'draft';
        $status = request()->get('status', $defaultStatus);

        $reports = Report::query()
            ->with([
                'user:id,name,photo,work_unit_id',
                'user.workUnit:id,name',
                'assignment:id,purpose,destination,start_date,end_date',
                'reviews:id,report_id,status,reviewer_type,created_at,notes',
                'transportationTypes:id,name,label',
                'inCityReport',
                'outCityReport',
                'outCountyReport',
                'travelReport'
            ])
            // Filter berdasarkan role
            ->when($isLeader, function ($query) use ($user) {
                // Leader hanya bisa lihat laporan dari anggota work unit nya
                $query->whereHas('user.workUnit', function ($workUnitQuery) use ($user) {
                    $workUnitQuery->where('head_id', $user->id);
                });
            })
            ->when(!$isAdminOrSuperadmin && !$isVerifikator && !$isLeader, function ($query) use ($user) {
                // Employee hanya bisa lihat laporan yang dia buat
                $query->where('user_id', $user->id);
            })
            // Filter untuk PPK dan Kepala Unit: hanya tampilkan laporan yang sudah lengkap
            ->when($isVerifikator || $isLeader, function ($query) {
                // Hanya tampilkan laporan yang sudah lengkap (ketiga bagian sudah diisi)
                $query->where(function ($q) {
                    // 1. Surat Tugas sudah diisi (travel_order_file dan spd_file ada)
                    $q->whereNotNull('travel_order_file')
                      ->whereNotNull('spd_file')
                      // 2. Biaya/Pengeluaran sudah diisi (ada salah satu dari in_city_report, out_city_report, atau travel_report)
                      ->where(function ($subQ) {
                          $subQ->whereHas('inCityReport')
                               ->orWhereHas('outCityReport')
                               ->orWhereHas('travelReport');
                      })
                      // 3. Laporan Perjalanan sudah diisi (ada travel_report)
                      ->whereHas('travelReport');
                });
            })
            // Filter berdasarkan search
            ->when(request()->filled('search'), function ($query) {
                $query->where(function ($q) {
                    $q->where('travel_purpose', 'like', '%' . request()->search . '%')
                      ->orWhere('destination_city', 'like', '%' . request()->search . '%')
                      ->orWhereHas('user', function ($userQuery) {
                          $userQuery->where('name', 'like', '%' . request()->search . '%');
                      })
                      ->orWhereHas('assignment', function ($assignmentQuery) {
                          $assignmentQuery->where('purpose', 'like', '%' . request()->search . '%');
                      });
                });
            })
            // Filter berdasarkan status report
            ->when($status === 'draft', function ($query) {
                $query->where('status', ReportStatus::DRAFT);
            })
            ->when($status === 'submitted', function ($query) {
                $query->where('status', ReportStatus::SUBMITTED);
            })
            ->when($status === 'rejected', function ($query) {
                $query->where('status', ReportStatus::REJECTED);
            })
            ->when($status === 'approved', function ($query) {
                $query->where('status', ReportStatus::APPROVED);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Hitung total untuk setiap status report
        $totalDraft = Report::query()
            // Filter berdasarkan role (sama seperti query utama)
            ->when($isLeader, function ($query) use ($user) {
                $query->whereHas('user.workUnit', function ($workUnitQuery) use ($user) {
                    $workUnitQuery->where('head_id', $user->id);
                });
            })
            ->when(!$isAdminOrSuperadmin && !$isVerifikator && !$isLeader, function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            // Filter untuk PPK dan Kepala Unit: hanya hitung laporan yang sudah lengkap
            ->when($isVerifikator || $isLeader, function ($query) {
                $query->where(function ($q) {
                    $q->whereNotNull('travel_order_file')
                      ->whereNotNull('spd_file')
                      ->where(function ($subQ) {
                          $subQ->whereHas('inCityReport')
                               ->orWhereHas('outCityReport')
                               ->orWhereHas('travelReport');
                      })
                      ->whereHas('travelReport');
                });
            })
            ->when(request()->filled('search'), function ($query) {
                $query->where(function ($q) {
                    $q->where('travel_purpose', 'like', '%' . request()->search . '%')
                      ->orWhere('destination_city', 'like', '%' . request()->search . '%')
                      ->orWhereHas('user', function ($userQuery) {
                          $userQuery->where('name', 'like', '%' . request()->search . '%');
                      })
                      ->orWhereHas('assignment', function ($assignmentQuery) {
                          $assignmentQuery->where('purpose', 'like', '%' . request()->search . '%');
                      });
                });
            })
            ->where('status', ReportStatus::DRAFT)
            ->count();

        $totalSubmitted = Report::query()
            // Filter berdasarkan role (sama seperti query utama)
            ->when($isLeader, function ($query) use ($user) {
                $query->whereHas('user.workUnit', function ($workUnitQuery) use ($user) {
                    $workUnitQuery->where('head_id', $user->id);
                });
            })
            ->when(!$isAdminOrSuperadmin && !$isVerifikator && !$isLeader, function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            // Filter untuk PPK dan Kepala Unit: hanya hitung laporan yang sudah lengkap
            ->when($isVerifikator || $isLeader, function ($query) {
                $query->where(function ($q) {
                    $q->whereNotNull('travel_order_file')
                      ->whereNotNull('spd_file')
                      ->where(function ($subQ) {
                          $subQ->whereHas('inCityReport')
                               ->orWhereHas('outCityReport')
                               ->orWhereHas('travelReport');
                      })
                      ->whereHas('travelReport');
                });
            })
            ->when(request()->filled('search'), function ($query) {
                $query->where(function ($q) {
                    $q->where('travel_purpose', 'like', '%' . request()->search . '%')
                      ->orWhere('destination_city', 'like', '%' . request()->search . '%')
                      ->orWhereHas('user', function ($userQuery) {
                          $userQuery->where('name', 'like', '%' . request()->search . '%');
                      })
                      ->orWhereHas('assignment', function ($assignmentQuery) {
                          $assignmentQuery->where('purpose', 'like', '%' . request()->search . '%');
                      });
                });
            })
            ->where('status', ReportStatus::SUBMITTED)
            ->count();

        $totalRejected = Report::query()
            // Filter berdasarkan role (sama seperti query utama)
            ->when($isLeader, function ($query) use ($user) {
                $query->whereHas('user.workUnit', function ($workUnitQuery) use ($user) {
                    $workUnitQuery->where('head_id', $user->id);
                });
            })
            ->when(!$isAdminOrSuperadmin && !$isVerifikator && !$isLeader, function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            // Filter untuk PPK dan Kepala Unit: hanya hitung laporan yang sudah lengkap
            ->when($isVerifikator || $isLeader, function ($query) {
                $query->where(function ($q) {
                    $q->whereNotNull('travel_order_file')
                      ->whereNotNull('spd_file')
                      ->where(function ($subQ) {
                          $subQ->whereHas('inCityReport')
                               ->orWhereHas('outCityReport')
                               ->orWhereHas('travelReport');
                      })
                      ->whereHas('travelReport');
                });
            })
            ->when(request()->filled('search'), function ($query) {
                $query->where(function ($q) {
                    $q->where('travel_purpose', 'like', '%' . request()->search . '%')
                      ->orWhere('destination_city', 'like', '%' . request()->search . '%')
                      ->orWhereHas('user', function ($userQuery) {
                          $userQuery->where('name', 'like', '%' . request()->search . '%');
                      })
                      ->orWhereHas('assignment', function ($assignmentQuery) {
                          $assignmentQuery->where('purpose', 'like', '%' . request()->search . '%');
                      });
                });
            })
            ->where('status', ReportStatus::REJECTED)
            ->count();

        $totalApproved = Report::query()
            // Filter berdasarkan role (sama seperti query utama)
            ->when($isLeader, function ($query) use ($user) {
                $query->whereHas('user.workUnit', function ($workUnitQuery) use ($user) {
                    $workUnitQuery->where('head_id', $user->id);
                });
            })
            ->when(!$isAdminOrSuperadmin && !$isVerifikator && !$isLeader, function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            // Filter untuk PPK dan Kepala Unit: hanya hitung laporan yang sudah lengkap
            ->when($isVerifikator || $isLeader, function ($query) {
                $query->where(function ($q) {
                    $q->whereNotNull('travel_order_file')
                      ->whereNotNull('spd_file')
                      ->where(function ($subQ) {
                          $subQ->whereHas('inCityReport')
                               ->orWhereHas('outCityReport')
                               ->orWhereHas('travelReport');
                      })
                      ->whereHas('travelReport');
                });
            })
            ->when(request()->filled('search'), function ($query) {
                $query->where(function ($q) {
                    $q->where('travel_purpose', 'like', '%' . request()->search . '%')
                      ->orWhere('destination_city', 'like', '%' . request()->search . '%')
                      ->orWhereHas('user', function ($userQuery) {
                          $userQuery->where('name', 'like', '%' . request()->search . '%');
                      })
                      ->orWhereHas('assignment', function ($assignmentQuery) {
                          $assignmentQuery->where('purpose', 'like', '%' . request()->search . '%');
                      });
                });
            })
            ->where('status', ReportStatus::APPROVED)
            ->count();
        
        return Inertia::render('reports/index', [
            'reports' => ReportResource::collection($reports)->response()->getData(true),
            'isAdminOrSuperadmin' => $isAdminOrSuperadmin,
            'isLeader' => $isLeader,
            'isVerifikator' => $isVerifikator,
            'status' => $status,
            'search' => request()->get('search', ''),
            'totals' => [
                'draft' => $totalDraft,
                'submitted' => $totalSubmitted,
                'rejected' => $totalRejected,
                'approved' => $totalApproved,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $assignmentId = request()->get('assignment_id');
        $assignment = null;
        
        if ($assignmentId) {
            $assignment = Assignment::find($assignmentId);
            
            // Cek apakah user adalah bagian dari assignment ini
            if (!$assignment || !$assignment->users()->where('user_id', auth()->id())->exists()) {
                abort(403, 'Anda tidak memiliki akses ke penugasan ini.');
            }
        }
        
        $transportationTypes = TransportationType::all(['id', 'name', 'label']);
        
        $data = [
            'assignment_id' => $assignmentId,
            'transportation_types' => $transportationTypes->toArray(),
            'assignment' => $assignment ? [
                'id' => $assignment->id,
                'purpose' => $assignment->purpose,
                'destination' => $assignment->destination,
                'start_date' => $assignment->start_date?->format('Y-m-d'),
                'end_date' => $assignment->end_date?->format('Y-m-d'),
            ] : null,
        ];
        
        
        return Inertia::render('reports/create', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ReportRequest $request)
    {
        try {
            $validated = $request->validated();

                        // Cek apakah assignment ada dan user ada di assignment tersebut
            $assignmentId = $validated['assignment_id'];
            $assignment = Assignment::where('id', $assignmentId)
                ->whereHas('users', function ($query) {
                    $query->where('user_id', auth()->id());
                })
                ->first();

            if (!$assignment) {
                return redirect()->back()
                    ->withErrors(['error' => 'Penugasan tidak ditemukan atau Anda tidak memiliki akses.']);
            }

            // Cek apakah sudah ada report untuk assignment ini dari user ini
            $existingReport = Report::where('assignment_id', $assignmentId)
                ->where('user_id', auth()->id())
                ->first();

            if ($existingReport) {
                return redirect()->back()
                    ->withErrors(['error' => 'Anda sudah membuat laporan untuk penugasan ini.']);
            }

            // Handle file uploads
            $travelOrderFile = null;
            $spdFile = null;

            $userId = (int) auth()->id();

            if ($request->hasFile('travel_order_file')) {
                $travelOrderFile = FileStorageService::storePublicOriginal(
                    $request->file('travel_order_file'),
                    'files/reports',
                    $userId
                );
            }

            if ($request->hasFile('spd_file')) {
                $spdFile = FileStorageService::storePublicOriginal(
                    $request->file('spd_file'),
                    'files/reports',
                    $userId
                );
            }

            $report = Report::create([
                'user_id' => auth()->id(),
                'assignment_id' => $assignmentId,
                'travel_type' => $validated['travel_type'],
                // Ambil data dari assignment
                'travel_order_number' => $validated['travel_order_number'],
                'destination_city' => $assignment->destination,
                'departure_date' => $assignment->start_date,
                'return_date' => $assignment->end_date,
                'actual_duration' => $validated['actual_duration'],
                'travel_purpose' => $assignment->purpose,
                'travel_order_file' => $travelOrderFile,
                'spd_file' => $spdFile,
            ]);

            // Attach transportation types
            if (isset($validated['transportation_type_ids'])) {
                $report->transportationTypes()->attach($validated['transportation_type_ids']);
            }

            // Redirect to report show page with details tab
            return redirect()->route('reports.show', $report)
                ->with('success', 'Laporan perjalanan berhasil dibuat.')
                ->with('tabs', 'details');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat membuat laporan perjalanan. Silakan coba lagi.'])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Report $report, Request $request): Response
    {
        $tab = $request->get('tabs', 'details');
        
        // Load semua data yang diperlukan
        $report->load([
            'user.workUnit.head',
            'assignment.users',
            'assignment.assignmentDocumentations',
            'reviews',
            'inCityReport', // Load inCityReport selalu
            'outCityReport.fullboardPrice', // Load outCityReport dengan fullboardPrice
            'outCountyReport', // Load outCountyReport selalu
            'travelReport', // Load travelReport selalu
            'transportationTypes', // Load transportation types
        ]);

        // Load fullboard prices untuk out city expense
        $fullboardPrices = FullboardPrice::all();
        
        // Load semua transportation types
        $transportationTypes = TransportationTypeModel::all();

        $authUser = auth()->user();
        $userRoles = $authUser->roles->map(function($role) {
            return ['name' => $role->name];
        })->toArray();
        
        // Transform data via Resource (pastikan bentuk { data: ... })
        $reportData = (new DetailReportResource($report))->response()->getData(true);


        $tabData = [];

        return Inertia::render('reports/show', [
            'report' => $reportData,
            'tabData' => $tabData,
            'activeTab' => $tab,
            'fullboardPrices' => $fullboardPrices,
            'transportationTypes' => $transportationTypes,
            'auth' => [
                'user' => [
                    'id' => $authUser->id,
                    'name' => $authUser->name,
                    'roles' => $userRoles,
                ]
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Report $report): Response
    {
        return Inertia::render('reports/edit', [
            'report' => $report,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ReportRequest $request, Report $report)
    {
        $validated = $request->validated();

        $userId = (int) auth()->id();

        // Handle file replacements if provided
        if ($request->hasFile('travel_order_file')) {
            FileStorageService::deletePublicIfExists($report->travel_order_file);
            $validated['travel_order_file'] = FileStorageService::storePublicOriginal(
                $request->file('travel_order_file'),
                'files/reports',
                $userId
            );
        }

        if ($request->hasFile('spd_file')) {
            FileStorageService::deletePublicIfExists($report->spd_file);
            $validated['spd_file'] = FileStorageService::storePublicOriginal(
                $request->file('spd_file'),
                'files/reports',
                $userId
            );
        }

        // Hanya update field yang diizinkan (tidak termasuk field dari assignment)
        $allowedFields = ['travel_type', 'travel_order_number', 'actual_duration'];
        $updateData = array_intersect_key($validated, array_flip($allowedFields));

        // Tambahkan file fields hanya jika ada file baru
        if (isset($validated['travel_order_file'])) {
            $updateData['travel_order_file'] = $validated['travel_order_file'];
        }
        if (isset($validated['spd_file'])) {
            $updateData['spd_file'] = $validated['spd_file'];
        }

        $report->update($updateData);

        // Update transportation types
        if (isset($validated['transportation_type_ids'])) {
            $report->transportationTypes()->sync($validated['transportation_type_ids']);
        }

        return redirect()->route('reports.show', $report)
            ->with('success', 'Laporan perjalanan berhasil diperbarui.')
            ->with('reload', true);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Report $report)
    {
        $report->delete();

        return redirect()->route('reports.index')
            ->with('success', 'Laporan perjalanan berhasil dihapus.');
    }

    /**
     * Bulk delete reports
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:reports,id',
        ]);

        Report::whereIn('id', $validated['ids'])
            ->where('user_id', auth()->id())
            ->delete();

        return redirect()->route('reports.index')
            ->with('success', 'Laporan perjalanan berhasil dihapus.');
    }

    /**
     * Review a report (approve/reject)
     */
    public function review(Request $request, Report $report)
    {
        $user = auth()->user();
        
        // Validasi input
        $validated = $request->validate([
            'reviewer_type' => 'required|in:' . implode(',', array_column(ReviewerType::cases(), 'value')),
            'status' => 'required|in:' . implode(',', array_column(ReviewStatus::cases(), 'value')),
            'notes' => 'nullable|string',
        ]);

        // Cek apakah user punya permission untuk review
        $canReview = false;
        
        // Verifikator (PPK) bisa review semua laporan
        if ($user->hasRole('verificator') && $validated['reviewer_type'] === ReviewerType::COMMITMENT_OFFICER->value) {
            $canReview = true;
        }
        
        // Leader (Kasi) hanya bisa review laporan dari work unit yang dipimpinnya
        if ($user->hasRole('leader') && $validated['reviewer_type'] === ReviewerType::SECTION_HEAD->value) {
            $reportUser = $report->user;
            if ($reportUser->workUnit && $reportUser->workUnit->head_id === $user->id) {
                $canReview = true;
            }
        }

        if (!$canReview) {
            return redirect()->back()
                ->withErrors(['error' => 'Anda tidak memiliki izin untuk melakukan review laporan ini.']);
        }

        // Cek apakah sudah ada review dari reviewer ini
        $existingReview = ReportReview::where('report_id', $report->id)
            ->where('reviewer_type', $validated['reviewer_type'])
            ->first();

        if ($existingReview) {
            return redirect()->back()
                ->withErrors(['error' => 'Anda sudah memberikan review untuk laporan ini.']);
        }

        // Buat review baru
        ReportReview::create([
            'report_id' => $report->id,
            'reviewer_id' => $user->id,
            'reviewer_type' => $validated['reviewer_type'],
            'status' => $validated['status'],
            'notes' => $validated['notes'],
        ]);

        $statusText = $validated['status'] === ReviewStatus::APPROVED->value ? 'disetujui' : 'ditolak';
        $reviewerText = $validated['reviewer_type'] === ReviewerType::COMMITMENT_OFFICER->value ? 'PPK' : 'Kasi';

        return redirect()->back()
            ->with('success', "Laporan berhasil {$statusText} oleh {$reviewerText}.");
    }

    /**
     * Submit a report (change status from draft to submitted)
     */
    public function submit(Request $request, Report $report)
    {
        $user = auth()->user();
        
        // Hanya creator laporan yang bisa submit
        if ($report->user_id !== $user->id) {
            return redirect()->back()
                ->withErrors(['error' => 'Anda tidak memiliki izin untuk mengirim laporan ini.']);
        }

        // Izinkan submit saat draft, dan resubmit saat rejected (dengan syarat ada perubahan)
        if (!in_array($report->status, [ReportStatus::DRAFT, ReportStatus::REJECTED])) {
            return redirect()->back()
                ->withErrors(['error' => 'Hanya laporan dengan status draft atau ditolak yang dapat dikirim.']);
        }

        // Validasi kelengkapan sebelum submit: wajib ada biaya dan laporan perjalanan
        $hasExpense = ($report->inCityReport !== null) || ($report->outCityReport !== null);
        $hasTravelReport = ($report->travelReport !== null);

        if (!$hasExpense || !$hasTravelReport) {
            $missingParts = [];
            $redirectTab = null;

            if (!$hasExpense) {
                $missingParts[] = 'Biaya';
                $redirectTab = 'expenses';
            }
            if (!$hasTravelReport) {
                $missingParts[] = 'Laporan Perjalanan';
                // Jika biaya ada tapi laporan perjalanan tidak, arahkan ke tab laporan perjalanan
                $redirectTab = $redirectTab ?: 'travel-reports';
            }

            $missingText = implode(' dan ', $missingParts);

            return redirect()->back()
                ->withErrors(['error' => "Tidak dapat menyerahkan laporan. Lengkapi ${missingText} terlebih dahulu."])
                ->with('tabs', $redirectTab);
        }

        // Jika resubmit dari rejected, pastikan ada perubahan setelah penolakan
        if ($report->status === ReportStatus::REJECTED) {
            $report->loadMissing('reviews');
            $lastRejected = $report->reviews
                ->filter(function ($review) {
                    return $review->status === ReviewStatus::REJECTED || ($review->status?->value ?? null) === ReviewStatus::REJECTED->value;
                })
                ->sortByDesc('created_at')
                ->first();

            if (!$lastRejected || !$report->hasChangesAfter($lastRejected->created_at)) {
                return redirect()->back()
                    ->withErrors(['error' => 'Belum ada perubahan setelah penolakan. Perbarui data sebelum menyerahkan kembali.']);
            }
        }

        // Update status laporan menjadi submitted (dan bersihkan review jika resubmit)
        DB::transaction(function () use ($report) {
            if ($report->status === ReportStatus::REJECTED) {
                ReportReview::where('report_id', $report->id)->delete();
            }

            $report->update([
                'status' => ReportStatus::SUBMITTED
            ]);
        });

        return redirect()->back()
            ->with('success', 'Laporan berhasil dikirim untuk review.');
    }

    /**
     * Download expense report as Word document
     */
    public function downloadExpenseReport(Report $report)
    {
        // Cek apakah laporan sudah approved
        if ($report->status !== ReportStatus::APPROVED) {
            return redirect()->back()
                ->withErrors(['error' => 'Hanya laporan yang sudah disetujui yang dapat diunduh.']);
        }

        // Cek permission untuk download
        $user = auth()->user();
        $canDownload = false;

        // Admin dan superadmin bisa download semua
        if ($user->hasAnyRole(['admin', 'superadmin'])) {
            $canDownload = true;
        }
        // Verifikator bisa download semua
        elseif ($user->hasRole('verificator')) {
            $canDownload = true;
        }
        // Leader bisa download laporan dari work unit yang dipimpinnya
        elseif ($user->hasRole('leader')) {
            $reportUser = $report->user;
            if ($reportUser->workUnit && $reportUser->workUnit->head_id === $user->id) {
                $canDownload = true;
            }
        }
        // User hanya bisa download laporan yang dia buat
        elseif ($report->user_id === $user->id) {
            $canDownload = true;
        }

        if (!$canDownload) {
            return redirect()->back()
                ->withErrors(['error' => 'Anda tidak memiliki izin untuk mengunduh laporan ini.']);
        }

        try {
            $wordService = new ExpenseWordService();
            $tempFile = $wordService->generate($report);

            $filename = 'Rincian_Biaya_Perjalanan_Dinas_' . $report->id . '_' . date('Y-m-d') . '.docx';

            return response()->download($tempFile, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ])->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Gagal mengunduh laporan: ' . $e->getMessage()]);
        }
    }

    /**
     * Download travel report (Laporan Perjadin) as Word document
     */
    public function downloadTravelReport(Report $report)
    {
        // Only approved reports are downloadable
        if ($report->status !== ReportStatus::APPROVED) {
            return redirect()->back()
                ->withErrors(['error' => 'Hanya laporan yang sudah disetujui yang dapat diunduh.']);
        }

        // Check permissions similar to expense download
        $user = auth()->user();
        $canDownload = false;

        if ($user->hasAnyRole(['admin', 'superadmin']) || $user->hasRole('verificator')) {
            $canDownload = true;
        } elseif ($user->hasRole('leader')) {
            $reportUser = $report->user;
            if ($reportUser->workUnit && $reportUser->workUnit->head_id === $user->id) {
                $canDownload = true;
            }
        } elseif ($report->user_id === $user->id) {
            $canDownload = true;
        }

        if (!$canDownload) {
            return redirect()->back()
                ->withErrors(['error' => 'Anda tidak memiliki izin untuk mengunduh laporan ini.']);
        }

        try {
            $wordService = new TravelReportWordService();
            $tempFile = $wordService->generate($report->loadMissing('travelReport', 'user', 'assignment.assignmentDocumentations'));

            $filename = 'Laporan_Perjadin_' . $report->id . '_' . date('Y-m-d') . '.docx';

            return response()->download($tempFile, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ])->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Gagal mengunduh laporan: ' . $e->getMessage()]);
        }
    }
}
