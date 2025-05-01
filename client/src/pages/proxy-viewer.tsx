import { useEffect, useState, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  RefreshCw, 
  Shield, 
  AlertTriangle, 
  ExternalLink, 
  Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { extractDomain, getFaviconUrl } from "@/lib/utils";

// Types for error handling
interface ProxyError {
  title: string;
  message: string;
  code?: string;
  type: 'network' | 'security' | 'blocked' | 'timeout' | 'generic';
  icon: React.ReactNode;
}

export default function ProxyViewer() {
  const [, params] = useRoute("/proxy");
  const [, navigate] = useLocation();
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ProxyError | null>(null);
  const [pageTitle, setPageTitle] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadAttempts, setLoadAttempts] = useState<number>(0);
  const { toast } = useToast();
  
  const MAX_LOAD_ATTEMPTS = 2;
  
  // List of known websites that may block proxy access
  const BLOCKING_SITES = [
    'netflix.com',
    'hulu.com',
    'amazon.com',
    'disneyplus.com',
    'facebook.com',
    'instagram.com'
  ];

  // Get the URL from the query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlParam = searchParams.get("url");
    
    if (!urlParam) {
      setError({
        title: "No URL Provided",
        message: "Please enter a URL to browse through the proxy.",
        type: 'generic',
        icon: <Info className="h-16 w-16 text-blue-500" />
      });
      setIsLoading(false);
      return;
    }
    
    setUrl(urlParam);
    
    try {
      // Check if the site might block proxy access
      const domain = extractDomain(urlParam);
      const mightBlock = BLOCKING_SITES.some(site => domain.includes(site));
      
      if (mightBlock) {
        toast({
          title: "Notice",
          description: `${domain} may block proxy access. Some features might not work correctly.`,
          duration: 5000,
        });
      }
      
      // Record website visit
      recordWebsiteVisit(urlParam);
    } catch (err) {
      console.error("Error processing URL:", err);
    }
  }, []);
  
  // Function to record website visit
  const recordWebsiteVisit = async (urlParam: string) => {
    try {
      // Extract domain for the title
      const domain = extractDomain(urlParam);
      const title = domain.replace(/^www\./, '');
      
      // Get favicon
      const favicon = getFaviconUrl(urlParam);
      
      await apiRequest("POST", "/api/websites/record", {
        title,
        url: urlParam,
        favicon
      });
    } catch (error) {
      console.error("Failed to record website visit:", error);
      // Non-critical error, don't show to user
    }
  };

  // Handle iframe loading
  useEffect(() => {
    if (!url) return;
    
    setIsLoading(true);
    setError(null);
    
    // Function to detect content type issues
    const detectContentIssues = () => {
      if (!iframeRef.current) return;
      
      try {
        // Try to access iframe content - this will throw if blocked by CORS
        const iframeDoc = iframeRef.current.contentDocument;
        const iframeWin = iframeRef.current.contentWindow;
        
        // Check if we can access the iframe document
        if (!iframeDoc || !iframeWin) {
          if (loadAttempts < MAX_LOAD_ATTEMPTS) {
            setLoadAttempts(prev => prev + 1);
            handleRefreshClick();
          } else {
            setError({
              title: "Content Blocked",
              message: "This website prevents being displayed in a frame. Try visiting directly or using another proxy.",
              type: 'security',
              icon: <AlertTriangle className="h-16 w-16 text-orange-500" />
            });
          }
          return;
        }
        
        // Update page title if available
        if (iframeDoc.title) {
          setPageTitle(iframeDoc.title);
        }
        
      } catch (e) {
        console.error("Error accessing iframe content:", e);
        
        if (loadAttempts < MAX_LOAD_ATTEMPTS) {
          setLoadAttempts(prev => prev + 1);
          handleRefreshClick();
        } else {
          setError({
            title: "Access Restricted",
            message: "This website restricts access through proxy services. It may use advanced security measures.",
            type: 'blocked',
            icon: <Shield className="h-16 w-16 text-red-500" />
          });
        }
      }
    };
    
    // Create an iframe once we have the URL
    const iframe = document.getElementById("proxy-iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.src = `/proxy?url=${encodeURIComponent(url)}`;
      
      iframe.onload = () => {
        setIsLoading(false);
        detectContentIssues();
      };
      
      iframe.onerror = (e) => {
        console.error("Iframe loading error:", e);
        setError({
          title: "Failed to Load Website",
          message: "The website could not be loaded through our proxy. It may be temporarily unavailable or blocking proxy access.",
          type: 'network',
          icon: <AlertTriangle className="h-16 w-16 text-red-500" />
        });
        setIsLoading(false);
      };
      
      // Set a timeout to handle stalled connections
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          setError({
            title: "Request Timeout",
            message: "The website is taking too long to respond. It may be temporarily unavailable or too large to proxy efficiently.",
            type: 'timeout',
            icon: <AlertTriangle className="h-16 w-16 text-yellow-500" />
          });
          setIsLoading(false);
        }
      }, 20000); // 20 second timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [url, loadAttempts]);

  // Navigation handlers
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
  
  const handleDirectVisit = () => {
    if (!url) return;
    
    // Confirm before redirecting away
    if (window.confirm("You will leave ProxyWave and visit this site directly. Continue?")) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation bar */}
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
              <span className="text-sm truncate">
                {pageTitle ? `${pageTitle} - ${extractDomain(url)}` : url}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                title="Visit directly (opens in new tab)"
                onClick={handleDirectVisit}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                title="Refresh page"
                onClick={handleRefreshClick}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content area */}
      <div className="flex-grow bg-secondary relative">
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full border-4 border-t-primary border-b-primary border-l-gray-200 border-r-gray-200 animate-spin mb-4"></div>
              <p className="text-gray-600">Loading {extractDomain(url)}...</p>
            </div>
          </div>
        )}
        
        {/* Error display */}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="max-w-md w-full mx-4">
              <CardContent className="pt-6">
                <div className="text-center">
                  {error.icon}
                  <h3 className="text-xl font-bold mb-2">{error.title}</h3>
                  <p className="text-gray-600 mb-4">{error.message}</p>
                  
                  {error.type === 'blocked' && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Content Restrictions</AlertTitle>
                      <AlertDescription>
                        Some websites actively block proxy access for security reasons. You may need to visit the site directly.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex justify-center gap-3">
                    <Button onClick={handleBackClick} variant="outline">
                      Return Home
                    </Button>
                    
                    {error.type !== 'generic' && (
                      <Button onClick={handleRefreshClick}>
                        Try Again
                      </Button>
                    )}
                    
                    {['blocked', 'security'].includes(error.type) && (
                      <Button variant="secondary" onClick={handleDirectVisit}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Directly
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <iframe 
            id="proxy-iframe"
            ref={iframeRef}
            className="w-full h-full border-none"
            title="Proxied Website"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          ></iframe>
        )}
      </div>
    </div>
  );
}
