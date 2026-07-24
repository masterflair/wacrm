"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Send } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function PdfActions({ quoteId, contactId }: { quoteId: string, contactId: string }) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const supabase = createClient();

  const generatePdfBlob = async (element: HTMLElement): Promise<Blob> => {
    // Dynamically import to avoid Next.js SSR window/document crashes
    const { toJpeg } = await import("html-to-image");
    const { jsPDF } = await import("jspdf");

    // Save scroll position and temporarily scroll to top to prevent Y-offset clipping during capture
    const currentScrollX = window.scrollX;
    const currentScrollY = window.scrollY;
    window.scrollTo(0, 0);

    // Save original class and inline style
    const originalClass = element.className;
    const originalStyle = element.getAttribute("style") || "";

    // Temporarily strip mx-auto and lock 800x1131 dimensions at (0,0) offset
    element.className = originalClass.replace(/\bmx-auto\b/g, "");
    element.style.width = "800px";
    element.style.height = "1131px";
    element.style.maxWidth = "none";
    element.style.margin = "0";
    
    try {
      const dataUrl = await toJpeg(element, { 
        pixelRatio: 2, 
        quality: 0.95,
        backgroundColor: "#ffffff",
        cacheBust: true,
        width: 800,
        height: 1131,
        style: {
          margin: "0",
          transform: "none",
          left: "0",
          top: "0",
        }
      });
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      return pdf.output('blob');
    } finally {
      element.className = originalClass;
      element.setAttribute("style", originalStyle);
      window.scrollTo(currentScrollX, currentScrollY);
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;
    
    setDownloading(true);
    try {
      const blob = await generatePdfBlob(element);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Quotation-${quoteId.split('-')[0].toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  const handleShare = async () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;
    
    setSharing(true);
    const loadingToast = toast.loading("Generating and uploading PDF...");
    
    try {
      // 1. Generate PDF Blob
      const pdfBlob = await generatePdfBlob(element);
      const filename = `Quotation-${quoteId}-${Date.now()}.pdf`;

      // 2. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('quotations')
        .upload(filename, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: publicUrlData } = supabase
        .storage
        .from('quotations')
        .getPublicUrl(filename);
        
      const publicUrl = publicUrlData.publicUrl;

      // 4. Send via WhatsApp API
      toast.loading("Sending via WhatsApp...", { id: loadingToast });
      
      const res = await fetch(`/api/whatsapp/send`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: contactId,
          message_type: "document",
          media_url: publicUrl,
          filename: `Quotation-${quoteId.split('-')[0].toUpperCase()}.pdf`,
        })
      });

      if (!res.ok) throw new Error("Failed to send WhatsApp message");

      // 5. Update Status
      await supabase.from("quotations").update({ status: "sent" }).eq("id", quoteId);
      
      toast.success("PDF sent via WhatsApp successfully!", { id: loadingToast });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to share PDF", { id: loadingToast });
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="gap-2" 
        onClick={handleDownload} 
        disabled={downloading || sharing}
      >
        <Download className="h-4 w-4" />
        {downloading ? "Generating..." : "Download PDF"}
      </Button>

      <Button 
        className="gap-2" 
        onClick={handleShare} 
        disabled={downloading || sharing}
      >
        <Send className="h-4 w-4" />
        {sharing ? "Sending..." : "Share via WhatsApp"}
      </Button>
    </>
  );
}
