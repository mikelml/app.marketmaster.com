import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CategoryCard from "@/components/category-card";
import ProductCard from "@/components/product-card";
import { ChevronRight, Loader2, ShoppingCart } from "lucide-react";

export default function HomePage() {
  const [email, setEmail] = useState("");

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProducts = [], isLoading: isFeaturedLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { featured: true }],
  });

  const { data: newProducts = [], isLoading: isNewLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { featured: "new" }],
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle the newsletter subscription here
    alert(`Thank you for subscribing with ${email}!`);
    setEmail("");
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative h-[500px] overflow-hidden">
        <div
          className="relative h-full w-full bg-gradient-to-r from-dark/80 to-dark/50"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-lg">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Smart Home Revolution
              </h1>
              <p className="text-lg text-white/90 mb-8">
                Discover the latest tech to transform your living space. Up to 40% off on selected items.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products/category/electronics">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    Shop Now <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="bg-white hover:bg-gray-100 text-dark border-white w-full sm:w-auto">
                  Learn More
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Slider Navigation */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            <div className="h-2 w-8 rounded-full bg-white"></div>
            <div className="h-2 w-2 rounded-full bg-white/50"></div>
            <div className="h-2 w-2 rounded-full bg-white/50"></div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-8">Shop by Category</h2>
          {isCategoriesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">Featured Products</h2>
            <div className="mt-4 md:mt-0">
              <select className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Popularity</option>
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          {isFeaturedLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/products">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                View All Products <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* BANNER SECTION */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative rounded-xl overflow-hidden h-64 group">
              <img
                src="https://pixabay.com/get/g3d4e6a18091a5a28e946ff2c43c9fcab1c7dffe4b03880665d6b96198126f18e5a61f9797a044acfef0a6454cbb582a5ce4292b9221045dc427aa32a1b1cf585_1280.jpg"
                alt="Home Furniture Sale"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-dark/70 to-transparent flex flex-col justify-center p-6">
                <h3 className="text-white text-2xl font-semibold mb-2">Home Furniture Sale</h3>
                <p className="text-white/90 mb-4">Up to 50% off on selected items</p>
                <Link href="/products/category/home-kitchen">
                  <Button className="bg-white text-dark hover:bg-gray-100 w-fit">
                    Shop Now <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden h-64 group">
              <img
                src="https://pixabay.com/get/ga82a8754020c7cded7f0cd16f19b2e476b610c6d1c227f89db877eb53f710bcff06f20f947bc5010c84346154f9b7b77e90477b06ae8ee898055fefa304557f8_1280.jpg"
                alt="Tech Gadgets"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-dark/70 to-transparent flex flex-col justify-center p-6">
                <h3 className="text-white text-2xl font-semibold mb-2">Latest Tech Gadgets</h3>
                <p className="text-white/90 mb-4">New arrivals with free shipping</p>
                <Link href="/products/category/electronics">
                  <Button className="bg-white text-dark hover:bg-gray-100 w-fit">
                    Explore Collection <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST PRODUCTS */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">Latest Products</h2>
            <div className="flex mt-4 md:mt-0 space-x-2 overflow-x-auto md:overflow-visible">
              <Button className="bg-primary text-white">All</Button>
              <Button variant="outline">Electronics</Button>
              <Button variant="outline">Fashion</Button>
              <Button variant="outline">Home</Button>
            </div>
          </div>

          {isNewLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NEWSLETTER SECTION */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-3">Subscribe to Our Newsletter</h2>
            <p className="text-white/90 mb-6">
              Get the latest updates on new products and upcoming sales.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white"
                required
              />
              <Button type="submit" className="bg-white text-primary hover:bg-gray-100 font-medium">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
