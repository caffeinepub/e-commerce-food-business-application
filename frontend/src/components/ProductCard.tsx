import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../backend';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const imageUrl = product.image?.getDirectURL();
  const priceInDollars = Number(product.price) / 100;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1 text-lg">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-0">
        <span className="text-2xl font-bold text-primary">
          ${priceInDollars.toFixed(2)}
        </span>
        <Button
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
          size="sm"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
