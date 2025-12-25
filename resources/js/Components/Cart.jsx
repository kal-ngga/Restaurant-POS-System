import { useState, useEffect } from 'react'
import axios from 'axios'
import { router } from '@inertiajs/react'

export default function Cart({ isOpen, onClose }) {
    const [cartItems, setCartItems] = useState([])
    const [total, setTotal] = useState(0)
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(false)

    const fetchCart = async () => {
        try {
            const response = await axios.get('/cart')
            setCartItems(response.data.items)
            setTotal(response.data.total)
            setCount(response.data.count)
        } catch (error) {
            console.error('Error fetching cart:', error)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchCart()
        }
    }, [isOpen])

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return

        // Optimistic update - update UI immediately
        setCartItems(prevItems => 
            prevItems.map(item => 
                item.id === itemId 
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        )

        setLoading(true)
        try {
            const response = await axios.put(`/cart/update/${itemId}`, { quantity: newQuantity })
            // Update with server response to ensure consistency
            setCartItems(response.data.items)
            setTotal(response.data.total)
            setCount(response.data.count)
        } catch (error) {
            console.error('Error updating cart:', error)
            // Revert on error
            await fetchCart()
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = async (itemId) => {
        setLoading(true)
        try {
            await axios.delete(`/cart/remove/${itemId}`)
            await fetchCart()
        } catch (error) {
            console.error('Error removing item:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleClear = async () => {
        if (window.confirm('Apakah anda yakin ingin membersihkan keranjang?')) {
            setLoading(true)
            try {
                await axios.post('/cart/clear')
                await fetchCart()
            } catch (error) {
                console.error('Error clearing cart:', error)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Keranjang kosong')
            return
        }

        // Tutup sidenav cart lalu arahkan ke halaman checkout
        onClose()
        router.visit('/checkout')
    }

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Slider */}
            <div
                className={`fixed top-0 right-0 h-screen w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>

                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Keranjang</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Items */}
                <div className="p-6">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Keranjang kosong</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4 border-b border-gray-200 pb-4">
                                    {/* Image */}
                                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.menu_item.image && (
                                            <img
                                                src={item.menu_item.image}
                                                alt={item.menu_item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">
                                            {item.menu_item.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Rp {parseFloat(item.price).toLocaleString('id-ID')}
                                        </p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                disabled={loading}
                                                className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-semibold">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                disabled={loading}
                                                className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                disabled={loading}
                                                className="ml-auto text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total:</span>
                            <span className="text-amber-600">
                                Rp {total.toLocaleString('id-ID')}
                            </span>
                        </div>

                        <button
                            onClick={handleClear}
                            disabled={loading}
                            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-semibold transition"
                        >
                            Bersihkan Keranjang
                        </button>

                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 disabled:opacity-50 font-semibold transition"
                        >
                            Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}
