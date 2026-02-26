import { useGetMyOrders } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package } from 'lucide-react';
import { OrderStatus, OrderType } from '../backend';

export default function MyOrders() {
  const { data: orders = [], isLoading } = useGetMyOrders();

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.pending:
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case OrderStatus.processing:
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case OrderStatus.shipped:
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case OrderStatus.delivered:
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getOrderTypeLabel = (type: OrderType) => {
    return type === OrderType.bulk ? 'Bulk Order' : 'Regular Order';
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">My Orders</h2>
        <p className="text-muted-foreground">Track your order history and status</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No orders yet</p>
            <p className="text-sm text-muted-foreground">Start shopping to place your first order!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.toString()}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getOrderTypeLabel(order.orderType)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium">Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>
                            {item.product.name} × {item.quantity.toString()}
                          </span>
                          <span className="font-medium">
                            ${(Number(item.product.price) * Number(item.quantity)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>
                      ${order.items
                        .reduce(
                          (sum, item) =>
                            sum + Number(item.product.price) * Number(item.quantity),
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
