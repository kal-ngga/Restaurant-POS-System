import { useState } from 'react'
import { router } from '@inertiajs/react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const handleLogin = (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})
        
        router.post('/login', {
            email,
            password,
        }, {
            onSuccess: () => {
                // Redirect akan dihandle oleh server berdasarkan role
                setLoading(false)
            },
            onError: (errors) => {
                setErrors(errors)
                setLoading(false)
                if (errors.email) {
                    alert('Login gagal: ' + errors.email)
                } else if (errors.message) {
                    alert('Login gagal: ' + errors.message)
                } else {
                    alert('Login gagal: Email atau password salah')
                }
            },
        })
    }

    return (
        <div className="w-screen h-screen bg-white overflow-hidden flex flex-col lg:flex-row items-center justify-start">
            {/* LEFT IMAGE - Hidden on mobile, visible on lg screens */}
            <img
                src="/Images/bg_register.png"
                className="
                hidden lg:block
                w-1/2 h-full object-cover
                bg-gradient-to-b from-[rgba(0,0,0,0.5)] to-[rgba(0,0,0,0.5)]
                "
            />

            {/* RIGHT CONTENT */}
            <div className="w-full lg:w-1/2 h-full bg-white flex flex-col items-center justify-center gap-8 px-4 sm:px-8 md:px-12 lg:px-24 py-8 sm:py-12 md:py-16 lg:py-20 overflow-y-auto">

                {/* Logo */}
                <img src="/Images/Logo.svg" className="w-32 h-16 md:w-40 md:h-20 lg:w-[164px] lg:h-[77px]" />

                {/* Heading */}
                <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg gap-2 text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[36px] font-bold text-[#202020] font-tt">
                        Selamat Datang! Masuk untuk melanjutkan
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-[20px] text-[#797979] font-tt">
                        Masuk untuk menikmati kehangatan cita rasa masakan Ibu. Pesan menu favoritmu dengan lebih mudah.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg flex flex-col gap-8">
                    {/* Input Email */}
                    <div className="flex flex-col gap-2 font-tt">
                        <label className="text-lg sm:text-xl md:text-xl mx-4 lg:text-[20px] font-medium text-[#202020]">Email/Username</label>
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="masukan E-mail disini"
                            required
                            className="h-12 sm:h-14 md:h-14 lg:h-[52px] px-4 sm:px-6 py-3 sm:py-3 md:py-4 border-2 border-[#EEEEEE] rounded-xl flex items-center text-[#202020] text-base sm:text-lg md:text-lg lg:text-[18px] font-normal focus:outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700 focus:ring-opacity-20 transition-all"
                        />
                    </div>

                    {/* Input Password */}
                    <div className="flex flex-col gap-2 font-tt">
                        <label className="text-lg sm:text-xl md:text-xl mx-4 lg:text-[20px] font-medium text-[#202020]">Password</label>

                        <div className="h-12 sm:h-14 md:h-14 lg:h-[52px] px-4 sm:px-6 py-3 sm:py-3 md:py-4 border-2 border-[#EEEEEE] rounded-xl flex items-center justify-between focus-within:border-amber-700 focus-within:ring-2 focus-within:ring-amber-700 focus-within:ring-opacity-20 transition-all">
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukan Password disini"
                                required
                                className="flex-1 bg-transparent text-[#202020] text-base sm:text-lg md:text-lg lg:text-[18px] focus:outline-none placeholder-[#A6A6A6]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="relative w-5 h-5 sm:w-6 sm:h-6 hover:opacity-70 transition-opacity"
                            >
                                {showPassword ? (
                                    <svg className="w-full h-full stroke-[#4D4D4D]" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                ) : (
                                    <svg className="w-full h-full stroke-[#4D4D4D]" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Reset Password */}
                        <div className="w-full mx-6 text-base sm:text-lg md:text-lg lg:text-[18px] text-[#202020] opacity-50 font-tt cursor-pointer hover:opacity-75 transition-opacity">
                            Reset Password
                        </div>
                    </div>

                    {/* Button Masuk */}
                    <button 
                        type="submit"
                        disabled={loading || !email || !password}
                        className="w-full px-4 sm:px-6 py-3 sm:py-3 md:py-4 bg-amber-500 rounded-xl text-center text-lg sm:text-xl md:text-xl lg:text-[20px] text-[#FFFFFF] font-medium font-tt hover:bg-amber-600 duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                    {/* Login Akun */}
                    <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto lg:max-w-lg text-center text-base sm:text-lg font-tt text-[#202020]">
                        Belum punya akun?{" "}
                        <a href="/register" className="text-[#6A0A0D] underline hover:opacity-80 font-medium">
                            Daftar di sini
                        </a>
                    </div>
            </div>
        </div>
    )
}