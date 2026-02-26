import { useState } from 'react';
import { useGetAllProducts } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ProductCard from '../components/ProductCard';
import ShoppingCart from '../components/ShoppingCart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ShoppingCart as CartIcon } from 'lucide-react';
import { ProductCategory, type Product } from '../backend';

export type CartItem = {
  product: Product;
  quantity: number;
};

export default function HomePage() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const { identity } = useInternetIdentity();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const isAuthenticated = !!identity;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: bigint, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const dryFruits = products.filter((p) => p.category === ProductCategory.dryFruits);
  const snacks = products.filter((p) => p.category === ProductCategory.snacks);
  const chocolates = products.filter((p) => p.category === ProductCategory.chocolates);

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Our Products</h2>
          <p className="text-muted-foreground">Premium quality snacks, dry fruits, and chocolates</p>
        </div>
        {cartItemCount > 0 && (
          <Button onClick={() => setShowCart(true)} size="lg" className="relative">
            <CartIcon className="mr-2 h-5 w-5" />
            Cart
            <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground text-xs font-bold text-primary">
              {cartItemCount}
            </span>
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8 grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="dryFruits">Dry Fruits</TabsTrigger>
          <TabsTrigger value="snacks">Snacks</TabsTrigger>
          <TabsTrigger value="chocolates">Chocolates</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {products.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No products available yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dryFruits" className="space-y-4">
          {dryFruits.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No dry fruits available yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {dryFruits.map((product) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="snacks" className="space-y-4">
          {snacks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No snacks available yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {snacks.map((product) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="chocolates" className="space-y-4">
          {chocolates.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No chocolates available yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {chocolates.map((product) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ShoppingCart
        cart={cart}
        open={showCart}
        onClose={() => setShowCart(false)}
        onUpdateQuantity={updateQuantity}
        onClearCart={clearCart}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
