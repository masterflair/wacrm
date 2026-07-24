import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Printer, Pencil, FileText, Phone, Mail, Globe } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { PdfActions } from "@/components/quotations/pdf-actions";
import { formatCurrency } from "@/lib/utils";
import { BackButton } from "@/components/ui/back-button";

export const dynamic = 'force-dynamic';

export default async function QuotationViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const isFromInbox = search.from === 'inbox';
  const conversationId = search.c as string | undefined;
  
  const backLink = isFromInbox 
    ? (conversationId ? `/inbox?c=${conversationId}` : "/inbox") 
    : "/quotations";

  const supabase = await createClient();

  const { data: quote } = await supabase
    .from("quotations")
    .select(`
      *,
      contacts(*),
      quotation_items(*)
    `)
    .eq("id", id)
    .single();

  if (!quote) {
    notFound();
  }

  // Find the profile / account details for the "From" section
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_id")
    .eq("user_id", quote.user_id)
    .single();

  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", profile?.account_id)
    .single();

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Top Action Bar - Hidden when printing */}
      <div className="flex items-center justify-between border-b border-border/50 bg-background px-6 py-4 print:hidden">
        <div className="flex items-center gap-4">
          <BackButton className="hover:bg-accent hover:text-accent-foreground transition-colors" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Quotation #{quote.id.split('-')[0].toUpperCase()}</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(quote.created_at), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link 
            href={`/quotations/${quote.id}/edit`}
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <PdfActions quoteId={quote.id} contactId={quote.contact_id} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        {/* Invoice Container - ALWAYS LIGHT MODE for perfect PDF/Print */}
        <div id="invoice-content" className="mx-auto w-full max-w-[800px] bg-white text-slate-900 shadow-2xl overflow-hidden print:shadow-none print:w-full relative min-h-[1131px] flex flex-col">
          
          {/* Decorative Top Graphic Header */}
          <div className="h-4 w-full bg-indigo-600 shrink-0"></div>
          
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

          {/* Invoice Header */}
          <div className="p-10 md:p-14 flex flex-col md:flex-row justify-between gap-8 relative bg-white z-10">
            
            {/* Subtle Watermark */}
            <div className="absolute top-12 right-12 opacity-5 pointer-events-none select-none">
              <span className="text-9xl font-black tracking-tighter text-slate-900">QUOTE</span>
            </div>

            <div className="z-10">
              <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">QUOTATION</h2>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <span className="font-medium text-slate-700">Ref:</span> 
                <span className="text-slate-900">#{quote.id.split('-')[0].toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <span className="font-medium text-slate-700">Date:</span> 
                <span>{format(new Date(quote.created_at), "MMM d, yyyy")}</span>
              </div>
              {quote.valid_until && (
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-medium text-slate-700">Valid Until:</span> 
                  <span className="text-red-600 font-medium">{format(new Date(quote.valid_until), "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
            
            <div className="text-left md:text-right z-10 flex flex-col items-start md:items-end">
              {account?.logo_url ? (
                <div className="h-16 mb-4 flex items-center justify-end">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={account.logo_url} alt="Company Logo" className="h-full object-contain max-w-[200px]" crossOrigin="anonymous" />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/20">
                  <Printer className="h-7 w-7" />
                </div>
              )}
              <h3 className="font-bold text-2xl mb-1 text-slate-900">{account?.name || "Your Company Name"}</h3>
              <div className="text-slate-500 text-sm leading-relaxed flex flex-col items-start md:items-end">
                {account?.address && <p className="whitespace-pre-line">{account.address}</p>}
                {account?.email && <p>{account.email}</p>}
                {account?.phone && <p>{account.phone}</p>}
                {account?.website && <p>{account.website}</p>}
                {account?.tax_id && <p className="mt-1 font-medium text-slate-700">Tax ID: {account.tax_id}</p>}
                {(!account?.email && !account?.phone && !account?.address && !account?.website) && (
                  <p className="whitespace-pre-line text-slate-400 italic">
                    Configure company details in Settings
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="px-10 md:px-14 py-8 bg-slate-50 border-y border-slate-200 relative z-10">
            <p className="text-xs font-bold text-indigo-600 mb-3 uppercase tracking-widest">Billed To</p>
            <h3 className="text-2xl font-semibold text-slate-900 mb-1">{quote.contacts?.name || "Customer"}</h3>
            <div className="flex flex-col gap-1 text-slate-500 text-sm">
              <p>{quote.contacts?.phone}</p>
              {quote.contacts?.email && <p>{quote.contacts.email}</p>}
              
              {/* If tax_id exists, it might contain GSTIN::State::Address */}
              {(() => {
                const parts = (quote.contacts?.tax_id ?? '').split('::');
                const gstin = parts[0] || '';
                const state = parts[1] || '';
                const address = parts.slice(2).join('::') || '';

                return (
                  <>
                    {address && <p className="whitespace-pre-line">{address}</p>}
                    {(gstin || state) && (
                      <div className="mt-0.5">
                        {gstin && <p className="font-medium text-slate-700">GSTIN: {gstin}</p>}
                        {state && <p className="text-slate-500">State: {state}</p>}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="px-10 md:px-14 py-4 relative z-10 bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-xs font-bold text-slate-900 uppercase tracking-widest">
                  <th className="py-4 font-semibold w-[40%]">Description</th>
                  <th className="py-4 font-semibold text-center w-[15%]">Qty</th>
                  <th className="py-4 font-semibold text-right w-[15%]">Price</th>
                  <th className="py-4 font-semibold text-right w-[15%]">Tax</th>
                  <th className="py-4 font-semibold text-right w-[15%]">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {quote.quotation_items?.map((item: any, index: number) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0 group">
                    <td className="py-6 pr-4 align-top">
                      <div className="font-semibold text-slate-900 text-base">{item.description}</div>
                      {item.details && (
                        <div className="mt-1 text-sm font-normal text-slate-500 leading-relaxed whitespace-pre-line">
                          {item.details}
                        </div>
                      )}
                    </td>
                    <td className="py-6 text-center align-top">
                      <div className="font-medium text-slate-700">
                        {item.quantity} <span className="text-[10px] uppercase text-slate-400 ml-1">{item.unit || "pcs"}</span>
                      </div>
                    </td>
                    <td className="py-6 text-right text-slate-600 align-top">
                      <div className="font-medium">{formatCurrency(item.unit_price, quote.currency)}</div>
                    </td>
                    <td className="py-6 text-right text-slate-600 align-top">
                      {item.taxable && item.tax_amount > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-slate-700">{formatCurrency(item.tax_amount, quote.currency)}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">({item.tax_rate}%)</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-6 text-right align-top">
                      <div className="font-bold text-slate-900 text-base">{formatCurrency(item.total_price + (item.tax_amount || 0), quote.currency)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Notes Section */}
          <div className="px-10 md:px-14 py-8 bg-slate-50 flex flex-col md:flex-row justify-between items-start gap-8 border-t border-slate-200 relative z-10">
            {/* Notes / Terms */}
            <div className="flex-1 w-full md:max-w-md">
              {quote.notes ? (
                <div className="space-y-1.5">
                  {quote.notes_title && (
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" /> {quote.notes_title}
                    </p>
                  )}
                  <div className="text-xs whitespace-pre-line text-slate-600 leading-relaxed">
                    {quote.notes}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Totals Card */}
            <div className="w-full md:w-80 shrink-0 rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between text-slate-500 mb-3 text-sm">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">{formatCurrency(quote.subtotal || quote.total_amount, quote.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-500 mb-4 text-sm">
                <span>Tax</span>
                <span className="font-medium text-slate-900">{formatCurrency(quote.tax_amount || 0, quote.currency)}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-900">Total Due</span>
                <span className="text-2xl font-black text-indigo-600 tracking-tight">{formatCurrency(quote.total_amount, quote.currency)}</span>
              </div>
            </div>
          </div>

          {/* Footer Graphics */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-indigo-600 z-10"></div>

          {/* Footer Text */}
          <div className="p-8 pb-12 text-center bg-slate-50 border-t border-slate-200 relative z-10 space-y-4 mt-auto">
            <p className="text-sm font-semibold text-slate-800 tracking-tight">
              Thank you for your business!
            </p>
            
            {(account?.email || account?.phone || account?.website || account?.name) && (
              <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-600 font-medium">
                {account?.name && (
                  <span className="font-bold text-slate-900 tracking-tight text-sm">
                    {account.name}
                  </span>
                )}
                {account?.phone && (
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    {account.phone}
                  </span>
                )}
                {account?.email && (
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    {account.email}
                  </span>
                )}
                {account?.website && (
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <Globe className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    {account.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </span>
                )}
              </div>
            )}
            
            <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
              If you have any questions concerning this quotation, please contact us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
