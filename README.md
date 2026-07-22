# BloodConnect

BloodConnect adalah sistem koordinasi donor darah darurat berbasis web yang menghubungkan pencari donor dengan pendonor sukarela di sekitar mereka.

## Fitur Utama

- **Peta Interaktif:** Visualisasi real-time permintaan darah aktif dan pendonor terdekat.
- **Pencarian Berbasis Lokasi:** Menggunakan ekstensi PostGIS untuk menyaring pendonor dalam radius tertentu dari rumah sakit.
- **Pengecekan Kelayakan:** Memastikan kepatuhan medis pendonor (misal: jarak antar donor minimal 90 hari).
- **Privasi Terjaga:** Kontak pendonor hanya diungkapkan kepada pemohon apabila pendonor menyetujui permintaan tersebut.

## Teknologi

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend & Database:** Supabase (PostgreSQL), PostGIS
- **Peta:** React Leaflet

## Lisensi

Proyek ini menggunakan lisensi MIT.
