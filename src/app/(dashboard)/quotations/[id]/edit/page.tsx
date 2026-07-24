"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Plus, Trash2, Save, FileText, Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import type { Contact } from "@/types";
import { useAuth } from "@/hooks/use-auth";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  taxable: boolean;
  tax_rate: number;
  details?: string;
}

export default function EditQuotationPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;
  const { user, defaultCurrency } = useAuth();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingContacts, setFetchingContacts] = useState(true);

  // Form State
  const [contactId, setContactId] = useState("");
  const [notesTitle, setNotesTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [validUntil, setValidUntil] = useState("");
  const [taxRate, setTaxRate] = useState<number>(0);
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, unit: "pcs", unit_price: 0, taxable: true, tax_rate: 0 }
  ]);
  const [contactSearch, setContactSearch] = useState("");
  const [openContactPopover, setOpenContactPopover] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: contactData } = await supabase.from("contacts").select("id, name, phone").order("name");
      if (contactData) setContacts(contactData as any);
      
      const { data: productData } = await supabase.from("products").select("*").eq("status", "active").order("name");
      if (productData) setProducts(productData);

      if (quoteId) {
        const { data: quote } = await supabase
          .from("quotations")
          .select("*, quotation_items(*)")
          .eq("id", quoteId)
          .single();
          
        if (quote) {
          setContactId(quote.contact_id);
          setNotesTitle(quote.notes_title || "");
          setNotes(quote.notes || "");
          setTaxRate(quote.tax_rate || 0);
          setValidUntil(quote.valid_until ? quote.valid_until.split('T')[0] : "");
          if (quote.quotation_items && quote.quotation_items.length > 0) {
            setItems(quote.quotation_items.map((i: any) => ({
              id: i.id,
              description: i.description,
              quantity: i.quantity,
              unit: i.unit || "pcs",
              unit_price: i.unit_price,
              taxable: i.taxable !== undefined ? i.taxable : true,
              tax_rate: i.tax_rate !== undefined ? i.tax_rate : quote.tax_rate
            })));
          }
        }
      }

      setFetchingContacts(false);
    }
    loadData();
  }, []);

  const addLineItem = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), description: "", quantity: 1, unit: "pcs", unit_price: 0, taxable: true, tax_rate: taxRate }
    ]);
  };

  const removeLineItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleProductSelect = (id: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setItems(items.map(item => item.id === id ? { 
      ...item, 
      description: product.name, 
      details: product.description || "",
      unit_price: product.default_price, 
      unit: product.unit || "pcs",
      tax_rate: product.tax_rate !== null ? product.tax_rate : taxRate 
    } : item));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const taxAmount = items.reduce(
    (sum, item) => sum + (item.taxable ? (item.quantity * item.unit_price * item.tax_rate) / 100 : 0),
    0
  );

  const totalAmount = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!contactId) return toast.error("Please select a contact");
    if (items.some(i => !i.description)) return toast.error("All items must have a description");

    setLoading(true);

    try {
      // 1. Update Quotation
      const { error: quoteError } = await supabase
        .from("quotations")
        .update({
          contact_id: contactId,
          currency: defaultCurrency,
          notes_title: notesTitle.trim() || null,
          notes,
          valid_until: validUntil || null,
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total_amount: totalAmount,
        })
        .eq("id", quoteId);

      if (quoteError) throw quoteError;

      // 2. Delete old items and Insert New Items
      await supabase.from("quotation_items").delete().eq("quotation_id", quoteId);

      const formattedItems = items.map(item => {
        const itemTotal = item.quantity * item.unit_price;
        const itemTax = item.taxable ? (itemTotal * item.tax_rate) / 100 : 0;
        return {
          quotation_id: quoteId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          total_price: itemTotal,
          taxable: item.taxable,
          tax_rate: item.taxable ? item.tax_rate : 0,
          tax_amount: itemTax,
          details: item.details || null
        };
      });

      const { error: itemsError } = await supabase
        .from("quotation_items")
        .insert(formattedItems);

      if (itemsError) throw itemsError;

      // 3. Save as default if checked
      if (saveAsDefault) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from("profiles").select("account_id").eq("user_id", session.user.id).single();
          if (profile?.account_id) {
            await supabase.from("accounts").update({
              default_terms_title: notesTitle.trim() || null,
              default_terms: notes.trim() || null,
            }).eq("id", profile.account_id);
          }
        }
      }

      toast.success("Quotation updated successfully!");
      router.push("/quotations");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/50 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Edit Quote</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8">
          
          {/* Details Section */}
          <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-medium">Quote Details</h3>
              <p className="text-sm text-muted-foreground">Select the customer and set the basic parameters.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 flex flex-col">
                <Label>Contact (Lead/Customer) <span className="text-destructive">*</span></Label>
                <Popover open={openContactPopover} onOpenChange={setOpenContactPopover}>
                  <PopoverTrigger 
                    className="inline-flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    disabled={fetchingContacts}
                  >
                    {contactId
                      ? (contacts.find((c) => c.id === contactId)?.name || contacts.find((c) => c.id === contactId)?.phone)
                      : (fetchingContacts ? "Loading contacts..." : "Select contact...")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <input 
                        className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Search contact name or phone..."
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                      />
                    </div>
                    <ScrollArea className="max-h-60 overflow-y-auto p-1">
                      {contacts
                        .filter(c => (c.name?.toLowerCase().includes(contactSearch.toLowerCase()) || c.phone?.includes(contactSearch)))
                        .map((contact) => (
                          <div
                            key={contact.id}
                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                            onClick={() => {
                              setContactId(contact.id);
                              setOpenContactPopover(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${contactId === contact.id ? "opacity-100" : "opacity-0"}`}
                            />
                            {contact.name || contact.phone}
                          </div>
                      ))}
                      {contacts.filter(c => (c.name?.toLowerCase().includes(contactSearch.toLowerCase()) || c.phone?.includes(contactSearch))).length === 0 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          No contacts found.
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Valid Until (Optional)</Label>
                <Input 
                  type="date" 
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Default GST Rate (%)</Label>
                <Input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 18"
                />
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Line Items</h3>
                <p className="text-sm text-muted-foreground">Add products or services to the quote.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="gap-2">
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            </div>

              <div className="space-y-4">
                {/* Header row */}
                <div className="grid grid-cols-12 gap-4 px-4 pb-2 text-xs font-semibold text-muted-foreground hidden md:grid uppercase tracking-wider">
                  <div className="col-span-5">Product / Service</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Tax</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-start bg-card border border-border/40 p-4 rounded-xl shadow-sm relative group hover:border-primary/30 transition-all">
                      <div className="col-span-12 md:col-span-5 space-y-2 md:space-y-0 relative group">
                        <Label className="md:hidden text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Product / Service</Label>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <select
                              className="h-10 w-8 md:w-28 rounded-md border border-input bg-background/50 text-sm focus-visible:outline-none transition-colors hover:bg-background"
                              onChange={(e) => handleProductSelect(item.id, e.target.value)}
                              value=""
                              title="Select from Catalog"
                            >
                              <option value="" disabled>Catalog</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                            <Input 
                              placeholder="Product or service name..." 
                              value={item.description}
                              onChange={(e) => updateItem(item.id, "description", e.target.value)}
                              required
                              className="flex-1 bg-background/50 transition-colors focus:bg-background"
                            />
                          </div>
                          <Textarea 
                            placeholder="Add additional details or specifications (optional)..."
                            value={item.details || ""}
                            onChange={(e) => updateItem(item.id, "details", e.target.value)}
                            className="min-h-[60px] text-sm resize-y bg-background/50 transition-colors focus:bg-background"
                          />
                        </div>
                      </div>
                      
                      <div className="col-span-6 md:col-span-2 space-y-2 md:space-y-0">
                        <Label className="md:hidden text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Quantity</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="number" 
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                            required
                            className="w-16 bg-background/50 transition-colors focus:bg-background px-2 text-center"
                          />
                          <Input 
                            placeholder="Unit"
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                            required
                            className="flex-1 bg-background/50 transition-colors focus:bg-background px-2 text-center"
                          />
                        </div>
                      </div>

                      <div className="col-span-6 md:col-span-2 space-y-2 md:space-y-0">
                        <Label className="md:hidden text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Price</Label>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                          required
                          className="w-full bg-background/50 transition-colors focus:bg-background"
                        />
                      </div>

                      <div className="col-span-10 md:col-span-2 space-y-2 md:space-y-0">
                        <Label className="md:hidden text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Tax</Label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                            checked={item.taxable}
                            onChange={(e) => updateItem(item.id, "taxable", e.target.checked)}
                            title="Apply GST"
                          />
                          <div className="relative flex-1">
                            <Input 
                              type="number" 
                              min="0"
                              step="0.01"
                              value={item.tax_rate}
                              onChange={(e) => updateItem(item.id, "tax_rate", parseFloat(e.target.value) || 0)}
                              disabled={!item.taxable}
                              className="pr-6 h-10 disabled:opacity-50 bg-background/50 transition-colors focus:bg-background"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-span-2 md:col-span-1 flex justify-end md:justify-center items-start pt-1 md:pt-0">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 w-10 md:mt-0 mt-[26px]"
                          onClick={() => removeLineItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            <div className="flex justify-end pt-4 border-t">
              <div className="text-right space-y-1">
                <p className="text-sm text-muted-foreground flex justify-between gap-8">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">{defaultCurrency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </p>
                <p className="text-sm text-muted-foreground flex justify-between gap-8">
                  <span>GST Amount</span>
                  <span className="font-medium text-foreground">{defaultCurrency} {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </p>
                <div className="pt-2 mt-2 border-t text-3xl font-bold tracking-tight text-primary flex justify-between gap-8">
                  <span className="text-lg flex items-end pb-1">Total Due</span>
                  <span>{defaultCurrency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Notes Heading / Title (Optional)</Label>
                <Input 
                  placeholder="e.g. Terms & Conditions, Payment Terms (leave blank for no heading)"
                  value={notesTitle}
                  onChange={(e) => setNotesTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes Content (Optional)</Label>
                <Textarea 
                  placeholder="Add any terms, conditions, or special notes for the customer..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-32"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="saveAsDefault" 
                  checked={saveAsDefault}
                  onChange={(e) => setSaveAsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <Label htmlFor="saveAsDefault" className="text-sm font-normal text-muted-foreground cursor-pointer select-none">
                  Save these terms & notes as default for future quotations
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => router.push("/quotations")}>Cancel</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? "Saving..." : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
