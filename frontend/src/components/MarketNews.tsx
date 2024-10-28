import { Link, Divider } from "@nextui-org/react";
import { useState, useEffect } from 'react';
import { portfolioApi } from '../services/api';

interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export function MarketNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await portfolioApi.getMarketNews();
      setNews(response.data.slice(0, 3)); // Show only top 5 news items
    } catch (err) {
      console.error('Failed to load market news:', err);
      setError('Failed to load market news');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-24 bg-default-100 rounded-lg" />
    ))}
  </div>;

  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="space-y-4">
      {news.map((item, index) => (
        <div key={item.id}>
          <Link href={item.url} target="_blank" className="block hover:opacity-70">
            <div className="flex gap-4">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.headline}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="font-medium line-clamp-2">{item.headline}</h3>
                <p className="text-sm text-default-500 mt-1 line-clamp-2">
                  {item.summary}
                </p>
                <div className="flex gap-2 mt-2 text-xs text-default-400">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{new Date(item.datetime * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Link>
          {index < news.length - 1 && <Divider className="my-4" />}
        </div>
      ))}
    </div>
  );
}

