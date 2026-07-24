import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { id } = await params;

    // Fetch quotation details
    const { data: quote, error: quoteError } = await supabase
      .from("quotations")
      .select(`
        *,
        contacts(*),
        quotation_items(*)
      `)
      .eq("id", id)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    // Format the text message
    let messageText = `📄 *QUOTATION REF: #${quote.id.split('-')[0]}*\n`;
    messageText += `Hello ${quote.contacts?.name || 'Customer'},\n\nHere is your quotation details:\n\n`;

    quote.quotation_items.forEach((item: any, i: number) => {
      messageText += `${i + 1}. *${item.description}*\n`;
      messageText += `   Qty: ${item.quantity} ${item.unit || 'pcs'} | Unit Price: ${quote.currency} ${item.unit_price}\n`;
      messageText += `   *Subtotal:* ${quote.currency} ${item.total_price}\n\n`;
    });

    messageText += `*TOTAL AMOUNT: ${quote.currency} ${quote.total_amount}*\n\n`;
    
    if (quote.notes) {
      messageText += `Notes:\n${quote.notes}\n\n`;
    }
    messageText += `Thank you for your business!`;

    // Send the WhatsApp message by hitting our internal endpoint
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const sendReq = await fetch(`${siteUrl}/api/whatsapp/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "cookie": request.headers.get("cookie") || "",
        "authorization": request.headers.get("authorization") || ""
      },
      body: JSON.stringify({
        contact_id: quote.contact_id,
        message_type: "text",
        content_text: messageText,
      })
    });

    if (!sendReq.ok) {
      const errorData = await sendReq.json();
      return NextResponse.json({ error: errorData.error || "Failed to send WhatsApp message" }, { status: sendReq.status });
    }

    // Update status to sent
    await supabase
      .from("quotations")
      .update({ status: "sent" })
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending quotation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
