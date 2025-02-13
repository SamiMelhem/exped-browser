import { SearchResult } from '@/lib/google-search';
import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResult[];
  onResultClick: (url: string) => void;
}

export function SearchResults({ results, onResultClick }: SearchResultsProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="max-h-[400px] overflow-y-auto scrollbar-hide px-4">
      <div className="space-y-4">
        {results.map((result, index) => (
          <Card
            key={index}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer w-full"
            onClick={() => onResultClick(result.link)}
          >
            <div className="flex gap-4 items-start">
              {result.image && (
                <img
                  src={result.image}
                  alt=""
                  className="w-16 h-16 object-cover rounded shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 w-full">
                  <h3 className="font-medium text-blue-600 hover:underline truncate flex-1">
                    {result.title}
                  </h3>
                  <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {result.snippet}
                </p>
                <p className="text-xs text-gray-400 truncate mt-1">
                  {result.link}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}