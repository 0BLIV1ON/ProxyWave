import { Button } from "@/components/ui/button";
import { Crown, Zap, ShieldOff, Shield } from "lucide-react";

export default function PremiumFeatures() {
  const premiumFeatures = [
    {
      icon: <Zap className="mr-2" />,
      title: "Faster Speeds",
      description: "Experience up to 5x faster browsing with dedicated proxy servers."
    },
    {
      icon: <ShieldOff className="mr-2" />,
      title: "Ad-Free Experience",
      description: "Browse without any advertisements or distractions."
    },
    {
      icon: <Shield className="mr-2" />,
      title: "Enhanced Security",
      description: "Additional encryption layers and privacy protections."
    }
  ];
  
  return (
    <section className="max-w-4xl mx-auto mb-16">
      <div className="premium-gradient text-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="text-4xl mr-2" />
            <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
          </div>
          
          <p className="text-center mb-6 max-w-xl mx-auto">
            Get ad-free browsing, faster speeds, and enhanced privacy features with our Premium plan.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="flex items-center text-xl font-medium mb-2">
                  {feature.icon}
                  {feature.title}
                </div>
                <p className="text-sm text-white/90">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              className="bg-white text-primary hover:bg-white/90 px-8 py-3 rounded-md font-medium transition"
            >
              Get Premium Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
