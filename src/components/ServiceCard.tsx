import Link from "next/link";
import Image from "next/image";

interface ServiceCardProps {
  title: string;
  description: string;
  price: number;
  promoPrice?: number;
  duration: string;
  href: string;
  icon?: React.ReactNode;
  image?: string;
  isRecommended?: boolean;
  badge?: string;
}

export default function ServiceCard({
  title,
  description,
  price,
  promoPrice,
  duration,
  href,
  icon,
  image,
  isRecommended = false,
  badge
}: ServiceCardProps) {
  return (
    <div className={`
      rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden relative
      ${isRecommended ? 'bg-gradient-to-br from-[#fdfbf7] via-white to-[#d4b5a0]/10 ring-4 ring-[#d4b5a0] ring-opacity-50 shadow-2xl transform scale-105' : 'bg-white'}
    `}>
      {/* Image Section */}
      {image && (
        <div className="h-48 relative overflow-hidden bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
      )}
      
      {/* Content Section */}
      <div className="p-6 relative">
        {badge && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-3 py-1 text-xs rounded-full font-semibold z-10 shadow-md whitespace-nowrap">
            {badge}
          </div>
        )}
        {/* Icon */}
        {icon && !image && (
          <div className="w-14 h-14 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center mb-4 shadow-lg">
            {icon}
          </div>
        )}
        
        {/* Title & Description */}
        <h3 className="text-xl font-serif font-semibold text-[#2c3e50] mb-2">{title}</h3>
        <p className="text-[#2c3e50]/70 text-sm mb-4 line-clamp-2">{description}</p>
        
        {/* Price & Duration */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-2xl font-bold text-[#d4b5a0]">{price}€</span>
            {promoPrice && (
              <div className="text-sm text-green-600 font-semibold">
                Tarif lancement : {promoPrice}€
              </div>
            )}
          </div>
          <span className="text-sm text-[#2c3e50]/60 bg-[#fdfbf7] px-3 py-1 rounded-full">
            {duration}
          </span>
        </div>
        
        {/* CTA Button */}
        <Link 
          href={href} 
          className="block w-full text-center bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300"
        >
          Découvrir
        </Link>
      </div>
    </div>
  );
}