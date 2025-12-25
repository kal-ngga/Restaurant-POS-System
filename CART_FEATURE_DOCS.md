# Fitur Keranjang (Cart) - Dokumentasi

## Overview
Fitur keranjang sederhana yang terintegrasi dengan database MySQL dan aplikasi web React/Laravel. Pengguna dapat menambah produk ke keranjang, mengatur jumlah, dan melihat total harga.

## Fitur Utama

### 1. **Database Schema**
- **Table: `carts`**
  - `id` (Primary Key)
  - `user_id` (Foreign Key ke users)
  - `created_at`, `updated_at`

- **Table: `cart_items`**
  - `id` (Primary Key)
  - `cart_id` (Foreign Key ke carts)
  - `menu_item_id` (Foreign Key ke menu_items)
  - `quantity` (Jumlah item)
  - `price` (Harga per item)
  - `notes` (Catatan/keterangan, nullable)
  - `created_at`, `updated_at`

### 2. **Backend (Laravel)**

#### Model
- `App\Models\Cart` - Model untuk keranjang
- `App\Models\CartItem` - Model untuk item dalam keranjang
- Relations sudah disetup di `App\Models\User`

#### Controller
- `App\Http\Controllers\CartController`
  - `index()` - Get cart items & total
  - `add()` - Tambah item ke cart
  - `update()` - Update quantity item
  - `remove()` - Hapus item dari cart
  - `clear()` - Kosongkan semua cart

#### Routes
Semua routes dilindungi dengan `auth` middleware:
```
POST   /cart/add          - Tambah item ke cart
PUT    /cart/update/{id}  - Update quantity
DELETE /cart/remove/{id}  - Hapus item
POST   /cart/clear        - Kosongkan cart
GET    /cart              - Lihat cart
```

### 3. **Frontend (React Components)**

#### Component: `Cart.jsx`
Popup slider yang menampilkan:
- Daftar item dalam keranjang
- Kontrol quantity (+ / -)
- Tombol hapus item
- Total harga
- Tombol "Bersihkan Keranjang" dan "Checkout"

#### Component: `Navbar.jsx`
Diupdate dengan:
- Icon keranjang (shopping cart)
- Badge menampilkan jumlah item di cart
- Tombol untuk membuka Cart slider
- Auto-refresh cart count setiap 5 detik

#### Page: `Catalog.jsx`
Diupdate dengan:
- Tombol "+" pada setiap card makanan untuk add to cart
- Modal untuk memilih quantity sebelum menambah ke cart
- Integrasi dengan Cart component

### 4. **User Flow**

1. User melihat katalog makanan
2. Hover di card makanan, tekan tombol "+"
3. Modal muncul untuk memilih quantity
4. Klik "Tambah ke Keranjang"
5. Item masuk ke database
6. Klik icon cart di navbar untuk membuka slider
7. Di dalam slider bisa:
   - Lihat semua item
   - Ubah quantity
   - Hapus item
   - Lihat total harga
   - Bersihkan cart
   - Checkout (ready untuk diimplementasi)

## Penggunaan API

### Add to Cart
```javascript
POST /cart/add
Body: {
    "menu_item_id": 1,
    "quantity": 2
}
```

### Get Cart
```javascript
GET /cart
Response: {
    "items": [...],
    "total": 50000,
    "count": 2
}
```

### Update Item Quantity
```javascript
PUT /cart/update/{cartItemId}
Body: {
    "quantity": 3
}
```

### Remove Item
```javascript
DELETE /cart/remove/{cartItemId}
```

### Clear Cart
```javascript
POST /cart/clear
```

## Notes
- Setiap user memiliki 1 cart yang otomatis dibuat saat user login
- Harga item disimpan di `cart_items` table untuk historical accuracy
- Cart items akan otomatis dihapus jika user dihapus (cascade delete)
- Component sudah responsive dan bisa diakses dari mobile

## Future Enhancements
- Implementasi Checkout functionality
- Payment gateway integration
- Order history
- Cart persistence (LocalStorage backup)
- Rating & review after purchase
