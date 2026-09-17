import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// PENTING: ganti '/nama-repo-kamu/' di bawah dengan nama repo GitHub kamu
// Contoh: kalau repo-nya https://github.com/username/dashboard-keuangan
// maka base = '/dashboard-keuangan/'
export default defineConfig({
  plugins: [react()],
  base: "/dashboard-keuangan/",
});
