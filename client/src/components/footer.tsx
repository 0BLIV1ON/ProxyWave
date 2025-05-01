import { 
  ShieldCheck
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <ShieldCheck className="mr-2" />
              ProxyWave
            </h3>
            <p className="text-gray-400 mb-4">
              A secure web proxy service that protects your privacy while browsing the internet.
            </p>
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
