# Struktur Tabel Travel Reports

## Deskripsi
Tabel `travel_reports` digunakan untuk menyimpan laporan perjalanan dinas dengan struktur yang mengikuti format standar laporan perjalanan dinas.

## Struktur Kolom

### Primary Key
- `id` - Primary key auto increment

### Foreign Keys
- `report_id` - Referensi ke tabel `reports` (cascade delete)

### A. PENDAHULUAN
1. **Latar Belakang** (`background`)
   - Deskripsi latar belakang mengapa perjalanan dinas dilaksanakan
   - Tipe: TEXT, nullable

2. **Maksud dan Tujuan** (`purpose_and_objectives`)
   - Penjelasan maksud dan tujuan perjalanan dinas
   - Tipe: TEXT, nullable

3. **Ruang Lingkup** (`scope`)
   - Batasan dan ruang lingkup kegiatan yang dilaksanakan
   - Tipe: TEXT, nullable

4. **Dasar Pelaksanaan** (`legal_basis`)
   - Dasar hukum atau peraturan yang menjadi landasan pelaksanaan
   - Tipe: TEXT, nullable

### B. KEGIATAN YANG DILAKSANAKAN
1. **Deskripsi Kegiatan** (`activities_conducted`)
   - Ringkasan kegiatan yang dilaksanakan
   - Tipe: TEXT, nullable

2. **Detail Kegiatan** (`activity_details`)
   - Detail pelaksanaan setiap kegiatan
   - Tipe: TEXT, nullable

3. **Catatan Rapat** (`meeting_notes`)
   - Catatan dari rapat atau pertemuan yang dihadiri
   - Tipe: TEXT, nullable

4. **Kunjungan Lapangan** (`site_visits`)
   - Deskripsi kunjungan lapangan yang dilakukan
   - Tipe: TEXT, nullable

5. **Aktivitas Koordinasi** (`coordination_activities`)
   - Kegiatan koordinasi yang dilakukan
   - Tipe: TEXT, nullable

### C. HASIL YANG DICAPAI
1. **Pencapaian** (`achievements`)
   - Hasil yang berhasil dicapai dari perjalanan dinas
   - Tipe: TEXT, nullable

2. **Output** (`outputs`)
   - Output atau produk yang dihasilkan
   - Tipe: TEXT, nullable

3. **Manfaat** (`benefits`)
   - Manfaat yang diperoleh dari perjalanan dinas
   - Tipe: TEXT, nullable

4. **Tindak Lanjut** (`follow_up_actions`)
   - Tindak lanjut yang diperlukan setelah perjalanan dinas
   - Tipe: TEXT, nullable

### D. KESIMPULAN DAN SARAN
1. **Kesimpulan** (`conclusions`)
   - Kesimpulan dari perjalanan dinas
   - Tipe: TEXT, nullable

2. **Rekomendasi** (`recommendations`)
   - Saran dan rekomendasi untuk perbaikan
   - Tipe: TEXT, nullable

3. **Pelajaran** (`lessons_learned`)
   - Pelajaran yang diperoleh dari perjalanan dinas
   - Tipe: TEXT, nullable

### Informasi Tambahan
- **Catatan Tambahan** (`additional_notes`) - Catatan lain yang diperlukan
- **Lampiran** (`attachments`) - JSON array untuk menyimpan daftar file lampiran

### Status dan Metadata
- **Status** (`status`) - Enum: draft, submitted, reviewed, approved, rejected
- **Waktu Submit** (`submitted_at`) - Timestamp kapan laporan disubmit
- **Waktu Review** (`reviewed_at`) - Timestamp kapan laporan direview
- **Reviewer** (`reviewed_by`) - Foreign key ke user yang melakukan review

## Relasi
- `belongsTo(Report::class)` - Setiap travel report terkait dengan satu report
- `belongsTo(User::class, 'reviewed_by')` - Setiap travel report dapat direview oleh satu user

## Scopes
- `scopeSubmitted()` - Filter laporan yang sudah disubmit
- `scopeApproved()` - Filter laporan yang sudah diapprove
- `scopeDraft()` - Filter laporan yang masih draft

## Methods
- `isSubmitted()` - Check apakah laporan sudah disubmit
- `isApproved()` - Check apakah laporan sudah diapprove
- `isDraft()` - Check apakah laporan masih draft

## Indexes
- `report_id, status` - Composite index untuk query berdasarkan report dan status
- `submitted_at` - Index untuk query berdasarkan waktu submit

## Contoh Penggunaan

```php
// Membuat travel report baru
$travelReport = TravelReport::create([
    'report_id' => $report->id,
    'background' => 'Latar belakang perjalanan dinas...',
    'purpose_and_objectives' => 'Maksud dan tujuan...',
    'status' => 'draft'
]);

// Query laporan yang sudah disubmit
$submittedReports = TravelReport::submitted()->get();

// Check status laporan
if ($travelReport->isApproved()) {
    // Lakukan sesuatu
}
```
