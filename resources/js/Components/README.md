# Folder Components

Folder ini digunakan untuk menyimpan **komponen React yang bisa digunakan kembali** (reusable components) di berbagai halaman.

## Struktur Folder

```
resources/js/
├── Components/          ← Folder untuk komponen reusable
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Navbar.jsx
│   └── ...
├── Pages/              ← Folder untuk halaman Inertia.js
│   ├── Home.jsx
│   ├── Catalog.jsx
│   └── ...
└── assets/            ← Folder untuk assets (gambar, dll)
```

## Kapan Menggunakan Components vs Pages?

### Gunakan `Components/` untuk:
- ✅ Komponen yang digunakan di lebih dari satu halaman
- ✅ Komponen UI yang bisa digunakan kembali (Button, Card, Modal, dll)
- ✅ Komponen kecil yang menjadi bagian dari halaman

### Gunakan `Pages/` untuk:
- ✅ Halaman utama yang di-route oleh Inertia.js
- ✅ Komponen yang langsung diakses melalui URL
- ✅ Komponen yang tidak digunakan di tempat lain

## Cara Menggunakan Komponen

### Import dengan path alias `@`:
```jsx
import Button from '@/Components/Button'
import Navbar from '@/Components/Navbar'
```

### Atau dengan relative path:
```jsx
import Button from '../Components/Button'
```

## Contoh Komponen

Lihat `ExampleComponent.jsx` untuk contoh struktur komponen yang bisa digunakan.

