# 🩸 BloodConnect

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)

**BloodConnect** adalah sistem koordinasi donor darah darurat berbasis *web* yang menghubungkan pencari donor dengan pendonor sukarela secara *real-time*. Platform ini dirancang untuk mengatasi inefisiensi pencarian donor darah melalui media sosial yang sering kali tidak terukur, tidak terverifikasi, dan memiliki masalah privasi yang serius.

Dengan BloodConnect, pencarian darah yang biasanya membutuhkan waktu berjam-jam melalui *broadcast message* kini dapat dipertemukan dalam hitungan detik dengan pendonor terdekat yang siap siaga di area sekitar.

---

## ✨ Fitur Utama

1. **🔴 Live Signal Map**
   Visualisasi peta *real-time* berbasis **Leaflet** untuk menampilkan sinyal darurat aktif dari pemohon darah (Seeker) serta pendonor siaga (Donor) di area lokal.

2. **🏥 Eligibility Engine**
   Mesin kelayakan otomatis yang memastikan kepatuhan medis pendonor. Pendonor hanya dapat mengajukan diri jika selang waktu dari tanggal donor terakhir memenuhi standar kesehatan (minimal 90 hari / 3 bulan).
   $$\text{Eligibility} = (\text{CurrentDate} - \text{LastDonation}) \ge 90\text{ hari}$$

3. **📍 Geospatial Proximity Search**
   Pencarian berbasis lokasi menggunakan ekstensi **PostGIS** pada Supabase/PostgreSQL untuk menyaring secara instan pendonor yang berada dalam radius terdekat (misal: 10 KM) dari rumah sakit pasien.

4. **🔒 Anonymous Handshake**
   Mekanisme privasi tingkat tinggi menggunakan **Row Level Security (RLS)**. Data kontak/nomor telepon pendonor hanya akan diungkapkan kepada pemohon darah jika pendonor telah secara sadar menyetujui permintaan tersebut (*Accept Request*).

5. **🩸 Blood Matrix & Impact Calculator**
   * **Blood Matrix:** Tabel visual interaktif inter-kompatibilitas golongan darah (siapa yang bisa mendonorkan ke siapa).
   * **Impact Calculator:** Kalkulator interaktif untuk menunjukkan dampak nyata dari satu donor darah (misal: jumlah nyawa yang terselamatkan, volume sel darah merah, plasma, dan keping darah).

---

## 🛠️ Tech Stack & Arsitektur

Platform ini dibangun menggunakan arsitektur modern fullstack yang responsif dan berestetika tinggi:

* **Frontend:** Next.js 15 (App Router) dengan TypeScript.
* **Styling:** Tailwind CSS & Shadcn/UI, dirancang dengan sentuhan *Apple Aesthetic* (*glassmorphism*, *micro-interactions*, dan sudut membulat yang halus).
* **Database & Backend:** Supabase (PostgreSQL) dengan ekstensi **PostGIS** untuk perhitungan koordinat geografis.
* **Real-time Engine:** Supabase Realtime Subscriptions untuk pembaruan instan koordinat map dan sinyal darurat.
* **Peta Interaktif:** React Leaflet & Leaflet.js.

---

## 💾 Struktur Database

### 1. Tabel `profiles`
Menyimpan informasi dasar pengguna dan status ketersediaan pendonor.

| Nama Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | `uuid` | *Primary Key* (Relasi ke `auth.users` Supabase) |
| `full_name` | `text` | Nama lengkap pengguna |
| `blood_type` | `enum` | Golongan darah (A, B, AB, O) |
| `rhesus` | `boolean` | Positif (`true`) atau Negatif (`false`) |
| `last_donation` | `date` | Tanggal terakhir melakukan donor darah |
| `location` | `geography` | Titik koordinat GPS terkini (PostGIS Point) |
| `is_available` | `boolean` | Status kesiapan mendonorkan darah secara manual |

### 2. Tabel `blood_requests`
Menyimpan data permintaan darah aktif yang membutuhkan respon segera.

| Nama Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | `uuid` | *Primary Key* |
| `seeker_id` | `uuid` | *Foreign Key* ke tabel `profiles` (Pemohon) |
| `hospital_name` | `text` | Nama rumah sakit tempat pasien dirawat |
| `hospital_coord` | `geography`| Titik koordinat GPS rumah sakit |
| `status` | `enum` | Status permintaan (`open`, `fulfilled`, `expired`) |
| `created_at` | `timestamp`| Waktu permintaan dibuat |

---

## 🧮 Kode Geospatial (PostGIS Example)

Berikut adalah contoh fungsi query SQL yang digunakan untuk mencari pendonor dalam radius **10 kilometer** yang memiliki golongan darah yang cocok dan status aktif:

```sql
SELECT id, full_name, blood_type, location
FROM profiles
WHERE ST_DWithin(
  location, 
  ST_MakePoint(longitude_user, latitude_user)::geography, 
  10000 -- 10.000 meter (10 km)
)
AND blood_type = 'O'
AND is_available = true;
```

---

## 🚀 Memulai Proyek

Ikuti langkah-langkah di bawah ini untuk menjalankan BloodConnect di lingkungan lokal Anda.

### 📋 Prasyarat
Pastikan Anda sudah menginstal:
* [Node.js](https://nodejs.org/) (Versi 18 ke atas)
* [Git](https://git-scm.com/)

### 🔧 Langkah Instalasi

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/mortalaproduction-code/blood-donor.git
   cd blood-donor
   ```

2. **Instal seluruh dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Buat file `.env.local` di direktori utama dan tambahkan kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Jalankan server pengembangan:**
   ```bash
   npm run dev
   ```

5. **Buka aplikasi:**
   Akses `http://localhost:3000` melalui browser Anda.

---

## 🗺️ Struktur Folder

```text
├── app/                  # Next.js App Router Pages (login, register, radar, dll)
│   ├── globals.css       # Style global Tailwind
│   ├── layout.tsx        # Layout utama aplikasi
│   └── page.tsx          # Beranda utama platform
├── components/           # Komponen UI modular reusable
│   ├── ActiveRequests.tsx# Panel list permintaan aktif
│   ├── BloodMatrix.tsx   # Visual interaktif tabel kecocokan
│   ├── HowItWorks.tsx    # Langkah penggunaan
│   ├── ImpactCalculator.tsx# Kalkulator penyelamat nyawa
│   ├── LiveSignalMap.tsx # Wrapper peta signal
│   ├── MapComponent.tsx  # Peta Leaflet untuk radar
│   └── Navbar.tsx        # Navigasi premium dengan Glassmorphism
├── lib/                  # Helper utilities dan Supabase Client
└── package.json          # File konfigurasi dependensi npm
```

---

## 🔮 Roadmap Pengembangan Masa Depan

* **Integrasi API PMI:** Hubungan langsung dengan *live database* ketersediaan stok darah PMI (Palang Merah Indonesia).
* **Sistem Gamifikasi & Penghargaan:** Penambahan sistem *Point* dan *Badges* untuk mengapresiasi dan memotivasi para pendonor aktif secara berkala.
* **Apple HealthKit & Google Fit Integration:** Fitur integrasi data detak jantung, tekanan darah, dan kelayakan fisik pendonor langsung dari perangkat *smartwatch* pendonor (iOS/Android).

---

## 📄 Lisensi

Proyek ini berada di bawah lisensi MIT. Silakan gunakan dan kembangkan untuk membantu menyelamatkan lebih banyak nyawa. ❤️
