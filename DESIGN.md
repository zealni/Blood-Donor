
---

# DESIGN.md - BloodConnect

## 1. Project Overview
**BloodConnect** adalah sistem koordinasi donor darah darurat berbasis *web* yang menghubungkan pencari donor dengan pendonor sukarela secara *real-time*. Proyek ini dirancang untuk mengatasi inefisiensi pencarian donor darah melalui media sosial yang sering kali tidak terukur, tidak terverifikasi, dan memiliki masalah privasi.

*   **Tujuan:** Mempercepat waktu respon pencarian darah dalam situasi kritis.
*   **Target Pengguna:** Pasien darurat, keluarga pasien, dan pendonor sukarela di area lokal.

---

## 2. Problem Statement
1.  **Delay in Response:** Pencarian donor melalui *broadcast* WhatsApp memiliki jangkauan yang tidak terfilter.
2.  **Data Staleness:** Informasi kebutuhan darah tetap tersebar meskipun kebutuhan sudah terpenuhi.
3.  **Privacy Concerns:** Pendonor seringkali enggan membagikan nomor telepon mereka secara publik.
4.  **Eligibility Issues:** Tidak ada mekanisme otomatis untuk memverifikasi apakah seseorang sudah boleh mendonorkan darahnya kembali (jeda 3 bulan).

---

## 3. System Architecture
Sistem ini menggunakan arsitektur *Modern Fullstack* dengan pendekatan *Serverless*.

*   **Frontend:** *Next.js 15* (*App Router*) dengan *TypeScript*.
*   **Styling:** *Tailwind CSS* & *Shadcn/UI* (Mengikuti *Human Interface Guidelines* Apple).
*   **Backend & Database:** *Supabase* (*PostgreSQL*).
*   **Real-time:** *Supabase Realtime Subscriptions*.
*   **Geospatial:** *PostGIS extension* pada *PostgreSQL*.
*   **Deployment:** *Vercel*.

---

## 4. Database Schema
Struktur data dirancang untuk mendukung integritas dan kecepatan *query* lokasi.

### 4.1. Tabel `profiles`
Menyimpan informasi pengguna dan status ketersediaan.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | `uuid` | *Primary Key (Link to Auth.Users)*. |
| `full_name` | `text` | Nama lengkap pengguna. |
| `blood_type` | `enum` | A, B, AB, O. |
| `rhesus` | `boolean` | Positif (+) atau Negatif (-). |
| `last_donation` | `date` | Tanggal terakhir melakukan donor. |
| `location` | `geography` | Titik koordinat GPS terakhir pengguna. |
| `is_available` | `boolean` | Status ketersediaan manual pengguna. |

### 4.2. Tabel `blood_requests`
Menyimpan data permintaan darah yang aktif.
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | `uuid` | *Primary Key*. |
| `seeker_id` | `uuid` | *Foreign Key* ke `profiles`. |
| `hospital_name` | `text` | Nama Rumah Sakit lokasi pasien. |
| `hospital_coord` | `geography` | Titik koordinat GPS Rumah Sakit. |
| `status` | `enum` | *open, fulfilled, expired*. |
| `created_at` | `timestamp` | Waktu permintaan dibuat. |

---

## 5. Core Logic & Algorithms

### 5.1. Eligibility Engine (Logika Kelayakan)
Sistem secara otomatis memfilter pendonor yang layak secara medis berdasarkan waktu.
$$Eligibility = (CurrentDate - LastDonation) \ge 90 \, \text{days}$$

### 5.2. Geospatial Proximity Search
Mencari pendonor dalam radius tertentu menggunakan fungsi *PostGIS*. Contoh *query* untuk mencari pendonor dalam radius 10km:
```sql
SELECT * FROM profiles
WHERE ST_DWithin(location, ST_MakePoint(longitude, latitude)::geography, 10000)
AND blood_type = 'O'
AND is_available = true;
```

### 5.3. Anonymous Handshake (Privasi)
Sistem menggunakan *Row Level Security* (RLS) di *Supabase*. Nomor telepon pendonor hanya akan dikirimkan ke pemohon jika pendonor telah melakukan *action* `Accept Request` pada aplikasi.

---

## 6. User Flow

### 6.1. Alur Pemohon (Seeker)
1.  *Login* ke aplikasi.
2.  Klik **"Buat Permintaan Darah"**.
3.  Masukkan detail (Golongan darah, RS, jumlah kantong).
4.  Sistem secara otomatis mendeteksi lokasi atau pengguna memilih lokasi RS di peta.
5.  Menunggu respon dari pendonor terdekat.

### 6.2. Alur Pendonor (Donor)
1.  Menerima notifikasi *push* atau melihat daftar permintaan di *dashboard* berdasarkan radius terdekat.
2.  Melihat urgensi permintaan.
3.  Klik **"Saya Bersedia Membantu"**.
4.  Sistem membuka jalur komunikasi (nomor WhatsApp/Telepon) antara kedua pihak.

---

## 7. UI/UX Principles
*   **Clarity:** Menggunakan tipografi yang kontras dan bersih.
*   **Responsiveness:** Optimasi penuh untuk perangkat *mobile* karena situasi darurat sering terjadi di lapangan.
*   **Apple Aesthetic:** Menggunakan elemen *Rounded Corners*, *Blur Effects* (*Glassmorphism*), dan *Micro-interactions* yang halus.

---

## 8. Future Roadmap
*   **Integration:** Integrasi langsung dengan API stok darah PMI.
*   **Gamification:** Sistem *Point* dan *Badges* untuk pendonor yang aktif sebagai bentuk apresiasi sosial.
*   **Health Kit Integration:** Sinkronisasi data kesehatan (detak jantung/tekanan darah) sebelum melakukan donor (khusus pengguna iOS).

---
