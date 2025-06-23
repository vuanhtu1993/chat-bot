import axios from 'axios';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

export class SearchService {
  private googleApiKey: string;
  private googleCx: string;
  private bingApiKey: string;

  constructor(
    googleApiKey: string,
    googleCx: string,
    bingApiKey: string
  ) {
    this.googleApiKey = googleApiKey;
    this.googleCx = googleCx;
    this.bingApiKey = bingApiKey;
  }

  async searchGoogle(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/customsearch/v1`,
        {
          params: {
            key: this.googleApiKey,
            cx: this.googleCx,
            q: query,
          },
        }
      );

      return response.data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        source: 'google',
      }));
    } catch (error) {
      console.error('Error searching Google:', error);
      throw error;
    }
  }

  async searchBing(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(
        'https://api.bing.microsoft.com/v7.0/search',
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.bingApiKey,
          },
          params: {
            q: query,
            count: 10,
          },
        }
      );

      return response.data.webPages.value.map((item: any) => ({
        title: item.name,
        link: item.url,
        snippet: item.snippet,
        source: 'bing',
      }));
    } catch (error) {
      console.error('Error searching Bing:', error);
      throw error;
    }
  }

  async searchAll(query: string): Promise<SearchResult[]> {
    try {
      const [googleResults, bingResults] = await Promise.all([
        this.searchGoogle(query),
        this.searchBing(query),
      ]);

      // Merge and deduplicate results
      const allResults = [...googleResults, ...bingResults];
      const uniqueResults = Array.from(
        new Map(allResults.map(item => [item.link, item])).values()
      );

      return uniqueResults;
    } catch (error) {
      console.error('Error searching all engines:', error);
      throw error;
    }
  }
}
