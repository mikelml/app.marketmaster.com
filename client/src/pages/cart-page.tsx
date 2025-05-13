import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import {
  ChevronRight,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  CreditCard,
  Truck,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export default function CartPage() {
  const [, navigate] = useLocation();
  const { 
    cartItems, 
    isLoading, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    checkout,
    subtotal
  } = useCart();
  
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [discount, setDiscount] = useState(0);

  const shipping = 0; // Free shipping
  const total = subtotal - discount + shipping;

  const handleQuantityChange = (id: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1) {
      updateCartItem.mutate({ id, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (id: number) => {
    removeFromCart.mutate(id);
  };

  const handleClearCart = () => {
    clearCart.mutate();
  };

  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      setPromoSuccess("");
      return;
    }

    // Simulate promo code validation
    if (promoCode.toUpperCase() === "DISCOUNT20") {
      const discountAmount = subtotal * 0.2; // 20% discount
      setDiscount(discountAmount);
      setPromoSuccess("Promo code applied successfully!");
      setPromoError("");
    } else {
      setPromoError("Invalid promo code");
      setPromoSuccess("");
    }
  };

  const handleCheckout = () => {
    checkout.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-6" />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary/90">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Cart</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Cart Items ({cartItems.length})</CardTitle>
              <CardDescription>Review and modify your items</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[400px]">Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-16 h-16 rounded-md overflow-hidden mr-4 bg-gray-50">
                              <img 
                                src={item.product.imageUrl} 
                                alt={item.product.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium">{item.product.name}</h3>
                              <p className="text-sm text-gray-500">{item.product.description?.substring(0, 60)}...</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="mt-1 h-8 p-0 text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>{formatCurrency(item.product.price)}</TableCell>
                        
                        <TableCell>
                          <div className="flex items-center border rounded max-w-[120px]">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                              disabled={item.quantity <= 1 || updateCartItem.isPending}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                              disabled={item.quantity >= item.product.stock || updateCartItem.isPending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          {formatCurrency(item.product.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleClearCart}
                disabled={clearCart.isPending}
              >
                {clearCart.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Clear Cart
              </Button>
              
              <Link href="/products">
                <Button variant="outline">
                  Continue Shopping
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* Shipping & Delivery */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Shipping & Delivery
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 text-green-800 p-3 rounded-md flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-2 mt-0.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm">Free shipping on all orders!</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Estimated Delivery</h3>
                  <p className="text-sm text-gray-600">
                    Standard Shipping (3-5 business days)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Promo Code */}
                <div className="space-y-2">
                  <div className="flex">
                    <Input 
                      placeholder="Enter promo code" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="rounded-r-none"
                    />
                    <Button 
                      onClick={handleApplyPromoCode} 
                      className="rounded-l-none bg-primary hover:bg-primary/90"
                    >
                      Apply
                    </Button>
                  </div>
                  
                  {promoError && (
                    <p className="text-sm text-red-500">{promoError}</p>
                  )}
                  
                  {promoSuccess && (
                    <p className="text-sm text-green-600">{promoSuccess}</p>
                  )}
                </div>
                
                <Separator />
                
                {/* Summary Details */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
                
                {/* Payment Methods */}
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <CreditCard className="h-4 w-4 mr-1" /> Payment Methods
                  </h3>
                  <div className="flex space-x-2">
                    <svg className="h-6" viewBox="0 0 48 32" fill="none">
                      <rect width="48" height="32" rx="4" fill="#016FD0" />
                      <path d="M23 21H25V11H23V21Z" fill="white" />
                      <path d="M32.9 11.5C32.1 11.2 30.9 11 29.5 11C26.2 11 23.9 12.6 23.9 14.9C23.9 16.6 25.5 17.5 26.7 18.1C27.9 18.7 28.3 19.1 28.3 19.6C28.3 20.4 27.3 20.7 26.4 20.7C25.1 20.7 24.3 20.5 23.2 20.1L22.8 19.9L22.4 22.2C23.4 22.6 25 22.9 26.6 22.9C30.1 22.9 32.3 21.3 32.3 18.8C32.3 17.4 31.3 16.3 29.5 15.5C28.4 14.9 27.7 14.6 27.7 14C27.7 13.5 28.3 13 29.4 13C30.3 13 31 13.1 31.6 13.4L31.9 13.5L32.3 11.5H32.9Z" fill="white" />
                      <path d="M38.1 11H36.2C35.5 11 35 11.2 34.7 11.9L30.6 21H34.1L34.7 19.3H38.6L38.9 21H42V11H38.1ZM35.5 17.2C35.5 17.2 36.7 14.1 36.8 13.8C36.8 13.8 37 13.3 37.1 13.1L37.2 13.7C37.2 13.7 37.9 16.8 38 17.2H35.5Z" fill="white" />
                      <path d="M19.7 11L16.5 18L16.2 16.7C15.6 15 14 13.1 12.2 12.1L15.1 21H18.6L23.6 11H19.7Z" fill="white" />
                      <path d="M12.8 11H7.49999L7.39999 11.2C11.4 12.2 14 14.2 15 16.7L13.9 12C13.7 11.3 13.3 11.1 12.8 11Z" fill="white" />
                    </svg>
                    <svg className="h-6" viewBox="0 0 48 32" fill="none">
                      <rect width="48" height="32" rx="4" fill="#FF5F00" />
                      <circle cx="17" cy="16" r="10" fill="#EB001B" />
                      <circle cx="31" cy="16" r="10" fill="#F79E1B" />
                      <path d="M24 22.9C27.3 20.5 27.3 11.5 24 9.1C20.7 11.5 20.7 20.5 24 22.9Z" fill="#FF5F00" />
                    </svg>
                    <svg className="h-6" viewBox="0 0 48 32" fill="none">
                      <rect width="48" height="32" rx="4" fill="#1434CB" />
                      <path d="M18 21.5H14.5V10.5H18V21.5Z" fill="white" />
                      <path d="M16.2 9C14.9 9 14 9.9 14 11C14 12.1 14.9 13 16.2 13C17.5 13 18.4 12.1 18.4 11C18.3 9.9 17.5 9 16.2 9Z" fill="white" />
                      <path d="M34 21.5H30.7V20.5C30 21.2 29 21.7 27.8 21.7C25.4 21.7 23.5 19.8 23.5 17.4C23.5 15 25.4 13.1 27.8 13.1C29 13.1 30 13.6 30.7 14.3V13.3H34V21.5ZM28.7 17.4C29.7 17.4 30.5 16.6 30.5 15.6C30.5 14.6 29.7 13.8 28.7 13.8C27.7 13.8 26.9 14.6 26.9 15.6C26.9 16.6 27.7 17.4 28.7 17.4Z" fill="white" />
                      <path d="M20.3 16.3C20.3 14.3 21.4 13.3 23.4 13.3H24.8V16.5C24.8 17.5 24 18.3 23 18.3C21.5 18.3 20.3 17.6 20.3 16.3ZM24.8 10.5H28.1V21.5H24.8V20.4C24.1 21.2 23 21.7 21.8 21.7C19.3 21.7 17 20 17 16.3C17 12.9 19.1 10.9 23.4 10.9H24.8V10.5Z" fill="white" />
                    </svg>
                    <svg className="h-6" viewBox="0 0 48 32" fill="none">
                      <rect width="48" height="32" rx="4" fill="#003087" />
                      <path d="M33.1 14.1H30.5C30.3 14.1 30.1 14.2 30.1 14.4L28.9 20.2C28.9 20.3 28.9 20.4 29 20.4C29.1 20.4 29.2 20.5 29.2 20.5H30.7C30.9 20.5 31.1 20.3 31.2 20.1L31.5 18.3C31.5 18.1 31.7 18 31.9 18H32.7C34.6 18 35.8 17 36.1 15.2C36.2 14.5 36.1 13.9 35.7 13.5C35.2 13.1 34.3 14.1 33.1 14.1ZM33.3 15.3C33.3 15.3 33.5 16.5 32.2 16.5H31.6L32 14.7C32 14.6 32.1 14.6 32.2 14.6H32.5C33.2 14.6 33.4 14.6 33.3 15.3Z" fill="white" />
                      <path d="M16.9 14.1H14.3C14.1 14.1 13.9 14.2 13.9 14.4L12.7 20.2C12.7 20.3 12.7 20.4 12.8 20.4C12.9 20.4 13 20.5 13 20.5H14.6C14.7 20.5 14.9 20.4 14.9 20.3L15.2 18.3C15.2 18.1 15.4 18 15.6 18H16.4C18.3 18 19.5 17 19.8 15.2C19.9 14.5 19.8 13.9 19.4 13.5C19 13.1 18.1 14.1 16.9 14.1ZM17.1 15.3C17.1 15.3 17.3 16.5 16 16.5H15.4L15.8 14.7C15.8 14.6 15.9 14.6 16 14.6H16.3C17 14.6 17.2 14.6 17.1 15.3Z" fill="white" />
                      <path d="M24.1 17.4H22.9C22.8 17.4 22.8 17.4 22.7 17.4C22.7 17.4 22.6 17.5 22.6 17.5L22.5 17.7L22.4 17.5C22.2 17.3 22 17.3 21.6 17.3C20.3 17.3 19.3 18.4 19.1 19.7C19 20.3 19.1 20.9 19.5 21.3C19.8 21.7 20.3 21.8 20.9 21.8C21.9 21.8 22.4 21.2 22.4 21.2L22.3 21.4C22.3 21.5 22.3 21.6 22.4 21.6C22.5 21.6 22.6 21.7 22.6 21.7H23.7C23.9 21.7 24.1 21.6 24.1 21.4L24.8 17.6C24.8 17.5 24.8 17.4 24.7 17.4C24.5 17.4 24.3 17.4 24.1 17.4ZM22.9 19.7C22.8 20.4 22.2 20.9 21.5 20.9C21.2 20.9 20.9 20.8 20.7 20.6C20.5 20.4 20.5 20.1 20.5 19.8C20.6 19.1 21.2 18.6 21.9 18.6C22.2 18.6 22.5 18.7 22.7 18.9C22.9 19.1 23 19.4 22.9 19.7Z" fill="white" />
                      <path d="M29.3 17.4H28.1C28 17.4 28 17.4 27.9 17.4C27.9 17.4 27.8 17.5 27.8 17.5L27.7 17.7L27.6 17.5C27.4 17.3 27.2 17.3 26.8 17.3C25.5 17.3 24.5 18.4 24.3 19.7C24.2 20.3 24.3 20.9 24.7 21.3C25 21.7 25.5 21.8 26.1 21.8C27.1 21.8 27.6 21.2 27.6 21.2L27.5 21.4C27.5 21.5 27.5 21.6 27.6 21.6C27.7 21.6 27.8 21.7 27.8 21.7H28.9C29.1 21.7 29.3 21.6 29.3 21.4L30 17.6C30 17.5 30 17.4 29.9 17.4C29.7 17.4 29.5 17.4 29.3 17.4ZM28 19.7C27.9 20.4 27.3 20.9 26.6 20.9C26.3 20.9 26 20.8 25.8 20.6C25.6 20.4 25.6 20.1 25.6 19.8C25.7 19.1 26.3 18.6 27 18.6C27.3 18.6 27.6 18.7 27.8 18.9C28.1 19.1 28.1 19.4 28 19.7Z" fill="white" />
                    </svg>
                  </div>
                </div>
                
                {/* Action Button */}
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleCheckout}
                  disabled={checkout.isPending}
                >
                  {checkout.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Proceed to Checkout
                </Button>
                
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Secure Checkout</AlertTitle>
                  <AlertDescription className="text-yellow-700 text-xs">
                    All transactions are secure and encrypted. Your personal data is protected.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
