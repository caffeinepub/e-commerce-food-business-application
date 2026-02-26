import { useState, useEffect } from 'react';
import { useAddProduct, useUpdateProduct } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ProductCategory, type Product, ExternalBlob } from '../backend';
import { Upload } from 'lucide-react';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductFormDialog({ open, onClose, product }: ProductFormDialogProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProductCategory>(ProductCategory.dryFruits);
  const [inStock, setInStock] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice((Number(product.price) / 100).toFixed(2));
      setDescription(product.description);
      setCategory(product.category);
      setInStock(product.inStock);
      setImagePreview(product.image?.getDirectURL() || null);
      setImageFile(null);
    } else {
      setName('');
      setPrice('');
      setDescription('');
      setCategory(ProductCategory.dryFruits);
      setInStock(true);
      setImageFile(null);
      setImagePreview(null);
    }
  }, [product, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageBlob: ExternalBlob | undefined = product?.image;

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      imageBlob = ExternalBlob.fromBytes(uint8Array);
    }

    const productData: Product = {
      id: product?.id || BigInt(0),
      name,
      price: BigInt(Math.round(parseFloat(price) * 100)),
      description,
      category,
      inStock,
      image: imageBlob,
    };

    if (product) {
      await updateProduct.mutateAsync({ id: product.id, product: productData });
    } else {
      await addProduct.mutateAsync(productData);
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Premium Almonds"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="9.99"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ProductCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProductCategory.dryFruits}>Dry Fruits</SelectItem>
                <SelectItem value={ProductCategory.snacks}>Snacks</SelectItem>
                <SelectItem value={ProductCategory.chocolates}>Chocolates</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="h-20 w-20 overflow-hidden rounded-md border">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <label htmlFor="image" className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">{imageFile ? 'Change Image' : 'Upload Image'}</span>
                </div>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="inStock">In Stock</Label>
            <Switch id="inStock" checked={inStock} onCheckedChange={setInStock} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={addProduct.isPending || updateProduct.isPending}>
              {addProduct.isPending || updateProduct.isPending
                ? 'Saving...'
                : product
                ? 'Update Product'
                : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
