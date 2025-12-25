import { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '@/Components/Sidebar'
import { DashNav } from '@/Components/DashNav'

export default function Tables({ tables: initialTables }) {
    const [tables, setTables] = useState(initialTables || [])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showReservationModal, setShowReservationModal] = useState(false)
    const [selectedTable, setSelectedTable] = useState(null)
    const [editingTable, setEditingTable] = useState(null)
    const [reservationUserId, setReservationUserId] = useState('')
    const [formData, setFormData] = useState({
        table_number: '',
        capacity: 4,
        location: '',
        status: 'available'
    })

    useEffect(() => {
        fetchTables()
        fetchUsers()
    }, [])

    const fetchTables = async () => {
        try {
            const res = await axios.get('/tables', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            const tablesData = res.data?.tables || res.data || []
            setTables(Array.isArray(tablesData) ? tablesData : [])
        } catch (e) {
            console.error('Failed to fetch tables', e)
            setTables([])
        }
    }

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/users', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            const usersData = res.data?.users || res.data || []
            setUsers(Array.isArray(usersData) ? usersData : [])
        } catch (e) {
            console.error('Failed to fetch users', e)
            setUsers([])
        }
    }

    const handleOpenModal = (table = null) => {
        if (table) {
            setEditingTable(table)
            setFormData({
                table_number: table.table_number,
                capacity: table.capacity,
                location: table.location || '',
                status: table.status || 'available'
            })
        } else {
            setEditingTable(null)
            setFormData({
                table_number: '',
                capacity: 4,
                location: '',
                status: 'available'
            })
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingTable(null)
        setFormData({
            table_number: '',
            capacity: 4,
            location: '',
            status: 'available'
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (editingTable) {
                await axios.put(`/tables/${editingTable.id}`, formData)
            } else {
                await axios.post('/tables', formData)
            }
            await fetchTables()
            handleCloseModal()
        } catch (error) {
            const message = error.response?.data?.message || 'Terjadi kesalahan'
            alert(message)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async (table) => {
        if (loading) return
        
        const action = table.status === 'available' ? 'mengubah menjadi occupied' : 'mengubah menjadi available'
        if (!window.confirm(`Apakah anda yakin ingin ${action} tabel "${table.table_number}"?`)) return

        setLoading(true)
        try {
            await axios.post(`/tables/${table.id}/toggle-status`)
            await fetchTables()
        } catch (error) {
            const message = error.response?.data?.message || 'Terjadi kesalahan saat mengubah status tabel'
            alert(message)
            console.error('Error toggling status:', error)
            await fetchTables()
        } finally {
            setLoading(false)
        }
    }

    const handleOpenReservationModal = (table) => {
        setSelectedTable(table)
        setReservationUserId('')
        setShowReservationModal(true)
    }

    const handleCloseReservationModal = () => {
        setShowReservationModal(false)
        setSelectedTable(null)
        setReservationUserId('')
    }

    const handleReserve = async () => {
        if (!reservationUserId) {
            alert('Pilih user terlebih dahulu')
            return
        }

        setLoading(true)
        try {
            await axios.post(`/tables/${selectedTable.id}/reserve`, {
                user_id: reservationUserId
            })
            await fetchTables()
            handleCloseReservationModal()
        } catch (error) {
            const message = error.response?.data?.message || 'Terjadi kesalahan saat melakukan reservasi'
            alert(message)
            console.error('Error reserving table:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (table) => {
        if (!window.confirm(`Apakah anda yakin ingin menghapus tabel "${table.table_number}"?`)) return

        setLoading(true)
        try {
            await axios.delete(`/tables/${table.id}`)
            await fetchTables()
        } catch (error) {
            const message = error.response?.data?.message || 'Terjadi kesalahan'
            alert(message)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800'
            case 'occupied':
                return 'bg-red-100 text-red-800'
            case 'reserved':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'available':
                return 'Tersedia'
            case 'occupied':
                return 'Terisi'
            case 'reserved':
                return 'Dipesan'
            default:
                return status
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
                                    <div className="text-neutral-800 text-2xl font-semibold" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Manajemen Tabel</div>
                                    <button
                                        onClick={() => handleOpenModal()}
                                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
                                        style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    >
                                        + Tambah Tabel
                                    </button>
                                </div>

                                <div className="w-full p-6">
                                    {loading && !showModal && !showReservationModal ? (
                                        <div className="text-center py-8 text-gray-500" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Memuat data...</div>
                                    ) : tables.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Tidak ada tabel</div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {tables.map((table) => (
                                                <div key={table.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                    <div className={`h-4 ${getStatusColor(table.status).split(' ')[0]}`}></div>
                                                    <div className="p-6">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div>
                                                                <h3 className="text-xl font-semibold text-gray-800" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                                    {table.table_number}
                                                                </h3>
                                                                {table.location && (
                                                                    <p className="text-sm text-gray-500 mt-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                                        {table.location}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`} style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                                {getStatusLabel(table.status)}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="space-y-2 mb-4">
                                                            <div className="flex items-center text-sm text-gray-600" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                                <span className="mr-2">👥</span>
                                                                <span>Kapasitas: {table.capacity} orang</span>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                                                <span className="mr-2">📋</span>
                                                                <span>Order: {table.orders_count || 0}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-2 mt-4">
                                                            <button
                                                                onClick={() => handleOpenModal(table)}
                                                                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                                                style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                                            >
                                                                Edit
                                                            </button>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <button
                                                                    onClick={() => handleToggleStatus(table)}
                                                                    disabled={loading}
                                                                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                                                                        table.status === 'available' 
                                                                            ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                                                                            : 'bg-green-600 text-white hover:bg-green-700'
                                                                    } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                                                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                                                >
                                                                    {table.status === 'available' ? 'Terisi' : 'Kosong'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleOpenReservationModal(table)}
                                                                    disabled={loading || table.status === 'reserved'}
                                                                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                                                >
                                                                    Reservasi
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDelete(table)}
                                                                disabled={loading}
                                                                className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                                style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
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
                                {editingTable ? 'Edit Tabel' : 'Tambah Tabel'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Nomor Tabel *</label>
                                <input
                                    type="text"
                                    value={formData.table_number}
                                    onChange={(e) => setFormData({...formData, table_number: e.target.value})}
                                    required
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                    placeholder="Contoh: T-01, Meja 1"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Kapasitas *</label>
                                    <input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 1})}
                                        required
                                        min="1"
                                        max="20"
                                        style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                        placeholder="4"
                                    />
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
                                        <option value="occupied">Terisi</option>
                                        <option value="reserved">Dipesan</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>Lokasi</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                    placeholder="Contoh: Lantai 1, Area Smoking"
                                />
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
                                    {loading ? 'Menyimpan...' : editingTable ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reservation Modal */}
            {showReservationModal && selectedTable && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-semibold text-gray-800" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                Reservasi Tabel {selectedTable.table_number}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                    Pilih User *
                                </label>
                                <select
                                    value={reservationUserId}
                                    onChange={(e) => setReservationUserId(e.target.value)}
                                    required
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                                >
                                    <option value="">-- Pilih User --</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                    <strong>Informasi Tabel:</strong>
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1" style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}>
                                    <li>Nomor: {selectedTable.table_number}</li>
                                    <li>Kapasitas: {selectedTable.capacity} orang</li>
                                    {selectedTable.location && <li>Lokasi: {selectedTable.location}</li>}
                                </ul>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseReservationModal}
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleReserve}
                                    disabled={loading || !reservationUserId}
                                    style={{fontFamily: "'Inter', 'TT Commons', sans-serif"}}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {loading ? 'Memproses...' : 'Reservasi'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

