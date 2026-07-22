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

## Memulai Proyek

### Prasyarat
- Node.js v18+
- Git

### Instalasi

1. Clone repositori:
   ```bash
   git clone https://github.com/mortalaproduction-code/blood-donor.git
   cd blood-donor
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi Environment Variables:
   Buat file `.env.local` dan tambahkan kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Jalankan server:
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses di `http://localhost:3000`.

## Lisensi

Proyek ini menggunakan lisensi MIT.
