import { useState } from 'react';
import { useGetAllProducts, useGetAllOrders } from '../hooks/useQueries';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProductManagement from '../components/ProductManagement';
import OrderManagement from '../components/OrderManagement';
import { Package, ShoppingBag } from 'lucide-react';

export default function AdminDashboard() {
  const { data: products = [] } = useGetAllProducts();
  const { data: orders = [] } = useGetAllOrders();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage products and orders</p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="products">Product Management</TabsTrigger>
          <TabsTrigger value="orders">Order Management</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
