interface ArticleMetaProps {
  author?: string;
  authorTitle?: string;
  lastUpdated: string;
  readTime?: string;
}

export default function ArticleMeta({
  author = "Canadian Heat Pump Hub Team",
  authorTitle = "HVAC Research & Analysis",
  lastUpdated,
  readTime
}: ArticleMetaProps) {
  const formattedDate = new Date(lastUpdated).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8 shadow-sm">
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
            {author.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{author}</div>
            <div className="text-gray-600 text-xs">{authorTitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span>📅</span>
          <div>
            <div className="text-xs text-gray-500">Last Updated</div>
            <div className="font-medium">{formattedDate}</div>
          </div>
        </div>
        {readTime && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>⏱️</span>
            <div>
              <div className="text-xs text-gray-500">Read Time</div>
              <div className="font-medium">{readTime}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
