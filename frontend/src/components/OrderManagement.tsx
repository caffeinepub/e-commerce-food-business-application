import { useGetAllOrders, useUpdateOrderStatus } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatus, OrderType } from '../backend';

export default function OrderManagement() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const updateOrderStatus = useUpdateOrderStatus();

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
    return type === OrderType.bulk ? 'Bulk' : 'Regular';
  };

  const handleStatusChange = async (orderId: bigint, newStatus: OrderStatus) => {
    await updateOrderStatus.mutateAsync({ orderId, status: newStatus });
  };

  if (isLoading) {
    return <div className="text-center">Loading orders...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Customer Info</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const total = order.items.reduce(
                    (sum, item) =>
                      sum + Number(item.product.price) * Number(item.quantity),
                    0
                  );

                  return (
                    <TableRow key={order.id.toString()}>
                      <TableCell className="font-medium">#{order.id.toString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getOrderTypeLabel(order.orderType)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              {item.product.name} × {item.quantity.toString()}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${(total / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs text-sm text-muted-foreground">
                          {order.customerInfo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            handleStatusChange(order.id, value as OrderStatus)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={OrderStatus.pending}>Pending</SelectItem>
                            <SelectItem value={OrderStatus.processing}>Processing</SelectItem>
                            <SelectItem value={OrderStatus.shipped}>Shipped</SelectItem>
                            <SelectItem value={OrderStatus.delivered}>Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
