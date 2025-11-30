import { router } from '@inertiajs/react'

export default function Navbar({ 
    showSearch = false, 
    searchQuery = '', 
    onSearchChange = null,
    searchPlaceholder = "Jelajahi makanan disini"
}) {
    const handleLogout = () => {
        router.post('/logout')
    }

    return (
        <div className="w-screen fixed px-26 py-6 z-50 bg-white border-b border-gray-100 inline-flex justify-start items-center gap-4">
            {/* Logo */}
            <div data-property-1="favicon" data-property-2="2" className="w-auto h-auto relative overflow-hidden">
                Logo
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

            {/* Foto Profil - Optional */}
            {/* <div className="flex justify-start items-center gap-6">
                <div className="w-6 h-6 relative overflow-hidden">
                    <div className="w-1.5 h-1.5 left-[13.50px] top-[2.50px] absolute bg-red-700 rounded-full" />
                </div>
                <img className="w-10 h-10 relative rounded-[336px] outline outline-[10px] outline-white" src="https://placehold.co/40x40" />
            </div> */}

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

