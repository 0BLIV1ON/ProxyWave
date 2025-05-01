import ProxyForm from "./proxy-form";
import BrowserExtension from "./browser-extension";
import { AlertCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="text-center max-w-4xl mx-auto py-8">
      <div className="mb-2">
        <div className="inline-block text-primary">
          <AlertCircle className="w-16 h-16" />
        </div>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Secure Web Proxy Service</h1>
      <p className="text-gray-600 text-lg mb-8 max-w-3xl mx-auto">
        ProxyWave is a secure web proxy service that allows you to browse various websites with enhanced privacy. 
        Access popular resources while protecting your identity using our secure connection.
      </p>
      
      <ProxyForm />
      <BrowserExtension />
    </section>
  );
}
