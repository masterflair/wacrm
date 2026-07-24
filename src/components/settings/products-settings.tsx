"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Product } from "@/types";
import { useAuth } from "@/hooks/use-auth";

export function ProductsSettings() {
  const supabase = createClient();
  const { user, defaultCurrency } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [taxRate, setTaxRate] = useState("");

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to load products");
    } else {
      setProducts(data as Product[]);
    }
    setLoading(false);
  }

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setDescription(product.description || "");
      setPrice(product.default_price.toString());
      setUnit(product.unit || "pcs");
      setTaxRate(product.tax_rate !== null && product.tax_rate !== undefined ? product.tax_rate.toString() : "");
    } else {
      setEditingProduct(null);
      setName("");
      setDescription("");
      setPrice("");
      setUnit("pcs");
      setTaxRate("");
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name) return toast.error("Name is required");
    
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) return toast.error("Invalid price");

    const payload = {
      user_id: user.id,
      name,
      description,
      default_price: parsedPrice,
      unit,
      tax_rate: taxRate ? parseFloat(taxRate) : null,
      status: "active"
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);
        
        if (error) throw error;
        toast.success("Product updated");
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...payload } as Product : p));
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select()
          .single();
          
        if (error) throw error;
        toast.success("Product added");
        setProducts([...products, data as Product]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete product");
    } else {
      toast.success("Product deleted");
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Products & Services</h2>
          <p className="text-sm text-muted-foreground">
            Manage your standard catalog to quickly generate quotations.
          </p>
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Default Price</TableHead>
              <TableHead>Tax Rate</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Loading catalog...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-3 py-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <p>No products or services found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {product.description || "-"}
                  </TableCell>
                  <TableCell>
                    {defaultCurrency} {product.default_price.toLocaleString()} {product.unit && <span className="text-sm text-muted-foreground">/ {product.unit}</span>}
                  </TableCell>
                  <TableCell>
                    {product.tax_rate !== null ? `${product.tax_rate}%` : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openModal(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Website Development" 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Price <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{defaultCurrency}</span>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="pl-12"
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)} 
                  placeholder="e.g. pcs, hrs" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-tax">GST Rate (%)</Label>
              <Input 
                type="number"
                step="0.01"
                min="0"
                value={taxRate} 
                onChange={(e) => setTaxRate(e.target.value)} 
                placeholder="e.g. 18 (leave empty for default)" 
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Optional details..." 
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
