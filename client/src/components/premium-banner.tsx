import { Star } from "lucide-react";

export default function PremiumBanner() {
  return (
    <div className="bg-gradient-to-r from-primary to-accent text-white py-2 px-4 text-center text-sm">
      <span className="mr-2">⭐</span> Configure your personal web proxy for free and share it with friends!
      <span className="mx-2">|</span>
      <span className="mr-2">⭐</span> <a href="#" className="underline hover:text-white/90 transition">Enjoy ad-free, ultra fast browsing with Premium proxy access!</a>
    </div>
  );
}
