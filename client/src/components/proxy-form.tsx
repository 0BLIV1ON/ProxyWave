import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { urlSchema } from "@shared/schema";

export default function ProxyForm() {
  const [inputUrl, setInputUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Quick links for easy access
  const quickLinks = [
    { name: "DuckDuckGo", url: "https://duckduckgo.com" },
    { name: "Google", url: "https://www.google.com" },
    { name: "YouTube", url: "https://www.youtube.com" },
    { name: "Facebook", url: "https://www.facebook.com" },
    { name: "Wikipedia", url: "https://www.wikipedia.org" },
    { name: "Reddit", url: "https://www.reddit.com" },
    { name: "Instagram", url: "https://www.instagram.com" },
    { name: "TikTok", url: "https://www.tiktok.com" },
    { name: "Twitter", url: "https://twitter.com" },
    { name: "Twitch", url: "https://www.twitch.tv" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError("");
    
    if (!inputUrl.trim()) {
      setError("Please enter a URL or search query");
      return;
    }
    
    try {
      // Validate URL
      const { url } = urlSchema.parse({ url: inputUrl });
      
      // Show loading state
      setIsLoading(true);
      
      // Send request to backend for processing
      const response = await apiRequest("GET", `/api/proxy?url=${encodeURIComponent(inputUrl)}`, undefined);
      const data = await response.json();
      
      // Navigate to proxy page with the validated URL
      navigate(`/proxy?url=${encodeURIComponent(data.url)}`);
    } catch (error) {
      // Handle validation errors
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Invalid URL or search query");
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process URL",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuickLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    setInputUrl(url);
    // Automatically submit the form
    handleSubmit(e as unknown as React.FormEvent);
  };

  return (
    <div className="bg-white rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] p-6 mb-8">
      <form className="mb-4" onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
              placeholder="Enter URL or search query to access"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
            />
            {/* Display when error */}
            {error && (
              <div className="text-destructive text-sm text-left mt-1">
                <span className="flex items-center">
                  <i className="ri-error-warning-line mr-1"></i>
                  {error}
                </span>
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            className="px-6 py-3 flex-shrink-0 flex items-center justify-center" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loader mr-2 w-4 h-4 rounded-full border-2 border-white border-t-transparent"></span>
                <span>Loading...</span>
              </>
            ) : (
              <span>Go!</span>
            )}
          </Button>
          <Button 
            type="button" 
            className="bg-accent hover:bg-accent/90 text-white px-4 py-3 rounded-md transition flex-shrink-0 flex items-center"
          >
            <Crown className="h-4 w-4 mr-1" /> Premium
          </Button>
        </div>
      </form>
      
      {/* Quick Links */}
      <div className="text-sm text-gray-600">
        <span className="mr-2">Quick links:</span>
        {quickLinks.map((link, index) => (
          <a 
            key={index} 
            href="#" 
            className="text-primary hover:underline mr-2"
            onClick={(e) => handleQuickLinkClick(e, link.url)}
          >
            {link.name}
          </a>
        ))}
      </div>
    </div>
  );
}
