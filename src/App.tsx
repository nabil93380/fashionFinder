import React, { useState } from 'react';
import ProductCard from './components/ProductCard';

interface Product {
  title: string;
  price: number;
  rating: number;
  reviews: number;
  thumbnail: string;
  source: string;
  link: string;
  categorie: string;
}

interface CategoryResult {
  categorie: string;
  products: Product[];
}

interface SearchResponse {
  styleResume: string;
  results: CategoryResult[];
}

export default function App() {
  const [styleInput, setStyleInput] = useState('');
  const [loadingState, setLoadingState] = useState<'idle' | 'analyzing' | 'searching'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!styleInput.trim()) return;

    setLoadingState('analyzing');
    setError(null);
    setData(null);

    try {
      // We simulate the two-step loading state by setting a timeout for the second state
      // since the backend does both sequentially in one request
      const searchTimeout = setTimeout(() => {
        setLoadingState('searching');
      }, 2000);

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ style: styleInput }),
      });

      clearTimeout(searchTimeout);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur (${response.status})`);
      }

      const resultData = await response.json();
      setData(resultData);
      setLoadingState('idle');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la recherche.');
      setLoadingState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm py-6 px-4 mb-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-indigo-900">Fashion Finder</h1>
          <p className="text-center text-gray-500 mt-2">Décrivez votre style, nous trouvons les meilleures tenues au meilleur prix.</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-12">
        <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
            Votre description de style
          </label>
          <textarea
            id="style"
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            placeholder="Ex: casual chic, couleurs neutres, minimaliste, je travaille dans une startup..."
            value={styleInput}
            onChange={(e) => setStyleInput(e.target.value)}
            disabled={loadingState !== 'idle'}
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={loadingState !== 'idle' || !styleInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loadingState !== 'idle' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {loadingState === 'analyzing' ? 'Claude analyse ton style...' : 'Recherche des produits...'}
                </>
              ) : (
                'Trouver ma tenue'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-500">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg shadow-sm">
              <h2 className="font-semibold mb-1 flex items-center">
                <span className="mr-2">✨</span> Votre profil style
              </h2>
              <p>{data.styleResume}</p>
            </div>

            <div className="space-y-10">
              {data.results.map((categoryResult, idx) => (
                <section key={idx}>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{categoryResult.categorie}</h2>
                  
                  {categoryResult.products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {categoryResult.products.map((product, pIdx) => (
                        <ProductCard key={pIdx} {...product} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Aucun produit trouvé pour cette catégorie.</p>
                  )}
                </section>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
