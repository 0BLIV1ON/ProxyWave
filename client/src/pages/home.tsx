import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import RecentWebsites from "@/components/recent-websites";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <HeroSection />
        <FeaturesSection />
        <RecentWebsites />
      </main>
      <Footer />
    </div>
  );
}
