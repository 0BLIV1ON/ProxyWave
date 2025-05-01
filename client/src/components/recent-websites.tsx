import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { History } from "lucide-react";
import { type Website } from "@shared/schema";
import { useLocation } from "wouter";

export default function RecentWebsites() {
  const [, navigate] = useLocation();
  
  const { data: recentWebsites, isLoading, error } = useQuery<Website[]>({
    queryKey: ['/api/websites/recent']
  });
  
  const handleWebsiteClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    navigate(`/proxy?url=${encodeURIComponent(url)}`);
  };

  return (
    <section className="max-w-4xl mx-auto mb-16">
      <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center">
        <History className="text-primary mr-2" />
        Recently Accessed Websites
      </h2>
      
      <Card className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="loader h-8 w-8 rounded-full border-4 border-gray-200"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Failed to load recent websites.</p>
          </div>
        ) : recentWebsites && recentWebsites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentWebsites.map((website) => (
              <a 
                key={website.id} 
                href="#" 
                className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition"
                onClick={(e) => handleWebsiteClick(e, website.url)}
              >
                <img 
                  src={website.favicon || `https://www.google.com/s2/favicons?domain=${website.url}`} 
                  alt={`${website.title} icon`} 
                  className="w-6 h-6 mr-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://www.google.com/s2/favicons?domain=example.com';
                  }}
                />
                <div className="overflow-hidden">
                  <div className="text-foreground font-medium truncate">{website.title}</div>
                  <div className="text-xs text-gray-500 truncate">{website.url}</div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <History className="text-4xl mx-auto" />
            </div>
            <p className="text-gray-600">You haven't accessed any websites yet.</p>
            <p className="text-sm text-gray-500">Your recently accessed websites will appear here.</p>
          </div>
        )}
      </Card>
    </section>
  );
}
