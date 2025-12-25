export default function CardFood({ 
    image = "https://placehold.co/400x250",
    category = "Kategori",
    badge = "New Arrival",
    title = "Nama Produk",
    price = "Rp0",
    unit = "/ unit",
    onAddClick = null
  }) {
    return (
      <div className="w-full max-w-sm bg-white rounded-3xl outline outline-1 outline-slate-200 flex flex-col overflow-hidden shadow-sm hover:outline-amber-600 outline-2 duration-300">

        {/* Image */}
        <div className="w-full h-40 bg-amber-600/25 outline outline-1 outline-slate-200/25">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="py-4 px-5 flex flex-col gap-2">
          
          {/* badges */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-amber-600/10 rounded-full text-amber-600 text-xs font-medium font-['TT_Commons']">
              {badge}
            </span>
            <span className="px-3 py-1 bg-amber-100 rounded-full text-amber-600 text-xs font-medium font-['TT_Commons']">
              {category}
            </span>
          </div>

          {/* title */}
          <h2 className="text-xl font-demibold text-neutral-800 line-clamp-1 font-['TT_Commons']">
            {title}
          </h2>

          {/* Price + action */}
          <div className="flex items-center justify-between">
            <div className="flex flex-row gap-2 items-center">
              <span className="text-[20px] font-demibold text-neutral-800 font-['TT_Commons']">{price}</span>
              <span className="text-[20px]font-demibold text-neutral-400 font-['TT_Commons']">{unit}</span>
            </div>

            {/* Add button */}
            <button 
              onClick={onAddClick}
              className="p-2 bg-amber-600/10 rounded-full hover:bg-amber-600/20 duration-200 flex transition-all"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="oklch(41.4% 0.112 45.904)" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }