import { useState, useMemo } from 'react'
import axios from 'axios'
import CardFood from '@/Components/CardMakanan'
import CategoryCard from '@/Components/CategoryCard'
import Navbar from '@/Components/Navbar'
import Cart from '@/Components/Cart'
import { router } from '@inertiajs/react'

export default function Catalog({ categories = [], menuItems = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [cartOpen, setCartOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [showQuantityModal, setShowQuantityModal] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(false)

    // Filter menu items based on search and category
    const filteredMenuItems = useMemo(() => {
        let filtered = menuItems;

        // Filter by category (jika bukan 'all')
        if (activeCategory && activeCategory !== 'all') {
            filtered = filtered.filter(item => item.category_id === activeCategory);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [menuItems, activeCategory, searchQuery]);

    // Kategori "Semua Makanan" untuk ditambahkan di awal
    const allCategory = {
        id: 'all',
        name: 'Semua Makanan',
        icon: '🍽️',
        menu_items_count: menuItems.length
    };

    // Format price to Indonesian Rupiah
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleAddToCart = (item) => {
        setSelectedItem(item)
        setQuantity(1)
        setShowQuantityModal(true)
    }

    const confirmAddToCart = async () => {
        setLoading(true)
        try {
            await axios.post('/cart/add', {
                menu_item_id: selectedItem.id,
                quantity: quantity
            })
            setShowQuantityModal(false)
            setSelectedItem(null)
            setQuantity(1)
            alert('Berhasil ditambahkan ke keranjang!')
        } catch (error) {
            console.error('Error adding to cart:', error)
            alert('Gagal menambahkan ke keranjang')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-screen min-h-screen flex flex-col items-center bg-stone-100">
            {/* NAVBAR */}
            <Navbar 
                showSearch={true}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Jelajahi makanan disini"
                onCartClick={() => setCartOpen(true)}
            />
            
            {/* Header Teks*/}
            <div className="w-full h-auto py-20 mt-[100px] flex flex-col mx-auto items-center justify-center bg-red-600/25">
                <div className="flex flex-col items-center justify-center">
                    <div className="text-center justify-start text-amber-700 text-[48px] font-bold font-['TT_Commons']">
                        Bingung Mau Makan Apa? Biar Kami Bantu Kamu
                    </div>
                    <div className="w-auto max-w-4xl text-center text-amber-800 text-[24px] font-['TT_Commons']">
                        Sedang ingin yang gurih, manis, atau super pedas? Intip koleksi lengkap hidangan Korea kami di sini.
                        Apapun mood kamu, kami punya sajian lezat yang siap menemani momen santaimu.
                    </div>
                </div>
            </div>

            {/* Kontennya */}
            <div className="w-full max-w-7xl py-8 flex flex-col gap-8">
                {/* Kategori */}
                <div className="w-full flex flex-row gap-2 items-center">
                    <div className="flex gap-5 flex-wrap flex-1">
                        {/* Kategori "Semua Makanan" */}
                        <CategoryCard
                            key={allCategory.id}
                            icon={allCategory.icon}
                            title={allCategory.name}
                            count={allCategory.menu_items_count}
                            active={activeCategory === 'all'}
                            onClick={() => setActiveCategory('all')}
                        />
                        {/* Kategori lainnya */}
                        {categories.map((item) => (
                            <CategoryCard
                                key={item.id}
                                icon={item.icon || "🍽️"}
                                title={item.name}
                                count={item.menu_items_count || 0}
                                active={activeCategory === item.id}
                                onClick={() => setActiveCategory(item.id)}
                            />
                        ))}
                    </div>
                    {activeCategory && activeCategory !== 'all' && (
                        <button 
                            onClick={() => setActiveCategory('all')}
                            className="w-auto h-auto px-8 py-4 bg-amber-600 rounded-2xl text-neutral-100 font-['TT_Commons'] font-demibold 
                            hover:bg-amber-500 transition-all duration-300 ml-auto"
                        >
                            Hapus Filter
                        </button>
                    )}
                </div>

                {/* Card Makanan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMenuItems.length > 0 ? (
                        filteredMenuItems.map((item) => (
                            <CardFood 
                                key={item.id}
                                image={item.image}
                                category={item.category?.name || 'Kategori'}
                                badge={item.badge}
                                title={item.title}
                                price={formatPrice(item.price)}
                                unit={item.unit}
                                onAddClick={() => handleAddToCart(item)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-500 font-['TT_Commons']">
                            Tidak ada makanan yang ditemukan
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Slider */}
            <Cart 
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
            />

            {/* Quantity Modal */}
            {showQuantityModal && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                        <h3 className="text-xl font-bold mb-4">{selectedItem.title}</h3>
                        <p className="text-gray-600 mb-4">
                            Harga: {formatPrice(selectedItem.price)}
                        </p>

                        <div className="flex items-center justify-center gap-4 mb-6">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={loading}
                                className="w-10 h-10 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                disabled={loading}
                                className="w-16 text-center border border-gray-300 rounded py-2 disabled:opacity-50"
                            />
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                disabled={loading}
                                className="w-10 h-10 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            >
                                +
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowQuantityModal(false)}
                                disabled={loading}
                                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 disabled:opacity-50 font-semibold"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmAddToCart}
                                disabled={loading}
                                className="flex-1 bg-amber-600 text-white py-2 rounded hover:bg-amber-700 disabled:opacity-50 font-semibold"
                            >
                                {loading ? 'Menambah...' : 'Tambah ke Keranjang'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}