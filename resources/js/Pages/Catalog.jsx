import { useState, useMemo } from 'react'
import CardFood from '@/Components/CardMakanan'
import CategoryCard from '@/Components/CategoryCard'
import Navbar from '@/Components/Navbar'


export default function Catalog({ categories = [], menuItems = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all'); // Default ke 'all' untuk menampilkan semua

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

    return (
        <div className="w-screen min-h-screen flex flex-col items-center bg-stone-100">
            {/* NAVBAR */}
            <Navbar 
                showSearch={true}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Jelajahi makanan disini"
            />
            
            {/* Header Teks*/}
            <div className="w-full h-auto py-20 mt-[100px] flex flex-col mx-auto items-center justify-center bg-amber-600/25">
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
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-500 font-['TT_Commons']">
                            Tidak ada makanan yang ditemukan
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}