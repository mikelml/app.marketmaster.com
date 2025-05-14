import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";

export default function CartSidebar() {
  const { user } = useAuth();
  const { 
    cartItems, 
    isLoading, 
    updateCartItem, 
    removeFromCart, 
    checkout,
    subtotal,
    totalItems,
  } = useCart();
  const [isVisible, setIsVisible] = useState(true);

  const toggleCart = () => {
    setIsVisible(prev => !prev);
  };

  const handleCheckout = () => {
    checkout.mutate();
  };

  useEffect(() => {
    // setIsVisible(true);
    // const cartSidebar = document.getElementById('cart-sidebar');
    // if (!cartSidebar) return;
    const cartButton = document.getElementById('cart-button');
    const closeSidebar = document.getElementById('close-cart');
    const viewCart = document.getElementById('view-cart-sidebar');
    
    const handleCartClick = () => {
      setIsVisible(true);
    };
    
    const handleCloseClick = () => {
      setIsVisible(false);
    };
    
    cartButton?.addEventListener('click', handleCartClick);
    closeSidebar?.addEventListener('click', handleCloseClick);
    viewCart?.addEventListener('click', handleCloseClick);
    return () => {
      cartButton?.removeEventListener('click', handleCartClick);
      closeSidebar?.removeEventListener('click', handleCloseClick);
      viewCart?.removeEventListener('click', handleCloseClick);
    };
  }, []);

  return (
    <div 
      id="cart-sidebar"
      className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-lg transform ${
        !isVisible ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 z-50`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">Your Cart ({totalItems} items)</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            id="close-cart" 
            onClick={toggleCart}
          >
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
        
        {!user ? (
          <div className="flex-grow flex flex-col items-center justify-center p-4">
            <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4 text-center">
              Please sign in to view your cart
            </p>
            <Link href="/auth">
              <Button className="bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            </Link>
          </div>
        ) : isLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-4">
            <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4 text-center">
              Your cart is empty
            </p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center border-b pb-4">
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name} 
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="ml-4 flex-grow">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-500">
                        {item.quantity} x {formatCurrency(item.product.price)}
                      </span>
                      <div className="flex items-center border rounded">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateCartItem.mutate({ id: item.id, quantity: item.quantity - 1 });
                            }
                          }}
                          disabled={updateCartItem.isPending}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-2 py-1">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => {
                            updateCartItem.mutate({ id: item.id, quantity: item.quantity + 1 });
                          }}
                          disabled={updateCartItem.isPending || item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-4 text-gray-400 hover:text-red-500"
                    onClick={() => removeFromCart.mutate(item.id)}
                    disabled={removeFromCart.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between mb-6 text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <Button 
                className="w-full mb-2 bg-primary hover:bg-primary/90"
                onClick={handleCheckout}
                disabled={checkout.isPending}
              >
                {checkout.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Checkout
              </Button>
              <Link href="/cart">
                <Button
                  id="view-cart-sidebar"
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={toggleCart}
                >
                  View Cart
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
