import Link from "next/link";
import { Heart, ArrowLeft, Shield, FileText, Users, AlertTriangle, Lock, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Syarat & Ketentuan | BloodConnect",
  description: "Baca syarat dan ketentuan penggunaan platform BloodConnect — sistem koordinasi donor darah darurat berbasis geolokasi.",
};

const sections = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: "1. Penerimaan Syarat",
    content: `Dengan mengakses atau menggunakan platform BloodConnect ("Platform"), Anda menyatakan telah membaca, memahami, dan menyetujui syarat dan ketentuan ini. Jika Anda tidak setuju dengan salah satu ketentuan, mohon untuk tidak menggunakan Platform kami.

Platform ini dikembangkan oleh Mortala Production sebagai proyek nirlaba berbasis kemanusiaan untuk membantu koordinasi donor darah darurat di Indonesia.`,
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "2. Kelayakan Pengguna",
    content: `Untuk menggunakan Platform ini, Anda harus:
• Berusia minimal 17 tahun
• Memiliki kapasitas hukum untuk mengikat perjanjian
• Memberikan informasi yang akurat, terkini, dan lengkap saat registrasi
• Tidak menggunakan Platform untuk tujuan yang melanggar hukum

Kami berhak menangguhkan atau menghapus akun yang melanggar ketentuan ini tanpa pemberitahuan sebelumnya.`,
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "3. Akun & Keamanan",
    content: `Anda bertanggung jawab sepenuhnya atas:
• Kerahasiaan kredensial akun (email & password) Anda
• Semua aktivitas yang terjadi di bawah akun Anda
• Memberitahu kami segera jika terjadi akses tidak sah

BloodConnect tidak bertanggung jawab atas kerugian yang timbul akibat kegagalan Anda menjaga kerahasiaan akun.`,
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "4. Penggunaan Layanan",
    content: `Platform BloodConnect dirancang semata-mata untuk keperluan koordinasi donor darah darurat. Anda setuju untuk:
• Hanya menggunakan fitur "Sinyal Darurat" ketika benar-benar membutuhkan donor darah
• Tidak membuat permintaan palsu atau menyesatkan
• Menghormati privasi pendonor lain
• Tidak menyebarkan informasi kontak pendonor yang Anda terima kepada pihak ketiga

Penyalahgunaan Platform dapat mengakibatkan penangguhan akun dan tindakan hukum.`,
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "5. Privasi & Data Lokasi",
    content: `Penggunaan data lokasi Anda tunduk pada Kebijakan Privasi kami. Dengan menggunakan fitur geolokasi, Anda memberikan izin kepada Platform untuk:
• Mengakses koordinat GPS perangkat Anda secara real-time saat menggunakan Peta Radar
• Menampilkan jarak Anda ke permintaan donor terdekat kepada pendonor lain (tanpa mengungkapkan koordinat pasti)
• Menyimpan riwayat aktivitas donor Anda secara anonim untuk keperluan analitik

Anda dapat mencabut izin lokasi kapan saja melalui pengaturan browser atau perangkat.`,
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: "6. Penafian & Batasan Tanggung Jawab",
    content: `BloodConnect adalah platform penghubung, bukan penyedia layanan medis. Kami tidak:
• Menjamin ketersediaan pendonor yang cocok pada setiap saat
• Bertanggung jawab atas keputusan medis yang dibuat berdasarkan informasi di Platform
• Menjamin keakuratan data stok darah PMI yang ditampilkan (bersifat indikatif/simulasi)

Dalam situasi darurat medis, selalu hubungi 118 (Ambulans) atau 119 (BPBD) sebagai prioritas utama.`,
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: "7. Perubahan Syarat",
    content: `Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui:
• Notifikasi dalam aplikasi
• Email ke alamat yang terdaftar
• Pembaruan tanggal "Terakhir Diperbarui" di halaman ini

Penggunaan Platform secara berkelanjutan setelah perubahan dianggap sebagai penerimaan syarat yang baru.`,
  },
];

export default function TermsPage() {
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
      <div className="bg-gradient-to-br from-primary/5 via-white to-rose-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 border border-primary/20">
            <FileText className="w-4 h-4" />
            Dokumen Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Syarat &amp; Ketentuan
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Harap baca dokumen ini dengan seksama sebelum menggunakan platform BloodConnect. Dengan mendaftar, Anda menyetujui seluruh ketentuan di bawah ini.
          </p>
          <p className="mt-4 text-xs text-slate-400 font-medium">
            Terakhir Diperbarui: 26 Mei 2026 · Berlaku untuk: BloodConnect v2.0
          </p>
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
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
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
        <div className="mt-10 bg-gradient-to-r from-primary/10 to-rose-50 rounded-3xl border border-primary/20 p-8 text-center">
          <h3 className="text-lg font-extrabold text-slate-900 mb-2">Ada Pertanyaan?</h3>
          <p className="text-slate-600 text-sm mb-4">
            Jika Anda memiliki pertanyaan tentang Syarat &amp; Ketentuan ini, hubungi kami di:
          </p>
          <a
            href="mailto:mortala.production@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            mortala.production@gmail.com
          </a>
          <div className="mt-6 pt-6 border-t border-primary/20">
            <Link
              href="/privacy"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Baca juga: Kebijakan Privasi →
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
            <Link href="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
            <Link href="/register" className="hover:text-primary transition-colors">Daftar Sekarang</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
