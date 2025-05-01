import { useEffect } from 'react';
import { useLocation } from 'wouter';
import AnalyticsDashboard from '@/components/analytics-dashboard';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { apiRequest } from '@/lib/queryClient';

export default function AnalyticsPage() {
  const [location] = useLocation();
  
  // Record page view for analytics
  useEffect(() => {
    const recordPageView = async () => {
      try {
        await fetch('/api/analytics/pageview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: location,
            referrer: document.referrer,
            userAgent: navigator.userAgent
          }),
        });
      } catch (error) {
        console.error("Failed to record page view:", error);
      }
    };
    
    recordPageView();
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <AnalyticsDashboard />
      </main>
      <Footer />
    </div>
  );
}