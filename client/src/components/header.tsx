import { Button } from "@/components/ui/button";
import { ShieldCheck, Menu, BarChart2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <div className="text-primary text-3xl font-bold flex items-center">
              <ShieldCheck className="mr-2" />
              ProxyWave
            </div>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/analytics">
            <Button variant="ghost" className="flex items-center">
              <BarChart2 className="mr-2 h-4 w-4" /> Analytics
            </Button>
          </Link>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col space-y-2">
              <Link href="/analytics" className="block">
                <Button variant="ghost" className="flex items-center justify-center w-full mt-2">
                  <BarChart2 className="mr-2 h-4 w-4" /> Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
