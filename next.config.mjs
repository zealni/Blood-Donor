/** @type {import('next').NextConfig} */
const nextConfig = {
  // Menonaktifkan Strict Mode untuk mencegah Leaflet menginisialisasi peta dua kali 
  // pada saat tahap pengembangan (development).
  reactStrictMode: false,
};

export default nextConfig;
