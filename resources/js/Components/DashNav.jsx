import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'

export function DashNav() {
    const [current, setCurrent] = useState('/')

    useEffect(() => {
        setCurrent(window.location.pathname)
    }, [])

    return (
        <div className="w-full px-2 sm:px-4 lg:px-10 py-6 bg-white border-b border-slate-200 flex justify-between items-center">
            <div className="w-[531px] justify-start text-black text-4xl font-semibold font-['TT_Commons']">Dasbor Ringkasan</div>
            <div className="flex justify-start items-center gap-6">
                <div className="pl-3 pr-4 py-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-200 flex justify-center items-center gap-2">
                    <div className="justify-start text-neutral-500 text-xl font-normal font-['TT_Commons']">Download Ringkasan</div>
                </div>
            </div>
        </div>
    )
}