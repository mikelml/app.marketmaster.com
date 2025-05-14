import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Star, StarHalf } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  
  const discountPercentage = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) 
    : 0;
    
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate("/auth")
      // window.location.href = "/auth";
      return;
    }
    
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };
  
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-amber-400 text-amber-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-amber-400 text-amber-400" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-amber-400" />);
    }
    
    return stars;
  };
  
  return (
    <Link href={`/products/${product.slug}`}>
      <Card 
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-56 overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {(product.isNew || product.isBestSeller) && (
            <div className="absolute top-3 left-3">
              {product.isNew && (
                <span className="bg-primary text-white text-xs px-2 py-1 rounded">New</span>
              )}
              {product.isBestSeller && (
                <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded ml-1">Best Seller</span>
              )}
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-3 top-3 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className="h-5 w-5 text-gray-400 hover:text-red-500 hover:fill-red-500" />
          </Button>
          
          <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              className="w-full rounded-none bg-primary hover:bg-primary/90"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock > 0 ? (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </>
              ) : (
                "Out of Stock"
              )}
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-center mb-1">
            <div className="flex text-amber-400">
              {renderStars(product.rating || 0)}
            </div>
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
          </div>
          
          <h3 className="font-medium text-dark">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-dark">{formatCurrency(product.price)}</span>
              {product.comparePrice && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  {formatCurrency(product.comparePrice)}
                </span>
              )}
            </div>
            {discountPercentage > 0 && (
              <span className="text-xs text-green-600 font-medium">-{discountPercentage}%</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
