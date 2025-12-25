import { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '@/Components/Sidebar'
import { DashNav } from '@/Components/DashNav'

export default function MenuItems({ menuItems: initialMenuItems, categories: initialCategories }) {
    const [menuItems, setMenuItems] = useState(initialMenuItems || [])
    const [categories, setCategories] = useState(initialCategories || [])
    const [loading, setLoading] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState({
        category_id: '',
        title: '',
        description: '',
        image: '',
        badge: '',
        price: '',
        unit: '',
        stock: 0,
        status: 'available'
    })

    useEffect(() => {
        fetchMenuItems()
        fetchCategories()
    }, [])

    const fetchMenuItems = async () => {
        try {
            const res = await axios.get('/menu-items', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            // Handle both response structures
            const items = res.data?.menuItems || res.data?.data || res.data || []
            const menuItemsArray = Array.isArray(items) ? items : []
            console.log('Fetched menu items:', menuItemsArray.length)
            // Log status of each item for debugging
            menuItemsArray.forEach(item => {
                console.log(`Item ${item.id} (${item.title}): status = ${item.status}`)
            })
            // Create new array with new object references to ensure React detects changes
            const newItems = menuItemsArray.map(item => ({ ...item }))
            setMenuItems(newItems)
            setRefreshKey(prev => prev + 1)
        } catch (e) {
            console.error('Failed to fetch menu items', e)
            setMenuItems([])
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories')
            setCategories(res.data.categories || res.data)
        } catch (e) {
            console.error('Failed to fetch categories', e)
        }
    }

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                category_id: item.category_id,
                title: item.title,
                description: item.description || '',
                image: item.image || '',
                badge: item.badge || '',
                price: item.price,
                unit: item.unit,
                stock: item.stock || 0,
                status: item.status || 'available'
            })
        } else {
            setEditingItem(null)
            setFormData({
                category_id: '',
                title: '',
                description: '',
                image: '',
                badge: '',
                price: '',
                unit: '',
                stock: 0,
                status: 'available'
            })
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingItem(null)
        setFormData({
            category_id: '',
            title: '',
            image: '',
            badge: '',
            price: '',
            unit: '',
            stock: 0,
            status: 'available'
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price)
            }
            
            if (editingItem) {
                await axios.put(`/menu-items/${editingItem.id}`, data)
            } else {
                await axios.post('/menu-items', data)
            }
            await fetchMenuItems()
            handleCloseModal()
        } catch (error) {
            const message = error.response?.data?.message || 'Terjadi kesalahan'
            alert(message)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async (item) => {
        if (loading) return
        
        // Determine current status - handle null, undefined, or empty string
        const currentStatus = item.status === null || item.status === undefined || item.status === '' ? 'available' : item.status
        const action = currentStatus === 'available' ? 'menyembunyikan' : 'menampilkan'
        if (!window.confirm(`Apakah anda yakin ingin ${action} menu item "${item.title}"?`)) return

        setLoading(true)
        
        try {
            console.log('Before toggle - Item:', item.id, 'Status:', currentStatus)
            
            const response = await axios.post(`/menu-items/${item.id}/toggle-status`)
            console.log('Toggle response:', response.data)
            
            // Get the updated item from response
            const updatedItem = response.data?.menuItem
            if (updatedItem) {
                console.log('Updated item from response:', updatedItem.id, 'New status:', updatedItem.status)
                
                // Update state directly from response
                setMenuItems(prevItems => {
                    const newItems = prevItems.map(menuItem => {
                        if (menuItem.id === item.id) {
                            return { ...menuItem, status: updatedItem.status }
                        }
                        return { ...menuItem } // Create new object reference for all items
                    })
                    console.log('State updated. Item', item.id, 'now has status:', newItems.find(i => i.id === item.id)?.status)
                    return newItems
                })
                
                // Force re-render by updating refresh key
                setRefreshKey(prev => prev + 1)
            }
            
            // Also refresh from server to ensure consistency
            setTimeout(async () => {
                await fetchMenuItems()
                setRefreshKey(prev => prev + 1)
            }, 200)
            
        } catch (error) {
            const message = error.response?.data?.message || 'Terjadi kesalahan saat mengubah status menu'
            alert(message)
            console.error('Error toggling status:', error)
            await fetchMenuItems()
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
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
                                <div className="w-full h-16 px-6 pt-0.5 border-b border-slate-200 inline-flex justify-between items-center">
                                    <div className="text-neutral-800 text-2xl font-semibold" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Manajemen Menu Items</div>
                                    <button
                                        onClick={() => handleOpenModal()}
                                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
                                        style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    >
                                        + Tambah Menu Item
                                    </button>
                                </div>

                                <div className="w-full p-6">
                                {loading && !showModal ? (
                                    <div className="text-center py-8 text-gray-500" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Memuat data...</div>
                                ) : menuItems.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Tidak ada menu items</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-sm text-gray-500 border-b" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                    <th className="py-3 px-4">Gambar</th>
                                                    <th className="py-3 px-4">Nama</th>
                                                    <th className="py-3 px-4">Kategori</th>
                                                    <th className="py-3 px-4">Badge</th>
                                                    <th className="py-3 px-4">Harga</th>
                                                    <th className="py-3 px-4">Unit</th>
                                                    <th className="py-3 px-4">Stok</th>
                                                    <th className="py-3 px-4">Status</th>
                                                    <th className="py-3 px-4">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {menuItems.map((item) => (
                                                    <tr key={`${item.id}-${item.status}-${refreshKey}`} className="text-sm border-b hover:bg-gray-50">
                                                        <td className="py-3 px-4">
                                                            {item.image ? (
                                                                <img 
                                                                    src={item.image} 
                                                                    alt={item.title}
                                                                    className="w-16 h-16 object-cover rounded"
                                                                    onError={(e) => {
                                                                        e.target.src = '/Images/Logo.svg'
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                                    No Image
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 font-medium" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>{item.title}</td>
                                                        <td className="py-3 px-4" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>{item.category?.name || 'N/A'}</td>
                                                        <td className="py-3 px-4">
                                                            {item.badge && (
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                                    {item.badge}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>{formatPrice(item.price)}</td>
                                                        <td className="py-3 px-4" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>{item.unit}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                (item.stock || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`} style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                                {item.stock || 0}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                (item.status === 'available' || item.status === null) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                            }`} style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                                {(item.status === 'available' || item.status === null) ? 'Tersedia' : 'Tersembunyi'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleOpenModal(item)}
                                                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault()
                                                                        e.stopPropagation()
                                                                        handleToggleStatus(item)
                                                                    }}
                                                                    disabled={loading}
                                                                    className={`px-3 py-1 rounded text-xs font-medium ${
                                                                        (item.status === 'available' || item.status === null)
                                                                            ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                                                                            : 'bg-green-600 text-white hover:bg-green-700'
                                                                    } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                                                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                                                >
                                                                    {(item.status === 'available' || item.status === null) ? 'Sembunyikan' : 'Tampilkan'}
                                                                </button>
                                                            </div>
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-semibold text-gray-800" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                {editingItem ? 'Edit Menu Item' : 'Tambah Menu Item'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Kategori *</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                    required
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Nama Menu *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                    placeholder="Contoh: Bibimbap"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={3}
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                    placeholder="Deskripsi menu..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Path Gambar</label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                    placeholder="/Images/Bibimbap.png"
                                />
                                <p className="text-xs text-gray-500 mt-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Masukkan path gambar, contoh: /Images/Bibimbap.png</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Badge</label>
                                <input
                                    type="text"
                                    value={formData.badge}
                                    onChange={(e) => setFormData({...formData, badge: e.target.value})}
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                    placeholder="Contoh: Best Seller, New Arrival"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Harga *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        required
                                        min="0"
                                        step="0.01"
                                        style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                        placeholder="50000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Unit *</label>
                                    <input
                                        type="text"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                        required
                                        style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                        placeholder="/ porsi, / botol"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Stok *</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => {
                                            const stock = parseInt(e.target.value) || 0
                                            setFormData({
                                                ...formData, 
                                                stock: stock,
                                                status: stock > 0 ? 'available' : 'hidden'
                                            })
                                        }}
                                        required
                                        min="0"
                                        style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Menu akan otomatis tersembunyi jika stok 0</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                    >
                                        <option value="available">Tersedia</option>
                                        <option value="hidden">Tersembunyi</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                                >
                                    {loading ? 'Menyimpan...' : editingItem ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
