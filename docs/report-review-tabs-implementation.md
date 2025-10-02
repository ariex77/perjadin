# Implementasi Sistem Tabs Review Laporan

## Deskripsi
Sistem tabs review laporan telah diimplementasikan dengan 3 kategori status review sesuai permintaan:

### 1. **Ditinjau** (Status Default)
- **Arti**: Laporan belum ditolak atau belum disetujui
- **Kondisi**: 
  - Belum ada reports sama sekali
  - Ada reports tapi belum ada reviews
  - Ada reviews tapi belum 2 approved dan tidak ada rejected

### 2. **Disetujui**
- **Arti**: Laporan disetujui oleh 2 reviewer (PPK + Pimpinan)
- **Kondisi**: Ada minimal 2 review dengan status 'approved'

### 3. **Ditolak**
- **Arti**: Laporan ditolak oleh salah satu reviewer
- **Kondisi**: Ada minimal 1 review dengan status 'rejected'

## Implementasi Backend

### Controller (`app/Http/Controllers/Reports/ReportController.php`)
- Method `index()` diupdate untuk menghitung total setiap status
- Filter query berdasarkan status review
- Mengirim data totals ke frontend

### Resource (`app/Http/Resources/Reports/AssignmentResource.php`)
- Menambahkan properti `review_status` ke response
- Logika penentuan status review berdasarkan reviews yang ada

## Implementasi Frontend

### Halaman (`resources/js/pages/reports/index.tsx`)
- 3 tabs dengan icon dan badge count
- Tabs: Ditinjau, Disetujui, Ditolak
- Warna berbeda untuk setiap status

### Columns (`resources/js/components/sections/reports/columns.tsx`)
- Kolom "Status Review" baru
- Badge dengan warna dan icon sesuai status
- Format: ✓ Disetujui, ✗ Ditolak, ⏳ Ditinjau

### Types (`resources/js/types/assignments/assignment.ts`)
- Menambahkan `review_status?: 'ditinjau' | 'disetujui' | 'ditolak'`

## Logika Status Review

```php
// Di AssignmentResource
if ($allReviews->count() > 0) {
    $hasRejected = $allReviews->contains('status', 'rejected');
    $approvedCount = $allReviews->where('status', 'approved')->count();
    
    if ($hasRejected) {
        $data['review_status'] = 'ditolak';
    } elseif ($approvedCount >= 2) { // PPK + Pimpinan = 2 reviewer
        $data['review_status'] = 'disetujui';
    }
    // Jika belum 2 approved dan tidak ada rejected = tetap 'ditinjau'
}
```

## Fitur yang Tersedia

1. **Filter Otomatis**: Data difilter berdasarkan tab yang dipilih
2. **Counter Badge**: Menampilkan jumlah item di setiap tab
3. **Visual Indicator**: Warna dan icon berbeda untuk setiap status
4. **Persistent State**: Status tab tersimpan saat navigasi
5. **Search Integration**: Search tetap berfungsi di semua tab

## Penggunaan

1. Buka halaman `/reports`
2. Pilih tab sesuai status yang ingin dilihat
3. Data akan otomatis difilter
4. Counter badge menunjukkan jumlah item di setiap kategori
5. Kolom "Status Review" menampilkan status visual

## Catatan Teknis

- Status default adalah "ditinjau"
- Logika review mempertimbangkan 2 reviewer (PPK + Pimpinan)
- Sistem mendukung role-based access control
- Search dan pagination tetap berfungsi di semua tab
