import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ProductCard from "@/components/product-card";
import { formatCurrency } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MinusCircle,
  PlusCircle,
  ShoppingCart,
  Star,
  StarHalf,
  Truck,
  ShieldCheck,
  RotateCcw,
  Heart,
} from "lucide-react";

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch product details
  const {
    data: product,
    isLoading: isProductLoading,
    error: productError,
  } = useQuery<Product>({
    queryKey: [`/api/products/${slug}`],
  });

  // Fetch related products (from same category)
  const {
    data: relatedProducts = [],
    isLoading: isRelatedLoading,
  } = useQuery<Product[]>({
    queryKey: ["/api/products", { category: product?.categoryId.toString() }],
    enabled: !!product?.categoryId,
  });

  const filteredRelatedProducts = relatedProducts
    .filter(p => p.id !== product?.id)
    .slice(0, 4);

  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (product) {
      addToCart.mutate({ productId: product.id, quantity });
    }
  };

  const renderStars = (rating: number = 0) => {
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
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  const discountPercentage = product?.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) 
    : 0;

  // Generate fake product images based on the main image
  const productImages = product 
    ? [
        product.imageUrl,
        // Add variations of the same image by appending unique query params
        `${product.imageUrl}?v=2`,
        `${product.imageUrl}?v=3`,
        `${product.imageUrl}?v=4`,
      ]
    : [];

  if (isProductLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you're looking for does not exist or has been removed.</p>
        <Button 
          onClick={() => navigate("/products")}
          className="bg-primary hover:bg-primary/90"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="/products">Products</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink>{product.name}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          {/* Main Image */}
          <div className="relative aspect-square bg-white rounded-lg overflow-hidden mb-4 border">
            <img 
              src={productImages[activeImageIndex]} 
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
            {product.isNew && (
              <span className="absolute top-4 left-4 bg-primary text-white text-xs px-2 py-1 rounded">
                New
              </span>
            )}
            {product.isBestSeller && (
              <span className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded">
                Best Seller
              </span>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          <div className="flex space-x-2">
            {productImages.map((image, index) => (
              <div 
                key={index}
                className={`cursor-pointer w-20 h-20 rounded-md overflow-hidden border-2 ${activeImageIndex === index ? 'border-primary' : 'border-gray-200'}`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img 
                  src={image} 
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex mr-2">
              {renderStars(product.rating)}
            </div>
            <span className="text-gray-500 text-sm">
              ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="text-3xl font-bold text-gray-900 mr-3">
                {formatCurrency(product.price)}
              </span>
              
              {product.comparePrice && (
                <>
                  <span className="text-lg text-gray-500 line-through mr-2">
                    {formatCurrency(product.comparePrice)}
                  </span>
                  <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                    Save {discountPercentage}%
                  </span>
                </>
              )}
            </div>
            
            <div className="text-gray-500 mb-4">
              {product.stock > 0 ? (
                <span className="text-green-600 flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-2"></span>
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-600 mr-2"></span>
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-b py-4 my-6">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <span className="mr-4 font-medium">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="h-10 w-10"
                >
                  <MinusCircle className="h-5 w-5" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className="h-10 w-10"
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-primary hover:bg-primary/90 flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addToCart.isPending}
              >
                {addToCart.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="mr-2 h-5 w-5" />
                )}
                Add to Cart
              </Button>
              
              <Button variant="outline" className="flex-1">
                <Heart className="mr-2 h-5 w-5" />
                Add to Wishlist
              </Button>
            </div>
          </div>

          {/* Product Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Truck className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm">Free Shipping</span>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm">2-Year Warranty</span>
            </div>
            <div className="flex items-center">
              <RotateCcw className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm">30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="w-full justify-start border-b bg-white">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="py-4">
          <div className="prose max-w-none">
            <p className="mb-4">{product.description}</p>
            <p className="mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="specifications" className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Technical Specifications</h3>
              <table className="min-w-full">
                <tbody>
                  <tr className="border-t">
                    <td className="py-2 text-gray-600">Brand</td>
                    <td className="py-2 font-medium">ShopEase</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 text-gray-600">Model</td>
                    <td className="py-2 font-medium">{product.name}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 text-gray-600">Category</td>
                    <td className="py-2 font-medium">Electronics</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 text-gray-600">Warranty</td>
                    <td className="py-2 font-medium">2 Years</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">In The Box</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>1 x {product.name}</li>
                <li>User Manual</li>
                <li>Warranty Card</li>
                <li>Power Adapter</li>
              </ul>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="reviews" className="py-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-xl mb-2">Customer Reviews</h3>
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-gray-500">
                    Based on {product.reviewCount} reviews
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-16 text-sm">5 stars</span>
                    <div className="flex-grow mx-2 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                    <span className="w-12 text-sm text-right">70%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 text-sm">4 stars</span>
                    <div className="flex-grow mx-2 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: "20%" }}></div>
                    </div>
                    <span className="w-12 text-sm text-right">20%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 text-sm">3 stars</span>
                    <div className="flex-grow mx-2 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: "7%" }}></div>
                    </div>
                    <span className="w-12 text-sm text-right">7%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 text-sm">2 stars</span>
                    <div className="flex-grow mx-2 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: "2%" }}></div>
                    </div>
                    <span className="w-12 text-sm text-right">2%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 text-sm">1 star</span>
                    <div className="flex-grow mx-2 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: "1%" }}></div>
                    </div>
                    <span className="w-12 text-sm text-right">1%</span>
                  </div>
                </div>
                
                <Button className="mt-6 w-full bg-primary hover:bg-primary/90">
                  Write a Review
                </Button>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h3 className="font-semibold text-xl mb-4">Recent Reviews</h3>
              
              <div className="space-y-6">
                {/* Sample review items - in a real application these would come from API */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h4 className="font-medium">John D.</h4>
                        <div className="flex mt-1">
                          {renderStars(5)}
                        </div>
                      </div>
                      <span className="text-gray-500 text-sm">2 weeks ago</span>
                    </div>
                    <p className="mt-3 text-gray-700">
                      Absolutely love this product! It exceeded all my expectations and the quality is superb. Would definitely recommend.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h4 className="font-medium">Sarah M.</h4>
                        <div className="flex mt-1">
                          {renderStars(4)}
                        </div>
                      </div>
                      <span className="text-gray-500 text-sm">1 month ago</span>
                    </div>
                    <p className="mt-3 text-gray-700">
                      Great product for the price. Shipping was fast and everything works as expected. Only giving 4 stars because the user manual could be clearer.
                    </p>
                  </CardContent>
                </Card>
                
                <Button variant="outline" className="w-full">
                  Load More Reviews
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {filteredRelatedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Related Products</h2>
          
          {isRelatedLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRelatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recently Viewed */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Recently Viewed</h2>
        
        <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Products you view will appear here</p>
        </div>
      </div>
    </div>
  );
}
