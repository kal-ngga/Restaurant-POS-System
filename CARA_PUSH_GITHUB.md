# 🚀 Cara Push ke GitHub - Langkah Praktis

Repository GitHub Anda sudah dibuat di: **https://github.com/kal-ngga/Restaurant-POS-System**

Remote sudah dikonfigurasi dengan benar. Sekarang Anda perlu melakukan autentikasi untuk push code.

## 🔐 Opsi 1: Menggunakan Personal Access Token (Paling Mudah)

### Langkah 1: Buat Personal Access Token di GitHub

1. Buka [GitHub.com](https://github.com) dan login
2. Klik foto profil Anda di pojok kanan atas → **Settings**
3. Scroll ke bawah, klik **Developer settings** (di sidebar kiri)
4. Klik **Personal access tokens** → **Tokens (classic)**
5. Klik **Generate new token** → **Generate new token (classic)**
6. Isi:
   - **Note**: `Restaurant POS System` (atau nama lain)
   - **Expiration**: Pilih durasi (misalnya 90 days atau No expiration)
   - **Scopes**: Centang **`repo`** (ini akan memberi akses penuh ke repository)
7. Klik **Generate token** di bawah
8. **⚠️ PENTING**: Salin token yang muncul (Anda tidak akan bisa melihatnya lagi setelah ini!)

### Langkah 2: Push Menggunakan Token

Jalankan perintah berikut di terminal:

```bash
cd "/Users/kalingga/Dev/Telkom/SEM 03/TUBES/Restaurant-POS-System"
git push -u origin master
```

Ketika diminta:
- **Username**: Masukkan username GitHub Anda (`kal-ngga`)
- **Password**: Masukkan **Personal Access Token** yang Anda buat (bukan password GitHub!)

---

## 🔑 Opsi 2: Setup SSH Key (Untuk Masa Depan)

Jika Anda ingin menggunakan SSH (lebih praktis untuk push berikutnya), ikuti langkah ini:

### Langkah 1: Generate SSH Key

```bash
ssh-keygen -t ed25519 -C "email-anda@example.com"
```

Tekan Enter untuk semua pertanyaan (atau isi passphrase jika mau).

### Langkah 2: Copy SSH Key ke Clipboard

```bash
cat ~/.ssh/id_ed25519.pub | pbcopy
```

### Langkah 3: Tambahkan SSH Key ke GitHub

1. Buka GitHub → Settings → **SSH and GPG keys**
2. Klik **New SSH key**
3. **Title**: Isi nama (misalnya: "MacBook")
4. **Key**: Paste key yang sudah di-copy (Cmd+V)
5. Klik **Add SSH key**

### Langkah 4: Update Remote ke SSH

```bash
cd "/Users/kalingga/Dev/Telkom/SEM 03/TUBES/Restaurant-POS-System"
git remote set-url origin git@github.com:kal-ngga/Restaurant-POS-System.git
git push -u origin master
```

---

## ✅ Opsi 3: Menggunakan GitHub CLI (gh)

Jika Anda sudah install GitHub CLI:

```bash
gh auth login
git push -u origin master
```

---

## 📋 Perintah Cepat (Setelah Autentikasi)

Setelah berhasil push pertama kali, untuk push perubahan berikutnya cukup:

```bash
git add .
git commit -m "Deskripsi perubahan"
git push
```

---

## 🎯 Rekomendasi

**Untuk sekarang, gunakan Opsi 1 (Personal Access Token)** karena paling cepat dan mudah!

Setelah berhasil push, Anda bisa setup SSH key (Opsi 2) untuk kemudahan di masa depan.

---

**Setelah push berhasil, refresh halaman repository di browser dan Anda akan melihat semua file project Anda!** 🎉

