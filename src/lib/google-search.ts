import { toast } from 'sonner';

const GOOGLE_API_KEY = 'AIzaSyCnmJoHC2PrmlX0r5co0vnvNOQC-T1MQe4';
const SEARCH_ENGINE_ID = 'f0fd86b1a17b74ac2';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  image?: string;
}

export async function searchGoogle(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error('Search request failed');
    }

    const data = await response.json();
    
    return data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      image: item.pagemap?.cse_image?.[0]?.src
    }));
  } catch (error) {
    console.error('Search error:', error);
    toast.error('Search failed. Please try again.');
    return [];
  }
}