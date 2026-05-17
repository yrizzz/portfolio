import { ExternalLink } from 'lucide-react';

interface PrettyPrintProps {
  data: any;
  depth?: number;
}

export function PrettyPrint({ data, depth = 0 }: PrettyPrintProps) {
  const renderValue = (value: any, currentDepth: number = 0): JSX.Element => {
    if (value === null) {
      return <span className="text-gray-500">null</span>;
    }
    
    if (value === undefined) {
      return <span className="text-gray-500">undefined</span>;
    }
    
    if (typeof value === 'boolean') {
      return (
        <span className={value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
          {String(value)}
        </span>
      );
    }
    
    if (typeof value === 'number') {
      return <span className="text-blue-600 dark:text-blue-400">{value}</span>;
    }
    
    if (typeof value === 'string') {
      // Check if it's a URL
      if (value.match(/^https?:\/\//)) {
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 break-all"
          >
            {value}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        );
      }
      
      // Check if it's an email
      if (value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return (
          <a 
            href={`mailto:${value}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {value}
          </a>
        );
      }
      
      // Long strings - truncate with expand
      if (value.length > 150 && currentDepth > 0) {
        return (
          <details className="inline">
            <summary className="cursor-pointer text-orange-600 dark:text-orange-400 hover:underline">
              "{value.substring(0, 80)}..." (click to expand)
            </summary>
            <div className="mt-1 ml-4 text-orange-600 dark:text-orange-400 break-all whitespace-pre-wrap">
              "{value}"
            </div>
          </details>
        );
      }
      
      return <span className="text-orange-600 dark:text-orange-400 break-all">"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-500">[]</span>;
      }
      
      return (
        <div className="ml-4">
          <span className="text-gray-500">[</span>
          {value.map((item, index) => (
            <div key={index} className="ml-4">
              {renderValue(item, currentDepth + 1)}
              {index < value.length - 1 && <span className="text-gray-500">,</span>}
            </div>
          ))}
          <span className="text-gray-500">]</span>
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return <span className="text-gray-500">{'{}'}</span>;
      }
      
      return (
        <div className="ml-4">
          <span className="text-gray-500">{'{'}</span>
          {entries.map(([key, val], index) => (
            <div key={key} className="ml-4">
              <span className="text-purple-600 dark:text-purple-400">"{key}"</span>
              <span className="text-gray-500">: </span>
              {renderValue(val, currentDepth + 1)}
              {index < entries.length - 1 && <span className="text-gray-500">,</span>}
            </div>
          ))}
          <span className="text-gray-500">{'}'}</span>
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };

  return (
    <div className="font-mono text-xs">
      {renderValue(data, depth)}
    </div>
  );
}
