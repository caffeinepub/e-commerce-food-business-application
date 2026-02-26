import { useState } from 'react';
import { usePlaceOrder, useGetCallerUserProfile } from '../hooks/useQueries';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { OrderType, type OrderItem } from '../backend';
import type { CartItem } from '../pages/HomePage';
import { toast } from 'sonner';

interface ShoppingCartProps {
  cart: CartItem[];
  open: boolean;
  onClose: () => void;
  onUpdateQuantity: (productId: bigint, quantity: number) => void;
  onClearCart: () => void;
  isAuthenticated: boolean;
}

export default function ShoppingCart({
  cart,
  open,
  onClose,
  onUpdateQuantity,
  onClearCart,
  isAuthenticated,
}: ShoppingCartProps) {
  const [orderType, setOrderType] = useState<OrderType>(OrderType.regular);
  const [notes, setNotes] = useState('');
  const placeOrder = usePlaceOrder();
  const { data: userProfile } = useGetCallerUserProfile();

  const total = cart.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const orderItems: OrderItem[] = cart.map((item) => ({
      product: item.product,
      quantity: BigInt(item.quantity),
    }));

    const customerInfo = userProfile
      ? `${userProfile.name} | ${userProfile.email} | ${userProfile.phone}${notes ? ` | Notes: ${notes}` : ''}`
      : notes || 'No contact info';

    try {
      await placeOrder.mutateAsync({
        items: orderItems,
        orderType,
        customerInfo,
      });
      onClearCart();
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product.id.toString()} className="flex gap-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.product.image ? (
                      <img
                        src={item.product.image.getDirectURL()}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.product.id, 0)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${Number(item.product.price).toFixed(2)} each
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="ml-auto font-medium">
                        ${(Number(item.product.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4 py-4">
              <div>
                <Label className="mb-3 block">Order Type</Label>
                <RadioGroup
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as OrderType)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={OrderType.regular} id="regular" />
                    <Label htmlFor="regular" className="font-normal">
                      Regular Order
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={OrderType.bulk} id="bulk" />
                    <Label htmlFor="bulk" className="font-normal">
                      Bulk Order (Catering)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Delivery instructions, special requests..."
                  className="mt-2"
                />
              </div>
            </div>
            <Separator />
          </>
        )}

        <SheetFooter className="flex-col gap-4">
          {cart.length > 0 && (
            <>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button
                onClick={handlePlaceOrder}
                disabled={placeOrder.isPending || !isAuthenticated}
                className="w-full"
                size="lg"
              >
                {placeOrder.isPending
                  ? 'Placing Order...'
                  : isAuthenticated
                  ? 'Place Order'
                  : 'Login to Order'}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
