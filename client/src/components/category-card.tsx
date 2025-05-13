import { Category } from "@shared/schema";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/products/category/${category.slug}`}>
      <Card className="group cursor-pointer">
        <div className="relative rounded-lg overflow-hidden h-40 md:h-48">
          <img 
            src={category.imageUrl} 
            alt={category.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent"></div>
          <div className="absolute bottom-3 left-3">
            <h3 className="text-white font-medium text-lg">{category.name}</h3>
            <p className="text-white/80 text-sm">{category.description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
