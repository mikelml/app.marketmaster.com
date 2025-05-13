import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/product-card";
import { 
  Loader2, 
  Filter, 
  SlidersHorizontal, 
  X, 
  ChevronRight 
} from "lucide-react";

interface ProductPageProps {
  categorySlug?: string;
}

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const [location] = useLocation();
  const categorySlug = params?.slug;
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [productAvailability, setProductAvailability] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("popularity");

  // Extract search query from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1]);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [location]);

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Find current category
  const currentCategory = categories.find(cat => cat.slug === categorySlug);

  // Fetch products based on category or search
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: [
      "/api/products",
      { 
        category: categorySlug,
        search: searchTerm 
      }
    ],
  });

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      // Filter by price range
      const withinPriceRange = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      // Filter by tags
      const matchesTags = selectedTags.length === 0 || 
        (product.tags && selectedTags.some(tag => product.tags?.includes(tag)));
      
      // Filter by availability
      const isInStock = product.stock > 0;
      const matchesAvailability = productAvailability.length === 0 || 
        (productAvailability.includes("in-stock") && isInStock) ||
        (productAvailability.includes("out-of-stock") && !isInStock);
      
      return withinPriceRange && matchesTags && matchesAvailability;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "price-low-high":
          return a.price - b.price;
        case "price-high-low":
          return b.price - a.price;
        case "newest":
          return a.isNew ? -1 : 1;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default: // popularity based on review count
          return (b.reviewCount || 0) - (a.reviewCount || 0);
      }
    });

  // Collect all tags from products for filter
  const allTags = Array.from(
    new Set(
      products
        .flatMap(product => product.tags || [])
        .filter(Boolean)
    )
  );

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update the URL with the search term
    window.history.pushState(
      {}, 
      '', 
      searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : window.location.pathname
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAvailabilityToggle = (value: string) => {
    setProductAvailability(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 2000]);
    setSelectedTags([]);
    setProductAvailability([]);
    setSortOption("popularity");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <a href="/" className="hover:text-primary">Home</a>
          <ChevronRight className="h-4 w-4 mx-1" />
          {categorySlug ? (
            <>
              <a href="/products" className="hover:text-primary">Products</a>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-gray-900">{currentCategory?.name || categorySlug}</span>
            </>
          ) : (
            <span className="text-gray-900">Products</span>
          )}
        </div>
        
        <h1 className="text-3xl font-bold mb-2">
          {searchTerm 
            ? `Search results for "${searchTerm}"` 
            : currentCategory?.name || "All Products"}
        </h1>
        
        {currentCategory?.description && (
          <p className="text-gray-600">{currentCategory.description}</p>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <Button type="submit" className="absolute right-1 top-1 bottom-1">
            Search
          </Button>
        </form>

        <div className="flex gap-2">
          <Button variant="outline" onClick={toggleFilter} className="md:hidden flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filters
          </Button>
          
          <select
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="popularity">Popularity</option>
            <option value="newest">Newest</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Mobile Filter Panel */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 bg-white md:hidden overflow-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Filters</h2>
                <Button variant="ghost" size="icon" onClick={toggleFilter}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={priceRange}
                      max={2000}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Product Availability */}
                <div>
                  <h3 className="font-medium mb-3">Availability</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="in-stock-mobile" 
                        checked={productAvailability.includes("in-stock")}
                        onCheckedChange={() => handleAvailabilityToggle("in-stock")}
                      />
                      <Label htmlFor="in-stock-mobile">In Stock</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="out-of-stock-mobile" 
                        checked={productAvailability.includes("out-of-stock")}
                        onCheckedChange={() => handleAvailabilityToggle("out-of-stock")}
                      />
                      <Label htmlFor="out-of-stock-mobile">Out of Stock</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tags */}
                {allTags.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleTagToggle(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex gap-2">
                <Button onClick={clearFilters} variant="outline" className="flex-1">
                  Clear All
                </Button>
                <Button onClick={toggleFilter} className="flex-1 bg-primary hover:bg-primary/90">
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="bg-white rounded-lg border p-4 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-sm">
                Clear All
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Price Range */}
              <div>
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={priceRange}
                    max={2000}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Product Availability */}
              <div>
                <h3 className="font-medium mb-3">Availability</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="in-stock" 
                      checked={productAvailability.includes("in-stock")}
                      onCheckedChange={() => handleAvailabilityToggle("in-stock")}
                    />
                    <Label htmlFor="in-stock">In Stock</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="out-of-stock" 
                      checked={productAvailability.includes("out-of-stock")}
                      onCheckedChange={() => handleAvailabilityToggle("out-of-stock")}
                    />
                    <Label htmlFor="out-of-stock">Out of Stock</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tags */}
              {allTags.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Active Filters */}
          {(selectedTags.length > 0 || productAvailability.length > 0 || 
            priceRange[0] > 0 || priceRange[1] < 2000) && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500 flex items-center">
                <SlidersHorizontal className="h-4 w-4 mr-1" /> Active Filters:
              </span>
              
              {priceRange[0] > 0 || priceRange[1] < 2000 ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Price: ${priceRange[0]} - ${priceRange[1]}
                </Badge>
              ) : null}
              
              {productAvailability.includes("in-stock") && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  In Stock
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleAvailabilityToggle("in-stock")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {productAvailability.includes("out-of-stock") && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Out of Stock
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleAvailabilityToggle("out-of-stock")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleTagToggle(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
                Clear All
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500">Error loading products. Please try again later.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
              <Button onClick={clearFilters} className="bg-primary hover:bg-primary/90">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
