import { 
  Shield, 
  Globe, 
  Video, 
  Lock, 
  File, 
  Settings, 
  DollarSign 
} from "lucide-react";

export default function FeaturesSection() {
  // Key advantages of the proxy service
  const keyAdvantages = [
    {
      icon: <Globe className="text-xl" />,
      title: "Modern Website Access",
      description: "Unique technology that allows access to most modern websites and web applications."
    },
    {
      icon: <Video className="text-xl" />,
      title: "Video Website Support",
      description: "Works as a YouTube proxy and a proxy for other video websites with full streaming support."
    },
    {
      icon: <Lock className="text-xl" />,
      title: "Protected Traffic",
      description: "Your webproxy traffic is regular web traffic that is fully protected and encrypted."
    },
    {
      icon: <File className="text-xl" />,
      title: "Single Page Access",
      description: "A single web page can be opened through the proxy; there's no need to pass all your traffic."
    },
    {
      icon: <Settings className="text-xl" />,
      title: "No Configuration",
      description: "No configuration required; it acts as a proxy browser with simple operation."
    },
    {
      icon: <DollarSign className="text-xl" />,
      title: "Free Basic Version",
      description: "The basic version of the online proxy is free of charge with premium options available."
    }
  ];

  return (
    <section className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center">
        <Shield className="text-primary mr-2" />
        Cutting-edge online proxy
      </h2>
      
      <div className="mb-12">
        <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
          ProxyWave is a reliable and free web proxy service that protects your privacy.
          It supports numerous video sites, enabling anonymous surfing with full video streaming support.
          This online proxy is a good alternative to VPNs. It's free of charge, and you don't need to
          download or configure anything since it acts as a proxy browser.
        </p>
      </div>
      
      {/* Key Advantages */}
      <div className="mb-16">
        <h3 className="text-xl font-bold text-center mb-8">Key advantages of ProxyWave</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keyAdvantages.map((advantage, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
              <div className="flex items-start mb-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary mr-4">
                  {advantage.icon}
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">{advantage.title}</h4>
                  <p className="text-gray-600 text-sm">{advantage.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* How It Works */}
      <div className="mb-16">
        <h3 className="text-xl font-bold text-center mb-8">How this free proxy works</h3>
        
        <div className="bg-white p-8 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <div className="rounded-lg shadow-md w-full h-auto bg-secondary p-8">
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    {/* SVG diagram representing proxy functionality */}
                    <svg
                      className="w-full h-auto"
                      viewBox="0 0 600 300"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect x="20" y="120" width="120" height="60" rx="8" fill="#F5F5F5" stroke="#2196F3" strokeWidth="2" />
                      <text x="80" y="155" textAnchor="middle" fill="#333333" fontSize="16">Your Device</text>
                      
                      <rect x="240" y="120" width="120" height="60" rx="8" fill="#2196F3" stroke="#2196F3" strokeWidth="2" />
                      <text x="300" y="155" textAnchor="middle" fill="white" fontSize="16">ProxyWave</text>
                      
                      <rect x="460" y="120" width="120" height="60" rx="8" fill="#F5F5F5" stroke="#333333" strokeWidth="2" />
                      <text x="520" y="155" textAnchor="middle" fill="#333333" fontSize="16">Website</text>
                      
                      <path d="M140 150 L240 150" stroke="#2196F3" strokeWidth="2" markerEnd="url(#arrowhead)" />
                      <text x="190" y="140" textAnchor="middle" fill="#2196F3" fontSize="12">Encrypted</text>
                      
                      <path d="M360 150 L460 150" stroke="#2196F3" strokeWidth="2" markerEnd="url(#arrowhead)" />
                      <text x="410" y="140" textAnchor="middle" fill="#2196F3" fontSize="12">Protected</text>
                      
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#2196F3" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <p className="text-gray-600 mb-4">
                The free proxy is a kind of virtual pipeline, and your traffic flows through it to the
                destination website. That's why the destination website doesn't see your real network identity.
              </p>
              <p className="text-gray-600 mb-4">
                For better protection, all traffic to the free proxy is encrypted, ensuring that it
                remains hidden. In this way, this online proxy cares about your anonymity and privacy.
              </p>
              <p className="text-gray-600">
                Regardless of whether the destination website supports a secure connection or not, you
                can be sure that your web traffic to ProxyWave will always be protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
