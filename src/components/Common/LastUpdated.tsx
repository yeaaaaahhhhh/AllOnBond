import { Clock, RefreshCw } from 'lucide-react';

interface LastUpdatedProps {
  timestamp: Date;
  onRefresh?: () => void;
}

export default function LastUpdated({ timestamp, onRefresh }: LastUpdatedProps) {
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="h-4 w-4" />
        <span>마지막 업데이트: {formatTimestamp(timestamp)}</span>
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>새로고침</span>
        </button>
      )}
    </div>
  );
}
