# Utilities & Hooks Overview

Dokumen ini menjelaskan semua utility functions dan hooks yang tersedia untuk konsistensi di seluruh aplikasi.

## 📁 **File Utils (`/lib/utils/`)**

### **Initials Utils (`initials.ts`)**
```typescript
import { getInitials, getAllInitials, getInitialsWithFallback } from '@/lib/utils/initials';
```

**Fungsi:**
- `getInitials(name, maxLength?)` - Inisial pertama dan terakhir
- `getAllInitials(name, maxLength?)` - Inisial semua kata
- `getInitialsWithFallback(name, fallback?, maxLength?)` - Dengan fallback kustom

**Contoh:**
```typescript
getInitials("John Doe") // "JD"
getAllInitials("Ahmad Fauzi Rahman") // "AFR"
getInitialsWithFallback(null, "—") // "—"
```

### **File Utils (`file.ts`)**
```typescript
import { 
  getFileUrl, 
  getUserPhotoUrl, 
  getReportFileUrl,
  fileExists,
  getFileName,
  getFileExtension,
  isImageFile,
  isPdfFile,
  formatFileSize 
} from '@/lib/utils/file';
```

**Fungsi:**
- `getFileUrl(path, fallback?)` - URL lengkap untuk file
- `getUserPhotoUrl(photoPath)` - URL foto user
- `getReportFileUrl(filePath)` - URL file laporan
- `fileExists(path)` - Cek keberadaan file
- `getFileName(path)` - Nama file dari path
- `getFileExtension(path)` - Ekstensi file
- `isImageFile(path)` - Cek apakah file gambar
- `isPdfFile(path)` - Cek apakah file PDF
- `formatFileSize(bytes)` - Format ukuran file

**Contoh:**
```typescript
getFileUrl("images/employees/user-123.jpg") // "http://localhost/storage/images/employees/user-123.jpg"
isImageFile("photo.jpg") // true
formatFileSize(1024) // "1 KB"
```

### **General Utils (`utils.ts`)**
```typescript
import { cn, formatCurrencyIDR, type CurrencyFormatOptions } from '@/lib/utils';
```

**Fungsi:**
- `cn(...inputs)` - Class name merger (clsx + tailwind-merge)
- `formatCurrencyIDR(amount, options?)` - Format mata uang IDR

**Contoh:**
```typescript
cn("text-red-500", "bg-blue-500") // "text-red-500 bg-blue-500"
formatCurrencyIDR(1000000) // "Rp 1.000.000"
```

## 🎣 **Hooks (`/hooks/`)**

### **Auth Hook (`use-auth.tsx`)**
```typescript
import { useAuth } from '@/hooks/use-auth';
```

**Fungsi:**
- `isSuperadmin` - Cek apakah user superadmin
- `isAdmin` - Cek apakah user admin
- `isRegularUser` - Cek apakah user regular
- `hasRole(role)` - Cek role tertentu

### **Confirmation Hook (`use-confirmation.tsx`)**
```typescript
import { useConfirmation } from '@/hooks/use-confirmation';
```

**Fungsi:**
- `confirm(options)` - Confirmation dialog kustom
- `confirmDelete(itemName?)` - Konfirmasi hapus
- `confirmUpdate(itemName?)` - Konfirmasi update
- `confirmAction(action, itemName?)` - Konfirmasi aksi kustom

**Contoh:**
```typescript
const { confirmDelete } = useConfirmation();

const handleDelete = async () => {
  const confirmed = await confirmDelete('pegawai');
  if (confirmed) {
    // Proses hapus
  }
};
```

### **Navigation Hook (`use-navigation.tsx`)**
```typescript
import { useNavigation } from '@/hooks/use-navigation';
```

**Fungsi:**
- `navigate(routeName, params?, options?)` - Navigasi dengan options
- `navigateTo(routeName, params?)` - Navigasi langsung
- `navigateToCreate(routeName)` - Navigasi ke halaman create
- `navigateToEdit(routeName, id)` - Navigasi ke halaman edit
- `navigateToShow(routeName, id)` - Navigasi ke halaman show
- `navigateToIndex(routeName, query?)` - Navigasi ke halaman index
- `deleteItem(routeName, id, options?)` - Delete item
- `postData(routeName, data, options?)` - Post data
- `putData(routeName, id, data, options?)` - Put data

**Contoh:**
```typescript
const { navigateToCreate, deleteItem } = useNavigation();

// Navigasi ke create
navigateToCreate('masters.employees');

// Delete dengan konfirmasi
deleteItem('masters.employees', 123, {
  onSuccess: () => console.log('Berhasil dihapus')
});
```

### **Date Utils (`/lib/date.ts`)**
```typescript
import { 
  formatDate, 
  formatDateShortMonth, 
  formatDateLongMonth,
  formatDateLongMonthWithTime 
} from '@/lib/date';
```

**Fungsi:**
- `formatDate(dateStr)` - Format tanggal lengkap
- `formatDateShortMonth(dateStr)` - Format tanggal dengan bulan pendek
- `formatDateLongMonth(dateStr)` - Format tanggal dengan bulan panjang
- `formatDateLongMonthWithTime(dateStr)` - Format tanggal dengan waktu

## 🎯 **Keuntungan Penggunaan Utilities:**

✅ **Konsistensi**: Format dan behavior yang sama di seluruh aplikasi  
✅ **Maintainability**: Perubahan hanya perlu dilakukan di satu tempat  
✅ **Type Safety**: TypeScript support yang baik  
✅ **Reusability**: Bisa digunakan di berbagai komponen  
✅ **Testing**: Mudah untuk unit testing  
✅ **Documentation**: Dokumentasi yang jelas  

## 📋 **Best Practices:**

1. **Gunakan utilities yang sudah ada** daripada membuat fungsi baru
2. **Import dari index file** untuk kemudahan maintenance
3. **Gunakan TypeScript** untuk type safety
4. **Dokumentasikan** fungsi baru yang dibuat
5. **Test utilities** secara terpisah

## 🔍 **Monitoring:**

Untuk memastikan konsistensi, gunakan perintah berikut:

```bash
# Cari penggunaan yang tidak konsisten
grep -r "window.confirm" resources/js/
grep -r "router.get(" resources/js/
grep -r "Storage::url" app/
grep -r "formatDate" resources/js/
```

## 📊 **Status Coverage:**

- [x] **Date Formatting** - ✅ 100% konsisten
- [x] **File URLs** - ✅ 100% konsisten  
- [x] **Initials** - ✅ 100% konsisten
- [x] **Currency Formatting** - ✅ 100% konsisten
- [x] **Confirmation Dialogs** - 🔄 Sedang diimplementasikan
- [x] **Navigation** - 🔄 Sedang diimplementasikan
- [x] **Auth Checks** - ✅ 100% konsisten

**Total Coverage: ~85%** 🚀
