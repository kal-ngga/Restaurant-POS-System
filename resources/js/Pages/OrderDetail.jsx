import Sidebar from '@/Components/Sidebar'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'

export default function OrderDetail({ orderId }) {
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editingItem, setEditingItem] = useState(null)
    const [editQuantity, setEditQuantity] = useState(1)

    useEffect(() => {
        fetchOrder()
    }, [orderId])

    const fetchOrder = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`/orders/${orderId}`)
            setOrder(res.data)
        } catch (e) {
            console.error('Failed to fetch order', e)
            alert('Gagal memuat detail order')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateItem = async (itemId) => {
        if (editQuantity < 1) {
            alert('Quantity harus lebih dari 0')
            return
        }

        setLoading(true)
        try {
            await axios.put(`/orders/${orderId}/items/${itemId}`, {
                quantity: editQuantity
            })
            setEditingItem(null)
            fetchOrder()
        } catch (e) {
            alert('Gagal memperbarui item: ' + (e.response?.data?.message || e.message))
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Apakah anda yakin ingin menghapus item ini?')) return

        setLoading(true)
        try {
            await axios.delete(`/orders/${orderId}/items/${itemId}`)
            fetchOrder()
        } catch (e) {
            alert('Gagal menghapus item: ' + (e.response?.data?.message || e.message))
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateOrder = async () => {
        setLoading(true)
        try {
            await axios.put(`/orders/${orderId}`, {
                order_status: order.order_status,
                payment_status: order.payment_status,
                notes: order.notes
            })
            alert('Order berhasil diperbarui')
            fetchOrder()
        } catch (e) {
            alert('Gagal memperbarui order: ' + (e.response?.data?.message || e.message))
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteOrder = async () => {
        if (!window.confirm('Apakah anda yakin ingin menghapus order ini?')) return

        setLoading(true)
        try {
            await axios.delete(`/orders/${orderId}`)
            router.visit('/dashboard')
        } catch (e) {
            alert('Gagal menghapus order: ' + (e.response?.data?.message || e.message))
            setLoading(false)
        }
    }

    if (loading && !order) {
        return (
            <div className="min-h-screen bg-gray-50 relative">
                <Sidebar />
                <main className="pl-60 pt-24 px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center py-12 text-gray-500">Memuat data...</div>
                    </div>
                </main>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 relative">
                <Sidebar />
                <main className="pl-60 pt-24 px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center py-12 text-gray-500">Order tidak ditemukan</div>
                        <button
                            onClick={() => router.visit('/dashboard')}
                            className="mx-auto block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                        >
                            Kembali ke Dashboard
                        </button>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 relative">
            <Sidebar />
            <main className="pl-60 pt-24 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <button
                            onClick={() => router.visit('/dashboard')}
                            className="text-amber-600 hover:text-amber-700 flex items-center gap-2"
                        >
                            ← Kembali ke Dashboard
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-semibold text-gray-800 mb-2">
                                        Order #{order.order_number}
                                    </h1>
                                    <div className="flex gap-4 text-sm text-gray-600">
                                        <span>Tanggal: {new Date(order.created_at).toLocaleString('id-ID')}</span>
                                        <span>User: {order.user?.name || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDeleteOrder}
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    >
                                        Hapus Order
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Order Info */}
                        <div className="p-6 border-b border-gray-200 grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
                                <select
                                    value={order.payment_status}
                                    onChange={(e) => setOrder({...order, payment_status: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status Order</label>
                                <select
                                    value={order.order_status}
                                    onChange={(e) => setOrder({...order, order_status: e.target.value})}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                                <div className="px-4 py-2 bg-gray-50 rounded-lg text-lg font-semibold">
                                    Rp{Number(order.total_amount || 0).toLocaleString('id-ID')}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="p-6 border-b border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                            <textarea
                                value={order.notes || ''}
                                onChange={(e) => setOrder({...order, notes: e.target.value})}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                placeholder="Tambahkan catatan..."
                            />
                        </div>

                        {/* Order Items */}
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Items</h2>
                            {order.items && order.items.length > 0 ? (
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">{item.menu_item?.title || 'N/A'}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Rp{Number(item.unit_price || 0).toLocaleString('id-ID')} × {item.quantity}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {editingItem === item.id ? (
                                                    <>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={editQuantity}
                                                            onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                                        />
                                                        <button
                                                            onClick={() => handleUpdateItem(item.id)}
                                                            disabled={loading}
                                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                                                        >
                                                            Simpan
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingItem(null)}
                                                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                                                        >
                                                            Batal
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="text-right">
                                                            <div className="font-semibold text-gray-800">
                                                                Rp{Number(item.subtotal || 0).toLocaleString('id-ID')}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                Qty: {item.quantity}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setEditingItem(item.id)
                                                                setEditQuantity(item.quantity)
                                                            }}
                                                            className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteItem(item.id)}
                                                            disabled={loading}
                                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">Tidak ada items</div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => router.visit('/dashboard')}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpdateOrder}
                                disabled={loading}
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                            >
                                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}








