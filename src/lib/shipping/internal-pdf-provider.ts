import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { formatShopMoney } from "@/lib/shop-config";
import type { CreateLabelInput, CreateLabelResult, ShippingLabelProvider } from "@/lib/shipping/provider";

function decodeBase64ToBytes(base64: string) {
  if (typeof atob === "function") {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }
  return Uint8Array.from([]);
}

function toMoney(cents: number) {
  return formatShopMoney(cents);
}

export class InternalPdfProvider implements ShippingLabelProvider {
  async createLabel(input: CreateLabelInput): Promise<CreateLabelResult> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawRectangle({
      x: 24,
      y: 24,
      width: page.getWidth() - 48,
      height: page.getHeight() - 48,
      borderColor: rgb(0.12, 0.12, 0.12),
      borderWidth: 1.2,
    });

    page.drawText("Le Mini Gang - Bordereau d'envoi", {
      x: 40,
      y: 790,
      size: 18,
      font: titleFont,
      color: rgb(0.08, 0.08, 0.08),
    });
    page.drawText(`Numero dossier: ${input.orderNumber}`, {
      x: 40,
      y: 766,
      size: 12,
      font: titleFont,
    });
    page.drawText(`Transporteur selectionne: ${input.shippingProvider}`, {
      x: 40,
      y: 748,
      size: 10,
      font: bodyFont,
    });

    page.drawText("Expediteur", { x: 40, y: 710, size: 12, font: titleFont });
    page.drawText(
      `${input.sender.name}\n${input.sender.line1}\n${input.sender.line2 ?? ""}\n${input.sender.postalCode} ${input.sender.city}\n${input.sender.country}`,
      { x: 40, y: 690, size: 10, lineHeight: 14, font: bodyFont },
    );

    page.drawText("Destinataire", { x: 320, y: 710, size: 12, font: titleFont });
    page.drawText(
      `${input.receiver.name}\n${input.receiver.line1}\n${input.receiver.line2 ?? ""}\n${input.receiver.postalCode} ${input.receiver.city}\n${input.receiver.country}`,
      { x: 320, y: 690, size: 10, lineHeight: 14, font: bodyFont },
    );

    page.drawText("Contenu declare", { x: 40, y: 610, size: 12, font: titleFont });
    let rowY = 590;
    for (const item of input.items.slice(0, 18)) {
      page.drawText(
        `- ${item.category} ${item.brand ? `(${item.brand})` : ""} ${item.sizeLabel ? `- ${item.sizeLabel}` : ""} - ${item.condition}`,
        { x: 44, y: rowY, size: 9, font: bodyFont },
      );
      rowY -= 14;
    }

    page.drawText(`Estimation indicative: ${toMoney(input.estimatedTotalCents)}`, {
      x: 40,
      y: 308,
      size: 11,
      font: titleFont,
    });
    page.drawText(
      "L'estimation est confirmee apres controle qualite par l'atelier. Les articles refuses suivent la politique de rachat Mini Gang.",
      { x: 40, y: 286, size: 9, maxWidth: 520, lineHeight: 12, font: bodyFont },
    );

    try {
      const qrDataUrl = await QRCode.toDataURL(input.orderNumber, { margin: 1, width: 220 });
      const base64 = qrDataUrl.split(",")[1] ?? "";
      const qrBytes = decodeBase64ToBytes(base64);
      const qrPng = await pdfDoc.embedPng(qrBytes);
      page.drawImage(qrPng, { x: 425, y: 250, width: 130, height: 130 });
      page.drawText("Scanner ce QR a reception", { x: 420, y: 236, size: 9, font: bodyFont });
    } catch {
      page.drawText(`Code: ${input.orderNumber}`, { x: 420, y: 260, size: 10, font: titleFont });
    }

    const bytes = await pdfDoc.save();
    return {
      pdfBytes: bytes,
      trackingNumber: null,
    };
  }
}
