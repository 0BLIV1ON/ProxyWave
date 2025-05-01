import { 
  Facebook, 
  Twitter, 
  LinkedinIcon, 
  Send, 
  MessageCircle, 
  Copy 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SocialShare() {
  const { toast } = useToast();
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Link has been copied to clipboard"
    });
  };
  
  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mb-8">
      <Button size="icon" className="bg-[#3b5998] text-white p-2 rounded-md hover:bg-[#3b5998]/90">
        <Facebook className="h-4 w-4" />
      </Button>
      <Button size="icon" className="bg-[#1da1f2] text-white p-2 rounded-md hover:bg-[#1da1f2]/90">
        <Twitter className="h-4 w-4" />
      </Button>
      <Button size="icon" className="bg-[#25D366] text-white p-2 rounded-md hover:bg-[#25D366]/90">
        <MessageCircle className="h-4 w-4" />
      </Button>
      <Button size="icon" className="bg-[#0088cc] text-white p-2 rounded-md hover:bg-[#0088cc]/90">
        <Send className="h-4 w-4" />
      </Button>
      <Button size="icon" className="bg-[#0a66c2] text-white p-2 rounded-md hover:bg-[#0a66c2]/90">
        <LinkedinIcon className="h-4 w-4" />
      </Button>
      <Button size="icon" className="bg-gray-500 text-white p-2 rounded-md hover:bg-gray-500/90" onClick={handleCopyLink}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}
