"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "id" | "en";

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const idToEn: Record<string, string> = {
  "Beranda": "Home",
  "Peta": "Map",
  "Peringkat": "Ranking",
  "Papan Peringkat": "Leaderboard",
  "Panduan": "Guide",
  "Panduan Donor": "Donor Guide",
  "Notifikasi": "Notifications",
  "Pemberitahuan": "Notifications",
  "Tandai dibaca": "Mark as read",
  "Bantu Sekarang": "Help Now",
  "Sinyal Darurat Kritis (A+)": "Critical Emergency Signal (A+)",
  "RSUP Dr. Sardjito membutuhkan 2 kantong darah A+ segera!": "RSUP Dr. Sardjito needs 2 bags of A+ blood immediately!",
  "Pencapaian Baru": "New Achievement",
  "Selamat! Anda mendapatkan lencana 'Pahlawan Pertama'.": "Congratulations! You earned the 'First Hero' badge.",
  "Jadwal Donor Keliling": "Mobile Donation Schedule",
  "PMI Sleman di Sleman City Hall pukul 09:00 - 13:00 hari ini.": "PMI Sleman is at Sleman City Hall from 09:00 to 13:00 today.",
  "Profil Saya": "My Profile",
  "Keluar": "Log Out",
  "Masuk": "Log In",
  "Daftar": "Sign Up",
  "PEMBERITAHUAN BARU": "NEW NOTIFICATIONS",
  "Bahasa": "Language",
  "Indonesia": "Indonesian",
  "English": "English",
  "Sistem Donor Darurat Aktif": "Emergency Donor System Active",
  "Waktu Adalah": "Time Is",
  "Nyawa.": "Life.",
  "Platform koordinasi donor darah waktu nyata. Kami mempertemukan pasien yang sangat membutuhkan dengan pahlawan donor terdekat dalam hitungan detik, bukan jam.": "A real-time blood donation coordination platform. We connect patients in urgent need with nearby donor heroes in seconds, not hours.",
  "Butuh Darah": "Need Blood",
  "Jadi Pendonor": "Become a Donor",
  "Sinyal Darurat Aktif": "Active Emergency Signals",
  "Pendonor Siaga": "Ready Donors",
  "Sinyal SOS Aktif (Yogyakarta & Sekitarnya)": "Active SOS Signals (Yogyakarta and Nearby)",
  "Aceh": "Aceh",
  "Sumatera Utara": "North Sumatra",
  "Sumatera Barat": "West Sumatra",
  "Riau": "Riau",
  "Kepulauan Riau": "Riau Islands",
  "Jambi": "Jambi",
  "Bengkulu": "Bengkulu",
  "Sumatera Selatan": "South Sumatra",
  "Kepulauan Bangka Belitung": "Bangka Belitung Islands",
  "Lampung": "Lampung",
  "Banten": "Banten",
  "DKI Jakarta": "DKI Jakarta",
  "Jawa Barat": "West Java",
  "Jawa Tengah": "Central Java",
  "D.I. Yogyakarta": "D.I. Yogyakarta",
  "Jawa Timur": "East Java",
  "Bali": "Bali",
  "Nusa Tenggara Barat": "West Nusa Tenggara",
  "Nusa Tenggara Timur": "East Nusa Tenggara",
  "Kalimantan Barat": "West Kalimantan",
  "Kalimantan Tengah": "Central Kalimantan",
  "Kalimantan Selatan": "South Kalimantan",
  "Kalimantan Timur": "East Kalimantan",
  "Kalimantan Utara": "North Kalimantan",
  "Sulawesi Utara": "North Sulawesi",
  "Gorontalo": "Gorontalo",
  "Sulawesi Tengah": "Central Sulawesi",
  "Sulawesi Barat": "West Sulawesi",
  "Sulawesi Selatan": "South Sulawesi",
  "Sulawesi Tenggara": "Southeast Sulawesi",
  "Maluku": "Maluku",
  "Maluku Utara": "North Maluku",
  "Papua Barat": "West Papua",
  "Papua": "Papua",
  "Papua Tengah": "Central Papua",
  "Papua Pegunungan": "Highland Papua",
  "Papua Selatan": "South Papua",
  "Papua Barat Daya": "Southwest Papua",
  "Saat ini tidak ada pasien yang membutuhkan donor darah darurat di wilayah terpilih.": "Currently, there are no patients in need of emergency blood donation in the selected region.",
  "Pilih Wilayah Provinsi": "Select Province Region",
  "Sinyal SOS": "SOS Signals",
  "AKTIF": "ACTIVE",
  "Aktif": "Active",
  "Belum Ada Sinyal Darurat": "No Emergency Signals Yet",
  "Kebutuhan Darah": "Blood Needs",
  "Darurat": "Emergency",
  "Setiap detik sangat berarti. Pasien di bawah ini sedang mencari pendonor siaga. Anda dapat menyelamatkan hidup mereka sekarang.": "Every second matters. The patients below are looking for ready donors. You can help save their lives now.",
  "Lihat Semua Permintaan": "View All Requests",
  "Golongan Darah": "Blood Type",
  "Kritis": "Critical",
  "Tinggi": "High",
  "Sedang": "Medium",
  "Alur Sistem": "System Flow",
  "Bagaimana": "How",
  "Bekerja": "Works",
  "Kami memangkas rantai pencarian donor tradisional yang lambat dengan sistem otomatisasi berbasis geolokasi waktu nyata.": "We shorten the slow traditional donor search chain with a real-time geolocation-based automation system.",
  "Pancarkan Sinyal Darurat": "Send an Emergency Signal",
  "Pemohon membuat permintaan darurat di sistem, memasukkan golongan darah, rumah sakit, dan jumlah kantong.": "The requester creates an emergency request, entering the blood type, hospital, and number of bags needed.",
  "Notifikasi Instan & Deteksi Jarak": "Instant Notifications & Distance Detection",
  "Sistem mendeteksi pendonor siaga terdekat yang memiliki golongan darah yang cocok dalam radius terpilih dan mengirim notifikasi.": "The system detects nearby ready donors with compatible blood types within the selected radius and sends notifications.",
  "Persetujuan Anonim": "Anonymous Approval",
  "Pendonor menerima permintaan. Untuk menjaga privasi, nomor kontak (WhatsApp) baru akan terbuka setelah pendonor menekan tombol setuju.": "The donor accepts the request. To protect privacy, the contact number (WhatsApp) is only revealed after the donor agrees.",
  "Penyelamatan Sukses": "Successful Rescue",
  "Pendonor melakukan donor di rumah sakit tujuan. Setelah selesai, status permintaan berubah menjadi terpenuhi dan nyawa terselamatkan.": "The donor donates at the target hospital. Once complete, the request status changes to fulfilled and lives are saved.",
  "Edukasi Medis": "Medical Education",
  "Kecocokan Golongan Darah": "Blood Type Compatibility",
  "Ketahui siapa saja yang dapat menerima donor dari Anda, dan dari siapa saja Anda bisa menerima bantuan transfusi.": "Learn who can receive your donation, and who you can receive transfusion help from.",
  "Detail Golongan Darah": "Blood Type Details",
  "Bisa Mendonorkan Ke:": "Can Donate To:",
  "Bisa Menerima Donor Dari:": "Can Receive From:",
  "Pilih Golongan Darah Anda": "Choose Your Blood Type",
  "Sentuh golongan darah": "Tap a blood type",
  "Visualisasi Kecocokan Kompatibilitas": "Compatibility Visualization",
  "Dipilih": "Selected",
  "Bisa Menerima Donor Anda": "Can Receive Your Donation",
  "Bisa Mendonor ke Anda": "Can Donate to You",
  "Dua-duanya (Dua Arah)": "Both (Two-Way)",
  "Kalkulator Dampak": "Impact Calculator",
  "Dampak Donasi Anda": "Your Donation Impact",
  "Satu kantong darah dapat dipisahkan menjadi sel darah merah, plasma, dan trombosit untuk menyelamatkan hingga tiga nyawa. Lihat dampak nyata yang bisa Anda ciptakan.": "One blood bag can be separated into red blood cells, plasma, and platelets to save up to three lives. See the real impact you can create.",
  "Frekuensi Donor Per Tahun": "Donation Frequency Per Year",
  "Kali": "Times",
  "Secara medis, donor darah dapat dilakukan setiap 3 bulan (maksimal 4 kali setahun).": "Medically, blood donation can be done every 3 months (up to 4 times a year).",
  "Komitmen Jangka Waktu (Tahun)": "Time Commitment (Years)",
  "Tahun": "Year",
  "Thn": "Yrs",
  "Bln": "Mo",
  "Visualisasi Volume Darah": "Blood Volume Visualization",
  "Total Volume Terkumpul": "Total Volume Collected",
  "Kantong Darah": "Blood Bags",
  "didonasikan": "donated",
  "Jiwa Terselamatkan": "Lives Saved",
  "potensi nyawa dibantu": "potential lives helped",
  "Langkah awal yang luar biasa! Setiap tetes darah Anda adalah harapan baru bagi keluarga pasien.": "An amazing first step! Every drop of your blood is new hope for a patient's family.",
  "Pahlawan Komunitas! Anda berkontribusi aktif memberikan harapan hidup bagi belasan pasien.": "Community Hero! You are actively giving hope to dozens of patients.",
  "Pahlawan Kemanusiaan Sejati! Dedikasi Anda memberikan dampak luar biasa dalam menyelamatkan puluhan nyawa.": "True Humanitarian Hero! Your dedication creates an extraordinary impact by helping save dozens of lives.",
  "Tanya Jawab": "Q&A",
  "Pertanyaan Umum": "Common Questions",
  "Ada pertanyaan seputar donor darah dan penggunaan platform? Kami merangkum hal-hal paling penting yang perlu Anda ketahui di sini.": "Have questions about blood donation and using the platform? We summarize the most important things you need to know here.",
  "Layanan": "Services",
  "Butuh Donor Darah": "Need a Blood Donor",
  "Gabung Jadi Donor": "Join as a Donor",
  "Stok Darah PMI (Simulasi)": "PMI Blood Stock (Simulation)",
  "Registrasi Anggota": "Member Registration",
  "Kontak Darurat": "Emergency Contacts",
  "Ambulans: 118": "Ambulance: 118",
  "Kabar Kemanusiaan": "Humanitarian Updates",
  "Dapatkan informasi edukasi donor darah, tips kesehatan, dan kisah sukses penyelamatan nyawa langsung ke email Anda.": "Get blood donation education, health tips, and life-saving success stories directly in your email.",
  "Alamat email Anda": "Your email address",
  "Terima kasih! Anda berhasil berlangganan kabar kemanusiaan kami.": "Thank you! You have subscribed to our humanitarian updates.",
  "Hak Cipta Dilindungi Undang-Undang.": "All Rights Reserved.",
  "Syarat & Ketentuan": "Terms & Conditions",
  "Kebijakan Privasi": "Privacy Policy",
  "Kembali ke Atas": "Back to Top",
  "Masuk untuk mengakses dasbor donor Anda": "Log in to access your donor dashboard",
  "Email": "Email",
  "Kata Sandi": "Password",
  "Lupa Kata Sandi?": "Forgot Password?",
  "Masuk ke Dasbor": "Log In to Dashboard",
  "Belum terdaftar?": "Not registered yet?",
  "Daftar Sekarang": "Sign Up Now",
  "Memuat...": "Loading...",
  "Memuat Peta Lokasi...": "Loading Location Map...",
  "Memuat Peta Interaktif...": "Loading Interactive Map...",
  "Nama Lengkap": "Full Name",
  "Nama Lengkap tidak boleh kosong.": "Full Name cannot be empty.",
  "Mohon lengkapi Golongan Darah dan Rhesus.": "Please complete Blood Type and Rhesus.",
  "Profil berhasil diperbarui!": "Profile updated successfully!",
  "Daftar sekali untuk menjadi pendonor sekaligus pemohon donor": "Register once to become both a donor and a blood requester",
  "Gol. Darah": "Blood Type",
  "Rhesus": "Rhesus",
  "Pos": "Pos",
  "Neg": "Neg",
  "Positif": "Positive",
  "Negatif": "Negative",
  "Tanggal Donor Terakhir (Opsional)": "Last Donation Date (Optional)",
  "Kosongkan jika Anda belum pernah mendonorkan darah.": "Leave blank if you have never donated blood.",
  "Daftar & Masuk": "Sign Up & Log In",
  "Sudah punya akun?": "Already have an account?",
  "Masuk di Sini": "Log In Here",
  "Kembali ke Dasbor": "Back to Dashboard",
  "Edit Profil": "Edit Profile",
  "Edit Data Profil Saya": "Edit My Profile Data",
  "Email (Tidak Dapat Diubah)": "Email (Cannot Be Changed)",
  "Tanggal Donor Terakhir": "Last Donation Date",
  "Lokasi / Kota": "Location / City",
  "Contoh: Yogyakarta": "Example: Yogyakarta",
  "Ketersediaan Donor": "Donor Availability",
  "Aktifkan untuk memberitahu pemohon bahwa Anda bersedia mendonor": "Turn this on to tell requesters that you are willing to donate",
  "Simpan Perubahan": "Save Changes",
  "Batal": "Cancel",
  "Donor Terakhir": "Last Donation",
  "Belum Pernah": "Never",
  "Anda Layak Donor Darah!": "You Are Eligible to Donate Blood!",
  "Belum Layak Donor": "Not Eligible to Donate Yet",
  "Jeda waktu sejak donor terakhir Anda sudah melebihi 90 hari. Anda bisa bersiap untuk membantu pemohon donor kapan saja.": "The interval since your last donation is over 90 days. You can get ready to help blood requesters anytime.",
  "Status Siaga Pendonor": "Donor Readiness Status",
  "Bersedia Mendonor": "Willing to Donate",
  "Tidak Aktif": "Inactive",
  "Bersedia Donor": "Willing to Donate",
  "Tidak Siaga": "Not Ready",
  "Status Kelayakan Donor Medis": "Medical Donation Eligibility Status",
  "Layak donor (Belum pernah donor sebelumnya)": "Eligible to donate (No previous donation)",
  "Layak donor (Terakhir mendonor > 90 hari yang lalu)": "Eligible to donate (Last donation was over 90 days ago)",
  "Kembali": "Back",
  "Hubungi via WhatsApp (Sudah Terhubung)": "Contact via WhatsApp (Connected)",
  "Hubungi via WhatsApp (Persetujuan Anonim)": "Contact via WhatsApp (Anonymous Approval)",
  "Persetujuan anonim berhasil! Jalur komunikasi langsung dibuka. Menghubungkan Anda dengan": "Anonymous approval successful! A direct communication channel has been opened. Connecting you with",
  "via WhatsApp...": "via WhatsApp...",
  "*BloodConnect melindungi privasi Anda. Nomor telepon dan kontak hanya akan dibagikan kepada pihak yang bersangkutan setelah persetujuan diberikan.": "*BloodConnect protects your privacy. Phone numbers and contacts will only be shared with the related party after approval is given.",
  "Sinyal Donor Sekitar": "Nearby Donor Signals",
  "Tampilkan Sinyal": "Show Signals",
  "Sembunyikan Panel": "Hide Panel",
  "Menampilkan": "Showing",
  "pemohon": "requesters",
  "di sekitar Anda.": "around you.",
  "Siaga Donor": "Donor Ready",
  "Mode Pendonor": "Donor Mode",
  "Mode Pemohon": "Requester Mode",
  "Stok Aktual": "Current Stock",
  "PMI DIY: SIAGA": "PMI DIY: READY",
  "Stok": "Stock",
  "kantong": "bags",
  "Cukup": "Enough",
  "Menipis": "Low",
  "Aman": "Safe",
  "Cari RS atau Golongan Darah...": "Search hospital or blood type...",
  "Filter Lanjutan": "Advanced Filter",
  "Radius Jangkauan": "Coverage Radius",
  "Semua Jarak": "All Distances",
  "Semua": "All",
  "Semua Gol.": "All Types",
  "FILTER LANJUTAN": "ADVANCED FILTER",
  "Atur Ulang Filter": "Reset Filter",
  "Golongan Darah & Rhesus": "Blood Type & Rhesus",
  "Tingkat Urgensi": "Urgency Level",
  "Tidak ada permintaan yang sesuai pencarian.": "No requests match your search.",
  "Jarak": "Distance",
  "Butuh": "Needs",
  "Bantu": "Help",
  "Profil": "Profile",
  "Menghubungkan...": "Connecting...",
  "Setuju & Hubungi": "Agree & Contact",
  "Anda memilih membantu permintaan di": "You chose to help the request at",
  "dengan Golongan Darah": "with Blood Type",
  "Kontak Anda dan pemohon dilindungi. Menekan setuju akan membuka koordinasi via WhatsApp secara terenkripsi.": "Your contact and the requester's contact are protected. Pressing agree will open encrypted coordination via WhatsApp.",
  "Halo, saya pendonor sukarela dari BloodConnect. Saya melihat sinyal darurat Anda di": "Hello, I am a volunteer donor from BloodConnect. I saw your emergency signal at",
  "untuk golongan darah": "for blood type",
  "Saya bersedia mendonorkan darah saya.": "I am willing to donate my blood.",
  "Pancarkan Sinyal": "Send Signal",
  "Mohon lengkapi golongan darah, rhesus, dan lokasi rumah sakit.": "Please complete blood type, rhesus, and hospital location.",
  "Sinyal Darurat Kebutuhan Darah berhasil dipancarkan ke pendonor terdekat!": "The emergency blood request signal has been sent to nearby donors!",
  "Titik Terpilih": "Selected Point",
  "Sistem memetakan radius 10km ke pendonor terdekat.": "The system maps a 10km radius to nearby donors.",
  "Rumah Sakit / Lokasi": "Hospital / Location",
  "Ketik Nama Rumah Sakit...": "Type Hospital Name...",
  "Koordinat GPS Rumah Sakit": "Hospital GPS Coordinates",
  "Klik area rumah sakit di peta sebelah kanan untuk menandai lokasi GPS secara presisi.": "Click the hospital area on the map to mark the precise GPS location.",
  "Catatan Tambahan": "Additional Notes",
  "Contoh: Butuh 2 kantong, segera di IGD Dr. Sardjito.": "Example: Need 2 bags urgently at Dr. Sardjito ER.",
  "Pastikan informasi medis diisi dengan benar. Pendonor akan merespon berdasarkan golongan darah dan titik koordinat RS Anda.": "Make sure the medical information is correct. Donors will respond based on blood type and your hospital coordinates.",
  "Pancarkan Sinyal Sos": "Send SOS Signal",
  "Deteksi Lokasi Saya": "Detect My Location",
  "Browser Anda tidak mendukung layanan geolokasi.": "Your browser does not support geolocation services.",
  "Gagal mendeteksi lokasi otomatis. Silakan periksa koneksi internet Anda atau masukkan lokasi secara manual.": "Failed to detect location automatically. Please check your internet connection or enter the location manually.",
  "Jalan": "Streets",
  "Satelit": "Satellite",
  "Lokasi Anda": "Your Location",
  "Pusat Jangkauan Filter": "Filter Range Center",
  "Titik Rumah Sakit Pilihan": "Selected Hospital Point",
  "Lokasi Rumah Sakit Pilihan": "Selected Hospital Location",
  "Koordinat Terpilih": "Selected Coordinates",
  "Rumah Sakit Daerah Terdekat": "Nearest Regional Hospital",
  "Puskesmas Terdekat": "Nearest Community Health Center",
  "Sedia": "Available",
  "Pemohon": "Requester",
  "Pendonor": "Donor",
  "Siaga Pendonor": "Ready Donor",
  "Darurat (Butuh)": "Emergency (Needed)",
  "Siap Donor": "Ready to Donate",
  "Lokasi RS Anda": "Your Hospital Location",
  "Pahlawan Bulan Ini": "Heroes of the Month",
  "Peringkat kontributor pendonor darah terbanyak": "Ranking of top blood donor contributors",
  "Pahlawan Legendaris": "Legendary Hero",
  "Pahlawan Emas": "Gold Hero",
  "Pendonor Setia": "Loyal Donor",
  "Peringkat Anda": "Your Rank",
  "Silakan masuk terlebih dahulu": "Please log in first",
  "Poin": "Points",
  "x Donor": "x Donations",
  "Panduan Edu-Donor": "Donor Education Guide",
  "Informasi penting untuk calon pahlawan pendonor darah": "Important information for future blood donor heroes",
  "Kriteria Umum Calon Pendonor:": "General Donor Criteria:",
  "Usia:": "Age:",
  "17 s/d 60 tahun (atau sampai 65 tahun atas pertimbangan dokter).": "17 to 60 years old (or up to 65 years old with a doctor's approval).",
  "Berat Badan:": "Weight:",
  "Minimal 45 kg.": "Minimum 45 kg.",
  "Tekanan Darah:": "Blood Pressure:",
  "Sistole 90-160 mmHg, Diastole 60-100 mmHg.": "Systolic 90-160 mmHg, diastolic 60-100 mmHg.",
  "Kadar Hemoglobin (Hb):": "Hemoglobin (Hb) Level:",
  "12,5 g/dL s/d 17,0 g/dL.": "12.5 g/dL to 17.0 g/dL.",
  "Interval Donor:": "Donation Interval:",
  "Minimal 60 hari sejak donor darah sebelumnya.": "At least 60 days since the previous blood donation.",
  "Kesehatan Umum:": "General Health:",
  "Tidak sedang flu, batuk, demam, atau minum antibiotik.": "Not currently having flu, cough, fever, or taking antibiotics.",
  "Skema Transfusi & Kecocokan Golongan Darah": "Transfusion Scheme & Blood Type Compatibility",
  "Tipe Darah": "Blood Type",
  "Bisa Mendonor Ke (Resipien)": "Can Donate To (Recipient)",
  "Bisa Menerima Dari (Donor)": "Can Receive From (Donor)",
  "Penerima Universal": "Universal Recipient",
  "Pendonor Universal. Golongan darah Anda dapat didonorkan ke semua pasien golongan darah lainnya. Namun, jika Anda memerlukan transfusi, Anda hanya dapat menerima dari golongan O-.": "Universal donor. Your blood type can be donated to patients with all other blood types. However, if you need a transfusion, you can only receive from O-.",
  "Golongan darah paling umum. Sangat berharga untuk membantu mendonorkan darah ke lebih dari 80% populasi yang bergolongan darah rhesus positif.": "The most common blood type. Very valuable for donating blood to more than 80% of the population with rhesus-positive blood.",
  "Golongan darah yang tergolong langka. Sangat dicari untuk membantu pasien A- maupun golongan darah campuran AB-.": "A relatively rare blood type. Highly needed to help A- patients and mixed AB- blood type patients.",
  "Golongan darah yang sangat krusial dalam stok harian rumah sakit. Memiliki kontribusi besar bagi penanganan pasien rhesus positif.": "A blood type that is crucial for daily hospital stock. It greatly contributes to treating rhesus-positive patients.",
  "Sangat langka dan penting. Menjadi penyelamat bagi pasien B- dan AB- yang menghadapi situasi medis mendesak.": "Very rare and important. It can be life-saving for B- and AB- patients facing urgent medical situations.",
  "Golongan darah yang penting untuk mencukupi kebutuhan darah pasien bergolongan B+ dan AB+.": "An important blood type for meeting the needs of B+ and AB+ patients.",
  "Golongan darah paling langka kedua di dunia. Ketersediaan pendonor AB- sangat menentukan keselamatan pasien bergolongan serupa.": "The second rarest blood type in the world. The availability of AB- donors is vital for patients with the same blood type.",
  "Penerima Universal. Anda dapat menerima transfusi darah dari golongan darah manapun secara aman, namun Anda hanya bisa mendonorkan darah Anda ke sesama pemilik AB+.": "Universal recipient. You can safely receive blood transfusions from any blood type, but you can only donate your blood to other AB+ recipients.",
  "Donor & Terima": "Donate & Receive",
  "Penerima": "Recipient",
  "Semua Golongan Darah": "All Blood Types",
  "Semua Golongan (Donor Universal)": "All Types (Universal Donor)",
  "Manfaat Bagi Kesehatan Anda:": "Benefits for Your Health:",
  "Membantu menurunkan risiko penyakit jantung, menyeimbangkan kadar zat besi, memicu regenerasi sel darah baru, dan memberikan kepuasan mental yang mendalam.": "Helps reduce the risk of heart disease, balance iron levels, stimulate new blood cell regeneration, and bring a deep sense of fulfillment.",
  "Apa yang perlu dipersiapkan?": "What should be prepared?",
  "Tidur cukup minimal 6-8 jam sebelum mendonor, minum air putih ekstra (minimal 500ml), makan makanan bergizi ringan, dan hindari konsumsi alkohol / obat sakit kepala.": "Get at least 6-8 hours of sleep before donating, drink extra water (at least 500 ml), eat a light nutritious meal, and avoid alcohol or headache medication.",
  "Kembali ke Beranda": "Back to Home",
  "Dokumen Legal": "Legal Document",
  "Harap baca dokumen ini dengan seksama sebelum menggunakan platform BloodConnect. Dengan mendaftar, Anda menyetujui seluruh ketentuan di bawah ini.": "Please read this document carefully before using the BloodConnect platform. By registering, you agree to all terms below.",
  "Ada Pertanyaan?": "Any Questions?",
  "Baca juga: Kebijakan Privasi": "Also read: Privacy Policy",
  "Baca juga: Syarat & Ketentuan": "Also read: Terms & Conditions",
  "Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, hubungi kami di:": "If you have questions about these Terms & Conditions, contact us at:",
  "Hak Cipta Dilindungi.": "All Rights Reserved.",
  "Terakhir Diperbarui": "Last Updated",
  "Berlaku untuk": "Applies to",
  "Januari": "January",
  "Februari": "February",
  "Maret": "March",
  "April": "April",
  "Mei": "May",
  "Juni": "June",
  "Juli": "July",
  "Agustus": "August",
  "September": "September",
  "Oktober": "October",
  "November": "November",
  "Desember": "December",
  "Komitmen Privasi Kami": "Our Privacy Commitment",
  "Privasi Anda adalah prioritas kami. Dokumen ini menjelaskan secara transparan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.": "Your privacy is our priority. This document transparently explains how we collect, use, and protect your personal data.",
  "Tidak Menjual Data": "No Data Selling",
  "Kami tidak pernah menjual data Anda": "We never sell your data",
  "Lokasi Sementara": "Temporary Location",
  "GPS hanya aktif saat sesi Radar": "GPS is only active during Radar sessions",
  "Kontak Aman": "Secure Contact",
  "Nomor HP tersembunyi sampai Anda setuju": "Phone number is hidden until you agree",
  "Hubungi Petugas Perlindungan Data Kami": "Contact Our Data Protection Officer",
  "Untuk pertanyaan seputar privasi data, permintaan akses, atau penghapusan data:": "For questions about data privacy, access requests, or data deletion:",
  "Apakah saya memenuhi syarat untuk mendonorkan darah?": "Am I eligible to donate blood?",
  "Syarat dasar meliputi usia 17-60 tahun, berat badan minimal 45 kg, sehat jasmani dan rohani, tekanan darah normal (sistole 90-160, diastole 60-100 mmHg), serta kadar hemoglobin (Hb) yang cukup (12.5 - 17.0 g/dL). Anda juga tidak boleh sedang mengonsumsi obat antibiotik dalam 1 minggu terakhir, memiliki riwayat penyakit tertentu, atau sedang hamil/menyusui.": "Basic requirements include age 17-60, minimum weight of 45 kg, good physical and mental health, normal blood pressure (systolic 90-160, diastolic 60-100 mmHg), and sufficient hemoglobin (Hb) levels (12.5 - 17.0 g/dL). You also must not have taken antibiotics in the past week, have certain medical histories, or be pregnant/breastfeeding.",
  "Berapa lama jeda waktu yang aman antar donor darah?": "How long is the safe interval between blood donations?",
  "Jeda waktu ideal antar donor darah lengkap (whole blood) adalah minimal 8-12 minggu (sekitar 2 hingga 3 bulan). Hal ini untuk memastikan tubuh Anda memiliki cukup waktu guna memproduksi kembali sel darah merah baru dan mengembalikan kadar zat besi dalam darah ke tingkat yang normal.": "The ideal interval between whole blood donations is at least 8-12 weeks (around 2 to 3 months). This ensures your body has enough time to produce new red blood cells and restore iron levels to normal.",
  "Bagaimana BloodConnect melindungi privasi kontak saya?": "How does BloodConnect protect my contact privacy?",
  "Keamanan Anda adalah prioritas kami. Kami menggunakan sistem RLS (Row Level Security) database dan mekanisme persetujuan anonim. Kontak WhatsApp atau nomor telepon Anda tidak akan pernah dipublikasikan di peta atau dasbor publik. Nomor tersebut hanya akan dienkripsi dan dikirimkan secara pribadi ke pemohon setelah Anda mengklik tombol 'Terima Permintaan' secara sadar dan sukarela.": "Your safety is our priority. We use database Row Level Security (RLS) and an anonymous approval mechanism. Your WhatsApp contact or phone number will never be published on the map or public dashboard. It is encrypted and privately sent to the requester only after you consciously and voluntarily click the 'Accept Request' button.",
  "Apakah ada biaya dalam menggunakan layanan BloodConnect?": "Is there any fee to use BloodConnect?",
  "Tidak sama sekali. BloodConnect adalah proyek nirlaba berbasis kemanusiaan. Penggunaan website, pendaftaran pendonor, pemancaran sinyal darurat, dan koordinasi geospasial disediakan secara gratis 100% demi mempercepat penanganan situasi kritis donor darah di Indonesia.": "None at all. BloodConnect is a nonprofit humanitarian project. Website usage, donor registration, emergency signal broadcasting, and geospatial coordination are provided 100% free to speed up critical blood donation response in Indonesia.",
  "Apa bedanya BloodConnect dengan sistem stok darah PMI?": "How is BloodConnect different from PMI blood stock systems?",
  "PMI berfokus pada penyimpanan dan pengelolaan stok darah siap pakai secara tersentralisasi. BloodConnect berfokus pada koordinasi darurat antar-personal (P2P) secara langsung dan cepat saat stok darah tertentu di rumah sakit habis atau saat keluarga pasien harus mencari donor pengganti segera di sekitar area terdekat.": "PMI focuses on centralized storage and management of ready-to-use blood stock. BloodConnect focuses on fast direct person-to-person (P2P) emergency coordination when a specific hospital blood stock runs out or when a patient's family must quickly find replacement donors nearby.",
  "1. Penerimaan Syarat": "1. Acceptance of Terms",
  "2. Kelayakan Pengguna": "2. User Eligibility",
  "3. Akun & Keamanan": "3. Account & Security",
  "4. Penggunaan Layanan": "4. Service Usage",
  "5. Privasi & Data Lokasi": "5. Privacy & Location Data",
  "6. Penafian & Batasan Tanggung Jawab": "6. Disclaimer & Limitation of Liability",
  "7. Perubahan Syarat": "7. Changes to Terms",
  "1. Data yang Kami Kumpulkan": "1. Data We Collect",
  "2. Cara Kami Menggunakan Data": "2. How We Use Data",
  "3. Data Lokasi & Geolokasi": "3. Location & Geolocation Data",
  "4. Proteksi Data Kontak (Persetujuan Anonim)": "4. Contact Data Protection (Anonymous Approval)",
  "5. Berbagi Data dengan Pihak Ketiga": "5. Sharing Data with Third Parties",
  "6. Hak-Hak Anda": "6. Your Rights",
  "7. Pembaruan Kebijakan Ini": "7. Updates to This Policy",
  "Dengan mengakses atau menggunakan platform BloodConnect (\"Platform\"), Anda menyatakan telah membaca, memahami, dan menyetujui syarat dan ketentuan ini. Jika Anda tidak setuju dengan salah satu ketentuan, mohon untuk tidak menggunakan Platform kami. Platform ini dikembangkan oleh Mortala Production sebagai proyek nirlaba berbasis kemanusiaan untuk membantu koordinasi donor darah darurat di Indonesia.": "By accessing or using the BloodConnect platform (\"Platform\"), you state that you have read, understood, and agreed to these terms and conditions. If you do not agree with any provision, please do not use our Platform. This platform is developed by Mortala Production as a nonprofit humanitarian project to help coordinate emergency blood donation in Indonesia.",
  "Untuk menggunakan Platform ini, Anda harus: • Berusia minimal 17 tahun • Memiliki kapasitas hukum untuk mengikat perjanjian • Memberikan informasi yang akurat, terkini, dan lengkap saat registrasi • Tidak menggunakan Platform untuk tujuan yang melanggar hukum Kami berhak menangguhkan atau menghapus akun yang melanggar ketentuan ini tanpa pemberitahuan sebelumnya.": "To use this Platform, you must: • Be at least 17 years old • Have legal capacity to enter an agreement • Provide accurate, current, and complete information during registration • Not use the Platform for unlawful purposes We reserve the right to suspend or delete accounts that violate these terms without prior notice.",
  "Anda bertanggung jawab sepenuhnya atas: • Kerahasiaan kredensial akun (email & password) Anda • Semua aktivitas yang terjadi di bawah akun Anda • Memberitahu kami segera jika terjadi akses tidak sah BloodConnect tidak bertanggung jawab atas kerugian yang timbul akibat kegagalan Anda menjaga kerahasiaan akun.": "You are fully responsible for: • The confidentiality of your account credentials (email & password) • All activity under your account • Notifying us immediately if unauthorized access occurs BloodConnect is not responsible for losses arising from your failure to keep your account confidential.",
  "Platform BloodConnect dirancang semata-mata untuk keperluan koordinasi donor darah darurat. Anda setuju untuk: • Hanya menggunakan fitur \"Sinyal Darurat\" ketika benar-benar membutuhkan donor darah • Tidak membuat permintaan palsu atau menyesatkan • Menghormati privasi pendonor lain • Tidak menyebarkan informasi kontak pendonor yang Anda terima kepada pihak ketiga Penyalahgunaan Platform dapat mengakibatkan penangguhan akun dan tindakan hukum.": "The BloodConnect Platform is designed solely for emergency blood donation coordination. You agree to: • Use the \"Emergency Signal\" feature only when blood donation is genuinely needed • Not create false or misleading requests • Respect other donors' privacy • Not share donor contact information you receive with third parties Misuse of the Platform may result in account suspension and legal action.",
  "Penggunaan data lokasi Anda tunduk pada Kebijakan Privasi kami. Dengan menggunakan fitur geolokasi, Anda memberikan izin kepada Platform untuk: • Mengakses koordinat GPS perangkat Anda secara waktu nyata saat menggunakan Peta • Menampilkan jarak Anda ke permintaan donor terdekat kepada pendonor lain (tanpa mengungkapkan koordinat pasti) • Menyimpan riwayat aktivitas donor Anda secara anonim untuk keperluan analitik Anda dapat mencabut izin lokasi kapan saja melalui pengaturan browser atau perangkat.": "Use of your location data is subject to our Privacy Policy. By using geolocation features, you allow the Platform to: • Access your device GPS coordinates in real time while using the Map • Show your distance to nearby donor requests to other donors (without revealing exact coordinates) • Store your donor activity history anonymously for analytics You can revoke location permission at any time through browser or device settings.",
  "BloodConnect adalah platform penghubung, bukan penyedia layanan medis. Kami tidak: • Menjamin ketersediaan pendonor yang cocok pada setiap saat • Bertanggung jawab atas keputusan medis yang dibuat berdasarkan informasi di Platform • Menjamin keakuratan data stok darah PMI yang ditampilkan (bersifat indikatif/simulasi) Dalam situasi darurat medis, selalu hubungi 118 (Ambulans) atau 119 (BPBD) sebagai prioritas utama.": "BloodConnect is a connection platform, not a medical service provider. We do not: • Guarantee the availability of compatible donors at all times • Take responsibility for medical decisions made based on Platform information • Guarantee the accuracy of displayed PMI blood stock data (indicative/simulated) In medical emergencies, always contact 118 (Ambulance) or 119 (BPBD) as the first priority.",
  "Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui: • Notifikasi dalam aplikasi • Email ke alamat yang terdaftar • Pembaruan tanggal \"Terakhir Diperbarui\" di halaman ini Penggunaan Platform secara berkelanjutan setelah perubahan dianggap sebagai penerimaan syarat yang baru.": "We reserve the right to change these terms and conditions at any time. Changes will be communicated through: • In-app notifications • Email to the registered address • Updates to the \"Last Updated\" date on this page Continued use of the Platform after changes is considered acceptance of the new terms.",
  "Kami mengumpulkan beberapa jenis informasi untuk menyediakan dan meningkatkan layanan kami: Data yang Anda berikan secara langsung: • Nama lengkap dan alamat email saat registrasi • Nomor WhatsApp/telepon (opsional, untuk fitur kontak antar-pengguna) • Golongan darah yang Anda daftarkan sebagai pendonor • Informasi profil tambahan yang Anda isi secara sukarela Data yang dikumpulkan secara otomatis: • Koordinat GPS perangkat Anda (hanya saat menggunakan fitur Peta, dengan izin eksplisit) • Data browser (jenis browser, sistem operasi) untuk keperluan teknis • Waktu dan frekuensi penggunaan layanan": "We collect several types of information to provide and improve our services: Data you provide directly: • Full name and email address during registration • WhatsApp/phone number (optional, for user contact features) • Blood type registered as a donor • Additional profile information you voluntarily provide Automatically collected data: • Device GPS coordinates (only when using Map features, with explicit permission) • Browser data (browser type, operating system) for technical purposes • Time and frequency of service usage",
  "Data yang kami kumpulkan digunakan untuk: • Mencocokkan pendonor dengan pemohon berdasarkan golongan darah dan lokasi terdekat • Mengirimkan notifikasi sinyal darurat kepada pendonor yang relevan • Menampilkan statistik donasi anonim di Papan Peringkat • Meningkatkan performa dan keandalan Platform • Mendeteksi dan mencegah penyalahgunaan layanan • Mematuhi kewajiban hukum yang berlaku Kami TIDAK menggunakan data Anda untuk tujuan iklan komersial atau menjualnya kepada pihak ketiga manapun.": "The data we collect is used to: • Match donors with requesters based on blood type and nearby location • Send emergency signal notifications to relevant donors • Display anonymous donation statistics on the Leaderboard • Improve Platform performance and reliability • Detect and prevent service misuse • Comply with applicable legal obligations We DO NOT use your data for commercial advertising or sell it to any third party.",
  "Ini adalah fitur inti dari BloodConnect, dan kami sangat serius dalam melindunginya: Bagaimana lokasi Anda digunakan: • Koordinat GPS Anda diproses di server untuk menghitung jarak ke permintaan darurat • Kepada pendonor lain, yang ditampilkan hanyalah PERKIRAAN JARAK (contoh: \"2.3 km\"), bukan koordinat pasti Anda • Data lokasi TIDAK disimpan secara permanen — hanya digunakan dalam sesi aktif Kontrol Anda: • Anda dapat menonaktifkan izin lokasi kapan saja di pengaturan browser • Menonaktifkan lokasi tidak menghapus akun Anda, namun membatasi fungsionalitas Peta": "This is a core BloodConnect feature, and we take its protection seriously: How your location is used: • Your GPS coordinates are processed on the server to calculate distance to emergency requests • Other donors only see ESTIMATED DISTANCE (for example: \"2.3 km\"), not your exact coordinates • Location data is NOT stored permanently - it is only used during active sessions Your control: • You can disable location permission anytime in browser settings • Disabling location does not delete your account, but limits Map functionality",
  "Nomor WhatsApp/telepon Anda adalah informasi yang sangat sensitif. Kami melindunginya dengan: • Row Level Security (RLS) di tingkat database — nomor kontak tidak dapat diakses oleh pengguna lain secara langsung • Enkripsi data saat transit (HTTPS) dan saat istirahat (at-rest encryption) • Nomor kontak HANYA terungkap kepada pemohon SETELAH pendonor mengklik \"Terima Permintaan\" secara sadar • Log audit untuk setiap akses ke data sensitif Kami tidak pernah menampilkan nomor kontak Anda di halaman publik, peta, atau leaderboard.": "Your WhatsApp/phone number is highly sensitive information. We protect it with: • Database-level Row Level Security (RLS) - contact numbers cannot be directly accessed by other users • Encryption in transit (HTTPS) and at rest • Contact numbers are revealed ONLY to requesters AFTER donors consciously click \"Accept Request\" • Audit logs for every sensitive data access We never display your contact number on public pages, maps, or leaderboards.",
  "Kami membagikan data Anda HANYA dalam situasi berikut: • Kepada pendonor/pemohon lain: hanya data yang diperlukan untuk koordinasi (golongan darah, perkiraan jarak, nama depan) • Kepada penyedia infrastruktur: server dan database kami dikelola oleh penyedia cloud terpercaya yang terikat oleh perjanjian kerahasiaan • Kewajiban hukum: jika diwajibkan oleh pengadilan atau otoritas hukum yang berwenang Kami TIDAK pernah menjual data Anda kepada pengiklan, perusahaan data, atau pihak komersial manapun.": "We share your data ONLY in the following situations: • With other donors/requesters: only data needed for coordination (blood type, estimated distance, first name) • With infrastructure providers: our servers and databases are managed by trusted cloud providers bound by confidentiality agreements • Legal obligations: if required by a court or authorized legal authority We NEVER sell your data to advertisers, data companies, or any commercial party.",
  "Sebagai pengguna, Anda memiliki hak-hak berikut: • Hak Akses: meminta salinan data pribadi yang kami simpan tentang Anda • Hak Koreksi: memperbarui informasi yang tidak akurat di halaman Profil Anda • Hak Penghapusan: meminta penghapusan akun dan seluruh data terkait • Hak Portabilitas: meminta ekspor data Anda dalam format yang dapat dibaca mesin • Hak Keberatan: menolak pemrosesan data untuk tujuan tertentu Untuk menggunakan hak-hak ini, hubungi kami di mortala.production@gmail.com.": "As a user, you have the following rights: • Right of Access: request a copy of personal data we store about you • Right of Correction: update inaccurate information on your Profile page • Right of Deletion: request account deletion and all related data removal • Right of Portability: request export of your data in a machine-readable format • Right to Object: object to data processing for certain purposes To exercise these rights, contact us at mortala.production@gmail.com.",
  "Kebijakan Privasi ini dapat diperbarui sewaktu-waktu untuk mencerminkan: • Perubahan dalam praktik pengumpulan data kami • Persyaratan hukum baru yang berlaku • Umpan balik dari komunitas pengguna Setiap perubahan material akan diberitahukan melalui notifikasi dalam aplikasi dan email. Versi terbaru selalu tersedia di halaman ini.": "This Privacy Policy may be updated at any time to reflect: • Changes in our data collection practices • New applicable legal requirements • Feedback from the user community Any material changes will be communicated through in-app notifications and email. The latest version is always available on this page.",
};

const regexTranslations: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
  [/^Sistem Donor Darurat Aktif$/i, () => "Emergency Donor System Active"],
  [/^Sinyal SOS Aktif \((.+) & Sekitarnya\)$/i, (m) => `Active SOS Signals (${translateToEnglish(m[1])} and Nearby)`],
  [/^Sinyal SOS Aktif \((.+)\)$/i, (m) => `Active SOS Signals (${translateToEnglish(m[1])})`],
  [/^Butuh (\d+) Kantong$/i, (m) => `Needs ${m[1]} Bags`],
  [/^(\d+) detik lalu$/i, (m) => `${m[1]} seconds ago`],
  [/^(\d+) mnt lalu$/i, (m) => `${m[1]} min ago`],
  [/^(\d+) menit lalu$/i, (m) => `${m[1]} minutes ago`],
  [/^(\d+) jam lalu$/i, (m) => `${m[1]} ${m[1] === "1" ? "hour" : "hours"} ago`],
  [/^(\d+) hari lalu$/i, (m) => `${m[1]} ${m[1] === "1" ? "day" : "days"} ago`],
  [/^(\d+) menit yang lalu$/i, (m) => `${m[1]} minutes ago`],
  [/^(\d+) jam yang lalu$/i, (m) => `${m[1]} ${m[1] === "1" ? "hour" : "hours"} ago`],
  [/^(\d+) hari yang lalu$/i, (m) => `${m[1]} ${m[1] === "1" ? "day" : "days"} ago`],
  [/^Baru saja$/i, () => "Just now"],
  [/^Stok (.+): (\d+) kantong \((.+)\)$/i, (m) => `Stock ${m[1]}: ${m[2]} bags (${translateToEnglish(m[3])})`],
  [/^Pendonor Siaga \((.+)\)$/i, (m) => `Ready Donor (${m[1]})`],
  [/^Titik Terpilih \((.+)\)$/i, (m) => `Selected Point (${m[1]})`],
  [/^(\d+) Kali$/i, (m) => `${m[1]} Times`],
  [/^(\d+) Tahun$/i, (m) => `${m[1]} Year`],
  [/^(\d+) Thn$/i, (m) => `${m[1]} Yrs`],
  [/^(\d+)x \((\d+) Bln\)$/i, (m) => `${m[1]}x (${m[2]} Mo)`],
  [/^Jarak (.+) • Butuh (\d+) kantong$/i, (m) => `Distance ${m[1]} - Needs ${m[2]} bags`],
  [/^Menampilkan (\d+) pemohon di sekitar Anda\.$/i, (m) => `Showing ${m[1]} requesters around you.`],
  [/^Aktif: (.+)$/i, (m) => `Active: ${m[1]}`],
  [/^Urgensi: (.+)$/i, (m) => `Urgency: ${translateToEnglish(m[1])}`],
  [/^(\d+) Poin$/i, (m) => `${m[1]} Points`],
  [/^(\d+)x Donor$/i, (m) => `${m[1]}x Donations`],
  [/^Anda baru bisa mendonorkan darah lagi dalam (\d+) hari ke depan \(Jeda minimal 90 hari setelah donor terakhir\)\.$/i, (m) => `You can donate blood again in ${m[1]} days (minimum interval is 90 days after the last donation).`],
  [/^Belum layak donor \(Harus menunggu (\d+) hari lagi\)$/i, (m) => `Not eligible to donate yet (Must wait ${m[1]} more days)`],
  [/^Rhesus Positif \(\+\)$/i, () => "Rhesus Positive (+)"],
  [/^Rhesus Negatif \(-\)$/i, () => "Rhesus Negative (-)"],
  [/^Rhesus Positif \(\+\)$/i, () => "Rhesus Positive (+)"],
  [/^Rhesus Negatif \(-\)$/i, () => "Rhesus Negative (-)"],
  [/^Rhesus (Positif|Negatif) \(([+-])\)$/i, (m) => `Rhesus ${m[1] === "Positif" ? "Positive" : "Negative"} (${m[2]})`],
  [/^Terakhir Diperbarui: (.+) · Berlaku untuk: (.+)$/i, (m) => `Last Updated: ${m[1]} - Applies to: ${m[2]}`],
];

const enToId = Object.fromEntries(Object.entries(idToEn).map(([id, en]) => [en, id]));

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function translateToEnglish(text: string) {
  const normalized = normalizeText(text);
  if (!normalized) return text;
  const restored = enToId[normalized] ?? normalized;
  if (idToEn[restored]) return idToEn[restored];
  for (const [pattern, replacer] of regexTranslations) {
    const match = restored.match(pattern);
    if (match) return replacer(match);
  }
  return replaceKnownFragments(restored, idToEn);
}

function translateToIndonesian(text: string) {
  const normalized = normalizeText(text);
  if (!normalized) return text;
  if (enToId[normalized]) return enToId[normalized];
  return replaceKnownFragments(normalized, enToId);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceKnownFragments(text: string, dictionary: Record<string, string>) {
  return Object.entries(dictionary)
    .sort(([a], [b]) => b.length - a.length)
    .reduce((current, [source, target]) => {
      const pattern = new RegExp(`(^|[^A-Za-z])(${escapeRegExp(source)})(?=$|[^A-Za-z])`, "g");
      return current.replace(pattern, (_, prefix) => `${prefix}${target}`);
    }, text);
}

function translateValue(value: string, language: AppLanguage) {
  if (!value.trim()) return value;
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const translated = language === "en" ? translateToEnglish(value) : translateToIndonesian(value);
  return `${leading}${translated}${trailing}`;
}

function applyLanguage(language: AppLanguage) {
  if (typeof document === "undefined") return;

  document.documentElement.lang = language;
  document.title = language === "en" ? "BloodConnect - Emergency Blood Donation" : "BloodConnect - Donor Darah Darurat";

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (!node.textContent || !node.textContent.trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      // Skip translation if the element or any ancestor has data-no-translate="true"
      let curr: HTMLElement | null = parent;
      while (curr) {
        if (curr.getAttribute && curr.getAttribute("data-no-translate") === "true") {
          return NodeFilter.FILTER_REJECT;
        }
        curr = curr.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  textNodes.forEach((node) => {
    const next = translateValue(node.textContent ?? "", language);
    if (node.textContent !== next) node.textContent = next;
  });

  document.querySelectorAll<HTMLElement>("[placeholder], [title], [aria-label]").forEach((el) => {
    // Skip if the element or any ancestor has data-no-translate="true"
    let curr: HTMLElement | null = el;
    let shouldSkip = false;
    while (curr) {
      if (curr.getAttribute && curr.getAttribute("data-no-translate") === "true") {
        shouldSkip = true;
        break;
      }
      curr = curr.parentElement;
    }
    if (shouldSkip) return;

    ["placeholder", "title", "aria-label"].forEach((attr) => {
      const current = el.getAttribute(attr);
      if (!current) return;
      const next = translateValue(current, language);
      if (current !== next) el.setAttribute(attr, next);
    });
  });
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("id");

  const setLanguage = (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    localStorage.setItem("bloodconnect_language", nextLanguage);
  };

  useEffect(() => {
    const storedLanguage = localStorage.getItem("bloodconnect_language");
    if (storedLanguage === "en" || storedLanguage === "id") {
      setLanguageState(storedLanguage);
    }
  }, []);

  useEffect(() => {
    applyLanguage(language);

    const originalAlert = window.alert;
    window.alert = (message?: any) => {
      if (typeof message === "string") {
        originalAlert(translateValue(message, language));
      } else {
        originalAlert(message);
      }
    };

    let frame = 0;
    const observer = new MutationObserver((mutations) => {
      // Skip scheduling translation if all mutations occurred inside data-no-translate elements
      const hasOutsideMutation = mutations.some((mutation) => {
        let node: Node | null = mutation.target;
        while (node && node !== document.body) {
          if (node.nodeType === 1) {
            const el = node as Element;
            if (el.getAttribute("data-no-translate") === "true") {
              return false;
            }
          }
          node = node.parentNode;
        }
        return true;
      });

      if (!hasOutsideMutation) return;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => applyLanguage(language));
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });

    return () => {
      window.alert = originalAlert;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
