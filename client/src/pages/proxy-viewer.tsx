import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ProxyViewer() {
  const [, params] = useRoute("/proxy");
  const [, navigate] = useLocation();
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get the URL from the query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlParam = searchParams.get("url");
    
    if (!urlParam) {
      setError("No URL provided");
      setIsLoading(false);
      return;
    }
    
    setUrl(urlParam);
    
    // Record website visit
    const recordVisit = async () => {
      try {
        // Extract domain for the title
        const domain = new URL(urlParam).hostname;
        const title = domain.replace(/^www\./, '');
        
        // Get favicon
        const favicon = `${new URL(urlParam).origin}/favicon.ico`;
        
        await apiRequest("POST", "/api/websites/record", {
          title,
          url: urlParam,
          favicon
        });
      } catch (error) {
        console.error("Failed to record website visit:", error);
      }
    };
    
    recordVisit();
  }, []);

  useEffect(() => {
    if (!url) return;
    
    setIsLoading(true);
    setError(null);
    
    // Create an iframe once we have the URL
    const iframe = document.getElementById("proxy-iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.src = `/proxy?url=${encodeURIComponent(url)}`;
      
      iframe.onload = () => {
        setIsLoading(false);
      };
      
      iframe.onerror = () => {
        setError("Failed to load the website");
        setIsLoading(false);
      };
    }
  }, [url]);

  const handleBackClick = () => {
    navigate("/");
  };
  
  const handleRefreshClick = () => {
    if (!url) return;
    
    setIsLoading(true);
    setError(null);
    
    const iframe = document.getElementById("proxy-iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.src = `/proxy?url=${encodeURIComponent(url)}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={handleBackClick}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to ProxyWave
              </Button>
            </div>
            
            <div className="flex items-center bg-secondary rounded-md px-3 py-1 flex-grow mx-4 max-w-3xl">
              <Shield className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm truncate">{url}</span>
            </div>
            
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={handleRefreshClick}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-grow bg-secondary relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="loader h-12 w-12 rounded-full border-4 border-gray-200"></div>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="max-w-md w-full mx-4">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Proxy Error</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={handleBackClick}>Return to Homepage</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <iframe 
            id="proxy-iframe"
            className="w-full h-full border-none"
            title="Proxied Website"
            sandbox="allow-scripts allow-same-origin allow-forms"
          ></iframe>
        )}
      </div>
    </div>
  );
}
