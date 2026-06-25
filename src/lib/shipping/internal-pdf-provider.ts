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

function buildQrPayload(input: CreateLabelInput) {
  return JSON.stringify({
    dossier: input.orderNumber,
    expediteur: {
      nom: input.sender.name,
      email: input.sender.email,
      ville: input.sender.city,
    },
    nombre_vetements: input.items.length,
    vetements: input.items.map((item, index) => ({
      n: index + 1,
      categorie: item.category,
      marque: item.brand ?? "",
      taille: item.sizeLabel ?? "",
      etat: item.condition,
    })),
  });
}

export class InternalPdfProvider implements ShippingLabelProvider {
  async createLabel(input: CreateLabelInput): Promise<CreateLabelResult> {
    const pdfDoc = await PDFDocument.create();
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const addPage = () => {
      const page = pdfDoc.addPage([595, 842]);
      page.drawRectangle({
        x: 24,
        y: 24,
        width: page.getWidth() - 48,
        height: page.getHeight() - 48,
        borderColor: rgb(0.12, 0.12, 0.12),
        borderWidth: 1.2,
      });
      return page;
    };

    let page = addPage();

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
    page.drawText(`Transporteur sélectionné: ${input.shippingProvider}`, {
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
    for (const [index, item] of input.items.entries()) {
      if (rowY < 95) {
        page = addPage();
        page.drawText(`Le Mini Gang - Bordereau ${input.orderNumber}`, {
          x: 40,
          y: 790,
          size: 14,
          font: titleFont,
          color: rgb(0.08, 0.08, 0.08),
        });
        page.drawText("Suite du contenu declare", { x: 40, y: 758, size: 12, font: titleFont });
        rowY = 736;
      }

      page.drawText(
        `${index + 1}. ${item.category} ${item.brand ? `(${item.brand})` : ""} ${item.sizeLabel ? `- ${item.sizeLabel}` : ""} - ${item.condition}`,
        { x: 44, y: rowY, size: 9, maxWidth: 500, font: bodyFont },
      );
      rowY -= 14;
    }

    if (rowY < 280) {
      page = addPage();
      page.drawText(`Le Mini Gang - Bordereau ${input.orderNumber}`, {
        x: 40,
        y: 790,
        size: 14,
        font: titleFont,
        color: rgb(0.08, 0.08, 0.08),
      });
      rowY = 740;
    }

    page.drawText(
      input.estimatedTotalCents > 0
        ? `Estimation indicative: ${toMoney(input.estimatedTotalCents)}`
        : "Estimation indicative: à confirmer après contrôle",
      {
      x: 40,
      y: rowY - 22,
      size: 11,
      font: titleFont,
      },
    );
    page.drawText(
      "L'estimation est confirmée après contrôle qualité par l'atelier. Les articles refusés suivent la politique de rachat Mini Gang.",
      { x: 40, y: rowY - 46, size: 9, maxWidth: 520, lineHeight: 12, font: bodyFont },
    );

    try {
      const qrDataUrl = await QRCode.toDataURL(buildQrPayload(input), { margin: 1, width: 240 });
      const base64 = qrDataUrl.split(",")[1] ?? "";
      const qrBytes = decodeBase64ToBytes(base64);
      const qrPng = await pdfDoc.embedPng(qrBytes);
      page.drawImage(qrPng, { x: 425, y: 102, width: 130, height: 130 });
      page.drawText("Code du dossier et des vêtements", { x: 398, y: 88, size: 9, font: bodyFont });
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
