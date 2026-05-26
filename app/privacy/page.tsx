import Link from "next/link";
import { Heart, ArrowLeft, Shield, Eye, Database, Share2, UserCheck, Lock, RefreshCw, MapPin } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi | BloodConnect",
  description: "Pelajari bagaimana BloodConnect mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
};

const sections = [
  {
    icon: <Eye className="w-5 h-5" />,
    title: "1. Data yang Kami Kumpulkan",
    content: `Kami mengumpulkan beberapa jenis informasi untuk menyediakan dan meningkatkan layanan kami:

Data yang Anda berikan secara langsung:
• Nama lengkap dan alamat email saat registrasi
• Nomor WhatsApp/telepon (opsional, untuk fitur kontak antar-pengguna)
• Golongan darah yang Anda daftarkan sebagai pendonor
• Informasi profil tambahan yang Anda isi secara sukarela

Data yang dikumpulkan secara otomatis:
• Koordinat GPS perangkat Anda (hanya saat menggunakan fitur Peta Radar, dengan izin eksplisit)
• Data browser (jenis browser, sistem operasi) untuk keperluan teknis
• Waktu dan frekuensi penggunaan layanan`,
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "2. Cara Kami Menggunakan Data",
    content: `Data yang kami kumpulkan digunakan untuk:

• Mencocokkan pendonor dengan pemohon berdasarkan golongan darah dan lokasi terdekat
• Mengirimkan notifikasi sinyal darurat kepada pendonor yang relevan
• Menampilkan statistik donasi anonim di Leaderboard
• Meningkatkan performa dan keandalan Platform
• Mendeteksi dan mencegah penyalahgunaan layanan
• Mematuhi kewajiban hukum yang berlaku

Kami TIDAK menggunakan data Anda untuk tujuan iklan komersial atau menjualnya kepada pihak ketiga manapun.`,
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    title: "3. Data Lokasi & Geolokasi",
    content: `Ini adalah fitur inti dari BloodConnect, dan kami sangat serius dalam melindunginya:

Bagaimana lokasi Anda digunakan:
• Koordinat GPS Anda diproses di server untuk menghitung jarak ke permintaan darurat
• Kepada pendonor lain, yang ditampilkan hanyalah PERKIRAAN JARAK (contoh: "2.3 km"), bukan koordinat pasti Anda
• Data lokasi TIDAK disimpan secara permanen — hanya digunakan dalam sesi aktif

Kontrol Anda:
• Anda dapat menonaktifkan izin lokasi kapan saja di pengaturan browser
• Menonaktifkan lokasi tidak menghapus akun Anda, namun membatasi fungsionalitas Peta Radar`,
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "4. Proteksi Data Kontak (Anonymous Handshake)",
    content: `Nomor WhatsApp/telepon Anda adalah informasi yang sangat sensitif. Kami melindunginya dengan:

• Row Level Security (RLS) di tingkat database — nomor kontak tidak dapat diakses oleh pengguna lain secara langsung
• Enkripsi data saat transit (HTTPS) dan saat istirahat (at-rest encryption)
• Nomor kontak HANYA terungkap kepada pemohon SETELAH pendonor mengklik "Terima Permintaan" secara sadar
• Log audit untuk setiap akses ke data sensitif

Kami tidak pernah menampilkan nomor kontak Anda di halaman publik, peta, atau leaderboard.`,
  },
  {
    icon: <Share2 className="w-5 h-5" />,
    title: "5. Berbagi Data dengan Pihak Ketiga",
    content: `Kami membagikan data Anda HANYA dalam situasi berikut:

• Kepada pendonor/pemohon lain: hanya data yang diperlukan untuk koordinasi (golongan darah, perkiraan jarak, nama depan)
• Kepada penyedia infrastruktur: server dan database kami dikelola oleh penyedia cloud terpercaya yang terikat oleh perjanjian kerahasiaan
• Kewajiban hukum: jika diwajibkan oleh pengadilan atau otoritas hukum yang berwenang

Kami TIDAK pernah menjual data Anda kepada pengiklan, perusahaan data, atau pihak komersial manapun.`,
  },
  {
    icon: <UserCheck className="w-5 h-5" />,
    title: "6. Hak-Hak Anda",
    content: `Sebagai pengguna, Anda memiliki hak-hak berikut:

• Hak Akses: meminta salinan data pribadi yang kami simpan tentang Anda
• Hak Koreksi: memperbarui informasi yang tidak akurat di halaman Profil Anda
• Hak Penghapusan: meminta penghapusan akun dan seluruh data terkait
• Hak Portabilitas: meminta ekspor data Anda dalam format yang dapat dibaca mesin
• Hak Keberatan: menolak pemrosesan data untuk tujuan tertentu

Untuk menggunakan hak-hak ini, hubungi kami di mortala.production@gmail.com.`,
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: "7. Pembaruan Kebijakan Ini",
    content: `Kebijakan Privasi ini dapat diperbarui sewaktu-waktu untuk mencerminkan:
• Perubahan dalam praktik pengumpulan data kami
• Persyaratan hukum baru yang berlaku
• Umpan balik dari komunitas pengguna

Setiap perubahan material akan diberitahukan melalui notifikasi dalam aplikasi dan email. Versi terbaru selalu tersedia di halaman ini.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            <span className="font-extrabold text-slate-900">BloodConnect</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-sm font-bold mb-6 border border-blue-200">
            <Shield className="w-4 h-4" />
            Komitmen Privasi Kami
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Kebijakan Privasi
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Privasi Anda adalah prioritas kami. Dokumen ini menjelaskan secara transparan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.
          </p>
          <p className="mt-4 text-xs text-slate-400 font-medium">
            Terakhir Diperbarui: 26 Mei 2026 · Berlaku untuk: BloodConnect v2.0
          </p>

          {/* Privacy Highlights */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            {[
              { icon: "🔒", title: "Zero Data Selling", desc: "Kami tidak pernah menjual data Anda" },
              { icon: "📍", title: "Lokasi Sementara", desc: "GPS hanya aktif saat sesi Radar" },
              { icon: "🤝", title: "Kontak Aman", desc: "Nomor HP tersembunyi sampai Anda setuju" },
            ].map((h, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="text-2xl mb-2">{h.icon}</div>
                <div className="font-bold text-slate-900 text-sm">{h.title}</div>
                <div className="text-slate-500 text-xs mt-1">{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 flex-shrink-0">
                  {section.icon}
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">{section.title}</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-10 bg-gradient-to-r from-blue-50 to-slate-50 rounded-3xl border border-blue-100 p-8 text-center">
          <h3 className="text-lg font-extrabold text-slate-900 mb-2">Hubungi Data Protection Officer Kami</h3>
          <p className="text-slate-600 text-sm mb-4">
            Untuk pertanyaan seputar privasi data, permintaan akses, atau penghapusan data:
          </p>
          <a
            href="mailto:mortala.production@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-colors"
          >
            mortala.production@gmail.com
          </a>
          <div className="mt-6 pt-6 border-t border-blue-100">
            <Link
              href="/terms"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              Baca juga: Syarat &amp; Ketentuan →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer simple */}
      <div className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} Mortala Production. Hak Cipta Dilindungi.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Syarat &amp; Ketentuan</Link>
            <Link href="/register" className="hover:text-primary transition-colors">Daftar Sekarang</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
