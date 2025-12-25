import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import axios from 'axios'
import Sidebar from '@/Components/Sidebar'
import { DashNav } from '@/Components/DashNav'

export default function Categories({ categories: initialCategories }) {
    const [categories, setCategories] = useState(initialCategories || [])
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        icon: ''
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories')
            setCategories(res.data.categories || res.data)
        } catch (e) {
            console.error('Failed to fetch categories', e)
        }
    }

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category)
            setFormData({
                name: category.name,
                icon: category.icon || ''
            })
        } else {
            setEditingCategory(null)
            setFormData({
                name: '',
                icon: ''
            })
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingCategory(null)
        setFormData({
            name: '',
            icon: ''
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (editingCategory) {
                await axios.put(`/categories/${editingCategory.id}`, formData)
            } else {
                await axios.post('/categories', formData)
            }
            await fetchCategories()
            handleCloseModal()
        } catch (error) {
            const message = error.response?.data?.message || 'Terjadi kesalahan'
            alert(message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (category) => {
        if (!window.confirm(`Apakah anda yakin ingin menghapus kategori "${category.name}"?`)) return

        setLoading(true)
        try {
            await axios.delete(`/categories/${category.id}`)
            await fetchCategories()
        } catch (error) {
            const message = error.response?.data?.message || 'Terjadi kesalahan'
            alert(message)
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
                                <div className="w-full h-16 px-6 pt-0.5 border-b border-slate-200 inline-flex justify-between items-center">
                                    <div className="text-neutral-800 text-2xl font-semibold font-['TT_Commons']">Manajemen Kategori</div>
                                    <button
                                        onClick={() => handleOpenModal()}
                                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
                                    >
                                        + Tambah Kategori
                                    </button>
                                </div>

                                <div className="w-full p-6">
                                {loading && !showModal ? (
                                    <div className="text-center py-8 text-gray-500">Memuat data...</div>
                                ) : categories.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">Tidak ada kategori</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-sm text-gray-500 border-b">
                                                    <th className="py-3 px-4">Icon</th>
                                                    <th className="py-3 px-4">Nama</th>
                                                    <th className="py-3 px-4">Jumlah Menu Items</th>
                                                    <th className="py-3 px-4">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {categories.map((category) => (
                                                    <tr key={category.id} className="text-sm border-b hover:bg-gray-50">
                                                        <td className="py-3 px-4 text-2xl">{category.icon || '🍽️'}</td>
                                                        <td className="py-3 px-4 font-medium">{category.name}</td>
                                                        <td className="py-3 px-4">{category.menu_items_count || 0}</td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleOpenModal(category)}
                                                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(category)}
                                                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                                                                >
                                                                    Hapus
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
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                    placeholder="Contoh: Makanan Korea"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji)</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                    maxLength={10}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                    placeholder="Contoh: 🍜"
                                />
                                <p className="text-xs text-gray-500 mt-1">Opsional: Masukkan emoji untuk icon kategori</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                                >
                                    {loading ? 'Menyimpan...' : editingCategory ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
