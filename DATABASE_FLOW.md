# 📊 Cara Kerja Login/Register ke Database

## Database Structure

### Users Table (`restaurant_pos_db.users`)
```sql
CREATE TABLE users (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT
    name                VARCHAR(255)         -- Nama user
    email               VARCHAR(255) UNIQUE  -- Email unik (login identifier)
    password            VARCHAR(255)         -- Password (di-hash dengan bcrypt)
    phone               VARCHAR(255)         -- Optional: No telp
    role                ENUM(...)            -- customer, admin, staff, kitchen
    email_verified_at   TIMESTAMP            -- Optional
    remember_token      VARCHAR(100)         -- Optional
    created_at          TIMESTAMP            -- Waktu dibuat
    updated_at          TIMESTAMP            -- Waktu update terakhir
)
```

---

## 1️⃣ REGISTER FLOW

### Frontend (React - Register.jsx)
```javascript
User input:
- email: "john@example.com"
- username: "johndoe"
- password: "SecurePass123"

Click "Register" button
    ↓
fetch POST /register {
    "email": "john@example.com",
    "username": "johndoe",
    "password": "SecurePass123",
    "password_confirmation": "SecurePass123"
}
```

### Backend (Laravel - AuthController.php)
```php
public function register(Request $request)
{
    // 1. Validasi input
    $validated = $request->validate([
        'email' => 'required|email|unique:users,email',  // Cek email belum terdaftar
        'password' => 'required|string|min:8|regex:/[A-Z]/|regex:/[0-9]/',
    ]);

    // 2. Create user baru + hash password
    $user = User::create([
        'name' => $validated['email'],  // Nama = email (bisa diganti dengan username)
        'email' => $validated['email'],
        'password' => Hash::make($validated['password']),  // Hash dengan bcrypt
    ]);
    
    // 3. Auto-login user
    Auth::login($user);
    
    // 4. Return success
    return response()->json(['ok' => true]);
}
```

### Database INSERT
```sql
INSERT INTO users (name, email, password, role, created_at, updated_at) 
VALUES (
    'john@example.com',
    'john@example.com',
    '$2y$12$...',  -- Hashed password (bcrypt)
    'customer',    -- Default role
    NOW(),
    NOW()
);
```

**Result di Database:**
```
id  | name                | email              | password (hashed) | role      | created_at
1   | john@example.com    | john@example.com   | $2y$12$...        | customer  | 2025-11-27 10:30:00
```

---

## 2️⃣ LOGIN FLOW

### Frontend (React - Home.jsx)
```javascript
User input:
- email: "john@example.com"
- password: "SecurePass123"

Click "Masuk" button
    ↓
fetch POST /login {
    "email": "john@example.com",
    "password": "SecurePass123"
}
```

### Backend (Laravel - AuthController.php)
```php
public function login(Request $request)
{
    // 1. Validasi input
    $data = $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
    ]);

    // 2. Coba cari user di database & compare password
    if (!Auth::attempt($data)) {
        // Password SALAH atau email tidak ditemukan
        return response()->json(
            ['message' => 'Email atau password salah'], 
            422
        );
    }

    // 3. Login BERHASIL
    $request->session()->regenerate();  // Buat session baru
    return response()->json(['ok' => true]);
}
```

### Database Query yang Dijalankan
```sql
-- Laravel otomatis melakukan:
SELECT * FROM users WHERE email = 'john@example.com' LIMIT 1;

-- Kemudian membandingkan:
// Hash::check('SecurePass123', '$2y$12$...')  → true = BERHASIL
```

**Session Created:**
```
Session ID: abc123def456
User ID: 1
Expires: [sekarang + 2 jam] (SESSION_LIFETIME=120 minutes)
```

---

## 3️⃣ CARA CEK DATA DI DATABASE

### Opsi 1: Menggunakan MySQL CLI
```bash
# Login ke MySQL
mysql -u root -p

# Pilih database
USE restaurant_pos_db;

# Lihat semua user
SELECT id, name, email, role, created_at FROM users;

# Lihat user spesifik
SELECT * FROM users WHERE email = 'john@example.com';

# Hitung total user
SELECT COUNT(*) as total_users FROM users;

# Lihat password (hashed)
SELECT email, password FROM users;
```

### Opsi 2: Menggunakan Laravel Tinker
```bash
# Masuk ke tinker
php artisan tinker

# Lihat semua user
>>> User::all();

# Cari user by email
>>> User::where('email', 'john@example.com')->first();

# Hitung total
>>> User::count();

# Cek apakah password cocok
>>> $user = User::find(1);
>>> Hash::check('SecurePass123', $user->password);  // true atau false
```

### Opsi 3: Menggunakan Laravel Database UI (jika ada)
```bash
# Instal optional UI
composer require laravel-admin/package

# Akses di browser
http://localhost:8000/admin
```

---

## 🔒 Security Features

| Feature | Explanation |
|---------|------------|
| **Password Hashing** | `Hash::make()` menggunakan bcrypt (BCRYPT_ROUNDS=12) |
| **Email Unique** | Validation `unique:users,email` mencegah duplikat |
| **Session Security** | `session()->regenerate()` cegah session fixation |
| **CSRF Token** | `X-CSRF-TOKEN` header melindungi dari CSRF attack |
| **Password Regex** | Min 8 char + 1 uppercase + 1 number |

---

## 📝 Database Columns Explanation

| Column | Purpose |
|--------|---------|
| `id` | Primary key (auto increment) |
| `name` | User full name (atau bisa pakai username) |
| `email` | Email address - UNIQUE (login identifier) |
| `password` | Hashed password using bcrypt |
| `phone` | Optional phone number |
| `role` | User role: customer, admin, staff, kitchen |
| `email_verified_at` | Timestamp kalau email sudah diverifikasi |
| `remember_token` | Token untuk "Remember Me" feature |
| `created_at` | Waktu account dibuat |
| `updated_at` | Waktu profile update terakhir |

---

## ✅ Testing Checklist

### Test Register:
- [ ] Buka http://localhost:8000/register
- [ ] Isi email, username, password yang valid
- [ ] Password Requirements harus semua hijau
- [ ] Klik "Register"
- [ ] Should redirect ke /dashboard
- [ ] Cek database: `SELECT * FROM users WHERE email='...';`
- [ ] Data harus ada di table users

### Test Login:
- [ ] Buka http://localhost:8000 (login page)
- [ ] Isi email dan password yang baru terdaftar
- [ ] Klik "Masuk"
- [ ] Should redirect ke /dashboard
- [ ] Session harus tersimpan

### Test Invalid Login:
- [ ] Isi email atau password yang SALAH
- [ ] Harus muncul pesan error
- [ ] Should NOT redirect

---

## 🛠️ Common Commands

```bash
# Reset database (HATI-HATI! Hapus semua data)
php artisan migrate:fresh

# Lihat struktur table
php artisan db:table users

# Masuk tinker interaktif
php artisan tinker

# Buat user testing di tinker
>>> User::create(['name' => 'Test User', 'email' => 'test@example.com', 'password' => Hash::make('TestPass123')])
```

---

## 🔍 Debugging Tips

**Login gagal?** Check:
```bash
# 1. Email ada di database?
mysql -u root restaurant_pos_db -e "SELECT * FROM users WHERE email='...';";

# 2. Password match?
php artisan tinker
>>> $user = User::where('email', 'test@example.com')->first();
>>> Hash::check('password_input', $user->password);  // true?

# 3. Session driver correct?
# Check .env: SESSION_DRIVER=file
```

---

**Semuanya siap!** Sekarang data user akan otomatis tersimpan di database saat register, dan saat login Laravel akan query database untuk verifikasi. 🎉
