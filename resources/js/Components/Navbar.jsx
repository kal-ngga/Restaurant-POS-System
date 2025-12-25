import { router } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Navbar({ 
    showSearch = false, 
    searchQuery = '', 
    onSearchChange = null,
    searchPlaceholder = "Jelajahi makanan disini",
    onCartClick = null
}) {
    const [cartCount, setCartCount] = useState(0)

    const handleLogout = () => {
        router.post('/logout')
    }

    const fetchCartCount = async () => {
        try {
            const response = await axios.get('/cart')
            setCartCount(response.data.count)
        } catch (error) {
            console.error('Error fetching cart count:', error)
        }
    }

    useEffect(() => {
        fetchCartCount()
        // Refresh cart count setiap 5 detik
        const interval = setInterval(fetchCartCount, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-screen fixed px-26 py-6 z-50 bg-white border-b border-gray-100 inline-flex justify-start items-center gap-4">
            {/* Logo */}
            <div src="/Images/logo.svg" className="w-auto h-auto relative overflow-hidden">

            </div>

            {/* Search Bar - Conditional */}
            {showSearch && (
                <div className="flex-1 h-16 pl-8 pr-4 py-4 bg-gray-100 rounded-3xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex justify-between items-center hover:outline-slate-500 outline-2 duration-300">
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="flex-1 bg-transparent outline-none text-neutral-500 text-2xl font-normal font-['TT_Commons'] leading-8 placeholder:text-neutral-400"
                    />
                    {/* Search Icon */}
                    <div className="p-3 bg-white rounded-2xl flex justify-start items-center gap-2.5">
                        <div className="w-6 h-6 relative">
                            <div className="w-5 h-5 left-[2.17px] top-[2.17px] absolute outline outline-2 outline-offset-[-1px] outline-neutral-600" />
                            <div className="w-0.5 h-0.5 left-[21.67px] top-[21.67px] absolute bg-neutral-600 outline outline-2 outline-offset-[-1px] outline-neutral-600" />
                            <div className="w-6 h-6 left-0 top-0 absolute opacity-0 bg-neutral-600" />
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer jika tidak ada search */}
            {!showSearch && <div className="flex-1"></div>}

            {/* Cart Icon & Logout */}
            <div className="flex justify-start items-center gap-6">
                {/* Cart Icon */}
                <button
                    onClick={onCartClick}
                    className="relative p-3 rounded-full hover:bg-gray-100 transition"
                >
                    <svg 
                        className="w-6 h-6 text-gray-700" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                        />
                    </svg>
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Logout Button */}
            <button 
                onClick={handleLogout}
                className="w-auto h-auto px-8 py-4 rounded-3xl text-lg font-medium bg-amber-600 text-amber-100 hover:bg-amber-700 duration-300 font-['TT_Commons']"
            >
                Logout
            </button>
        </div>
    )
}

