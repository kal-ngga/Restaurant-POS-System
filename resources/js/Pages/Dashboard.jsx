import Navbar from '@/Components/Navbar'

export default function Dashboard() {
    return (
        <div className="w-screen min-h-screen flex flex-col items-center bg-stone-100">
            {/* NAVBAR */}
            <Navbar showSearch={false} />
            
            {/* Content */}
            <div className="w-full h-auto py-20 mt-[100px] flex flex-col mx-auto items-center justify-center bg-amber-600/25">
                <div className="flex flex-col items-center justify-center">
                    <div className="text-center justify-start text-amber-700 text-[48px] font-bold font-['TT_Commons']">
                        INI DASHBOARD BANG
                    </div>
                    <div className="w-auto max-w-4xl text-center text-amber-800 text-[24px] font-['TT_Commons']">
                        Sabar yak nanti dibuatin
                    </div>
                </div>
            </div>
        </div>
    );
}