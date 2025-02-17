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
    <div className="max-w-3xl mx-auto space-y-4">
      {results.map((result, index) => (
        <Card
          key={index}
          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          onClick={() => onResultClick(result.link)}
        >
          <div className="flex gap-4 items-start">
            {result.image && (
              <img
                src={result.image}
                alt=""
                className="w-16 h-16 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate flex-1">
                  {result.title}
                </h3>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                {result.snippet}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                {result.link}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}