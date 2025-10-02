@component('mail::message')
# Halo, {{ $recipient->name }}

Anda mendapatkan penugasan baru dengan detail sebagai berikut:

@component('mail::panel')
**Tujuan:** {{ $assignment->destination }}

**Periode:** {{ \Carbon\Carbon::parse($assignment->start_date)->format('d M Y') }} - {{ \Carbon\Carbon::parse($assignment->end_date)->format('d M Y') }}

**Maksud Perjalanan:**
{{ $assignment->purpose }}
@endcomponent

Harap segera mempersiapkan diri dan koordinasikan dengan tim terkait.
Silakan masuk ke aplikasi untuk melihat detail lengkap dan membuat laporan perjalanan jika diperlukan.


Terima kasih,<br>
{{ config('app.name') }}
@endcomponent
