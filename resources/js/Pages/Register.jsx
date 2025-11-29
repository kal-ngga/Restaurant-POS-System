import { useState } from 'react'
import LoginBg from '../assets/Restaurant Images 4K.jpg'


function PasswordRequirements({ password }) {
    const lengthValid = password.length >= 8
    const upperValid = /[A-Z]/.test(password)
    const numberValid = /[0-9]/.test(password)

    const Row = ({ valid, children }) => (
        <div className="flex items-center gap-3">
            <div className={`w-4 h-4 flex items-center justify-center rounded-sm ${valid ? 'bg-green-500' : 'border border-[#A6A6A6]'}`}>
                {valid ? (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : null}
            </div>
            <div className={`text-sm ${valid ? 'text-black' : 'text-[#A6A6A6]'}`}>{children}</div>
        </div>
    )

    return (
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mt-3">
            <div className="text-[18px] font-medium text-[#202020] mb-2">Persyaratan Password</div>
            <div className="flex flex-col gap-2">
                <Row valid={lengthValid}>Harus lebih dari 8 karakter</Row>
                <Row valid={upperValid}>Minimal 1 huruf besar</Row>
                <Row valid={numberValid}>Minimal 1 angka</Row>
            </div>
        </div>
    )
}

export default function Register() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const passwordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        console.log('Register submit dengan data:', { email, username, password })
        
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content
            console.log('CSRF Token:', csrfToken)
            
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                credentials: 'same-origin',
                body: JSON.stringify({ 
                    email, 
                    username,
                    password,
                    password_confirmation: password 
                })
            })

            console.log('Response status:', response.status)
            
            if (response.ok) {
                console.log('Register berhasil!')
                window.location.href = '/catalog'
            } else {
                const error = await response.json()
                console.log('Response error:', error)
                alert('Registrasi gagal: ' + (error.message || 'Terjadi kesalahan'))
            }
        } catch (err) {
            console.error('Fetch error:', err)
            alert('Terjadi kesalahan: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-screen h-screen bg-white overflow-hidden flex flex-col lg:flex-row items-center justify-start">
            {/* LEFT IMAGE - Hidden on mobile, visible on lg screens */}
            <img
                src={LoginBg}
                className="
                hidden lg:block
                w-1/2 h-full object-cover
                bg-gradient-to-b from-[rgba(0,0,0,0.5)] to-[rgba(0,0,0,0.5)]
                "
            />

            {/* RIGHT CONTENT */}
            <div className="w-full lg:w-1/2 h-full bg-white flex flex-col items-center justify-center gap-8 px-4 sm:px-8 md:px-12 lg:px-24 py-8 sm:py-12 md:py-16 lg:py-20 overflow-y-auto">

                {/* Logo */}
                <img src="https://placehold.co/164x77" className="w-32 h-16 md:w-40 md:h-20 lg:w-[164px] lg:h-[77px]" />

                {/* Heading */}
                <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg gap-2 text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[36px] font-bold text-[#202020] font-tt">
                        Daftarkan akun anda agar bisa melanjutkan
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-[20px] text-[#797979] font-tt">
                        Akses sistem manajemen toko untuk memantau penjualan dan persediaan barang secara real-time.
                    </p>
                </div>

                {/* Input Email */}
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg flex flex-col gap-2 font-tt">
                    <label className="text-lg sm:text-xl mx-4 md:text-xl lg:text-[20px] font-medium text-[#202020]">Email</label>
                    <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="masukan E-mail disini"
                        className="h-12 sm:h-14 md:h-14 lg:h-[52px] px-4 sm:px-6 py-3 sm:py-3 md:py-4 border-2 border-[#EEEEEE] rounded-xl flex items-center text-[#202020] text-base sm:text-lg md:text-lg lg:text-[18px] font-normal focus:outline-none focus:border-[#6A0A0D] focus:ring-2 focus:ring-[#6A0A0D] focus:ring-opacity-20 transition-all"
                    />
                </div>

                {/* Input Username */}
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg flex flex-col gap-2 font-tt">
                    <label className="text-lg sm:text-xl mx-4 md:text-xl lg:text-[20px] font-medium text-[#202020]">Username</label>
                    <input 
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="masukan Username disini"
                        className="h-12 sm:h-14 md:h-14 lg:h-[52px] px-4 sm:px-6 py-3 sm:py-3 md:py-4 border-2 border-[#EEEEEE] rounded-xl flex items-center text-[#202020] text-base sm:text-lg md:text-lg lg:text-[18px] font-normal focus:outline-none focus:border-[#6A0A0D] focus:ring-2 focus:ring-[#6A0A0D] focus:ring-opacity-20 transition-all"
                    />
                </div>

                {/* Input Password */}
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg flex flex-col gap-2 font-tt">
                    <label className="text-lg sm:text-xl mx-4 md:text-xl lg:text-[20px] font-medium text-[#202020]">Password</label>

                    <div className="h-12 sm:h-14 md:h-14 lg:h-[52px] px-4 sm:px-6 py-3 sm:py-3md:py-4 border-2 border-[#EEEEEE] rounded-xl flex items-center justify-between focus-within:border-[#6A0A0D] focus-within:ring-2 focus-within:ring-[#6A0A0D] focus-within:ring-opacity-20 transition-all">
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukan Password disini"
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
                    <div className="w-full max-w-xs sm:max-w-sm mx-6 md:max-w-md lg:max-w-lg text-base sm:text-lg md:text-lg lg:text-[18px] text-[#202020] opacity-50 font-tt cursor-pointer hover:opacity-75 transition-opacity">
                        Reset Password
                    </div>


                    {/* Persyaratan */}
                    {/* <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg text-sm sm:text-base md:text-base lg:text-[16px] font-tt leading-relaxed text-[#4D4D4D]">
                        Dengan bergabung, Anda menyetujui{" "}
                        <span className="text-[#6A0A0D] underline cursor-pointer hover:opacity-80">
                            Persyaratan Layanan
                        </span>{" "}
                        Telkom dan menerima email dari kami secara berkala. Silakan baca{" "}
                        <span className="text-[#6A0A0D] underline cursor-pointer hover:opacity-80">
                            Kebijakan Privasi
                        </span>{" "}
                        kami untuk mengetahui bagaimana kami menggunakan data pribadi Anda.
                    </div> */}
                </div>

                {/* Button Register */}
                <button 
                    onClick={handleLogin}
                    disabled={loading || !email || !username || !passwordValid}
                    className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 sm:px-6 py-3 sm:py-3 md:py-4 bg-[#B01116] rounded-xl text-center text-lg sm:text-xl md:text-xl lg:text-[20px] text-[#FFFFFF] font-medium font-tt hover:bg-[#8D0D11] duration-200"
                >
                    {loading ? 'Memproses...' : 'Register'}
                </button>

                {/* Link ke Login */}
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg text-center text-base sm:text-lg font-tt text-[#202020]">
                    Sudah punya akun?{' '}
                    <a href="/" className="text-[#6A0A0D] underline hover:opacity-80 font-medium">
                        Login di sini
                    </a>
                </div>
            </div>
        </div>
    )
}