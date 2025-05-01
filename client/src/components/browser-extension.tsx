import { Download } from "lucide-react";

export default function BrowserExtension() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-2 mb-8 text-sm">
      <div className="flex items-center">
        <Download className="text-primary mr-2 h-4 w-4" />
        <span>Install ProxyWave browser extension for Chrome</span>
      </div>
      <div className="flex items-center gap-2">
        <a href="#" className="text-primary hover:underline">from Chrome web store</a>
        <span>or</span>
        <a href="#" className="text-primary hover:underline">manually</a>
      </div>
      <div className="flex items-center">
        <span className="text-green-600 font-medium ml-2">Access websites with just one click!</span>
      </div>
    </div>
  );
}
