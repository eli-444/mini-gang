import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import { env } from "@/lib/env";
import { formatShopMoney } from "@/lib/shop-config";
import { createLaPosteOrderLabel } from "@/lib/shipping/la-poste-order-provider";

export interface OrderShippingLabelResult {
  pdfBytes: Uint8Array;
  trackingNumber?: string | null;
  carrier?: string | null;
}

export interface OrderShippingLabelInput {
  order: {
    id: string;
    email: string;
    prenom?: string | null;
    nom?: string | null;
    telephone?: string | null;
    adresse_ligne_1?: string | null;
    adresse_ligne_2?: string | null;
    code_postal?: string | null;
    ville?: string | null;
    pays?: string | null;
    total_centimes?: number | null;
    frais_livraison_centimes?: number | null;
    cree_le?: string | null;
  };
  items: Array<{
    id: string;
    nom_vetement?: string | null;
    taille?: string | null;
    prix_centimes?: number | null;
    vetement_id?: string | null;
  }>;
}

function pdfText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

function line(page: PDFPage, font: PDFFont, text: string, x: number, y: number, size = 10) {
  page.drawText(pdfText(text), { x, y, size, font, color: rgb(0.1, 0.12, 0.14) });
}

function drawBarcode(page: PDFPage, value: string, x: number, y: number, width: number, height: number) {
  page.drawRectangle({ x, y, width, height, borderColor: rgb(0.1, 0.12, 0.14), borderWidth: 1 });
  const chars = Array.from(value || "MINIGANG");
  const barWidth = width / Math.max(40, chars.length * 4);
  let cursor = x + 8;

  chars.forEach((char, charIndex) => {
    const code = char.charCodeAt(0);
    for (let bit = 0; bit < 4; bit += 1) {
      const draw = ((code >> bit) + charIndex) % 2 === 0;
      if (draw) {
        page.drawRectangle({
          x: cursor,
          y: y + 7,
          width: Math.max(1, barWidth * (bit % 2 === 0 ? 1.9 : 1)),
          height: height - 14,
          color: rgb(0.05, 0.06, 0.07),
        });
      }
      cursor += barWidth * 1.45;
      if (cursor > x + width - 10) return;
    }
  });
}

function senderAddress() {
  return {
    name: env.shippingSenderName ?? env.buybackReceiverName,
    line1: env.shippingSenderLine1 ?? env.buybackReceiverLine1,
    postalCode: env.shippingSenderPostalCode ?? env.buybackReceiverPostalCode,
    city: env.shippingSenderCity ?? env.buybackReceiverCity,
    country: env.shippingSenderCountry ?? env.buybackReceiverCountry,
  };
}

async function createInternalOrderLabel(input: OrderShippingLabelInput) {
  const pdfDoc = await PDFDocument.create();
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage([595, 842]);
  const sender = senderAddress();
  const customerName = `${input.order.prenom ?? ""} ${input.order.nom ?? ""}`.trim() || input.order.email;
  const orderRef = `MG-CMD-${input.order.id.slice(0, 8).toUpperCase()}`;
  const barcodeValue = `${orderRef}|${input.items.map((item) => item.vetement_id ?? item.id).join("|")}`;

  page.drawRectangle({
    x: 28,
    y: 28,
    width: page.getWidth() - 56,
    height: page.getHeight() - 56,
    borderColor: rgb(0.1, 0.12, 0.14),
    borderWidth: 1.2,
  });

  line(page, titleFont, "LE MINI GANG - BORDEREAU D'ENVOI", 46, 790, 18);
  line(page, bodyFont, `Commande: ${orderRef}`, 46, 765, 11);
  line(page, bodyFont, `Date: ${input.order.cree_le ? new Date(input.order.cree_le).toLocaleDateString("fr-CH") : "-"}`, 46, 748, 10);

  line(page, titleFont, "EXPEDITEUR", 46, 710, 12);
  line(page, bodyFont, sender.name, 46, 690);
  line(page, bodyFont, sender.line1, 46, 675);
  line(page, bodyFont, `${sender.postalCode} ${sender.city}`, 46, 660);
  line(page, bodyFont, sender.country, 46, 645);

  line(page, titleFont, "DESTINATAIRE", 330, 710, 12);
  line(page, bodyFont, customerName, 330, 690);
  line(page, bodyFont, input.order.adresse_ligne_1 ?? "-", 330, 675);
  if (input.order.adresse_ligne_2) line(page, bodyFont, input.order.adresse_ligne_2, 330, 660);
  line(page, bodyFont, `${input.order.code_postal ?? ""} ${input.order.ville ?? ""}`, 330, input.order.adresse_ligne_2 ? 645 : 660);
  line(page, bodyFont, input.order.pays ?? "CH", 330, input.order.adresse_ligne_2 ? 630 : 645);
  line(page, bodyFont, input.order.telephone ?? "", 330, input.order.adresse_ligne_2 ? 615 : 630);

  page.drawLine({ start: { x: 46, y: 600 }, end: { x: 548, y: 600 }, thickness: 1, color: rgb(0.82, 0.84, 0.86) });
  line(page, titleFont, "CONTENU", 46, 575, 12);

  let y = 548;
  input.items.slice(0, 18).forEach((item, index) => {
    const label = `${index + 1}. ${item.nom_vetement ?? item.vetement_id ?? "Article"}${item.taille ? ` - ${item.taille}` : ""}`;
    line(page, bodyFont, label, 52, y, 9.5);
    line(page, bodyFont, formatShopMoney(item.prix_centimes ?? 0), 460, y, 9.5);
    y -= 17;
  });

  if (input.items.length > 18) {
    line(page, bodyFont, `+ ${input.items.length - 18} article(s) supplementaire(s)`, 52, y, 9.5);
  }

  line(page, titleFont, `Total commande: ${formatShopMoney(input.order.total_centimes ?? 0)}`, 46, 210, 12);
  line(page, bodyFont, `Livraison: ${formatShopMoney(input.order.frais_livraison_centimes ?? 0)}`, 46, 192, 10);

  drawBarcode(page, barcodeValue, 300, 150, 230, 72);
  line(page, bodyFont, orderRef, 348, 132, 10);
  line(page, bodyFont, "Code barre interne - remplacable par le bordereau La Poste", 292, 116, 8.5);

  line(page, bodyFont, "A imprimer et coller sur le colis apres generation.", 46, 88, 9);
  return {
    pdfBytes: await pdfDoc.save(),
    trackingNumber: null,
    carrier: "Interne",
  };
}

export async function createOrderShippingLabel(input: OrderShippingLabelInput) {
  const laPostePdf = await createLaPosteOrderLabel(input);
  if (laPostePdf) return laPostePdf;
  return createInternalOrderLabel(input);
}
