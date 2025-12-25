import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { router } from '@inertiajs/react'
import Navbar from '@/Components/Navbar'

export default function Checkout({ cart }) {
    const [cartData, setCartData] = useState(cart ?? { items: [], total: 0, count: 0 })
    const [selectedMethod, setSelectedMethod] = useState('cash')
    const [hasScannedQris, setHasScannedQris] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedMenuItem, setSelectedMenuItem] = useState(null)
    const [showMenuDetail, setShowMenuDetail] = useState(false)

    const qrImage = useMemo(
        () =>
            `data:image/svg+xml;utf8,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
                    <rect width="180" height="180" fill="#ffffff"/>
                    <rect x="10" y="10" width="50" height="50" fill="#0f172a"/>
                    <rect x="120" y="10" width="50" height="50" fill="#0f172a"/>
                    <rect x="10" y="120" width="50" height="50" fill="#0f172a"/>
                    <rect x="70" y="70" width="40" height="40" fill="#0f172a"/>
                    <rect x="130" y="80" width="30" height="30" fill="#0f172a"/>
                    <rect x="80" y="130" width="60" height="30" fill="#0f172a"/>
                    <rect x="20" y="80" width="20" height="20" fill="#0f172a"/>
                    <rect x="90" y="20" width="20" height="20" fill="#0f172a"/>
                    <text x="90" y="165" text-anchor="middle" font-size="14" fill="#0f172a" font-family="Arial, sans-serif">QRIS Payment</text>
                </svg>
            `)}`,
        []
    )

    const formatPrice = (price = 0) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)

    const refreshCart = async () => {
        try {
            const response = await axios.get('/cart')
            setCartData(response.data)
        } catch (error) {
            console.error('Error fetching cart:', error)
        }
    }

    useEffect(() => {
        refreshCart()
    }, [])

    const handleFinish = async () => {
        if (!cartData.items?.length) {
            alert('Keranjang kosong')
            return
        }

        setIsSubmitting(true)
        try {
            await axios.post('/cart/checkout', {
                payment_method: selectedMethod,
            })
            alert('Pesanan berhasil diselesaikan!')
            router.visit('/catalog')
        } catch (error) {
            console.error('Checkout error:', error)
            alert('Checkout gagal, silakan coba lagi.')
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (selectedMethod !== 'qris') {
            setHasScannedQris(false)
        }
    }, [selectedMethod])

    const paymentOptions = [
        { key: 'cash', label: 'Cash', description: 'Bayar langsung di kasir' },
        { key: 'transfer', label: 'Transfer', description: 'Bayar via transfer bank' },
        { key: 'qris', label: 'QRIS', description: 'Scan QR untuk bayar' },
    ]

    const canFinish =
        Boolean(cartData.items?.length) &&
        !isSubmitting &&
        (selectedMethod === 'qris' ? hasScannedQris : true)

    return (
        <div className="min-h-screen bg-stone-100">
            <Navbar showSearch={false} onCartClick={() => router.visit('/catalog')} />
            <div className="pt-32 pb-16 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                <div className="h-full bg-white shadow-sm rounded-2xl p-6 flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-800">Ringkasan Pesanan</h1>
                        <span className="text-sm text-gray-500">
                            {cartData.count || 0} item
                        </span>
                    </div>

                    {cartData.items?.length ? (
                        <div className="space-y-4">
                            {cartData.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between items-start border-b border-gray-100 pb-4"
                                >
                                    <div className="flex-1">
                                        <p 
                                            className="font-semibold text-gray-800 cursor-pointer hover:text-amber-600 transition-colors"
                                            onClick={() => {
                                                setSelectedMenuItem(item.menu_item)
                                                setShowMenuDetail(true)
                                            }}
                                        >
                                            {item.menu_item?.title}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Qty: {item.quantity} &bull; {formatPrice(item.price)}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-amber-700">
                                        {formatPrice(item.quantity * item.price)}
                                    </p>
                                </div>
                            ))}

                            <div className="flex justify-between items-center pt-2 text-lg font-bold">
                                <span>Total</span>
                                <span className="text-amber-700">
                                    {formatPrice(cartData.total)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center py-12">
                            Keranjang kosong. Tambahkan pesanan dari katalog.
                        </div>
                    )}
                </div>

                <div className="bg-white shadow-sm rounded-2xl p-6 w-full lg:w-96 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Metode Pembayaran</h2>
                        <div className="space-y-3">
                            {paymentOptions.map((option) => {
                                const isActive = selectedMethod === option.key
                                return (
                                    <button
                                        key={option.key}
                                        type="button"
                                        onClick={() => setSelectedMethod(option.key)}
                                        className={`w-full text-left border rounded-xl p-4 transition hover:border-amber-300 ${
                                            isActive
                                                ? 'border-amber-600 bg-amber-50'
                                                : 'border-gray-200 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {option.label}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {option.description}
                                                </p>
                                            </div>
                                            <span
                                                className={`w-5 h-5 rounded-full border ${
                                                    isActive
                                                        ? 'border-amber-600 bg-amber-600'
                                                        : 'border-gray-300 bg-white'
                                                }`}
                                            />
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {selectedMethod === 'qris' && (
                        <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 p-4 text-center">
                            <p className="text-sm text-gray-700 mb-3">
                                Silakan scan QRIS untuk menyelesaikan pembayaran
                            </p>
                            <div className="bg-white rounded-lg p-3 mx-auto w-48 h-48 flex items-center justify-center">
                                <img
                                    src="/Images/QRIS Image.jpg"
                                    alt="QRIS code"
                                    className="max-h-full max-w-full object-contain"
                                    onError={(e) => {
                                        e.target.src = '/Images/Logo.svg'
                                    }}
                                />
                            </div>
                            <label className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={hasScannedQris}
                                    onChange={(event) => setHasScannedQris(event.target.checked)}
                                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                />
                                <span>Saya sudah scan dan membayar via QRIS</span>
                            </label>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleFinish}
                        disabled={!canFinish}
                        className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 disabled:opacity-50 transition"
                    >
                        {selectedMethod === 'qris' ? 'Selesai setelah scan' : 'Selesai'}
                    </button>
                </div>
            </div>

            {/* Menu Detail Modal/Slider */}
            {showMenuDetail && selectedMenuItem && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="relative">
                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setShowMenuDetail(false)
                                    setSelectedMenuItem(null)
                                }}
                                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Image */}
                            <div className="w-full h-64 bg-gray-200 rounded-t-2xl overflow-hidden">
                                {selectedMenuItem.image ? (
                                    <img 
                                        src={selectedMenuItem.image} 
                                        alt={selectedMenuItem.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/Images/Logo.svg'
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    {selectedMenuItem.badge && (
                                        <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-medium">
                                            {selectedMenuItem.badge}
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2 font-['TT_Commons']">
                                    {selectedMenuItem.title}
                                </h2>
                                {selectedMenuItem.description && (
                                    <p className="text-gray-600 mb-4 font-['TT_Commons']">
                                        {selectedMenuItem.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl font-bold text-amber-600 font-['TT_Commons']">
                                        {formatPrice(selectedMenuItem.price)}
                                    </span>
                                    <span className="text-gray-500 font-['TT_Commons']">
                                        {selectedMenuItem.unit}
                                    </span>
                                </div>
                                {selectedMenuItem.stock !== undefined && (
                                    <div className="mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            selectedMenuItem.stock > 0 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        } font-['TT_Commons']`}>
                                            Stok: {selectedMenuItem.stock || 0}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
