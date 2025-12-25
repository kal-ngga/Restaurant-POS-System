import { router } from '@inertiajs/react'

export default function TransactionList({ transactions = [] }) {
    if (!transactions || transactions.length === 0) {
        return <div className="p-4 text-gray-500">Tidak ada transaksi terbaru</div>
    }

    const handleViewDetail = (orderId) => {
        if (orderId) {
            router.visit(`/orders/${orderId}/detail`)
        }
    }

    return (
        <div className="p-4">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-sm text-gray-500 border-b">
                        <th className="py-4">Waktu</th>
                        <th className="py-4">User</th>
                        <th className="py-4">Items</th>
                        <th className="py-4">Total</th>
                        <th className="py-4">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((t) => (
                        <tr key={t.order_id || t.cart_id} className="text-sm border-b border-gray-200 hover:bg-gray-50 text-neutral-800 hover:text-neutral-900">
                            <td className="py-4 font-light text-lg font-['TT_Commons']">{new Date(t.created_at).toLocaleString('id-ID')}</td>
                            <td className="py-4 font-regular text-lg font-['TT_Commons']">{t.user_name}</td>
                            <td className="py-4 font-regular text-lg font-['TT_Commons']">{t.items_count}</td>
                            <td className="py-4 font-regular text-lg font-['TT_Commons']">Rp{Number(t.total || 0).toLocaleString('id-ID')}</td>
                            <td className="py-4">
                                {t.order_id && (
                                    <button
                                        onClick={() => handleViewDetail(t.order_id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                    >
                                        Detail
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
