import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireCoach } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoicePDF } from "@/lib/invoice-pdf";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;
    const { coach } = await requireCoach();

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        coachId: coach.id,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture introuvable" },
        { status: 404 }
      );
    }

    // Générer le PDF avec renderToBuffer (plus performant)
    const pdfBuffer = await renderToBuffer(<InvoicePDF invoice={invoice} />);

    // Convertir Buffer en Uint8Array pour NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    // Retourner le PDF
    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[INVOICE_PDF_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur génération PDF" },
      { status: 500 }
    );
  }
}
