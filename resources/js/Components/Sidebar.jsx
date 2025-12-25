import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'

export default function Sidebar() {
    const [current, setCurrent] = useState('/')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrent(window.location.pathname)
        }
    }, [])

    const handleLogout = () => {
        router.post('/logout')
    }

    const items = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/transactions', label: 'Transaksi' },
        { href: '/menu-items', label: 'Catalog' },
        { href: '/categories', label: 'Categories' },
        { href: '/tables', label: 'Tabel' },
        // { href: '/orders', label: 'Orders' },
    ]

    return (
        <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 z-40 px-4 py-6 flex flex-col">
            
            <img src="/Images/logo.svg" className="w-32 h-auto mx-auto mb-8 object-cover"/>
            
            <nav className="flex flex-1 flex-col gap-2">
                {items.map((it) => {
                    const active = current === it.href || (it.href !== '/' && current.startsWith(it.href))
                    return (
                        <a key={it.href} href={it.href} className={`px-4 py-3 rounded-lg flex items-center gap-3 text-sm ${active ? 'bg-amber-600 text-lg font-semibold text-white' : 'text-neutral-700 hover:bg-gray-50'}`}>
                            <span>{it.label}</span>
                        </a>
                    )
                })}
            </nav>

            <button 
                onClick={handleLogout}
                className="mt-auto w-full px-4 py-3 rounded-xl text-lg font-medium bg-amber-100 text-amber-700 font-['TT_Commons'] flex justify-center items-center"
            >
                Logout
            </button>
        </aside>
    )
}