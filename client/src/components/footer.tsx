import { 
  ShieldCheck
} from "lucide-react";

export default function Footer() {
  const serviceLinks = [
    { name: "Web Proxy", href: "#" },
    { name: "Secure Browsing", href: "#" },
    { name: "Video Streaming", href: "#" },
    { name: "Anonymous Surfing", href: "#" }
  ];
  
  return (
    <footer className="bg-foreground text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <ShieldCheck className="mr-2" />
              ProxyWave
            </h3>
            <p className="text-gray-400 mb-4">
              A secure web proxy service that protects your privacy while browsing the internet.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 ProxyWave. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
