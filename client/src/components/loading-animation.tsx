import { FC } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Globe, Wifi, RefreshCw } from "lucide-react";

type LoadingAnimationType = "default" | "globe" | "shield" | "connection";

interface LoadingAnimationProps {
  type?: LoadingAnimationType;
  text?: string;
  size?: "sm" | "md" | "lg";
}

const LoadingAnimation: FC<LoadingAnimationProps> = ({
  type = "default",
  text = "Loading...",
  size = "md",
}) => {
  const getSize = () => {
    switch (size) {
      case "sm": return "h-6 w-6";
      case "lg": return "h-16 w-16";
      default: return "h-10 w-10";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm": return "text-xs";
      case "lg": return "text-lg";
      default: return "text-sm";
    }
  };

  const iconSize = getSize();
  const textSize = getTextSize();

  const renderAnimation = () => {
    switch (type) {
      case "globe":
        return (
          <div className="flex flex-col items-center">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className={iconSize}
              >
                <Globe className="w-full h-full text-primary" />
              </motion.div>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
              >
                <Shield className={`w-2/3 h-2/3 text-primary opacity-60`} />
              </motion.div>
            </div>
            <p className={`mt-2 ${textSize} text-center`}>{text}</p>
          </div>
        );

      case "shield":
        return (
          <div className="flex flex-col items-center">
            <div className="relative">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: [0.8, 1.1, 0.8],
                  rotateY: [0, 180, 360],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={iconSize}
              >
                <Shield className="w-full h-full text-primary" />
              </motion.div>
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1/4 left-1/4 w-1/2 h-1/2 flex items-center justify-center"
              >
                <Lock className={`w-full h-full text-green-600`} />
              </motion.div>
            </div>
            <p className={`mt-2 ${textSize} text-center`}>{text}</p>
          </div>
        );

      case "connection":
        return (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              >
                <Wifi className={`${iconSize} text-primary`} />
              </motion.div>
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              >
                <Wifi className={`${iconSize} text-primary`} />
              </motion.div>
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              >
                <Wifi className={`${iconSize} text-primary`} />
              </motion.div>
            </div>
            <p className={`mt-2 ${textSize} text-center`}>{text}</p>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className={iconSize}
            >
              <RefreshCw className="w-full h-full text-primary" />
            </motion.div>
            <p className={`mt-2 ${textSize} text-center`}>{text}</p>
          </div>
        );
    }
  };

  return (
    <div className="flex justify-center items-center p-4">
      {renderAnimation()}
    </div>
  );
};

export default LoadingAnimation;