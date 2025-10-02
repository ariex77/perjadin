<?php

namespace App\Services;

use App\Models\Report;
use App\Models\User;
use Carbon\Carbon;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\SimpleType\TblWidth;
use App\Services\IndonesianNumberFormatter;

class ExpenseWordService
{
    /** Style section global (0.5 inch) */
    private array $sectionStyle = [
        'marginTop'    => 720, // 0.5 inch
        'marginRight'  => 720,
        'marginBottom' => 720,
        'marginLeft'   => 720,
    ];

    public function generate(Report $report): string
    {
        $phpWord = new PhpWord();

        // Doc props
        $properties = $phpWord->getDocInfo();
        $properties->setCreator('E-Perjadin System');
        $properties->setTitle('Rincian Biaya Perjalanan Dinas');
        $properties->setSubject('Laporan Biaya Perjalanan Dinas');

        $this->addStyles($phpWord);

        // Halaman 1
        $section = $this->createSection($phpWord);
        $this->addHeader($section);
        $this->addTitle($section);
        $this->addMetadata($section, $report);
        $this->addExpenseTable($section, $report);
        $this->addPaymentSection($section, $report);
        $this->addSpdCalculation($section, $report);

        // Halaman 2
        $this->addRealExpensePage($phpWord, $report);

        // Halaman 3
        $this->addReceiptPage($phpWord, $report);

        // Save temp file
        $tempFile = tempnam(sys_get_temp_dir(), 'expense_report_');
        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        $objWriter->save($tempFile);

        return $tempFile;
    }

    /** Section helper: gunakan margin global */
    private function createSection(PhpWord $phpWord)
    {
        return $phpWord->addSection($this->sectionStyle);
    }

    private function addStyles(PhpWord $phpWord): void
    {
        $phpWord->setDefaultFontName('Arial');
        $phpWord->setDefaultFontSize(11);

        // Default paragraph style hemat spasi
        $phpWord->setDefaultParagraphStyle([
            'spaceAfter'   => 0,
            'spaceBefore'  => 0,
            'lineHeight'   => 1.0,
            'widowControl' => true,
        ]);

        $phpWord->addTitleStyle(
            1,
            ['size' => 16, 'bold' => true, 'color' => '000000'],
            ['alignment' => Jc::CENTER, 'spaceAfter' => 100]
        );
        $phpWord->addFontStyle('headerFont', ['size' => 11, 'bold' => true]);
        $phpWord->addFontStyle('normalFont', ['size' => 11]);
        $phpWord->addFontStyle('tableHeaderFont', ['size' => 11, 'bold' => true]);
        $phpWord->addFontStyle('tableContentFont', ['size' => 11]);
    }

    private function addHeader($section): void
    {
        $logoPath = public_path('garuda.png');
        if (file_exists($logoPath)) {
            $section->addImage($logoPath, [
                'width'         => 50,
                'height'        => 50,
                'alignment'     => Jc::CENTER,
                'wrappingStyle' => 'inline',
            ]);
        }
    }

    private function addTitle($section): void
    {
        $section->addText(
            'RINCIAN BIAYA PERJALANAN DINAS',
            ['size' => 16, 'bold' => true],
            ['alignment' => Jc::CENTER, 'spaceAfter' => 250, 'spaceBefore' => 150]
        );
    }

    private function addMetadata($section, Report $report): void
    {
        $section->addText('Lampiran SPPD Nomor : ' . ($report->travel_order_number ?? '-'), [], ['spaceAfter' => 40]);
        $section->addText('Tanggal : ' . Carbon::parse($report->departure_date ?? $report->created_at ?? now())->format('d F Y'), [], ['spaceAfter' => 80]);
    }

    private function addExpenseTable($section, Report $report): void
    {
        $expenses = $this->getExpenseData($report);

        // Full width table (100%)
        $table = $section->addTable([
            'borderSize' => 6,
            'borderColor' => '000000',
            'cellMargin' => 80, // Added cell padding
            'width'      => 100 * 50,
            'unit'       => TblWidth::PERCENT,
        ]);

        // Lebar kolom (No. diperkecil konsisten)
        $colNo   = 500;
        $colDesc = 5400;
        $colAmt  = 2100;
        $colNote = 2000;

        // Header
        $table->addRow();
        $table->addCell($colNo,   ['bgColor' => 'E0E0E0'])->addText('No.', 'tableHeaderFont', ['alignment' => Jc::CENTER]);
        $table->addCell($colDesc, ['bgColor' => 'E0E0E0'])->addText('Perincian Biaya', 'tableHeaderFont', ['alignment' => Jc::CENTER]);
        $table->addCell($colAmt,  ['bgColor' => 'E0E0E0'])->addText('Jumlah', 'tableHeaderFont', ['alignment' => Jc::CENTER]);
        $table->addCell($colNote, ['bgColor' => 'E0E0E0'])->addText('Keterangan', 'tableHeaderFont', ['alignment' => Jc::CENTER]);

        // Body
        $no = 1;
        foreach ($expenses as $expense) {
            $table->addRow();
            $table->addCell($colNo)->addText($no . '.', 'tableContentFont', ['alignment' => Jc::CENTER]);
            $table->addCell($colDesc)->addText($expense['description'], 'tableContentFont');
            $table->addCell($colAmt)->addText($expense['amount'], 'tableContentFont', ['alignment' => Jc::RIGHT]);
            $table->addCell($colNote)->addText($expense['notes'] ?? '-', 'tableContentFont');
            $no++;
        }

        // Totals inside the same table
        $total = $this->calculateTotal($report);
        $terbilang = IndonesianNumberFormatter::toWords((int) round($total));

        // JUMLAH - sejajar dengan Perincian Biaya dan Jumlah, rata kiri
        $table->addRow();
        $table->addCell($colNo)->addText('', 'tableHeaderFont'); // Kosong untuk kolom No
        $table->addCell($colDesc)->addText('JUMLAH', 'tableHeaderFont'); // Rata kiri
        $table->addCell($colAmt)->addText('Rp. ' . number_format($total, 0, ',', '.') . ',-', 'tableHeaderFont', ['alignment' => Jc::RIGHT]);
        $table->addCell($colNote)->addText('', 'tableHeaderFont'); // Kosong untuk kolom Keterangan

        // TERBILANG - spans across Jumlah and Keterangan columns
        $table->addRow();
        $table->addCell($colNo)->addText('', 'tableHeaderFont'); // Kosong untuk kolom No
        $table->addCell($colDesc, ['gridSpan' => 3])->addText('Terbilang: ' . $terbilang, 'tableHeaderFont'); // Rata kiri

        // Payment info compact
        $table->addRow();
        $leftBlock = $table->addCell($colNo + $colDesc, ['gridSpan' => 2]);
        $leftBlock->addText('Telah dibayar sejumlah :  Rp. ' . number_format($total, 0, ',', '.') . ',-');
        $leftBlock->addText('(' . $terbilang . ')');

        $rightBlock = $table->addCell($colAmt + $colNote, ['gridSpan' => 2]);
        $rightBlock->addText('Jakarta, ' . Carbon::parse($report->return_date ?? now())->format('d F Y'), 'normalFont');
        $rightBlock->addText('Telah menerima jumlah uang sebesar : Rp.' . number_format($total, 0, ',', '.') . ',-');
        $rightBlock->addText('(' . $terbilang . ')');

        $section->addTextBreak(1);
    }

    private function getExpenseData(Report $report): array
    {
        $expenses = [];

        $transportCost = $this->calculateTransportCost($report);
        if ($transportCost > 0) {
            $expenses[] = [
                'description' => 'Angkutan dari tempat kedudukan ke Tempat tujuan, PP :',
                'amount'      => 'Rp.' . number_format($transportCost, 0, ',', '.') . ',-',
                'notes'       => 'Transportasi PP',
            ];
        }

        $dailyAllowance = 0;
        $days = $this->calculateDays($report);
        $perDay = 0;
        $desc = '';
        $notes = '';
        if ($report->inCityReport) {
            $perDay = (float) $report->inCityReport->daily_allowance;
            $dailyAllowance = $perDay * max(1, $days);
            $desc = "Uang Harian    :  {$days} Hari  x  Rp." . number_format($perDay, 0, ',', '.') . ",-";
            $notes = '';
        } elseif ($report->outCityReport) {
            if ($report->outCityReport->custom_daily_allowance) {
                $perDay = (float) $report->outCityReport->custom_daily_allowance;
                $notes = '';
            } elseif ($report->outCityReport->fullboard_price_id && $report->outCityReport->fullboardPrice) {
                $perDay = (float) $report->outCityReport->fullboardPrice->price;
                $notes = $report->outCityReport->fullboardPrice?->province_name ?? 'Provinsi';
            }
            $dailyAllowance = $perDay * max(1, $days);
            $desc = "Uang Harian    :  {$days} Hari  x  Rp." . number_format($perDay, 0, ',', '.') . ",-";
        }
        if ($dailyAllowance > 0) {
            $expenses[] = [
                'description' => $desc,
                'amount'      => 'Rp.' . number_format($dailyAllowance, 0, ',', '.') . ',-',
                'notes'       => $notes,
            ];
        }

        $hotelCost = $this->calculateHotelCost($report);
        if ($hotelCost > 0) {
            $nights = $this->calculateNights($report);
            $expenses[] = [
                'description' => "Biaya Penginapan  :  {$nights} Malam  x  Rp." . number_format($hotelCost / max(1, $nights), 0, ',', '.') . ",-",
                'amount'      => 'Rp.' . number_format($hotelCost, 0, ',', '.') . ',-',
                'notes'       => '',
            ];
        }

        // Sewa Kendaraan (khusus in-city)
        $vehicleRental = 0;
        if ($report->inCityReport) {
            $vehicleRental = (float) ($report->inCityReport->vehicle_rental_fee ?? 0);
        }
        if ($vehicleRental > 0) {
            $days = $this->calculateDays($report);
            $expenses[] = [
                'description' => "Sewa Kendaraan :  {$days} Hari  x  Rp." . number_format($vehicleRental / max(1, $days), 0, ',', '.') . ",-",
                'amount'      => 'Rp.' . number_format($vehicleRental, 0, ',', '.') . ',-',
                'notes'       => '',
            ];
        }

        $representationCost = $this->calculateRepresentationCost($report);
        if ($representationCost > 0) {
            $days = $this->calculateDays($report);
            $expenses[] = [
                'description' => "Representatif     :  {$days} Hari  x  Rp." . number_format($representationCost / max(1, $days), 0, ',', '.') . ",-",
                'amount'      => 'Rp.' . number_format($representationCost, 0, ',', '.') . ',-',
                'notes'       => '',
            ];
        } else {
            $expenses[] = [
                'description' => 'Representatif     :  -',
                'amount'      => 'Rp.-,-',
                'notes'       => '',
            ];
        }

        return $expenses;
    }

    private function calculateTransportCost(Report $report): float
    {
        if ($report->inCityReport) {
            return (float) $report->inCityReport->transportation_cost;
        }
        if ($report->outCityReport) {
            $total = 0;
            $total += (float) ($report->outCityReport->origin_transport_cost ?? 0);
            $total += (float) ($report->outCityReport->local_transport_cost ?? 0);
            $total += (float) ($report->outCityReport->destination_transport_cost ?? 0);
            $total += (float) ($report->outCityReport->round_trip_ticket_cost ?? 0);
            return $total;
        }
        if ($report->outCountyReport) {
            $total = 0;
            $total += (float) ($report->outCountyReport->origin_transport_cost ?? 0);
            $total += (float) ($report->outCountyReport->international_ticket_cost ?? 0);
            $total += (float) ($report->outCountyReport->local_transport_cost ?? 0);
            return $total;
        }
        return 0;
    }

    /**
     * Uang harian:
     * - In-city: gunakan nilai yang ada (as-is).
     * - Out-city: rate/hari (custom/fullboard) × actual_duration (days).
     * - Out-county: gunakan field yang ada (as-is).
     */
    private function calculateDailyAllowance(Report $report): float
    {
        if ($report->inCityReport) {
            return (float) $report->inCityReport->daily_allowance;
        }

        if ($report->outCityReport) {
            $perDay = 0.0;
            if ($report->outCityReport->custom_daily_allowance) {
                $perDay = (float) $report->outCityReport->custom_daily_allowance;
            } elseif ($report->outCityReport->fullboard_price_id && $report->outCityReport->fullboardPrice) {
                $perDay = (float) $report->outCityReport->fullboardPrice->price;
            }
            $days = $this->calculateDays($report);
            return $perDay * max(1, $days);
        }

        if ($report->outCountyReport) {
            return (float) $report->outCountyReport->daily_allowance;
        }

        return 0;
    }

    private function calculateHotelCost(Report $report): float
    {
        if ($report->inCityReport) {
            return 0;
        }
        if ($report->outCityReport) {
            return (float) ($report->outCityReport->lodging_cost ?? 0);
        }
        if ($report->outCountyReport) {
            return (float) ($report->outCountyReport->lodging_cost ?? 0);
        }
        return 0;
    }

    private function calculateRepresentationCost(Report $report): float
    {
        return 0;
    }

    private function calculateDays(Report $report): int
    {
        if (!empty($report->actual_duration) && (int) $report->actual_duration > 0) {
            return (int) $report->actual_duration;
        }
        if ($report->assignment) {
            $startDate = Carbon::parse($report->assignment->start_date);
            $endDate   = Carbon::parse($report->assignment->end_date);
            return $startDate->diffInDays($endDate) + 1;
        }
        return 1;
    }

    private function calculateNights(Report $report): int
    {
        $days = $this->calculateDays($report);
        return max(0, $days - 1);
    }

    private function calculateTotal(Report $report): float
    {
        // Ambil data expenses yang akan ditampilkan di tabel
        $expenses = $this->getExpenseData($report);
        $total = 0;
        foreach ($expenses as $expense) {
            // Ambil angka dari string 'amount', contoh: 'Rp.90.000,-' => 90000
            if (preg_match('/Rp\.\s?([\d.,]+)/', $expense['amount'], $matches)) {
                // Hilangkan titik dan koma
                $amountStr = str_replace(['.', ','], '', $matches[1]);
                $amount = (int) $amountStr;
                $total += $amount;
            }
        }
        return $total;
    }

    private function addPaymentSection($section, Report $report): void
    {
        // TTD Bendahara (kiri) & Yang Bepergian (kanan) — 2 kolom
        $tbl = $section->addTable([
            'borderSize' => 0,
            'borderColor' => 'FFFFFF',
            'insideHBorderSize' => 0,
            'insideVBorderSize' => 0,
            'cellMargin' => 40,
            'width' => 100 * 50,
            'unit' => TblWidth::PERCENT,
        ]);
        $pCenter = ['alignment' => Jc::CENTER];

        // Row A1: label/jabatan
        $tbl->addRow();
        $left  = $tbl->addCell(4500);
        $left->addText('Bendahara Pengeluaran', 'normalFont', $pCenter);
        $right = $tbl->addCell(4500);
        $right->addText('Yang Bepergian', 'normalFont', $pCenter);

        // Row A2: ruang tanda tangan
        $tbl->addRow();
        $tbl->addCell(4500)->addTextBreak(3);
        $tbl->addCell(4500)->addTextBreak(3);

        // Row A3: nama + NIP
        $tbl->addRow();
        $n1 = $tbl->addCell(4500);
        $n1->addText('Budhi Hari Santoso', ['bold' => true, 'underline' => 'single'], $pCenter);
        $n1->addText('NIP. 197101072000031001', 'normalFont', $pCenter);

        $n2 = $tbl->addCell(4500);
        $n2->addText(($report->user->name ?? '-'), ['bold' => true, 'underline' => 'single'], $pCenter);
        $n2->addText('NIP. ' . ($report->user->nip ?? '-'), 'normalFont', $pCenter);

        // sedikit jarak sebelum garis pembatas
        $section->addTextBreak(1);
    }

    private function addSpdCalculation($section, Report $report): void
    {
        $total = $this->calculateTotal($report);
        $pCenter = ['alignment' => Jc::CENTER];

        $section->addText('', [], [
            'borderBottomSize' => 12,
            'borderBottomColor' => '000000',
            'spaceAfter' => 0,
        ]);

        // ——— Blok PERHITUNGAN SPD RAMPUNG ———
        $section->addTextBreak(1);
        $section->addText('PERHITUNGAN SPD RAMPUNG', 'headerFont', ['spaceAfter' => 60]);

        // tabel kecil 2 kolom (label : nilai) biar rapi
        $spd = $section->addTable([
            'borderSize' => 0,
            'borderColor' => 'FFFFFF',
            'insideHBorderSize' => 0,
            'insideVBorderSize' => 0,
            'cellMargin' => 40,
            'width' => 100 * 50,
            'unit' => TblWidth::PERCENT,
        ]);
        $spd->addRow();
        $spd->addCell(3000)->addText('Ditetapkan sejumlah', 'normalFont');
        $spd->addCell(6000)->addText(':  Rp. ' . number_format($total, 0, ',', '.'), 'normalFont');
        $spd->addRow();
        $spd->addCell(3000)->addText('Yang telah dibayar semula', 'normalFont');
        $spd->addCell(6000)->addText(':  Rp. ' . number_format($total, 0, ',', '.'), 'normalFont');
        $spd->addRow();
        $spd->addCell(3000)->addText('Sisa kurang / lebih', 'normalFont');
        $spd->addCell(6000)->addText(':  Rp. -', 'normalFont');

        // ——— Row B (PPK di kanan, sejajar kolom Yang Bepergian namun baris berbeda) ———
        $ppkUser = User::role('verificator')->first();
        $ppkName = $ppkUser?->name ?? 'Pejabat Pembuat Komitmen';
        $ppkNip  = $ppkUser?->nip  ?? '-';

        $ppkTbl = $section->addTable([
            'borderSize' => 0,
            'borderColor' => 'FFFFFF',
            'insideHBorderSize' => 0,
            'insideVBorderSize' => 0,
            'cellMargin' => 40,
            'width' => 100 * 50,
            'unit' => TblWidth::PERCENT,
        ]);

        // Row B1: label PPK di kolom kanan, kiri kosong (agar sejajar posisinya)
        $ppkTbl->addRow();
        $ppkTbl->addCell(4500)->addText(''); // kosong = sejajar kiri kolom "Bendahara Pengeluaran"
        $ppkLabel = $ppkTbl->addCell(4500);
        $ppkLabel->addText('Pejabat Pembuat Komitmen', 'normalFont', $pCenter);

        // Row B2: ruang tanda tangan PPK
        $ppkTbl->addRow();
        $ppkTbl->addCell(4500)->addText('');
        $ppkTbl->addCell(4500)->addTextBreak(3);

        // Row B3: nama + NIP PPK (kanan)
        $ppkTbl->addRow();
        $ppkTbl->addCell(4500)->addText('');
        $ppkNameCell = $ppkTbl->addCell(4500);
        $ppkNameCell->addText($ppkName, ['bold' => true, 'underline' => 'single'], $pCenter);
        $ppkNameCell->addText('NIP. ' . $ppkNip, 'normalFont', $pCenter);
    }


    private function addRealExpensePage(PhpWord $phpWord, Report $report): void
    {
        // SECTION baru -> Halaman 2
        $section = $this->createSection($phpWord);

        $section->addText('DAFTAR PENGELUARAN RIIL', ['size' => 14, 'bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 300]); // Added more spacing

        $userName = $report->user?->name ?: '-';
        $nip      = $report->user->nip ?? '-';
        $jabatan  = $report->user?->workUnit?->name ? ('Kepala ' . $report->user->workUnit->name) : '-';

        // Info table TANPA BORDER + full width
        $infoTable = $section->addTable([
            'borderSize' => 0,
            'borderColor' => 'FFFFFF',
            'insideHBorderSize' => 0,
            'insideVBorderSize' => 0,
            'cellMargin' => 80, // Added cell padding
            'width'      => 100 * 50,
            'unit'       => TblWidth::PERCENT,
        ]);
        $infoTable->addRow();
        $infoTable->addCell(2000)->addText('Nama');
        $infoTable->addCell(200)->addText(':');
        $infoTable->addCell(6800)->addText($userName, ['bold' => true]);
        $infoTable->addRow();
        $infoTable->addCell(2000)->addText('NIP');
        $infoTable->addCell(200)->addText(':');
        $infoTable->addCell(6800)->addText($nip, ['bold' => true]);
        $infoTable->addRow();
        $infoTable->addCell(2000)->addText('Jabatan');
        $infoTable->addCell(200)->addText(':');
        $infoTable->addCell(6800)->addText($jabatan);

        $section->addTextBreak(1);

        $section->addText(
            'Berdasarkan Surat Perjalanan Dinas (SPD) Nomor ' . ($report->travel_order_number ?? '-') . ' tanggal ' . Carbon::parse($report->departure_date ?? now())->format('d F Y') . ' dengan ini kami menyampaikan dengan sesungguhnya bahwa:',
            [],
            ['spaceAfter' => 60]
        );
        $section->addText(
            '1. Biaya Transport Pegawai dan/atau biaya penginapan di bawah ini yang tidak dapat diperoleh bukti-bukti pengeluarannya meliputi:',
            [],
            ['spaceAfter' => 60]
        );

        $table = $section->addTable([
            'borderSize' => 6,
            'borderColor' => '000000',
            'cellMargin' => 80,
            'width'      => 97 * 50,              // <— 90% dari lebar area teks
            'unit'       => TblWidth::PERCENT,
            'alignment'  => Jc::END,           // CENTER = masuk ke dalam simetris
            // pakai Jc::START kalau mau menjorok kiri saja (dengan sisa ruang di kanan)
        ]);

        $colNo   = 500; // Made consistent with other tables
        $colDesc = 5500;
        $colAmt  = 3000;

        $table->addRow();
        $table->addCell($colNo,   ['bgColor' => 'E0E0E0'])->addText('No.', 'tableHeaderFont', ['alignment' => Jc::CENTER]);
        $table->addCell($colDesc, ['bgColor' => 'E0E0E0'])->addText('Uraian', 'tableHeaderFont', ['alignment' => Jc::CENTER]);
        $table->addCell($colAmt,  ['bgColor' => 'E0E0E0'])->addText('Jumlah', 'tableHeaderFont', ['alignment' => Jc::CENTER]);

        $riilTransport = 0.0;
        if ($report->inCityReport) {
            $riilTransport = (float) ($report->inCityReport->actual_expense ?? 0);
        } elseif ($report->outCityReport) {
            $riilTransport = (float) ($report->outCityReport->actual_expense ?? 0);
        }

        $lodging   = $this->calculateHotelCost($report);
        $lodging30 = $lodging * 0.3;

        // Row 1
        $table->addRow();
        $table->addCell($colNo)->addText('1', 'tableContentFont', ['alignment' => Jc::CENTER]);
        $table->addCell($colDesc)->addText('Biaya Transport', 'tableContentFont');
        $table->addCell($colAmt)->addText('Rp. ' . number_format($riilTransport, 0, ',', '.') . ',-', 'tableContentFont', ['alignment' => Jc::RIGHT]);

        // Row 2
        $table->addRow();
        $table->addCell($colNo)->addText('2', 'tableContentFont', ['alignment' => Jc::CENTER]);
        $table->addCell($colDesc)->addText('Biaya Penginapan 30%', 'tableContentFont');
        $table->addCell($colAmt)->addText('Rp. ' . number_format($lodging30, 0, ',', '.') . ',-', 'tableContentFont', ['alignment' => Jc::RIGHT]);

        // Total row
        $table->addRow();
        $table->addCell($colNo)->addText('');
        $table->addCell($colDesc)->addText('Jumlah', 'tableHeaderFont', ['alignment' => Jc::RIGHT]);
        $table->addCell($colAmt)->addText('Rp. ' . number_format(($riilTransport + $lodging30), 0, ',', '.') . ',-', 'tableHeaderFont', ['alignment' => Jc::RIGHT]);

        $section->addText('2. Jumlah uang tersebut pada angka 1 di atas benar-benar dikeluarkan untuk pelaksanaan perjalanan dinas dimaksud dan apabila di kemudian hari terdapat kelebihan atas pembayaran, kami bersedia menyetorkan kelebihan tersebut ke Kas Negara.', [], ['spaceAfter' => 120]);
        $section->addText('Demikian pernyataan ini kami buat dengan sebenarnya, untuk dipergunakan sebagaimana mestinya.', [], ['spaceAfter' => 200]);

        // Signature compact (full width) TANPA BORDER
        $sigTable = $section->addTable([
            'borderSize' => 0,
            'borderColor' => 'FFFFFF',
            'insideHBorderSize' => 0,
            'insideVBorderSize' => 0,
            'cellMargin' => 40,
            'width'      => 100 * 50,
            'unit'       => TblWidth::PERCENT,
        ]);
        $sigTable->addRow();
        $ppk     = User::role('verificator')->first();
        $ppkName = $ppk?->name ?? '-';
        $ppkNip  = $ppk?->nip ?? '-';

        $left = $sigTable->addCell(4500);
        $this->addSignature($left, ['Mengetahui/Menyetujui', 'Pejabat Pembuat Komitmen'], $ppkName, $ppkNip);

        $right = $sigTable->addCell(4500);
        $right->addText('Jakarta, ' . Carbon::parse($report->return_date ?? now())->format('d F Y'), 'normalFont', ['alignment' => Jc::CENTER]);
        $this->addSignature($right, ['Pelaksana SPD'], $userName, $nip);
    }

    /** Blok tanda tangan standar */
    private function addSignature($container, array $roleLines, string $name, string $nip): void
    {
        $pCenter = ['alignment' => Jc::CENTER];

        foreach ($roleLines as $line) {
            $container->addText($line, 'normalFont', $pCenter);
        }
        $container->addTextBreak(4);
        $container->addText($name, 'headerFont', $pCenter);
        $container->addText('NIP. ' . ($nip ?: '-'), 'normalFont', $pCenter);
    }

    private function addReceiptPage(PhpWord $phpWord, Report $report): void
    {
        // SECTION baru -> Halaman 3 (pakai margin global 0.5")
        $section = $this->createSection($phpWord);

        $total     = $this->calculateTotal($report);
        $terbilang = IndonesianNumberFormatter::toWords((int) round($total));

        // Meta header kiri+kanan (full width) TANPA BORDER
        $noBorderTableStyle = [
            'borderSize' => 0,
            'borderColor' => 'FFFFFF',
            'insideHBorderSize' => 0,
            'insideVBorderSize' => 0,
            'cellMargin' => 0,
            'width' => 100 * 50,
            'unit' => TblWidth::PERCENT,
        ];
        $noBorderCellStyle = [
            'borderSize' => 0,
            'borderColor' => 'FFFFFF',
            'valign' => 'top',
        ];
        $meta = $section->addTable($noBorderTableStyle);
        $meta->addRow();

        // Kiri
        $leftCell = $meta->addCell(6000, $noBorderCellStyle);
        $leftCell->addText('BADAN KARANTINA INDONESIA', ['bold' => true]);
        $leftCell->addText('PUSAT DATA DAN SISTEM INFORMASI', ['bold' => true]);
        $leftCell->addText('JL. MH Thamrin No. 8');
        $leftCell->addText('JAKARTA PUSAT');

        // Kanan
        $metaRightCell = $meta->addCell(3000, $noBorderCellStyle);
        $metaRightTable = $metaRightCell->addTable([
            'borderSize' => 6,
            'borderColor' => '000000',
            'cellMargin' => 30,
            'width' => 100 * 50,
            'unit' => TblWidth::PERCENT,
        ]);

        // NBK row
        $metaRightTable->addRow();
        $metaRightTable->addCell(1200, ['borderSize' => 6, 'borderColor' => '000000'])->addText('NBK');
        $metaRightTable->addCell(200, ['borderSize' => 0, 'borderColor' => '000000'])->addText(':');
        $metaRightTable->addCell(1600, ['borderSize' => 0, 'borderColor' => '000000'])->addText('');

        // TGL row
        $metaRightTable->addRow();
        $metaRightTable->addCell(1200, ['borderSize' => 6, 'borderColor' => '000000'])->addText('TGL');
        $metaRightTable->addCell(200, ['borderSize' => 0, 'borderColor' => '000000'])->addText(':');
        $metaRightTable->addCell(1600, ['borderSize' => 0, 'borderColor' => '000000'])->addText(Carbon::parse($report->departure_date ?? now())->format('d F Y'));

        // MAK row
        $metaRightTable->addRow();
        $metaRightTable->addCell(1200, ['borderSize' => 6, 'borderColor' => '000000'])->addText('MAK');
        $metaRightTable->addCell(200, ['borderSize' => 0, 'borderColor' => '000000'])->addText(':');
        $metaRightTable->addCell(1600, ['borderSize' => 0, 'borderColor' => '000000'])->addText('');

        // Tahun row
        $metaRightTable->addRow();
        $metaRightTable->addCell(1200, ['borderSize' => 6, 'borderColor' => '000000'])->addText('Tahun');
        $metaRightTable->addCell(200, ['borderSize' => 0, 'borderColor' => '000000'])->addText(':');
        $metaRightTable->addCell(1600, ['borderSize' => 0, 'borderColor' => '000000'])->addText(Carbon::parse($report->return_date ?? now())->format('Y'));

        $section->addTextBreak(1);

        // Judul
        $section->addText('K W I T A N S I', ['bold' => true, 'size' => 14], [
            'alignment' => Jc::CENTER,
            'spaceAfter' => 160
        ]);

        // Isi kwitansi
        $table = $section->addTable([
            'borderSize' => 0,
            'borderColor' => 'FFFFFF',
            'insideHBorderSize' => 0,
            'insideVBorderSize' => 0,
            'cellMargin' => 0,
            'width' => 100 * 50,
            'unit' => TblWidth::PERCENT,
            'borderSize' => 0,
            'cellMargin' => 80,
            'width' => 100 * 50,
            'unit' => TblWidth::PERCENT,
        ]);
        $table->addRow();
        $table->addCell(3000)->addText('Sudah terima dari');
        $table->addCell(300)->addText(':');
        $table->addCell(5700)->addText('Pejabat Pembuat Komitmen Pusat Data dan Sistem Informasi');
        $table->addRow();
        $table->addCell(3000)->addText('Uang sebesar');
        $table->addCell(300)->addText(':');
        $table->addCell(5700)->addText('Rp. ' . number_format($total, 0, ',', '.') . ',-');
        $table->addRow();
        $table->addCell(3000)->addText('');
        $table->addCell(300)->addText('');
        $table->addCell(5700)->addText('(' . $terbilang . ')');
        $table->addRow();
        $table->addCell(3000)->addText('Guna pembayaran');
        $table->addCell(300)->addText(':');
        $table->addCell(5700)->addText('Ongkos perjalanan dinas menurut');
        $table->addRow();
        $table->addCell(3000)->addText('Surat Perintah Perjalanan Dinas dari');
        $table->addCell(300)->addText(':');
        $table->addCell(5700)->addText('Pusat Data dan Sistem Informasi');
        $table->addRow();
        $table->addCell(3000)->addText('Tanggal');
        $table->addCell(300)->addText(':');
        $table->addCell(5700)->addText(Carbon::parse($report->departure_date ?? now())->format('d F Y'));
        $table->addRow();
        $table->addCell(3000)->addText('Untuk perjalanan dinas dari');
        $table->addCell(300)->addText(':');
        $table->addCell(5700)->addText(($report->assignment?->origin ?? 'Jakarta') . '    Ke    ' . ($report->destination_city ?? '-'));
        $table->addRow();
        $table->addCell(3000)->addText('Jumlah');
        $table->addCell(300)->addText(':');
        $table->addCell(5700)->addText('Rp. ' . number_format($total, 0, ',', '.') . ',-');

        $section->addTextBreak(1);

        // Signature 3 kolom, 2 baris: (1) label jabatan, (2) nama+NIP
        $sig = $section->addTable([
            'borderSize' => 0,
            'borderColor' => 'FFFFFF',
            'insideHBorderSize' => 0,
            'insideVBorderSize' => 0,
            'cellMargin' => 40,
            'width' => 100 * 50,
            'unit' => TblWidth::PERCENT,
        ]);

        // ------- Baris 1: Label/Jabatan -------
        $sig->addRow();

        // cell style & paragraph style agar rapi tengah
        $cellStyle = ['valign' => 'top'];
        $pCenter   = ['alignment' => Jc::CENTER];

        // Kolom 1: PPK
        $c1 = $sig->addCell(3000, $cellStyle);
        $c1->addText('Setuju dibayar', 'normalFont', $pCenter);
        $c1->addText('Pejabat Pembuat Komitmen', 'normalFont', $pCenter);
        $c1->addText('Pusat Data dan Sistem Informasi KHIT', 'normalFont', $pCenter);
        // ruang tanda tangan, tetap 1 baris tabel (line break di dalam sel)
        $c1->addTextBreak(4);

        // Kolom 2: Bendahara Pengeluaran
        $c2 = $sig->addCell(3000, $cellStyle);
        $c2->addText('Bendahara Pengeluaran', 'normalFont', $pCenter);
        $c2->addTextBreak(5);

        // Kolom 3: Yang Bepergian + tanggal
        $c3 = $sig->addCell(3000, $cellStyle);
        $c3->addText('Jakarta, ' . Carbon::parse($report->return_date ?? now())->format('d F Y'), 'normalFont', $pCenter);
        $c3->addText('Yang Bepergian', 'normalFont', $pCenter);
        $c3->addTextBreak(4);

        // ------- Baris 2: Nama + NIP (masing-masing kolom) -------
        // Nilai contoh sesuai permintaan; silakan ambil dari DB jika tersedia
        // Ambil user dengan role 'verificator' menggunakan Spatie
        $verifikator = User::role('verificator')->first();
        $verifikatorName = $verifikator?->name ?? '-';
        $verifikatorNip  = $verifikator?->nip ?? '-';

        $bendaharaName = 'Budhi Hari Santoso';
        $bendaharaNip  = '19710107200003100'; // sesuai contoh Anda

        $pegawaiName = $report->user->name ?? '-';
        $pegawaiNip  = $report->user->nip  ?? '-';

        $sig->addRow();

        // Kolom 1: Verifikator
        $nc1 = $sig->addCell(3000, $cellStyle);
        $nc1->addText($verifikatorName, ['bold' => true, 'underline' => 'single'], $pCenter);
        $nc1->addText('NIP. ' . $verifikatorNip, 'normalFont', $pCenter);

        // Kolom 2: Bendahara
        $nc2 = $sig->addCell(3000, $cellStyle);
        $nc2->addText($bendaharaName, ['bold' => true, 'underline' => 'single'], $pCenter);
        $nc2->addText('NIP. ' . $bendaharaNip, 'normalFont', $pCenter);

        // Kolom 3: Yang Bepergian
        $nc3 = $sig->addCell(3000, $cellStyle);
        $nc3->addText($pegawaiName, ['bold' => true, 'underline' => 'single'], $pCenter);
        $nc3->addText('NIP. ' . $pegawaiNip, 'normalFont', $pCenter);
    }
}
