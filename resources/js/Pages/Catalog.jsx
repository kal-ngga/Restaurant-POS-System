import { useState } from 'react'
import CardFood from '@/Components/Card'

export default function Catalog() {
const makananKorea = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1604908177522-402fa5c9ecdf?w=400&h=250&fit=crop",
        category: "Makanan Utama",
        badge: "New Arrival",
        title: "Kimchi Jjigae",
        price: "Rp45.000",
        unit: "/ mangkuk"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1601315379730-94f56b3d2fa5?w=400&h=250&fit=crop",
        category: "Makanan Utama",
        badge: "Best Seller",
        title: "Korean BBQ Beef",
        price: "Rp85.000",
        unit: "/ porsi"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1588167100290-8cf4e9b6c3c0?w=400&h=250&fit=crop",
        category: "Minuman",
        badge: "New Arrival",
        title: "Banana Milk",
        price: "Rp18.000",
        unit: "/ botol"
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1575932444877-5106f8a12c1c?w=400&h=250&fit=crop",
        category: "Makanan Utama",
        badge: "Best Seller",
        title: "Tteokbokki",
        price: "Rp30.000",
        unit: "/ porsi"
    },
    {
        id: 5,
        image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=250&fit=crop",
        category: "Makanan Utama",
        badge: "New Arrival",
        title: "Korean Fried Chicken",
        price: "Rp55.000",
        unit: "/ porsi"
    },
    {
        id: 6,
        image: "https://images.unsplash.com/photo-1571817017418-7f9b0f4c53d3?w=400&h=250&fit=crop",
        category: "Makanan Utama",
        badge: "Best Seller",
        title: "Bibimbap",
        price: "Rp50.000",
        unit: "/ mangkuk"
    },
    {
        id: 7,
        image: "https://images.unsplash.com/photo-1580654499174-ea47efb93f52?w=400&h=250&fit=crop",
        category: "Makanan Utama",
        badge: "New Arrival",
        title: "Jajangmyeon",
        price: "Rp40.000",
        unit: "/ mangkuk"
    },
    {
        id: 8,
        image: "https://images.unsplash.com/photo-1617189265343-6fc625dbfc68?w=400&h=250&fit=crop",
        category: "Minuman",
        badge: "Best Seller",
        title: "Korean Strawberry Milk",
        price: "Rp20.000",
        unit: "/ botol"
    }
];

    return (
        <div className="w-screen min-h-screen flex flex-col gap-8 items-center bg-amber-100 pb-24">
            {/* NAVBAR */}
            <div className="w-screen px-10 py-5 left-0 top-0 absolute bg-white border-b border-gray-100 inline-flex justify-start items-center gap-4">
                {/* <div data-property-1="favicon" data-property-2="2" className="w-10 h-10 relative overflow-hidden" /> Logo */}
                {/* Search Bar */}
                <div className="flex-1 h-16 pl-8 pr-4 py-4 bg-gray-100 rounded-3xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex justify-between items-center hover:outline-slate-500 outline-2 duration-300">
                    <div className="justify-start text-neutral-500 text-2xl font-normal font-['TT_Commons'] leading-8">Jelajahi makanan disini</div>
                    {/* Search Icon */}
                    <div className="p-3 bg-white rounded-2xl flex justify-start items-center gap-2.5">
                        <div className="w-6 h-6 relative">
                            <div className="w-5 h-5 left-[2.17px] top-[2.17px] absolute outline outline-2 outline-offset-[-1px] outline-neutral-600" />
                            <div className="w-0.5 h-0.5 left-[21.67px] top-[21.67px] absolute bg-neutral-600 outline outline-2 outline-offset-[-1px] outline-neutral-600" />
                            <div className="w-6 h-6 left-0 top-0 absolute opacity-0 bg-neutral-600" />
                        </div>
                    </div>
                </div>

                {/* Foto Profil */}
                {/* <div className="flex justify-start items-center gap-6">
                    <div className="w-6 h-6 relative overflow-hidden">
                        <div className="w-1.5 h-1.5 left-[13.50px] top-[2.50px] absolute bg-red-700 rounded-full" />
                    </div>
                    <img className="w-10 h-10 relative rounded-[336px] outline outline-[10px] outline-white" src="https://placehold.co/40x40" />
                </div> */}

                <a href="/" className="w-auto h-auto px-8 py-4 rounded-3xl text-lg font-medium bg-amber-600 text-amber-100 hover:bg-amber-700 duration-300 font-['TT_Commons']">Logout</a> {/* Logout Link */}
            </div>

            {/* Content dengan Grid Layout */}
            <div className="mt-32 w-full max-w-7xl px-8 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {makananKorea.map((item) => (
                        <CardFood 
                            key={item.id}
                            image={item.image}
                            category={item.category}
                            badge={item.badge}
                            title={item.title}
                            price={item.price}
                            unit={item.unit}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}