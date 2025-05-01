import { useState, useEffect } from 'react';
import { 
  AlertCircle,
  X
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const privacyFacts = [
  {
    fact: "When you browse using a VPN, your ISP can see that you're using a VPN, but not what sites you're visiting."
  },
  {
    fact: "Incognito mode only prevents your browser from saving your history, but doesn't hide your activity from websites or your ISP."
  },
  {
    fact: "The average internet user is on more than 100 tracking databases."
  },
  {
    fact: "Websites can identify you based on your browser's 'fingerprint' even without cookies."
  },
  {
    fact: "Your smartphone can be tracked through Wi-Fi signals even when Wi-Fi is turned off."
  },
  {
    fact: "Email trackers can detect when, where, and how many times you open an email."
  },
  {
    fact: "Free public Wi-Fi is often monitored, and your data can be intercepted without encryption."
  },
  {
    fact: "Voice assistants like Alexa and Siri store recordings of your requests in the cloud."
  },
  {
    fact: "Social media companies can track your browsing even when you're not logged into their sites."
  },
  {
    fact: "Using a proxy server can help mask your IP address from websites you visit."
  },
  {
    fact: "Many mobile apps collect and share your location data even when you're not using them."
  },
  {
    fact: "Digital photos often contain metadata that reveals where and when they were taken."
  },
  {
    fact: "Ad blockers can reduce data usage by up to 50% while browsing."
  },
  {
    fact: "Some websites can detect if you're using ad blockers and may restrict content accordingly."
  },
  {
    fact: "Your browsing habits can be used to create a psychological profile for targeted advertising."
  }
];

export function usePrivacyFacts() {
  const [count, setCount] = useState(0);
  const [isEasterEggTriggered, setIsEasterEggTriggered] = useState(false);
  
  const incrementCount = () => {
    const newCount = count + 1;
    setCount(newCount);
    
    // Easter egg trigger: clicking the logo 5 times
    if (newCount === 5) {
      setIsEasterEggTriggered(true);
      setCount(0); // Reset for next time
    }
  };
  
  return {
    incrementCount,
    isEasterEggTriggered,
    setIsEasterEggTriggered
  };
}

export default function PrivacyFactsDialog({ 
  open, 
  onClose 
}: { 
  open: boolean; 
  onClose: () => void;
}) {
  // Type definition for our facts
  type PrivacyFact = {
    fact: string;
  };
  
  const [currentFact, setCurrentFact] = useState<PrivacyFact>(privacyFacts[0]);
  
  useEffect(() => {
    if (open) {
      // Select a random fact when dialog opens
      const randomIndex = Math.floor(Math.random() * privacyFacts.length);
      setCurrentFact(privacyFacts[randomIndex]);
    }
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-primary">
            <AlertCircle className="mr-2 h-5 w-5" />
            Privacy Fact
          </DialogTitle>
          <DialogDescription>
            Did you know?
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 border rounded-md bg-muted/50">
          <p className="text-foreground">{currentFact.fact}</p>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => {
              // Get another random fact
              let randomIndex;
              do {
                randomIndex = Math.floor(Math.random() * privacyFacts.length);
              } while (privacyFacts[randomIndex].fact === currentFact.fact && privacyFacts.length > 1);
              
              setCurrentFact(privacyFacts[randomIndex]);
            }}
          >
            Another fact
          </Button>
          <Button onClick={onClose}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}