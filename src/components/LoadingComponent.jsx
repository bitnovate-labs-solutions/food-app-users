import { motion } from "framer-motion";
import Logo from "@/assets/logos/logo1.png";

const LoadingComponent = ({
  type = "inline",
  isLoading = true,
  className = "",
  text = "",
}) => {
  if (!isLoading) return null;

  switch (type) {
    // INITAL PAGE LOADER
    case "screen":
      return (
        <div
          className={`fixed inset-0 flex flex-col items-center justify-center bg-white z-50 ${className}`}
        >
          {/* BRAND LOGO */}
          <img
            src={Logo}
            alt="TreatYourDate Logo"
            className="w-34 h-auto mb-10 animate-pulse"
          />
          {/* <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-primary rounded-full"></div> */}

          {/* ANIMATED LOADING DOTS */}
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-primary rounded-full"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2, // Staggered animation
                }}
              />
            ))}
          </div>

          {/* LOADING TEXT */}
          <p className="text-lightgray mt-10 text-sm">{text}</p>
        </div>
      );

    // INLINE LOADER
    case "inline":
      return (
        <div className={`flex justify-center items-center gap-2 ${className}`}>
          <div className="animate-spin h-5 w-5 border-3 border-gray-300 border-t-primary rounded-full"></div>
          <span>Loading...</span>
        </div>
      );

    // SKELETON LOADER
    case "skeleton":
      return (
        <div className={`animate-pulse space-y-2 ${className}`}>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      );

    // BUTTON LOADER
    case "button":
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
        </div>
      );

    default:
      return null;
  }
};

export default LoadingComponent;
