// export default function CategoryCard({ 
//     icon = "🍽️",
//     title = "Kategori",
//     count = 0,
//     active = false
// }) {
//     return (
//         <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 
//             ${active ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-neutral-700 hover:bg-amber-50'}`}>

//             {/* Icon */}
//             <span className="text-2xl">{icon}</span>

//             {/* Content */}
//             <div className="flex flex-col">
//                 {/* Title */}
//                 <span className={`font-semibold text-lg font-['TT_Commons'] ${active ? 'text-white' : 'text-neutral-800'}`}>
//                     {title}
//                 </span>
                
//                 {/* Count */}
//                 <span className={`text-sm font-['TT_Commons'] ${active ? 'text-amber-100' : 'text-neutral-500'}`}>
//                     {count} item
//                 </span>
//             </div>
//         </div>
//     );
// }

export default function CategoryCard({
    icon = "🍽️",
    title = "Kategori",
    count = 0,
    active = false,
    onClick = () => {}
  }) {
    return (
      <div 
        onClick={onClick} 
        className={`flex items-center gap-3 px-6 py-2 rounded-2xl cursor-pointer transition-all duration-300 outline-1 outline-slate-200
            ${active 
            ? 'bg-amber-600 text-white outline-slate-100' 
            : 'bg-white text-neutral-700 hover:bg-amber-50'
            } active:scale-95`}
        >

        {/* Icon */}
        <span className="text-2xl">{icon}</span>
  
        {/* Content */}
        <div className="flex flex-col">
          <span className={`text-lg font-semibold font-['TT_Commons'] ${active ? 'text-white' : 'text-neutral-800'}`}>
            {title}
          </span>
          <span className={`text-sm font-['TT_Commons'] ${active ? 'text-amber-100' : 'text-neutral-500'}`}>
            {count} item
          </span>
        </div>
    </div>
    );
  }
