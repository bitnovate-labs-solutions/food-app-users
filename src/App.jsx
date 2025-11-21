import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import AppRoutes from "@/routes/AppRoutes";
import { PWAPrompt } from "./components/PWAPrompt";
import { FilterProvider } from "./context/FilterContext";
import { FilterDrawerProvider } from "./context/FilterDrawerContext";
// import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 2, // Retry twice for better reliability
    },
  },
});

function App() {
  // useEffect(() => {
  //   // Register service worker
  //   if ("serviceWorker" in navigator) {
  //     // window.addEventListener("load", () => {
  //     navigator.serviceWorker
  //       .register("/firebase-messaging-sw.js", { scope: "/" })
  //       .then((registration) => {
  //         console.log("ServiceWorker registration successful", registration);
  //       })
  //       .catch((err) => {
  //         console.log("ServiceWorker registration failed: ", err);
  //       });
  //     // });
  //   }
  // }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <FilterProvider>
            <FilterDrawerProvider>
            <AppRoutes />
            </FilterDrawerProvider>
          </FilterProvider>
          <Toaster
            position="top-center"
            duration={2000}
            toastOptions={{
              style: {
                background: "white",
                border: "none",
                color: "#ff637e",
                boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.3)",
              },
              classNames: {
                description: "!text-gray-500",
                success: "!text-[#22c55e]",
                error: "!text-red-500",
              },
            }}
          />
          <PWAPrompt />
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
