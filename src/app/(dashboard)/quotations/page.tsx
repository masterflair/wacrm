"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Contact } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Plus, Search, MoreHorizontal, FileDown, Send, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function QuotationsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [quotations, setQuotations] = useState<(any & { contacts: Contact })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchQuotations();
  }, []);

  async function fetchQuotations() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("quotations")
      .select(`
        *,
        contacts (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load quotations");
      console.error(error);
    } else {
      setQuotations(data as any);
    }
    setLoading(false);
  }

  async function deleteQuotation(id: string) {
    if (!confirm("Are you sure you want to delete this quote?")) return;
    
    const { error } = await supabase.from("quotations").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete quotation");
    } else {
      toast.success("Quotation deleted");
      setQuotations(quotations.filter((q) => q.id !== id));
    }
  }

  async function sendQuotation(id: string) {
    const quote = quotations.find((q) => q.id === id);
    if (!quote) return;
    
    if (!confirm(`Are you sure you want to send this quote for ${quote.currency} ${quote.total_amount} to ${quote.contacts?.name || 'the customer'}?`)) return;
    
    const loadingToast = toast.loading("Sending quotation via WhatsApp...");
    try {
      const res = await fetch(`/api/quotations/${id}/send`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send quotation");
      
      toast.success("Quotation sent successfully!", { id: loadingToast });
      
      // Update local state
      setQuotations(quotations.map(q => q.id === id ? { ...q, status: "sent" } : q));
    } catch (error) {
      toast.error("Error sending quotation", { id: loadingToast });
    }
  }

  const filteredQuotations = quotations.filter((q) =>
    q.contacts?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Quotations</h1>
            <p className="text-sm text-muted-foreground">
              Manage and send pricing proposals
            </p>
          </div>
        </div>

        <Button className="gap-2" onClick={() => router.push("/quotations/new")}>
          <Plus className="h-4 w-4" />
          New Quote
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search quotes by contact name..."
                className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      Loading quotations...
                    </TableCell>
                  </TableRow>
                ) : filteredQuotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No quotations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotations.map((quote) => (
                    <TableRow 
                      key={quote.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => router.push(`/quotations/${quote.id}`)}
                    >
                      <TableCell className="font-medium">
                        {quote.contacts?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {quote.currency} {quote.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
                          ${quote.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                            quote.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                            quote.status === 'sent' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-gray-500/10 text-gray-500'}
                        `}>
                          {quote.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(quote.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                              <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/quotations/${quote.id}`)}>
                              <FileDown className="mr-2 h-4 w-4" />
                              View PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/quotations/${quote.id}/edit`)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Quote
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => sendQuotation(quote.id)}>
                              <Send className="mr-2 h-4 w-4" /> Send via WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-500"
                              onClick={() => deleteQuotation(quote.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
