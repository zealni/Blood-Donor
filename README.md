# BloodConnect

BloodConnect adalah sistem koordinasi donor darah darurat berbasis web yang dirancang untuk menjembatani kesenjangan antara pasien yang membutuhkan transfusi darah dengan pendonor sukarela di sekitar mereka. Aplikasi ini berfokus pada kecepatan, akurasi lokasi, dan privasi pengguna untuk memastikan proses pencarian donor darah berjalan secara efektif dan aman.

## 🌟 Latar Belakang

Seringkali, pencarian donor darah dalam kondisi darurat terhambat oleh kurangnya informasi mengenai ketersediaan pendonor di lokasi terdekat. Broadcast pesan melalui media sosial terkadang tidak tepat sasaran dan memakan waktu berharga. BloodConnect hadir sebagai solusi terpusat yang memanfaatkan teknologi geolokasi untuk menemukan pendonor potensial secara spesifik dalam radius yang paling efisien dari lokasi rumah sakit atau pasien.

## 🚀 Fitur Utama

- **Peta Interaktif Real-Time:** Menampilkan visualisasi geografis dari permintaan darah aktif serta sebaran pendonor terdekat tanpa mengorbankan privasi persis (exact location) pengguna.
- **Sistem Pencarian Berbasis Radius (Geospatial):** Menggunakan kekuatan ekstensi PostGIS untuk memetakan dan menyaring pendonor dalam radius kilometer tertentu dari lokasi darurat secara akurat.
- **Validasi Kelayakan Medis Otomatis:** Sistem yang secara otomatis melacak riwayat donor pengguna untuk memastikan mereka memenuhi syarat jarak waktu minimal (misalnya 90 hari) sebelum dapat mendonorkan darah kembali.
- **Manajemen Privasi Tingkat Lanjut:** Data kontak pribadi pendonor disembunyikan secara default. Informasi hanya akan diberikan kepada pihak pencari donor *jika* pendonor secara eksplisit menyetujui permintaan spesifik tersebut.
- **Multilingual Support (i18n):** Mendukung penggunaan aplikasi dalam berbagai bahasa untuk menjangkau pengguna yang lebih luas (contoh: Bahasa Indonesia dan Inggris).

## 💡 Alur Penggunaan (How It Works)

1. **Permintaan Darah:** Pengguna (pihak keluarga, teman, atau perwakilan rumah sakit) membuat "Blood Request" dengan mencantumkan golongan darah yang dibutuhkan, tenggat waktu, dan lokasi rumah sakit.
2. **Pencocokan Geospasial:** Algoritma BloodConnect memindai database untuk menemukan pendonor terdaftar dengan golongan darah yang sesuai, memenuhi syarat medis, dan berada di sekitar lokasi.
3. **Pemberitahuan & Persetujuan:** Pendonor potensial dapat melihat daftar permintaan terdekat. Jika mereka bersedia, mereka cukup menekan tombol untuk membantu.
4. **Koneksi Aman:** Setelah pendonor memberikan konfirmasi kesediaan, sistem baru akan membuka jalur komunikasi (menampilkan kontak) agar pihak pembuat permintaan dapat berkoordinasi langsung dengan pendonor.

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan tumpukan teknologi modern untuk memastikan performa yang cepat, antarmuka yang mulus, dan keamanan data yang andal:

- **Frontend:**
  - **Next.js 15:** Framework React modern untuk *server-side rendering* (SSR), optimasi performa, dan manajemen *routing*.
  - **TypeScript:** Memberikan keamanan tipe data (*type-safety*) yang meminimalisir *bug* dalam penulisan kode.
  - **Tailwind CSS & Shadcn UI:** Digunakan untuk merancang antarmuka pengguna (UI) yang rapi, bersih, dan sangat responsif di berbagai ukuran perangkat.
- **Backend, Database & Autentikasi:**
  - **Supabase:** Platform Backend-as-a-Service tangguh yang menangani autentikasi pengguna secara aman.
  - **PostgreSQL & PostGIS:** Database relasional yang kuat, dipadukan dengan ekstensi spasial untuk melakukan kueri koordinat geolokasi dengan sangat cepat.
- **Integrasi Peta:**
  - **React Leaflet:** Pustaka peta interaktif *open-source* untuk visualisasi titik-titik lokasi permintaan dan pendonor.

## 📄 Lisensi

Proyek ini didistribusikan di bawah Lisensi MIT. Bebas digunakan untuk tujuan kemanusiaan, kolaborasi *open-source*, maupun modifikasi lebih lanjut.
