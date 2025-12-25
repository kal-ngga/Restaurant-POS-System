import Sidebar from '@/Components/Sidebar'
import { DashNav } from '@/Components/DashNav'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'

export default function Transactions() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [summary, setSummary] = useState({
        best_selling: [],
        favorites: []
    })
    const [summaryLoading, setSummaryLoading] = useState(false)
    const [filters, setFilters] = useState({
        payment_status: '',
        order_status: '',
        search: '',
        month: '',
        year: new Date().getFullYear() // Default to current year
    })
    const [activeTab, setActiveTab] = useState('active') // 'active' or 'completed'

    useEffect(() => {
        // Debounce only for search, other filters trigger immediately
        const timeoutId = setTimeout(() => {
            fetchOrders()
        }, filters.search ? 300 : 0)
        
        fetchSummary()
        
        return () => clearTimeout(timeoutId)
    }, [filters, activeTab])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filters.payment_status && filters.payment_status !== '') {
                params.append('payment_status', filters.payment_status)
            }
            if (filters.order_status && filters.order_status !== '') {
                params.append('order_status', filters.order_status)
            }
            if (filters.search && filters.search !== '') {
                params.append('search', filters.search)
            }
            // Filter by month and year - backend requires both month and year
            // Always send year (default to current year if not set)
            if (filters.month && filters.month !== '') {
                const yearToUse = filters.year || new Date().getFullYear()
                params.append('month', filters.month.toString())
                params.append('year', yearToUse.toString())
            }
            
            const url = `/orders?${params.toString()}`
            console.log('Fetching orders with filters:', url)
            const res = await axios.get(url)
            let ordersData = []
            if (res.data) {
                if (res.data.data && Array.isArray(res.data.data)) {
                    ordersData = res.data.data
                } else if (Array.isArray(res.data)) {
                    ordersData = res.data
                }
            }
            
            console.log('Total orders received:', ordersData.length)
            
            // Separate active and completed transactions AFTER filtering
            const activeOrders = ordersData.filter(order => 
                order.order_status !== 'completed' && order.payment_status !== 'cancelled'
            )
            const completedOrders = ordersData.filter(order => 
                order.order_status === 'completed' || order.payment_status === 'cancelled'
            )
            
            console.log('Active orders:', activeOrders.length, 'Completed orders:', completedOrders.length)
            
            setOrders(activeTab === 'active' ? activeOrders : completedOrders)
        } catch (e) {
            console.error('Failed to fetch orders', e)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    const getMonthName = (monthNum) => {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
        return months[monthNum - 1]
    }

    const getYearOptions = () => {
        const currentYear = new Date().getFullYear()
        const years = []
        for (let i = 0; i < 3; i++) {
            years.push(currentYear - i)
        }
        return years
    }

    const handleViewOrder = (orderId) => {
        router.visit(`/orders/${orderId}/detail`)
    }

    const fetchSummary = async () => {
        setSummaryLoading(true)
        try {
            const params = new URLSearchParams()
            if (filters.month && filters.year && filters.month !== '' && filters.year !== '') {
                params.append('month', filters.month)
                params.append('year', filters.year)
            }
            if (filters.payment_status && filters.payment_status !== '') {
                params.append('payment_status', filters.payment_status)
            } else {
                params.append('payment_status', 'paid')
            }
            
            const res = await axios.get(`/orders/summary?${params.toString()}`)
            setSummary(res.data)
        } catch (e) {
            console.error('Failed to fetch summary', e)
        } finally {
            setSummaryLoading(false)
        }
    }

    const getStatusColor = (status, type) => {
        if (type === 'payment') {
            return status === 'paid' ? 'bg-green-100 text-green-800' :
                   status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                   'bg-red-100 text-red-800'
        } else {
            return status === 'completed' ? 'bg-green-100 text-green-800' :
                   status === 'ready' ? 'bg-blue-100 text-blue-800' :
                   status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                   'bg-gray-100 text-gray-800'
        }
    }

    const handleClearFilters = () => {
        setFilters({
            payment_status: '',
            order_status: '',
            search: '',
            month: '',
            year: new Date().getFullYear()
        })
    }

    const hasActiveFilters = () => {
        return filters.payment_status !== '' ||
               filters.order_status !== '' ||
               filters.search !== '' ||
               filters.month !== '' ||
               (filters.year !== '' && filters.year !== new Date().getFullYear())
    }

    return (
        <div className="min-h-screen bg-gray-50 relative">
            <Sidebar />
            <main className="pl-60">
                <DashNav />
                <div className="px-8 py-6">
                    <div className="max-w-[1440px] mx-auto flex flex-col justify-start items-start gap-6">
                        {/* Summary Section */}
                        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Best Selling Items */}
                            <div className="bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 p-6">
                                <h3 className="text-xl font-semibold text-neutral-800 mb-4" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                    Makanan Terlaris
                                </h3>
                                {summaryLoading ? (
                                    <div className="text-center py-4 text-gray-500" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Memuat data...</div>
                                ) : summary.best_selling && summary.best_selling.length > 0 ? (
                                    <div className="space-y-3">
                                        {summary.best_selling.map((item, index) => (
                                            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>No Image</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-800 truncate" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>{item.title}</p>
                                                    <p className="text-sm text-gray-600" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                        Terjual: {item.total_sold} pcs
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-amber-600" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                        Rp{Number(item.total_revenue || 0).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Tidak ada data</div>
                                )}
                            </div>

                            {/* Favorite Items */}
                            <div className="bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 p-6">
                                <h3 className="text-xl font-semibold text-neutral-800 mb-4" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                    Favorit Pembeli
                                </h3>
                                {summaryLoading ? (
                                    <div className="text-center py-4 text-gray-500" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Memuat data...</div>
                                ) : summary.favorites && summary.favorites.length > 0 ? (
                                    <div className="space-y-3">
                                        {summary.favorites.map((item, index) => (
                                            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>No Image</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-800 truncate" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>{item.title}</p>
                                                    <p className="text-sm text-gray-600" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                        Dipesan: {item.order_count} kali
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-amber-600" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                        {item.total_sold} pcs
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Tidak ada data</div>
                                )}
                            </div>
                        </div>

                        <div className="w-full">
                            <div className="w-full bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start overflow-hidden">
                                <div className="w-full h-16 px-6 pt-0.5 border-b border-slate-200 inline-flex justify-between items-center">
                                    <div className="text-neutral-800 text-2xl font-semibold" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Manajemen Transaksi</div>
                                </div>
                                
                                {/* Tabs for Active and Completed */}
                                <div className="w-full border-b border-slate-200 flex">
                                    <button
                                        onClick={() => setActiveTab('active')}
                                        style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                        className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                                            activeTab === 'active'
                                                ? 'text-amber-600 border-b-2 border-amber-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        Transaksi Aktif
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('completed')}
                                        style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                        className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                                            activeTab === 'completed'
                                                ? 'text-amber-600 border-b-2 border-amber-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        Transaksi Selesai
                                    </button>
                                </div>
                                
                                {/* Filters */}
                                <div className="w-full p-6 border-b border-slate-200 bg-gray-50">
                                    <div className="mb-4 pb-2 border-b border-slate-200">
                                        <h3 className="text-lg font-semibold text-gray-800" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Filter Transaksi</h3>
                                        <p className="text-sm text-gray-500 mt-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Gunakan filter di bawah untuk menyaring transaksi</p>
                                    </div>
                                    <div className="flex gap-4 items-end flex-wrap mb-4">
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Cari</label>
                                            <input
                                                type="text"
                                                placeholder="Cari order number atau nama user..."
                                                value={filters.search}
                                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                                                style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Bulan</label>
                                            <select
                                                value={filters.month || ''}
                                                onChange={(e) => {
                                                    const month = e.target.value ? parseInt(e.target.value) : ''
                                                    setFilters({
                                                        ...filters, 
                                                        month: month,
                                                        year: filters.year || new Date().getFullYear() // Ensure year is set when month is selected
                                                    })
                                                }}
                                                style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                            >
                                                <option value="">Semua Bulan</option>
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                                                    <option key={month} value={month}>
                                                        {getMonthName(month)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Tahun</label>
                                            <select
                                                value={filters.year || new Date().getFullYear()}
                                                onChange={(e) => setFilters({...filters, year: e.target.value ? parseInt(e.target.value) : new Date().getFullYear()})}
                                                style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                            >
                                                {getYearOptions().map(year => (
                                                    <option key={year} value={year}>
                                                        {year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Status Pembayaran</label>
                                            <select
                                                value={filters.payment_status}
                                                onChange={(e) => setFilters({...filters, payment_status: e.target.value})}
                                                style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                            >
                                                <option value="">Semua</option>
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Status Order</label>
                                            <select
                                                value={filters.order_status}
                                                onChange={(e) => setFilters({...filters, order_status: e.target.value})}
                                                style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                            >
                                                <option value="">Semua</option>
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="ready">Ready</option>
                                                <option value="served">Served</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                    {hasActiveFilters() && (
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleClearFilters}
                                                style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                                            >
                                                Hapus Filter
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Orders Table */}
                                <div className="w-full p-6">
                                    {loading ? (
                                        <div className="text-center py-8 text-gray-500" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Memuat data...</div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                            {activeTab === 'active' 
                                                ? 'Tidak ada transaksi aktif' 
                                                : 'Tidak ada transaksi selesai'}
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="text-sm text-gray-500 border-b" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                        <th className="py-3 px-4">Order Number</th>
                                                        <th className="py-3 px-4">User</th>
                                                        <th className="py-3 px-4">Tabel/Meja</th>
                                                        <th className="py-3 px-4">Tanggal</th>
                                                        <th className="py-3 px-4">Total</th>
                                                        <th className="py-3 px-4">Payment Status</th>
                                                        <th className="py-3 px-4">Order Status</th>
                                                        <th className="py-3 px-4">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders.map((order) => (
                                                        <tr key={order.id} className="text-sm border-b hover:bg-gray-50">
                                                            <td className="py-4 px-4 font-light text-lg" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>{order.order_number}</td>
                                                            <td className="py-4 px-4 font-regular text-lg" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>{order.user?.name || 'N/A'}</td>
                                                            <td className="py-4 px-4 font-regular text-lg" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                                {order.table ? (
                                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                                        {order.table.table_number}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4 font-light text-lg" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>{new Date(order.created_at).toLocaleString('id-ID')}</td>
                                                            <td className="py-3 px-4 font-regular text-lg" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Rp{Number(order.total_amount || 0).toLocaleString('id-ID')}</td>
                                                            <td className="py-3 px-4 font-regular text-lg">
                                                                <span 
                                                                    className="px-2 py-1 rounded text-xs" 
                                                                    style={{
                                                                        fontFamily: "'Inter', 'TT Commons', sans-serif",
                                                                        ...(order.payment_status === 'paid' ? {backgroundColor: '#dcfce7', color: '#166534'} : order.payment_status === 'pending' ? {backgroundColor: '#fef3c7', color: '#854d0e'} : {backgroundColor: '#fee2e2', color: '#991b1b'})
                                                                    }}
                                                                >
                                                                    {order.payment_status}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span 
                                                                    className="px-2 py-1 rounded text-xs" 
                                                                    style={{
                                                                        fontFamily: "'Inter', 'TT Commons', sans-serif",
                                                                        ...(order.order_status === 'completed' ? {backgroundColor: '#dcfce7', color: '#166534'} : order.order_status === 'ready' ? {backgroundColor: '#dbeafe', color: '#1e40af'} : order.order_status === 'processing' ? {backgroundColor: '#fef3c7', color: '#854d0e'} : {backgroundColor: '#f3f4f6', color: '#1f2937'})
                                                                    }}
                                                                >
                                                                    {order.order_status}
                                                                </span>
                                                            </td>
                                                            <td className="py-8 px-4">
                                                                <button
                                                                    onClick={() => handleViewOrder(order.id)}
                                                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                                                >
                                                                    Detail
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

