import { useState } from 'react';
import { useGetAllProducts, useAddProduct, useUpdateProduct, useRemoveProduct } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import ProductFormDialog from './ProductFormDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Product } from '../backend';

export default function ProductManagement() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const removeProduct = useRemoveProduct();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      await removeProduct.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'dryFruits':
        return 'Dry Fruits';
      case 'snacks':
        return 'Snacks';
      case 'chocolates':
        return 'Chocolates';
      default:
        return category;
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading products...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Products</CardTitle>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No products yet. Add your first product to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id.toString()}>
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                        {product.image ? (
                          <img
                            src={product.image.getDirectURL()}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{getCategoryLabel(product.category)}</TableCell>
                    <TableCell>${(Number(product.price) / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.inStock ? 'default' : 'destructive'}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <ProductFormDialog
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
