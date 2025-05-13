import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import HomePage from "@/pages/home-page";
import ProductPage from "@/pages/product-page";
import ProductDetailsPage from "@/pages/product-details-page";
import CartPage from "@/pages/cart-page";
import AdminPage from "@/pages/admin-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CartSidebar from "@/components/cart-sidebar";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <TooltipProvider>
          <Toaster />
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <CartSidebar />
                <main className="flex-grow">
                  <Switch>
                    <Route path="/" component={HomePage} />
                    <Route path="/products" component={ProductPage} />
                    <Route path="/products/category/:slug" component={ProductPage} />
                    <Route path="/products/:slug" component={ProductDetailsPage} />
                    <ProtectedRoute path="/cart" component={CartPage} />
                    <AdminRoute path="/admin" component={AdminPage} />
                    <Route path="/auth" component={AuthPage} />
                    <Route component={NotFound} />
                  </Switch>
                </main>
                <Footer />
              </div>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
