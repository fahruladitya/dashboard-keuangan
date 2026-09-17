# Dashboard Keuangan

Dashboard kewangan peribadi (React + Vite) dalam Ringgit Malaysia, dengan pencatatan manual pemasukan/pengeluaran, anggaran per kategori, target tabungan, dan laporan bulanan.

## Langkah menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` di browser.

## Langkah online-kan lewat GitHub Pages

1. **Edit `vite.config.js`**
   Ganti `base: '/nama-repo-kamu/'` dengan nama repo GitHub yang akan kamu buat. Contoh, kalau repo-nya `dashboard-keuangan`, maka:
   ```js
   base: '/dashboard-keuangan/',
   ```

2. **Buat repo baru di GitHub**
   Buka github.com, klik "New repository", beri nama (misal `dashboard-keuangan`), jangan centang "Add README" (karena sudah ada), lalu klik "Create repository".

3. **Push project ini ke repo tersebut**
   Jalankan di folder project:
   ```bash
   git init
   git add .
   git commit -m "init dashboard keuangan"
   git branch -M main
   git remote add origin https://github.com/USERNAME/dashboard-keuangan.git
   git push -u origin main
   ```
   Ganti `USERNAME` dengan username GitHub kamu.

4. **Install dependency & deploy**
   ```bash
   npm install
   npm run deploy
   ```
   Perintah ini akan build project lalu otomatis push hasil build ke branch `gh-pages`.

5. **Aktifkan GitHub Pages**
   Di halaman repo GitHub: masuk **Settings → Pages**. Di bagian "Branch", pilih `gh-pages` dan folder `/ (root)`, lalu klik **Save**.

6. **Selesai**
   Setelah 1-2 menit, dashboard bisa diakses di:
   ```
   https://USERNAME.github.io/dashboard-keuangan/
   ```

## Update setelah ada perubahan

Setiap kali ada perubahan pada dashboard:
```bash
git add .
git commit -m "update dashboard"
git push
npm run deploy
```

## Catatan

Data transaksi tersimpan hanya di memori browser (state React), jadi akan hilang saat halaman di-refresh. Kalau ingin data tersimpan permanen antar sesi, perlu ditambahkan penyimpanan seperti `localStorage` atau backend/database.
