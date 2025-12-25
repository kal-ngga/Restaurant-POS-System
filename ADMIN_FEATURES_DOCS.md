# Dokumentasi Fitur Admin - Restaurant POS System

## Daftar Isi
1. [Admin: Hide Menu Jika Stok Habis](#1-admin-hide-menu-jika-stok-habis)
2. [Admin: Sorting Data Terbaru Tanpa Memengaruhi Diagram](#2-admin-sorting-data-terbaru-tanpa-memengaruhi-diagram)
3. [Admin: Menu Manajemen Transaksi](#3-admin-menu-manajemen-transaksi)
4. [Data Menu Tidak Boleh Dihapus Permanen](#4-data-menu-tidak-boleh-dihapus-permanen)

---

## 1. Admin: Hide Menu Jika Stok Habis

### Logika Bisnis
- Menu memiliki atribut `status` (available/hidden) dan `stock` (jumlah stok)
- Jika stok menu habis (stock = 0), menu otomatis disembunyikan dari halaman pemesanan user
- Menu yang disembunyikan tetap tersimpan di database untuk menjaga integritas data transaksi lama
- Admin dapat melakukan toggle hide/unhide menu secara manual
- Menu yang di-hide tidak akan muncul di halaman catalog user, tetapi tetap bisa dilihat di halaman admin

### Struktur Database

**Migration: `add_status_and_stock_to_menu_items_table`**
```php
Schema::table('menu_items', function (Blueprint $table) {
    $table->string('status')->default('available')->after('unit');
    $table->integer('stock')->default(0)->after('status');
});
```

### Model: MenuItem.php

**Atribut yang Ditambahkan:**
```php
protected $fillable = [
    'category_id',
    'title',
    'image',
    'badge',
    'price',
    'unit',
    'status',  // 'available' atau 'hidden'
    'stock',   // jumlah stok
];
```

**Auto-hide Logic (Model Boot Method):**
```php
protected static function boot()
{
    parent::boot();

    static::saving(function ($menuItem) {
        // Auto-hide menu jika stock <= 0
        if ($menuItem->stock <= 0) {
            $menuItem->status = 'hidden';
        }
    });
}
```

**Query Scopes:**
```php
// Scope untuk mendapatkan menu yang available
public function scopeAvailable($query)
{
    return $query->where('status', 'available');
}

// Scope untuk mendapatkan menu yang hidden
public function scopeHidden($query)
{
    return $query->where('status', 'hidden');
}
```

### Controller: MenuItemController.php

**Method: toggleStatus() - Toggle Hide/Unhide**
```php
public function toggleStatus(MenuItem $menuItem)
{
    $menuItem->status = $menuItem->status === 'available' ? 'hidden' : 'available';
    $menuItem->save();

    return response()->json([
        'message' => 'Status menu berhasil diubah',
        'menuItem' => $menuItem->load('category')
    ]);
}
```

**Method: destroy() - Soft Delete (Hide Instead of Delete)**
```php
public function destroy(MenuItem $menuItem)
{
    // Instead of deleting, just hide the menu
    $menuItem->status = 'hidden';
    $menuItem->save();

    return response()->json([
        'message' => 'Menu item berhasil disembunyikan (data tetap tersimpan di database)'
    ]);
}
```

**Method: store() - Create dengan Status dan Stock**
```php
public function store(Request $request)
{
    $validated = $request->validate([
        'category_id' => 'required|exists:categories,id',
        'title' => 'required|string|max:255',
        'image' => 'nullable|string|max:500',
        'badge' => 'nullable|string|max:255',
        'price' => 'required|numeric|min:0',
        'unit' => 'required|string|max:50',
        'stock' => 'nullable|integer|min:0',
        'status' => 'nullable|in:available,hidden',
    ]);

    // Set default values
    $validated['stock'] = $validated['stock'] ?? 0;
    $validated['status'] = $validated['status'] ?? ($validated['stock'] > 0 ? 'available' : 'hidden');

    $menuItem = MenuItem::create($validated);
    // Auto-hide akan dipanggil oleh boot method jika stock = 0

    return response()->json([
        'message' => 'Menu item berhasil ditambahkan',
        'menuItem' => $menuItem->load('category')
    ]);
}
```

### Controller: CatalogController.php

**Filter Menu Available untuk User:**
```php
public function index(Request $request)
{
    $categories = Category::withCount('menuItems')->get();
    $query = MenuItem::with('category')
        ->where('status', 'available'); // Hanya tampilkan menu yang available

    // Filter kategori dan search tetap berfungsi
    if ($request->has('category_id') && $request->category_id) {
        $query->where('category_id', $request->category_id);
    }

    if ($request->has('search') && $request->search) {
        $query->where('title', 'like', "%{$request->search}%");
    }

    $menuItems = $query->get();

    return Inertia::render('Catalog', [
        'categories' => $categories,
        'menuItems' => $menuItems,
    ]);
}
```

### Routes: web.php

```php
Route::prefix('menu-items')->group(function () {
    Route::get('/', [MenuItemController::class, 'index']);
    Route::post('/', [MenuItemController::class, 'store']);
    Route::put('/{menuItem}', [MenuItemController::class, 'update']);
    Route::post('/{menuItem}/toggle-status', [MenuItemController::class, 'toggleStatus']); // Toggle status
    Route::delete('/{menuItem}', [MenuItemController::class, 'destroy']); // Soft delete (hide)
});
```

### View: MenuItems.jsx

**Tampilan Tabel dengan Status dan Stock:**
```jsx
<thead>
    <tr>
        <th>Gambar</th>
        <th>Nama</th>
        <th>Kategori</th>
        <th>Badge</th>
        <th>Harga</th>
        <th>Unit</th>
        <th>Stok</th>
        <th>Status</th>
        <th>Aksi</th>
    </tr>
</thead>
<tbody>
    {menuItems.map((item) => (
        <tr key={item.id}>
            {/* ... kolom lainnya ... */}
            <td>
                <span className={item.stock > 0 ? 'bg-green-100' : 'bg-red-100'}>
                    {item.stock || 0}
                </span>
            </td>
            <td>
                <span className={item.status === 'available' ? 'bg-green-100' : 'bg-gray-100'}>
                    {item.status === 'available' ? 'Tersedia' : 'Tersembunyi'}
                </span>
            </td>
            <td>
                <button onClick={() => handleToggleStatus(item)}>
                    {item.status === 'available' ? 'Sembunyikan' : 'Tampilkan'}
                </button>
                <button onClick={() => handleHide(item)}>Hide</button>
            </td>
        </tr>
    ))}
</tbody>
```

**Form Input Stock dan Status:**
```jsx
<div>
    <label>Stok *</label>
    <input
        type="number"
        value={formData.stock}
        onChange={(e) => {
            const stock = parseInt(e.target.value) || 0
            setFormData({
                ...formData, 
                stock: stock,
                status: stock > 0 ? 'available' : 'hidden' // Auto-update status
            })
        }}
        min="0"
    />
    <p>Menu akan otomatis tersembunyi jika stok 0</p>
</div>
<div>
    <label>Status</label>
    <select value={formData.status}>
        <option value="available">Tersedia</option>
        <option value="hidden">Tersembunyi</option>
    </select>
</div>
```

---

## 2. Admin: Sorting Data Terbaru Tanpa Memengaruhi Diagram

### Logika Bisnis
- Sorting hanya memengaruhi tampilan tabel transaksi di halaman Dashboard
- Diagram statistik di bagian atas tetap menggunakan keseluruhan data tanpa terpengaruh sorting
- Sorting dilakukan di client-side setelah data diterima dari server
- Metrics API tetap mengembalikan data lengkap tanpa filter sorting
- User dapat mengklik header kolom untuk mengubah sorting (ascending/descending)

### Controller: DashboardController.php

**Metrics API (Tidak Terpengaruh Sorting):**
```php
public function metrics(Request $request)
{
    // Query untuk metrics menggunakan semua data
    $totalRevenue = DB::table('orders')
        ->whereBetween('created_at', [$todayStart, $todayEnd])
        ->where('payment_status', 'paid')
        ->sum('total_amount');

    // Query untuk diagram menggunakan semua data
    $monthlyData = DB::table('orders')
        ->whereBetween('created_at', [$startDate, $endDate])
        ->where('payment_status', 'paid')
        ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_amount) as revenue'))
        ->groupBy(DB::raw('DATE(created_at)'))
        ->orderBy('date')
        ->get();

    // Metrics tidak terpengaruh oleh sorting di tabel
    return response()->json([
        'total_revenue' => $totalRevenue,
        'transactions_count' => $transactionsCount,
        'monthly_data' => $monthlyData,
        // ... data lainnya
    ]);
}
```

### View: Dashboard.jsx

**State untuk Sorting:**
```jsx
const [sortBy, setSortBy] = useState('created_at') // Default sort by created_at
const [sortOrder, setSortOrder] = useState('desc') // Default descending (newest first)
```

**Function untuk Sorting (Client-side):**
```jsx
const sortOrders = (orders) => {
    return [...orders].sort((a, b) => {
        let aValue, bValue
        
        switch (sortBy) {
            case 'created_at':
                aValue = new Date(a.created_at)
                bValue = new Date(b.created_at)
                break
            case 'total_amount':
                aValue = parseFloat(a.total_amount || 0)
                bValue = parseFloat(b.total_amount || 0)
                break
            case 'order_number':
                aValue = a.order_number || ''
                bValue = b.order_number || ''
                break
            default:
                aValue = new Date(a.created_at)
                bValue = new Date(b.created_at)
        }
        
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
        } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
        }
    })
}
```

**Handler untuk Mengubah Sorting:**
```jsx
const handleSort = (column) => {
    if (sortBy === column) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
        setSortBy(column)
        setSortOrder('desc')
    }
}
```

**Fetch Orders dengan Sorting:**
```jsx
const fetchOrders = async () => {
    setLoading(true)
    try {
        // Fetch data dari server (tanpa sorting)
        const res = await axios.get(`/orders?${params.toString()}`)
        let ordersData = res.data.data || res.data || []
        
        // Client-side sorting (tidak memengaruhi metrics)
        ordersData = sortOrders(ordersData)
        setOrders(ordersData)
    } catch (e) {
        console.error('Failed to fetch orders', e)
        setOrders([])
    } finally {
        setLoading(false)
    }
}
```

**Tabel dengan Sortable Headers:**
```jsx
<thead>
    <tr>
        <th onClick={() => handleSort('order_number')}>
            Order Number
            {sortBy === 'order_number' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
        </th>
        <th>User</th>
        <th onClick={() => handleSort('created_at')}>
            Tanggal
            {sortBy === 'created_at' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
        </th>
        <th onClick={() => handleSort('total_amount')}>
            Total
            {sortBy === 'total_amount' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
        </th>
        {/* ... kolom lainnya ... */}
    </tr>
</thead>
```

**Pemisahan Data:**
- **Metrics API**: Menggunakan semua data dari database, tidak terpengaruh sorting
- **Table Data**: Di-sort di client-side setelah diterima dari server
- **Diagram**: Menggunakan data dari metrics API yang terpisah dari tabel

---

## 3. Admin: Menu Manajemen Transaksi

### Logika Bisnis
- Halaman khusus untuk manajemen transaksi yang terpisah dari Dashboard
- Menampilkan daftar semua transaksi dengan filter berdasarkan:
  - Status pembayaran (pending, paid, cancelled)
  - Status order (pending, processing, ready, served, completed)
  - Pencarian berdasarkan order number atau nama user
  - Filter berdasarkan bulan dan tahun
- Pemisahan jelas antara:
  - **Transaksi Aktif**: Order yang belum completed dan payment status bukan cancelled
  - **Transaksi Selesai**: Order yang completed atau payment status cancelled
- Setiap transaksi memiliki halaman detail yang dapat diakses

### Routes: web.php

```php
Route::get('/transactions', function () {
    return Inertia::render('Transactions');
})->name('transactions');
```

### Controller: OrderController.php

**Method: index() - List Orders dengan Filter:**
```php
public function index(Request $request)
{
    $query = Order::with(['user', 'items.menuItem'])
        ->orderByDesc('created_at');

    // Filter by payment status
    if ($request->has('payment_status') && $request->payment_status !== '') {
        $query->where('payment_status', $request->payment_status);
    }

    // Filter by order status
    if ($request->has('order_status') && $request->order_status !== '') {
        $query->where('order_status', $request->order_status);
    }

    // Search by order number or user name
    if ($request->has('search') && $request->search !== '') {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('order_number', 'like', "%{$search}%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        });
    }

    // Filter by month and year
    if ($request->has('month') && $request->has('year') && $request->month && $request->year) {
        $month = $request->month;
        $year = $request->year;
        $startDate = now()->setYear($year)->setMonth($month)->setDay(1)->startOfDay();
        $endDate = $startDate->copy()->endOfMonth()->endOfDay();
        $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    $orders = $query->paginate(15);

    return response()->json($orders);
}
```

### View: Transactions.jsx

**State Management:**
```jsx
const [orders, setOrders] = useState([])
const [activeTab, setActiveTab] = useState('active') // 'active' or 'completed'
const [filters, setFilters] = useState({
    payment_status: '',
    order_status: '',
    search: '',
    month: '',
    year: ''
})
```

**Pemisahan Transaksi Aktif dan Selesai:**
```jsx
const fetchOrders = async () => {
    setLoading(true)
    try {
        const res = await axios.get(`/orders?${params.toString()}`)
        let ordersData = res.data.data || res.data || []
        
        // Pisahkan transaksi aktif dan selesai
        const activeOrders = ordersData.filter(order => 
            order.order_status !== 'completed' && order.payment_status !== 'cancelled'
        )
        const completedOrders = ordersData.filter(order => 
            order.order_status === 'completed' || order.payment_status === 'cancelled'
        )
        
        // Tampilkan sesuai tab yang aktif
        setOrders(activeTab === 'active' ? activeOrders : completedOrders)
    } catch (e) {
        console.error('Failed to fetch orders', e)
        setOrders([])
    } finally {
        setLoading(false)
    }
}
```

**UI dengan Tabs:**
```jsx
<div className="tabs">
    <button 
        onClick={() => setActiveTab('active')}
        className={activeTab === 'active' ? 'active' : ''}
    >
        Transaksi Aktif
    </button>
    <button 
        onClick={() => setActiveTab('completed')}
        className={activeTab === 'completed' ? 'active' : ''}
    >
        Transaksi Selesai
    </button>
</div>
```

**Filter Section:**
```jsx
<div className="filters">
    <input 
        type="text"
        placeholder="Cari order number atau nama user..."
        value={filters.search}
        onChange={(e) => setFilters({...filters, search: e.target.value})}
    />
    <select 
        value={filters.payment_status}
        onChange={(e) => setFilters({...filters, payment_status: e.target.value})}
    >
        <option value="">Semua</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="cancelled">Cancelled</option>
    </select>
    <select 
        value={filters.order_status}
        onChange={(e) => setFilters({...filters, order_status: e.target.value})}
    >
        <option value="">Semua</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="ready">Ready</option>
        <option value="served">Served</option>
        <option value="completed">Completed</option>
    </select>
    {/* Filter bulan dan tahun */}
</div>
```

**Tabel Transaksi:**
```jsx
<table>
    <thead>
        <tr>
            <th>Order Number</th>
            <th>User</th>
            <th>Tanggal</th>
            <th>Total</th>
            <th>Payment Status</th>
            <th>Order Status</th>
            <th>Aksi</th>
        </tr>
    </thead>
    <tbody>
        {orders.map((order) => (
            <tr key={order.id}>
                <td>{order.order_number}</td>
                <td>{order.user?.name || 'N/A'}</td>
                <td>{new Date(order.created_at).toLocaleString('id-ID')}</td>
                <td>Rp{Number(order.total_amount || 0).toLocaleString('id-ID')}</td>
                <td>
                    <span className={getStatusColor(order.payment_status, 'payment')}>
                        {order.payment_status}
                    </span>
                </td>
                <td>
                    <span className={getStatusColor(order.order_status, 'order')}>
                        {order.order_status}
                    </span>
                </td>
                <td>
                    <button onClick={() => handleViewOrder(order.id)}>
                        Detail
                    </button>
                </td>
            </tr>
        ))}
    </tbody>
</table>
```

**Navigation ke Detail:**
```jsx
const handleViewOrder = (orderId) => {
    router.visit(`/orders/${orderId}/detail`)
}
```

---

## 4. Data Menu Tidak Boleh Dihapus Permanen

### Logika Bisnis
- Menu tidak boleh dihapus secara permanen dari database
- Menggunakan konsep **soft delete** dengan mengubah status menjadi 'hidden'
- Data menu tetap tersimpan di database untuk:
  - Menjaga integritas data transaksi lama
  - Mencegah rusaknya relasi dengan order_items
  - Memungkinkan restore menu di masa depan
- Tombol "Hapus" diubah menjadi "Hide" yang menyembunyikan menu
- Menu yang di-hide tidak muncul di catalog user, tetapi tetap ada di database

### Controller: MenuItemController.php

**Method: destroy() - Soft Delete Implementation:**
```php
/**
 * Hide menu item instead of deleting (soft delete)
 * Menu data is preserved in database for transaction history
 */
public function destroy(MenuItem $menuItem)
{
    // Instead of deleting, just hide the menu
    $menuItem->status = 'hidden';
    $menuItem->save();

    return response()->json([
        'message' => 'Menu item berhasil disembunyikan (data tetap tersimpan di database)'
    ]);
}
```

**Alasan Menggunakan Soft Delete:**
1. **Integritas Data Transaksi**: Order items memiliki foreign key ke menu_items. Jika menu dihapus, relasi akan rusak.
2. **Data Historis**: Transaksi lama perlu menampilkan nama menu yang sudah tidak aktif.
3. **Kemungkinan Restore**: Menu yang di-hide bisa di-restore di masa depan jika diperlukan.

### View: MenuItems.jsx

**Tombol Hide (Menggantikan Delete):**
```jsx
const handleHide = async (item) => {
    if (!window.confirm(
        `Apakah anda yakin ingin menyembunyikan menu item "${item.title}"? 
        Data akan tetap tersimpan di database.`
    )) return

    setLoading(true)
    try {
        await axios.delete(`/menu-items/${item.id}`)
        await fetchMenuItems()
    } catch (error) {
        const message = error.response?.data?.message || 'Terjadi kesalahan'
        alert(message)
    } finally {
        setLoading(false)
    }
}
```

**UI dengan Tombol Hide:**
```jsx
<td>
    <div className="flex gap-2">
        <button onClick={() => handleOpenModal(item)}>Edit</button>
        <button onClick={() => handleToggleStatus(item)}>
            {item.status === 'available' ? 'Sembunyikan' : 'Tampilkan'}
        </button>
        <button 
            onClick={() => handleHide(item)}
            title="Sembunyikan menu (data tetap tersimpan)"
        >
            Hide
        </button>
    </div>
</td>
```

### Database Schema

**Tidak Ada Perubahan Schema:**
- Tidak perlu menambahkan kolom `deleted_at` karena menggunakan status 'hidden'
- Menu dengan status 'hidden' dianggap sebagai "soft deleted"
- Query untuk user hanya mengambil menu dengan status 'available'

### Query Filtering

**CatalogController - Hanya Tampilkan Available:**
```php
$query = MenuItem::with('category')
    ->where('status', 'available'); // Hanya menu yang available
```

**MenuItemController - Tampilkan Semua (Termasuk Hidden) untuk Admin:**
```php
$menuItems = MenuItem::with('category')->orderBy('title')->get();
// Admin bisa melihat semua menu termasuk yang hidden
```

---

## Ringkasan Implementasi

### 1. Hide Menu Jika Stok Habis
- ✅ Migration: Tambah kolom `status` dan `stock`
- ✅ Model: Auto-hide logic di boot method
- ✅ Controller: Toggle status dan filter available
- ✅ View: Tampilkan status, stock, dan tombol toggle

### 2. Sorting Tanpa Memengaruhi Diagram
- ✅ Client-side sorting di Dashboard.jsx
- ✅ Metrics API terpisah dari sorting
- ✅ Sortable table headers dengan indikator

### 3. Menu Manajemen Transaksi
- ✅ Halaman Transactions.jsx terpisah
- ✅ Filter berdasarkan status, search, bulan/tahun
- ✅ Pemisahan transaksi aktif dan selesai
- ✅ Link ke halaman detail transaksi

### 4. Soft Delete Menu
- ✅ Method destroy() mengubah status menjadi 'hidden'
- ✅ Data tetap tersimpan di database
- ✅ Relasi dengan order_items tetap aman
- ✅ Tombol "Hide" menggantikan "Delete"

---

## Cara Menggunakan

### 1. Menjalankan Migration
```bash
php artisan migrate
```

### 2. Mengakses Fitur
- **Dashboard**: `/dashboard` - Sorting tabel transaksi
- **Transaksi**: `/transactions` - Manajemen transaksi lengkap
- **Menu Items**: `/menu-items` - Kelola menu dengan status dan stock

### 3. Testing Fitur
1. **Hide Menu**: Set stock = 0, menu otomatis hidden
2. **Toggle Status**: Klik tombol "Sembunyikan/Tampilkan"
3. **Sorting**: Klik header kolom di tabel Dashboard
4. **Filter Transaksi**: Gunakan filter di halaman Transactions
5. **Soft Delete**: Klik "Hide" pada menu, data tetap ada di database

---

## Catatan Penting

1. **Data Integrity**: Semua fitur dirancang untuk menjaga integritas data
2. **User Experience**: Menu yang hidden tidak muncul di catalog user
3. **Admin Control**: Admin memiliki kontrol penuh untuk hide/unhide menu
4. **Performance**: Sorting dilakukan di client-side untuk responsivitas
5. **Scalability**: Struktur dapat dikembangkan untuk fitur restore menu

---

*Dokumentasi ini dibuat untuk keperluan presentasi project Restaurant POS System*

