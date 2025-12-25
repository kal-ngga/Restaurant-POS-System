import Navbar from '@/Components/Navbar'
import Sidebar from '@/Components/Sidebar'
import axios from 'axios'
import { useEffect, useState } from 'react'
import TransactionList from '@/Components/TransactionList'
import { DashNav } from '@/Components/DashNav'
import { router } from '@inertiajs/react'
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

export default function Dashboard() {
    const [metrics, setMetrics] = useState({
        total_revenue: 0,
        transactions_count: 0,
        avg_per_txn: 0,
        top_products: [],
        recent_transactions: [],
        monthly_data: [],
        previous_month_data: [],
        selected_month: new Date().getMonth() + 1,
        selected_year: new Date().getFullYear()
    })
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [filters, setFilters] = useState({
        payment_status: '',
        order_status: '',
        search: '',
        month: '', // Empty by default to show all months
        year: '' // Empty by default to show all years
    })
    const [sortBy, setSortBy] = useState('created_at') // Default sort by created_at
    const [sortOrder, setSortOrder] = useState('desc') // Default descending (newest first)

    useEffect(() => {
        let mounted = true
        const fetchMetrics = async () => {
            try {
                const res = await axios.get('/dashboard/metrics', {
                    params: {
                        month: selectedMonth || new Date().getMonth() + 1,
                        year: selectedYear || new Date().getFullYear()
                    }
                })
                if (mounted && res.data) {
                    setMetrics({
                        ...res.data,
                        monthly_data: res.data.monthly_data || [],
                        previous_month_data: res.data.previous_month_data || [],
                        recent_transactions: res.data.recent_transactions || []
                    })
                }
            } catch (e) {
                console.error('Failed to fetch metrics', e)
            }
        }

        fetchMetrics()
        const id = setInterval(fetchMetrics, 5000) // poll every 5s
        return () => { mounted = false; clearInterval(id) }
    }, [selectedMonth, selectedYear])

    useEffect(() => {
        // Debounce hanya untuk search, filter lain langsung trigger
        const timeoutId = setTimeout(() => {
            fetchOrders()
        }, filters.search ? 300 : 0) // Debounce 300ms hanya untuk search

        return () => clearTimeout(timeoutId)
    }, [filters, sortBy, sortOrder])

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
            if (filters.month && filters.year && filters.month !== '' && filters.year !== '') {
                params.append('month', filters.month)
                params.append('year', filters.year)
            }
            
            const res = await axios.get(`/orders?${params.toString()}`)
            // Handle paginated response - Laravel paginate returns {data: [...], current_page: ..., etc}
            let ordersData = []
            if (res.data) {
                if (res.data.data && Array.isArray(res.data.data)) {
                    // Paginated response
                    ordersData = res.data.data
                } else if (Array.isArray(res.data)) {
                    // Direct array response
                    ordersData = res.data
                }
            }
            
            // Client-side sorting (does not affect metrics/diagrams)
            ordersData = sortOrders(ordersData)
            setOrders(ordersData)
        } catch (e) {
            console.error('Failed to fetch orders', e)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    const sortOrders = (orders) => {
        if (!orders || orders.length === 0) return orders
        
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

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(column)
            setSortOrder('desc')
        }
    }

    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
        const dayName = days[date.getDay()]
        const day = date.getDate()
        const month = date.toLocaleString('id-ID', { month: 'short' })
        return { dayName, day, month }
    }

    // Generate chart data for selected month (all days in the month)
    const generateChartData = () => {
        const days = []
        const year = selectedYear
        const month = selectedMonth - 1 // JavaScript months are 0-indexed
        
        // Get number of days in the selected month
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        
        // Generate all days in the selected month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            const dateStr = date.toISOString().split('T')[0]
            
            // Find matching data from backend (date format: YYYY-MM-DD)
            const monthData = metrics.monthly_data?.find(d => {
                // Handle both string and Date object formats
                let backendDate = d.date
                if (typeof backendDate !== 'string') {
                    backendDate = new Date(backendDate).toISOString().split('T')[0]
                }
                return backendDate === dateStr
            })
            const prevMonthData = metrics.previous_month_data?.find(d => {
                let backendDate = d.date
                if (typeof backendDate !== 'string') {
                    backendDate = new Date(backendDate).toISOString().split('T')[0]
                }
                return backendDate === dateStr
            })
            
            const { dayName, day: dayNum, month: monthName } = formatDate(dateStr)
            
            days.push({
                date: dateStr,
                label: `${dayNum}`,
                'Bulan ini': parseFloat(monthData?.revenue || 0),
                'Bulan Kemarin': parseFloat(prevMonthData?.revenue || 0)
            })
        }
        
        return days
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

    const chartData = generateChartData()

    const handleViewOrder = (orderId) => {
        router.visit(`/orders/${orderId}/detail`)
    }

    const handleEditOrder = async (order) => {
        setSelectedOrder(order)
        setShowOrderModal(true)
    }

    const handleUpdateOrder = async () => {
        if (!selectedOrder) return
        
        setLoading(true)
        try {
            await axios.put(`/orders/${selectedOrder.id}`, {
                order_status: selectedOrder.order_status,
                payment_status: selectedOrder.payment_status,
                notes: selectedOrder.notes
            })
            setShowOrderModal(false)
            setSelectedOrder(null)
            fetchOrders()
            // Refresh metrics
            const res = await axios.get('/dashboard/metrics')
            setMetrics(res.data)
        } catch (e) {
            alert('Gagal memperbarui order: ' + (e.response?.data?.message || e.message))
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Apakah anda yakin ingin menghapus order ini?')) return
        
        setLoading(true)
        try {
            await axios.delete(`/orders/${orderId}`)
            fetchOrders()
            // Refresh metrics
            const res = await axios.get('/dashboard/metrics')
            setMetrics(res.data)
        } catch (e) {
            alert('Gagal menghapus order: ' + (e.response?.data?.message || e.message))
        } finally {
            setLoading(false)
        }
        
    }

    return (
        <div className="min-h-screen bg-gray-50 relative">
            <Sidebar />
            <main className="pl-60">
                <DashNav />
                <div className="px-8 py-6">
                    <div className="max-w-[1440px] mx-auto flex flex-col justify-start items-start gap-6 w-full">
                        <div className="w-full">
                            <div className="w-full bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start overflow-hidden">
                                <div className="w-full h-16 px-6 pt-0.5 border-b border-slate-200 inline-flex justify-center items-center gap-2">
                                <div className="flex-1 flex justify-center items-center gap-2">
                                    <div className="flex-1 h-8 justify-start text-gray-500 text-2xl font-regular" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Penjualan Hari ini</div>
                                </div>
                            </div>
                            <div className="w-full border-b border-slate-200 inline-flex justify-start items-center overflow-hidden">
                                <div className="w-80 self-stretch rounded-3xl inline-flex flex-col justify-center items-start">
                                    <div className="self-stretch px-6 pt-6 pb-5 border-b border-zinc-200 flex flex-col justify-start items-start gap-2">
                                        <div className="self-stretch justify-start text-neutral-400 text-lg font-regular" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Total pendapatan</div>
                                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                                            <div className="justify-start text-black text-3xl font-semibold" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Rp{Number(metrics.total_revenue || 0).toLocaleString('id-ID')}</div>
                                        </div>
                                    </div>
                                    {/* <div className="self-stretch px-6 pt-4 pb-5 inline-flex justify-start items-center gap-2">
                                        <div className="flex-1 justify-start"><span class="text-lime-600 text-lg font-medium ">8%</span><span class="text-gray-500 text-lg font-medium "> lebih banyak dari<br/>rata-rata harian.</span></div>
                                    </div> */}
                                </div>
                                <div className="w-80 self-stretch bg-white border-l border-slate-200 inline-flex flex-col justify-center items-start">
                                    <div className="self-stretch px-6 pt-6 pb-5 border-b border-zinc-200 flex flex-col justify-start items-start gap-2">
                                        <div className="self-stretch justify-start text-neutral-400 text-lg font-regular" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Penjualan Bersih</div>
                                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                                            <div className="justify-start text-black text-3xl font-semibold" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Rp{Number(metrics.total_revenue || 0).toLocaleString('id-ID')}</div>
                                        </div>
                                    </div>
                                    {/* <div className="self-stretch px-6 pt-4 pb-5 inline-flex justify-start items-center gap-2">
                                        <div className="flex-1 justify-start"><span class="text-lime-600 text-lg font-medium ">4%</span><span class="text-gray-500 text-lg font-medium "> lebih banyak dari<br/>rata-rata harian.</span></div>
                                    </div> */}
                                </div>
                                <div className="flex-1 self-stretch bg-white border-l border-slate-200 inline-flex flex-col justify-center items-start">
                                    <div className="self-stretch px-6 pt-6 pb-5 border-b border-zinc-200 flex flex-col justify-start items-start gap-2">
                                        <div className="self-stretch justify-start text-neutral-400 text-lg font-regular" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Jumlah Transaksi</div>
                                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                                            <div className="justify-start text-black text-3xl font-semibold" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>{metrics.transactions_count} Transaksi</div>
                                        </div>
                                    </div>
                                    {/* <div className="self-stretch px-6 pt-4 pb-5 inline-flex justify-start items-center gap-2">
                                        <div className="flex-1 justify-start text-gray-500 text-lg font-medium ">Hampir sama seperti<br/>rata-rata harian.</div>
                                    </div> */}
                                </div>
                                <div className="flex-1 self-stretch bg-white border-l border-slate-200 inline-flex flex-col justify-center items-start">
                                    <div className="self-stretch px-6 pt-6 pb-5 border-b border-zinc-200 flex flex-col justify-start items-start gap-2">
                                        <div className="self-stretch justify-start text-neutral-400 text-lg font-regular" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Rata-rata per Transaksi</div>
                                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                                            <div className="justify-start text-black text-3xl font-semibold" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Rp{Number(metrics.avg_per_txn || 0).toLocaleString('id-ID')}</div>
                                        </div>
                                    </div>
                                    {/* <div className="self-stretch px-6 pt-4 pb-5 inline-flex justify-start items-center gap-2">
                                        <div className="flex-1 justify-start"><span class="text-gray-400 text-lg font-medium ">2%</span><span class="text-gray-500 text-lg font-medium "> lebih sedikit dari<br/>rata-rata harian.</span></div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-center items-start">
                            <div className="w-full h-16 pl-6 pr-7 pt-0.5 border-b border-slate-200 inline-flex justify-start items-center gap-10">
                                <div className="flex-1 justify-start text-neutral-800 text-2xl font-semibold leading-7" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Penjualan Bruto Bulanan</div>
                                <div className="flex justify-start items-center gap-4">
                                    {/* Month Selector */}
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => {
                                            const month = parseInt(e.target.value)
                                            setSelectedMonth(month)
                                            // Trigger fetch metrics dengan bulan baru
                                        }}
                                        style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                                            <option key={month} value={month}>
                                                {getMonthName(month)}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Year Selector */}
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            const year = parseInt(e.target.value)
                                            setSelectedYear(year)
                                            // Trigger fetch metrics dengan tahun baru
                                        }}
                                        style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
                                    >
                                        {getYearOptions().map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="self-stretch px-6 pt-7 pb-8">
                                <ResponsiveContainer width="100%" height={400}>
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorThisWeek" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorLastWeek" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#a3a3a3" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#a3a3a3" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis 
                                            dataKey="label" 
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            interval={Math.floor(chartData.length / 10)} // Show approximately 10 labels
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis 
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            tickFormatter={(value) => {
                                                if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`
                                                if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
                                                return value.toString()
                                            }}
                                        />
                                        <Tooltip 
                                            formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`}
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        />
                                        <Legend />
                                        <Area 
                                            type="monotone" 
                                            dataKey="Bulan ini" 
                                            stroke="#2563eb" 
                                            strokeWidth={2}
                                            fillOpacity={1} 
                                            fill="url(#colorThisWeek)" 
                                            dot={{ fill: '#2563eb', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="Bulan Kemarin" 
                                            stroke="#a3a3a3" 
                                            strokeWidth={2}
                                            fillOpacity={1} 
                                            fill="url(#colorLastWeek)" 
                                            dot={{ fill: '#a3a3a3', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Recent Transactions */}
                            <div className="w-full p-6 border-t">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-lg font-semibold text-neutral-800" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Transaksi Terbaru</div>
                                    <div className="text-sm text-neutral-500" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Memperbarui setiap 5 detik</div>
                                </div>
                                <TransactionList transactions={metrics.recent_transactions} />
                            </div>
                        </div>
                        </div>
                        
                    </div>
                </div>
            </main>

            {/* Edit Order Modal */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-semibold text-gray-800" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Edit Order</h2>
                            <p className="text-sm text-gray-500 mt-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Order Number: {selectedOrder.order_number}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Status Pembayaran</label>
                                <select
                                    value={selectedOrder.payment_status}
                                    onChange={(e) => setSelectedOrder({...selectedOrder, payment_status: e.target.value})}
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Status Order</label>
                                <select
                                    value={selectedOrder.order_status}
                                    onChange={(e) => setSelectedOrder({...selectedOrder, order_status: e.target.value})}
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="ready">Ready</option>
                                    <option value="served">Served</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Catatan</label>
                                <textarea
                                    value={selectedOrder.notes || ''}
                                    onChange={(e) => setSelectedOrder({...selectedOrder, notes: e.target.value})}
                                    rows={3}
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                    placeholder="Tambahkan catatan..."
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowOrderModal(false)
                                    setSelectedOrder(null)
                                }}
                                style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpdateOrder}
                                disabled={loading}
                                style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                            >
                                {loading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}