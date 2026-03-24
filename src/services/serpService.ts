import { FashionQuery } from "./geminiService.js";

export interface Product {
  title: string;
  price: number;
  rating: number;
  reviews: number;
  thumbnail: string;
  source: string;
  link: string;
  categorie: string;
  score?: number;
}

export interface CategoryResult {
  categorie: string;
  products: Product[];
}

const MOCK_PRODUCTS: Record<string, Product[]> = {
  "Haut": [
    { title: "Chemise en popeline de coton", price: 35.99, rating: 4.5, reviews: 120, thumbnail: "https://picsum.photos/seed/chemise1/200/200", source: "Zara", link: "#", categorie: "Haut" },
    { title: "Blouse fluide blanche", price: 45.00, rating: 4.8, reviews: 340, thumbnail: "https://picsum.photos/seed/chemise2/200/200", source: "Mango", link: "#", categorie: "Haut" },
    { title: "T-shirt basique premium", price: 25.50, rating: 4.2, reviews: 85, thumbnail: "https://picsum.photos/seed/chemise3/200/200", source: "Uniqlo", link: "#", categorie: "Haut" }
  ],
  "Bas": [
    { title: "Pantalon large à pinces", price: 49.99, rating: 4.6, reviews: 210, thumbnail: "https://picsum.photos/seed/pantalon1/200/200", source: "H&M", link: "#", categorie: "Bas" },
    { title: "Jean droit taille haute", price: 59.90, rating: 4.7, reviews: 500, thumbnail: "https://picsum.photos/seed/pantalon2/200/200", source: "Levi's", link: "#", categorie: "Bas" },
    { title: "Jupe midi plissée", price: 39.99, rating: 4.3, reviews: 150, thumbnail: "https://picsum.photos/seed/pantalon3/200/200", source: "Asos", link: "#", categorie: "Bas" }
  ],
  "Chaussures": [
    { title: "Mocassins en cuir noir", price: 85.00, rating: 4.9, reviews: 890, thumbnail: "https://picsum.photos/seed/chaussure1/200/200", source: "Jonak", link: "#", categorie: "Chaussures" },
    { title: "Baskets blanches minimalistes", price: 95.00, rating: 4.8, reviews: 1200, thumbnail: "https://picsum.photos/seed/chaussure2/200/200", source: "Veja", link: "#", categorie: "Chaussures" },
    { title: "Bottines à talons carrés", price: 79.99, rating: 4.4, reviews: 320, thumbnail: "https://picsum.photos/seed/chaussure3/200/200", source: "Minelli", link: "#", categorie: "Chaussures" }
  ]
};

function calculateScore(product: any): number {
  const rating = product.rating || 0;
  const reviews = product.reviews || 0;
  
  // Extract price from string like "€45.00" or "45,00 €"
  let price = 0;
  if (typeof product.price === 'number') {
    price = product.price;
  } else if (typeof product.price === 'string') {
    const match = product.price.match(/[\d,.]+/);
    if (match) {
      price = parseFloat(match[0].replace(',', '.'));
    }
  } else if (product.extracted_price) {
    price = product.extracted_price;
  }

  // score = (rating * 20) + (min(reviews, 1000) * 0.05) - (price * 0.3)
  const score = (rating * 20) + (Math.min(reviews, 1000) * 0.05) - (price * 0.3);
  return score;
}

async function fetchCategoryProducts(queryObj: FashionQuery): Promise<CategoryResult> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    throw new Error("SERPAPI_KEY is not set");
  }

  const url = new URL("https://serpapi.com/search");
  url.searchParams.append("engine", "google_shopping");
  url.searchParams.append("q", queryObj.query);
  url.searchParams.append("hl", "fr");
  url.searchParams.append("gl", "fr");
  url.searchParams.append("num", "8");
  if (queryObj.budget_max) {
    url.searchParams.append("price_max", queryObj.budget_max.toString());
  }
  url.searchParams.append("api_key", apiKey);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`SerpApi error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const shoppingResults = data.shopping_results || [];

    const scoredProducts: Product[] = shoppingResults.map((item: any) => {
      let price = 0;
      if (item.extracted_price) {
        price = item.extracted_price;
      } else if (item.price) {
        const match = item.price.match(/[\d,.]+/);
        if (match) price = parseFloat(match[0].replace(',', '.'));
      }

      return {
        title: item.title,
        price: price,
        rating: item.rating || 0,
        reviews: item.reviews || 0,
        thumbnail: item.thumbnail,
        source: item.source,
        link: item.link,
        categorie: queryObj.categorie,
        score: calculateScore(item)
      };
    });

    // Sort by score descending and take top 3
    scoredProducts.sort((a, b) => (b.score || 0) - (a.score || 0));
    const topProducts = scoredProducts.slice(0, 3);

    return {
      categorie: queryObj.categorie,
      products: topProducts
    };
  } catch (error) {
    console.error(`Error fetching products for ${queryObj.categorie}:`, error);
    return {
      categorie: queryObj.categorie,
      products: [] // Return empty array on failure for this category
    };
  }
}

export async function searchProducts(queries: FashionQuery[]): Promise<CategoryResult[]> {
  const isDemoMode = process.env.DEMO_MODE && process.env.DEMO_MODE !== "false" && process.env.DEMO_MODE !== "0";
  if (isDemoMode) {
    console.log("DEMO MODE: Returning mock SerpApi response");
    return new Promise(resolve => {
      setTimeout(() => {
        const results = queries.map(q => ({
          categorie: q.categorie,
          products: MOCK_PRODUCTS[q.categorie] || MOCK_PRODUCTS["Haut"]
        }));
        resolve(results);
      }, 2000);
    });
  }

  // Execute all SerpApi calls in parallel
  const categoryPromises = queries.map(query => fetchCategoryProducts(query));
  const results = await Promise.all(categoryPromises);
  
  return results;
}
