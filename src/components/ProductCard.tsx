import React from 'react';

interface ProductCardProps {
  title: string;
  price: number;
  rating: number;
  reviews: number;
  thumbnail: string;
  source: string;
  link: string;
  categorie: string;
}

export default function ProductCard({ title, price, rating, reviews, thumbnail, source, link }: ProductCardProps) {
  // Generate stars (filled/empty unicode)
  const renderStars = () => {
    const filledStars = Math.round(rating);
    const emptyStars = 5 - filledStars;
    return '★'.repeat(filledStars) + '☆'.repeat(emptyStars);
  };

  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white mb-4">
      <div className="w-32 h-32 flex-shrink-0 bg-gray-100 flex items-center justify-center p-2">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
        ) : (
          <span className="text-gray-400 text-xs">Pas d'image</span>
        )}
      </div>
      
      <div className="flex flex-col justify-between p-4 flex-grow">
        <div>
          <h3 className="font-medium text-gray-900 line-clamp-2 text-sm md:text-base" title={title}>{title}</h3>
          <div className="text-sm text-gray-500 mt-1">{source}</div>
          
          <div className="flex items-center mt-1 text-sm">
            <span className="text-yellow-500 mr-1">{renderStars()}</span>
            <span className="text-gray-500">({reviews})</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-green-600 text-lg">{price.toFixed(2)} €</span>
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center"
          >
            Voir <span className="ml-1">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
