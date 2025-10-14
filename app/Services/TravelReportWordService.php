<?php

namespace App\Services;

use App\Models\Report;
use Carbon\Carbon;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Shared\Converter;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\Style\ListItem as ListItemStyle;

/**
 * TravelReportWordService
 *
 * Fitur utama:
 * - Halaman A4 (portrait), margin 0.5"
 * - Header instansi + garis bawah tebal
 * - Parser konten HTML ringan: <p>, <br>, <ul>, <ol>, <li> (nested),
 *   plus fallback "markdown-like" untuk baris awalan "- " sebagai bullet.
 * - List ordered (<ol>) selalu TYPE_NUMBER; unordered (<ul>) TYPE_BULLET_FILLED.
 * - List item kompleks pakai addListItemRun() agar bold/italic/underline tetap hidup.
 * - Toleran ke HTML "mentah" dari DB.
 */
class TravelReportWordService
{
    public function generate(Report $report): string
    {
        $phpWord = new PhpWord();

        // Doc props
        $properties = $phpWord->getDocInfo();
        $properties->setCreator('E-Perjadin System');
        $properties->setTitle('Laporan Perjadin');
        $properties->setSubject('Laporan Hasil Kegiatan Perjalanan Dinas');

        $this->addStyles($phpWord);

        // SECTION: A4 portrait, margin 0.5 inch
        $section = $phpWord->addSection([
            'pageSizeW'    => Converter::cmToTwip(21.0),
            'pageSizeH'    => Converter::cmToTwip(29.7),
            'marginTop'    => Converter::inchToTwip(1),
            'marginRight'  => Converter::inchToTwip(1),
            'marginBottom' => Converter::inchToTwip(1),
            'marginLeft'   => Converter::inchToTwip(1),
        ]);

        // HEADER RESMI
        $this->addTravelHeader($section);

        // Judul utama dari DB (fallback default)
        $title = trim((string)($report->travelReport?->title ?: 'LAPORAN HASIL KEGIATAN'));
        $section->addText(
            mb_strtoupper($title, 'UTF-8'),
            ['size' => 12, 'bold' => true],
            ['alignment' => Jc::CENTER, 'spaceAfter' => 200, 'spaceBefore' => 200]
        );

        // ====== A. PENDAHULUAN ======
        $section->addText('A. PENDAHULUAN', ['bold' => true], ['spaceAfter' => 100]);

        $section->addText('1. Latar Belakang', ['bold' => true], ['indentation' => ['left' => 360]]);
        $this->addSmartBlock($section, $report->travelReport?->background ?: '-', 120, 600);

        $section->addText('2. Maksud dan Tujuan', ['bold' => true], ['indentation' => ['left' => 360]]);
        // Konten di kolom "purpose_and_objectives" sering kombinasi teks & list
        $this->addSmartBlock($section, $report->travelReport?->purpose_and_objectives ?: '-', 160, 600);

        // ====== B. RUANG LINGKUP ======
        $section->addText('B. RUANG LINGKUP', ['bold' => true], ['spaceBefore' => 100]);
        $this->addSmartBlock($section, $report->travelReport?->scope ?: '-', 160, 240);

        // ====== C. DASAR PELAKSANAAN / DASAR HUKUM ======
        $section->addText('C. DASAR PELAKSANAAN', ['bold' => true]);
        $this->addSmartBlock($section, $report->travelReport?->legal_basis ?: '-', 160, 240);

        // ====== D. KEGIATAN YANG DILAKSANAKAN ======
        $section->addText('D. KEGIATAN YANG DILAKSANAKAN', ['bold' => true], ['spaceBefore' => 100]);
        $this->addSmartBlock($section, $report->travelReport?->activities_conducted ?: '-', 160, 240);

        // ====== E. HASIL YANG DICAPAI ======
        $section->addText('E. HASIL YANG DICAPAI', ['bold' => true]);
        $this->addSmartBlock($section, $report->travelReport?->achievements ?: '-', 160, 240);

        // ====== F. KESIMPULAN DAN SARAN ======
        $section->addText('F. KESIMPULAN DAN SARAN', ['bold' => true]);
        $this->addSmartBlock($section, $report->travelReport?->conclusions ?: '-', 200, 240);

        // ====== DOKUMENTASI (opsional) ======
        $this->addAssignmentEmployeelSection($section, $report);
        $this->addDocumentationSection($section, $report);

        // Penutup (lokasi, tanggal, pelaksana)
        $city = $report->destination_city ?: '-';
        $dateText = Carbon::parse($report->return_date ?: now())->translatedFormat('d F Y');

        $textrun = $section->addTextRun(['alignment' => Jc::LEFT, 'spaceBefore' => 120]);
        $textrun->addText("Dibuat di     : {$city}\n");
        $textrun->addText("Tanggal       : {$dateText}\n");
        $textrun->addText('Pelaksana     : ' . ($report->user?->name ?: '-'));

        // Save ke file temporary
        $tempFile = tempnam(sys_get_temp_dir(), 'travel_report_');
        $writer = IOFactory::createWriter($phpWord, 'Word2007');
        $writer->save($tempFile);
        return $tempFile;
    }

    private function addStyles(PhpWord $phpWord): void
    {
        // Default isi = 11
        $phpWord->setDefaultFontName('Arial');
        $phpWord->setDefaultFontSize(11);

        // Hemat spasi
        $phpWord->setDefaultParagraphStyle([
            'spaceAfter'   => 0,
            'spaceBefore'  => 0,
            'lineHeight'   => 1.15,
            'widowControl' => true,
        ]);

        // Gaya kecil untuk header alamat
        $phpWord->addFontStyle('HeaderBig',   ['name' => 'Arial', 'size' => 16, 'bold' => true]);
        $phpWord->addFontStyle('HeaderMid',   ['name' => 'Arial', 'size' => 12, 'bold' => true]);
        $phpWord->addFontStyle('HeaderSmall', ['name' => 'Arial', 'size' => 7]);
    }

    /**
     * Header: logo kiri, teks tengah, garis bawah tebal.
     */
    private function addTravelHeader($section): void
    {
        $table = $section->addTable([
            'borderSize'  => 0,
            'borderColor' => 'FFFFFF',
            'cellMargin'  => 0,
            'alignment'   => Jc::START, // left align table
        ]);

        $table->addRow();

        // Kiri: logo, full height, left aligned
        $logoCell = $table->addCell(1000, ['alignment' => Jc::START, 'valign' => 'top']);
        $logoPath = public_path('logo.png');
        if (is_string($logoPath) && file_exists($logoPath)) {
            $logoCell->addImage($logoPath, [
                'width'         => 90,
                'height'        => 90,
                'alignment'     => Jc::START,
                'wrappingStyle' => 'inline',
                'marginTop'     => 0,
                'marginLeft'    => 0,
            ]);
        } else {
            $logoCell->addText('');
        }

        // Kanan: blok teks header
        $textCell = $table->addCell(8000, ['alignment' => Jc::CENTER, 'valign' => 'top']);
        $textCell->addText('SEKRETARIAT', 'HeaderBig', ['alignment' => Jc::CENTER]);
        $textCell->addText('DINAS KESEHATAN', 'HeaderMid', ['alignment' => Jc::CENTER]);
        $textCell->addText('KABUPATEN KAMPAR', 'HeaderMid', ['alignment' => Jc::CENTER]);

        $textCell->addText(
            'JL Dr. A.Rahman Saleh No.01,' .
                ' Bangkinang',
            'HeaderSmall',
            ['alignment' => Jc::CENTER]
        );
        $textCell->addText('www.karantinaindonesia.go.id', 'HeaderSmall', ['alignment' => Jc::CENTER]);
        $textCell->addText('pdsi@karantinaindonesia.go.id', 'HeaderSmall', ['alignment' => Jc::CENTER]);

        // Garis bawah
        $section->addText('', [], [
            'borderBottomSize'  => 12,
            'borderBottomColor' => '000000',
            'spaceAfter'        => 0,
        ]);
    }

    /**
     * addSmartBlock: terima konten "apapun" dari DB.
     * - Jika mendeteksi tag HTML: parse via addHtmlAware()
     * - Jika plain text: pecah paragraf dan deteksi baris "- " sebagai bullet.
     */
    private function addSmartBlock($section, ?string $raw, int $spaceAfterTwip = 0, int $leftIndentTwip = 0): void
    {
        $text = trim((string)$raw);

        if ($text === '') {
            $section->addText('-', [], [
                'alignment'   => Jc::BOTH,
                'indentation' => ['left' => $leftIndentTwip],
            ]);
            if ($spaceAfterTwip > 0) $section->addTextBreak();
            return;
        }

        // Jika ada tag HTML umum → gunakan parser HTML
        if (preg_match('/<(ol|ul|li|p|br|strong|em|b|i|u)\b/i', $text)) {
            $this->addHtmlAware($section, $text, $spaceAfterTwip, $leftIndentTwip);
            return;
        }

        // ========= Plain text handling (tanpa HTML) =========
        // Normalisasi: pecah menjadi baris-baris logis
        [$lines, $context] = $this->normalizeToLines($text);

        // 1) Jika mayoritas baris match pola angka "1." → ordered
        $numberedCount = 0;
        foreach ($lines as $ln) {
            if (preg_match('/^\s*\d+[\.\)]\s+.+/u', $ln)) $numberedCount++;
        }
        $isNumberedList = $numberedCount >= max(1, floor(count($lines) * 0.5));

        // 2) Jika tidak jelas, tapi konteks mengandung "meliputi:" atau header "Tujuan:" → ordered
        if (!$isNumberedList && ($context['hasMeliputi'] || $context['hasTujuanHeader'])) {
            $isNumberedList = true;
        }

        // 3) Jika tidak numbered, cek bullet count
        $bulletCount = 0;
        foreach ($lines as $ln) {
            if (preg_match('/^\s*[•●▪‣‒–—\-]\s+.+/u', $ln)) $bulletCount++;
        }

        if ($isNumberedList) {
            // Render sebagai list numbering
            foreach ($lines as $ln) {
                $ln = trim($ln);
                if ($ln === '') continue;

                // Buang prefix angka "1." bila ada (Word akan kasih numbering)
                $item = preg_replace('/^\s*\d+[\.\)]\s+/u', '', $ln);
                // Atau jika bullet char dipakai tapi konteks ordered, buang bullet
                $item = preg_replace('/^\s*[•●▪‣‒–—\-]\s+/u', '', $item);

                $section->addListItem($item, 0, null, \PhpOffice\PhpWord\Style\ListItem::TYPE_NUMBER, [
                    'indentation' => ['left' => $leftIndentTwip],
                ]);
            }
            if ($spaceAfterTwip > 0) $section->addTextBreak();
            return;
        }

        if ($bulletCount >= max(1, floor(count($lines) * 0.4))) {
            // Render sebagai bullet list
            foreach ($lines as $ln) {
                $ln = trim($ln);
                if ($ln === '') continue;

                $item = preg_replace('/^\s*[•●▪‣‒–—\-]\s+/u', '', $ln);
                $section->addListItem($item, 0, null, \PhpOffice\PhpWord\Style\ListItem::TYPE_BULLET_FILLED, [
                    'indentation' => ['left' => $leftIndentTwip],
                ]);
            }
            if ($spaceAfterTwip > 0) $section->addTextBreak();
            return;
        }

        // Default: render paragraf biasa
        foreach ($lines as $ln) {
            $ln = trim($ln);
            if ($ln === '') continue;
            $section->addText($ln, [], [
                'alignment'   => Jc::BOTH,
                'indentation' => ['left' => $leftIndentTwip],
            ]);
        }
        if ($spaceAfterTwip > 0) $section->addTextBreak();
    }

    // TAMBAHKAN helper ini ke dalam class
    private function normalizeToLines(string $text): array
    {
        // Rapikan spasi ganjil & bullet karakter umum (termasuk '' U+2022 variasi)
        $t = $text;

        // Pastikan ada newline setelah tanda ':' yang jadi “pembuka list”
        // Contoh: "meliputi:Penyusunan ..." → "meliputi:\nPenyusunan ..."
        $t = preg_replace('/:\s*/u', ":\n", $t);

        // Ubah bullet berupa karakter spesial jadi newline + bullet standar
        // '•' U+2022, '' U+25CF (kadang copy-paste), '●' U+25CF, '▪' U+25AA, '‣' U+2023, '–' dash
        $t = preg_replace('/[•●▪‣]\s*/u', "\n• ", $t);
        // Kadang bullet nempel tanpa spasi: "Strategi" → "\n• Strategi"
        $t = preg_replace('/[•●▪‣]/u', "\n• ", $t);

        // Pastikan angka diikuti spasi jadi baris sendiri: "1.Teks" → "\n1. Teks"
        $t = preg_replace('/(\d+[\.\)])\s*/u', "\n$1 ", $t);

        // Pecah menjadi baris
        $rawLines = preg_split("/\r\n|\r|\n/u", $t);

        // Trim tiap baris & hilangkan baris kosong beruntun
        $lines = [];
        foreach ($rawLines as $ln) {
            $ln = trim($ln);
            if ($ln === '') continue;
            $lines[] = $ln;
        }

        // Deteksi konteks untuk heuristik
        $joined = mb_strtolower($text, 'UTF-8');
        $context = [
            'hasMeliputi'      => (bool)preg_match('/meliputi\s*:/u', $joined),
            'hasTujuanHeader'  => (bool)preg_match('/^tujuan\s*:|[\n\r]tujuan\s*:/u', $joined),
        ];

        return [$lines, $context];
    }

    /**
     * Parser HTML ringan untuk <p>, <br>, <ul>, <ol>, <li> (nested).
     * Ordered list (<ol>) → TYPE_NUMBER; Unordered list (<ul>) → TYPE_BULLET_FILLED.
     *
     * @param \PhpOffice\PhpWord\Element\Section|\PhpOffice\PhpWord\Element\TableCell $section
     */
    private function addHtmlAware($section, ?string $rawHtml, int $spaceAfterTwip = 0, int $leftIndentTwip = 0): void
    {
        $safe = trim((string)$rawHtml);
        if ($safe === '') {
            $section->addText('-', [], [
                'alignment'   => Jc::BOTH,
                'indentation' => ['left' => $leftIndentTwip],
            ]);
            if ($spaceAfterTwip > 0) $section->addTextBreak();
            return;
        }

        $html = '<div>' . $safe . '</div>';

        $dom  = new \DOMDocument('1.0', 'UTF-8');
        $prev = libxml_use_internal_errors(true);
        $dom->loadHTML(
            mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'),
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
        );
        libxml_clear_errors();
        libxml_use_internal_errors($prev);

        $root = $dom->documentElement;
        if (!$root) {
            $this->addPlainTextBlock($section, strip_tags($safe), $spaceAfterTwip, $leftIndentTwip);
            return;
        }

        foreach ($root->childNodes as $child) {
            $this->renderNode($section, $child, 0, $leftIndentTwip);
        }

        if ($spaceAfterTwip > 0) $section->addTextBreak();
    }

    /**
     * Render node DOM: p, br, ul, ol, li, text.
     *
     * @param \PhpOffice\PhpWord\Element\Section|\PhpOffice\PhpWord\Element\TableCell $container
     */
    private function renderNode($container, \DOMNode $node, int $listDepth, int $leftIndentTwip): void
    {
        if ($node->nodeType === XML_TEXT_NODE) {
            $text = trim(preg_replace('/\s+/u', ' ', $node->nodeValue ?? ''));
            if ($text !== '') {
                $container->addText($text, [], [
                    'alignment'   => Jc::BOTH,
                    'indentation' => ['left' => $leftIndentTwip],
                ]);
            }
            return;
        }

        if ($node->nodeType !== XML_ELEMENT_NODE) return;

        /** @var \DOMElement $el */
        $el  = $node;
        $tag = strtolower($el->tagName);

        switch ($tag) {
            case 'br':
                $container->addTextBreak();
                break;

            case 'p':
                $text = trim(preg_replace('/\s+/u', ' ', $el->textContent ?? ''));
                if ($text !== '') {
                    $container->addText($text, [], [
                        'alignment'   => Jc::BOTH,
                        'indentation' => ['left' => $leftIndentTwip],
                    ]);
                }
                break;

            case 'ul':
            case 'ol':
                $ordered = ($tag === 'ol');
                foreach ($el->childNodes as $li) {
                    if ($li instanceof \DOMElement && strtolower($li->tagName) === 'li') {
                        $this->renderListItem($container, $li, $listDepth, $ordered, $leftIndentTwip);
                    }
                }
                break;

            case 'li':
                $this->renderListItem($container, $el, $listDepth, false, $leftIndentTwip);
                break;

            default:
                foreach ($el->childNodes as $child) {
                    $this->renderNode($container, $child, $listDepth, $leftIndentTwip);
                }
                break;
        }
    }

    /**
     * Render satu item list menggunakan addListItemRun (preserve inline style).
     *
     * @param \PhpOffice\PhpWord\Element\Section|\PhpOffice\PhpWord\Element\TableCell $container
     */
    private function renderListItem($container, \DOMElement $li, int $depth, bool $ordered, int $leftIndentTwip): void
    {
        $listType = $ordered ? ListItemStyle::TYPE_NUMBER : ListItemStyle::TYPE_BULLET_FILLED;

        // Run utama untuk isi <li> (sebelum nested list)
        $itemRun = $container->addListItemRun(
            $depth,
            $listType,
            ['indentation' => ['left' => $leftIndentTwip]]
        );

        $hasNonListContent = false;

        // Render inline anak <li> HANYA sampai bertemu nested <ul>/<ol>
        foreach ($li->childNodes as $child) {
            if ($child instanceof \DOMElement) {
                $t = strtolower($child->tagName);
                if ($t === 'ul' || $t === 'ol') {
                    break; // nested list: render di bawah (depth+1)
                }
                $this->appendInlineToRun($itemRun, $child, $hasNonListContent);
            } elseif ($child->nodeType === XML_TEXT_NODE) {
                $txt = trim(preg_replace('/\s+/u', ' ', $child->nodeValue ?? ''));
                if ($txt !== '') {
                    $itemRun->addText($txt);
                    $hasNonListContent = true;
                }
            }
        }

        if (!$hasNonListContent) {
            $itemRun->addText('-'); // placeholder agar bullet/numbering tetap terlihat
        }

        // Deteksi paragraf awalan "- " sebagai sub-bullet (depth+1)
        foreach ($li->childNodes as $child) {
            if ($child instanceof \DOMElement && strtolower($child->tagName) === 'p') {
                $raw = trim($child->textContent ?? '');
                if (preg_match('/^\-\s+(.+)/u', $raw, $m)) {
                    $container->addListItem(
                        trim($m[1]),
                        $depth + 1,
                        null,
                        ListItemStyle::TYPE_BULLET_FILLED,
                        ['indentation' => ['left' => $leftIndentTwip]]
                    );
                }
            }
        }

        // Render nested <ul>/<ol> sebagai level berikutnya
        foreach ($li->childNodes as $child) {
            if ($child instanceof \DOMElement) {
                $t = strtolower($child->tagName);
                if ($t === 'ul' || $t === 'ol') {
                    $isOrdered = ($t === 'ol');
                    foreach ($child->childNodes as $subLi) {
                        if ($subLi instanceof \DOMElement && strtolower($subLi->tagName) === 'li') {
                            $this->renderListItem($container, $subLi, $depth + 1, $isOrdered, $leftIndentTwip);
                        }
                    }
                }
            }
        }
    }

    /**
     * Tambahkan node inline (text, span, strong/b, em/i, u, br, p) ke ListItemRun.
     * Menjaga bold/italic/underline.
     */
    private function appendInlineToRun(\PhpOffice\PhpWord\Element\ListItemRun $run, \DOMNode $node, bool &$hasContent): void
    {
        if ($node->nodeType === XML_TEXT_NODE) {
            $txt = trim(preg_replace('/\s+/u', ' ', $node->nodeValue ?? ''));
            if ($txt !== '') {
                $run->addText($txt);
                $hasContent = true;
            }
            return;
        }

        if (!($node instanceof \DOMElement)) return;

        $tag = strtolower($node->tagName);

        if ($tag === 'br') {
            $run->addTextBreak();
            $hasContent = true;
            return;
        }

        // Tag inline yang didukung
        $inlineTags = ['span', 'strong', 'b', 'em', 'i', 'u', 'p'];
        if (in_array($tag, $inlineTags, true)) {
            $isBold = in_array($tag, ['strong', 'b'], true);
            $isItal = in_array($tag, ['em', 'i'], true);
            $isUndl = ($tag === 'u');

            foreach ($node->childNodes as $child) {
                if ($child->nodeType === XML_TEXT_NODE) {
                    $txt = trim(preg_replace('/\s+/u', ' ', $child->nodeValue ?? ''));
                    if ($txt !== '') {
                        $run->addText($txt, [
                            'bold'      => $isBold,
                            'italic'    => $isItal,
                            'underline' => $isUndl ? 'single' : null,
                        ]);
                        $hasContent = true;
                    }
                } elseif ($child instanceof \DOMElement) {
                    $this->appendInlineToRun($run, $child, $hasContent);
                }
            }
            return;
        }

        // Elemen lain: flatten text content
        $txt = trim(preg_replace('/\s+/u', ' ', $node->textContent ?? ''));
        if ($txt !== '') {
            $run->addText($txt);
            $hasContent = true;
        }
    }

    /**
     * Fallback plain text writer.
     */
    private function addPlainTextBlock($section, string $text, int $spaceAfterTwip, int $leftIndentTwip): void
    {
        $lines = preg_split("/\r\n|\r|\n/u", $text);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') continue;
            $section->addText($line, [], [
                'alignment'   => Jc::BOTH,
                'indentation' => ['left' => $leftIndentTwip],
            ]);
        }
        if ($spaceAfterTwip > 0) $section->addTextBreak();
    }

    /**
     * Dokumentasi Kegiatan — TANPA huruf poin. Grid 2 kolom foto.
     */
    private function addAssignmentEmployeelSection($section, Report $report): void
    {
        try {
            if (!$report->relationLoaded('assignment.assignmentEmployees')) {
                $report->load('assignment.assignmentEmployees');
            }

            // Info sebelum dokumentasi
            $city = $report->destination_city ?: '-';
            $dateText = \Carbon\Carbon::parse($report->return_date ?: now())->translatedFormat('d F Y');

            $section->addText("Dibuat di      : {$city}", [], ['spaceBefore' => 160]);
            $section->addText("Tanggal       : {$dateText}");
            $section->addText("Pelaksana     :");

            // List pelaksana (assignment employees)
            if ($report->assignment && $report->assignment->assignmentEmployees && count($report->assignment->assignmentEmployees) > 0) {
                foreach ($report->assignment->assignmentEmployees as $idx => $employee) {
                    $num = $idx + 1;
                    $name = $employee->user->name ?? '-';
                    $section->addText("{$num}. {$name} : ………………………", [], ['spaceAfter' => 600]);
                }
            } else {
                $section->addText('Tidak ada pelaksana yang ditugaskan.');
            }

            $section->addText(''); // Spacer before documentation
        } catch (\Throwable $e) {
            $section->addText('Dokumentasi Kegiatan', ['bold' => true], ['spaceBefore' => 160]);
            $section->addText('Dokumentasi tidak dapat ditampilkan: ' . $e->getMessage(), [], ['spaceAfter' => 200]);
        }
    }

    /**
     * Dokumentasi Kegiatan — TANPA huruf poin. Grid 2 kolom foto.
     */
    private function addDocumentationSection($section, Report $report): void
    {
        try {
            if (!$report->relationLoaded('assignment.assignmentDocumentations')) {
                $report->load('assignment.assignmentDocumentations');
            }

            $section->addText('Dokumentasi Kegiatan', ['bold' => true], ['spaceBefore' => 160, 'spaceAfter' => 120]);

            if (!$report->assignment) {
                $section->addText('Tidak ada assignment terkait.', [], ['spaceAfter' => 200]);
                return;
            }

            $docs = $report->assignment->assignmentDocumentations ?? collect();
            $photoDocs = $docs->filter(function ($doc) {
                $path = storage_path('app/public/' . ($doc->photo ?? ''));
                return $doc->photo && is_string($doc->photo) && file_exists($path);
            });

            if ($photoDocs->isEmpty()) {
                $section->addText('Tidak ada foto dokumentasi yang valid.', [], ['spaceAfter' => 200]);
                return;
            }

            $table = $section->addTable([
                'borderSize'  => 0,
                'borderColor' => 'FFFFFF',
                'cellMargin'  => 0,
                'alignment'   => Jc::CENTER,
            ]);

            $photos = $photoDocs->values()->toArray();
            for ($i = 0; $i < count($photos); $i += 2) {
                $table->addRow();

                $cell1 = $table->addCell(4500, ['valign' => 'center']);
                $this->addFullPhotoToCell($cell1, $photos[$i]);

                $cell2 = $table->addCell(4500, ['valign' => 'center']);
                if (isset($photos[$i + 1])) {
                    $this->addFullPhotoToCell($cell2, $photos[$i + 1]);
                }
            }
        } catch (\Throwable $e) {
            $section->addText('Dokumentasi Kegiatan', ['bold' => true], ['spaceBefore' => 160]);
            $section->addText('Dokumentasi tidak dapat ditampilkan: ' . $e->getMessage(), [], ['spaceAfter' => 200]);
        }
    }

    private function addFullPhotoToCell($cell, $doc): void
    {
        $relative  = is_array($doc) ? ($doc['photo'] ?? '') : ($doc->photo ?? '');
        $photoPath = storage_path('app/public/' . $relative);
        if (!is_string($photoPath) || !file_exists($photoPath)) {
            $cell->addText('Foto tidak ditemukan', [], ['alignment' => Jc::CENTER]);
            return;
        }

        // Make image fill the cell width, height auto (proportional)
        $cell->addImage($photoPath, [
            'width'         => 370, // fill cell width
            // height not set, so aspect ratio is preserved
            'alignment'     => Jc::CENTER,
            'wrappingStyle' => 'inline',
            'marginTop'     => 0,
            'marginLeft'    => 0,
            'marginRight'   => 0,
            'marginBottom'  => 0,
        ]);
    }
}