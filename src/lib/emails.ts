import { env } from "@/lib/env";
import { log } from "@/lib/logger";
import { SUPPORT_EMAIL, formatShopMoney } from "@/lib/shop-config";

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!env.resendApiKey) {
    log.warn("Skipping email: RESEND_API_KEY missing", { to: payload.to, subject: payload.subject });
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Le Mini Gang <orders@leminigang.com>",
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });
}

export async function sendOrderPaidEmails(input: {
  orderId: string;
  customerEmail: string;
  customerName?: string | null;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  status: string;
  shippingAddress: {
    line1: string;
    line2?: string | null;
    postalCode: string;
    city: string;
    country: string;
  };
  items: Array<{ nom_vetement?: string | null; taille?: string | null; prix_centimes: number }>;
}) {
  const itemRows = input.items
    .map(
      (item) =>
        `<li>${escapeHtml(item.nom_vetement)}${item.taille ? `, ${escapeHtml(item.taille)}` : ""} - <strong>${formatShopMoney(item.prix_centimes)}</strong></li>`,
    )
    .join("");
  const address = [
    input.shippingAddress.line1,
    input.shippingAddress.line2,
    `${input.shippingAddress.postalCode} ${input.shippingAddress.city}`,
    input.shippingAddress.country,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br />");
  const orderUrl = `${env.publicSiteUrl}/mon-compte/commandes/${input.orderId}`;

  const customerPromise = sendEmail({
    to: input.customerEmail,
    subject: `Commande ${input.orderId} confirmee`,
    html: `
      <p>Merci${input.customerName ? ` ${escapeHtml(input.customerName)}` : ""}, votre commande <strong>${input.orderId}</strong> est bien payee.</p>
      <ul>${itemRows}</ul>
      <p>Sous-total: <strong>${formatShopMoney(input.subtotalCents)}</strong><br />
      Livraison: <strong>${formatShopMoney(input.shippingCents)}</strong><br />
      Total: <strong>${formatShopMoney(input.totalCents)}</strong></p>
      <p>Adresse de livraison:<br />${address}</p>
      <p>Statut: <strong>${escapeHtml(input.status)}</strong></p>
      <p><a href="${orderUrl}">Suivre ma commande</a></p>
      <p>Besoin d'aide: ${SUPPORT_EMAIL}</p>
    `,
  });

  const adminPromise = env.adminNotificationEmail
    ? sendEmail({
        to: env.adminNotificationEmail,
        subject: `Nouvelle commande payee ${input.orderId}`,
        html: `
          <p>Commande <strong>${input.orderId}</strong> payee.</p>
          <p>Client: ${escapeHtml(input.customerEmail)}</p>
          <ul>${itemRows}</ul>
          <p>Total: <strong>${formatShopMoney(input.totalCents)}</strong></p>
          <p>Adresse:<br />${address}</p>
          <p><a href="${env.publicSiteUrl}/admin/orders/${input.orderId}">Ouvrir dans l'admin</a></p>
        `,
      })
    : Promise.resolve();

  try {
    await Promise.all([customerPromise, adminPromise]);
  } catch (error) {
    log.error("Email send failed", {
      orderId: input.orderId,
      error: error instanceof Error ? error.message : "unknown error",
    });
  }
}

export async function sendShipmentEmail(input: {
  customerEmail: string;
  orderId: string;
  carrier: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}) {
  const trackingLine = input.trackingNumber
    ? `<p>Numero de suivi: <strong>${escapeHtml(input.trackingNumber)}</strong></p>`
    : "";
  const trackingLink = input.trackingUrl ? `<p><a href="${escapeHtml(input.trackingUrl)}">Ouvrir le suivi</a></p>` : "";

  try {
    await sendEmail({
      to: input.customerEmail,
      subject: `Commande ${input.orderId} expediee`,
      html: `
        <p>Votre commande <strong>${input.orderId}</strong> a ete confiee a ${escapeHtml(input.carrier)}.</p>
        ${trackingLine}
        ${trackingLink}
        <p>Vous pouvez aussi retrouver ces informations dans votre espace client.</p>
      `,
    });
  } catch (error) {
    log.warn("Failed to send shipment email", {
      orderId: input.orderId,
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
}

export async function sendSellOrderCreatedEmail(input: { customerEmail: string; orderNumber: string; labelUrl: string | null }) {
  const labelLink = input.labelUrl
    ? `<p><a href="${input.labelUrl}" target="_blank" rel="noreferrer">Telecharger mon bordereau PDF</a></p>`
    : "";

  try {
    await sendEmail({
      to: input.customerEmail,
      subject: `Dossier de vente ${input.orderNumber} cree`,
      html: `
        <p>Votre dossier de vente <strong>${input.orderNumber}</strong> est cree.</p>
        <p>Prochaine etape: imprimez le bordereau, preparez votre colis, puis deposez-le au transporteur choisi.</p>
        ${labelLink}
      `,
    });
  } catch (error) {
    log.warn("Failed to send sell order created email", {
      order_number: input.orderNumber,
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
}

export async function sendSellOrderDecisionEmail(input: {
  customerEmail: string;
  orderNumber: string;
  status: "accepted" | "partially_accepted" | "rejected";
  creditedAmountCents: number;
}) {
  const amount = formatShopMoney(input.creditedAmountCents);
  const statusLabel =
    input.status === "accepted"
      ? "accepte"
      : input.status === "partially_accepted"
        ? "partiellement accepte"
        : "refuse";

  try {
    await sendEmail({
      to: input.customerEmail,
      subject: `Decision de rachat ${input.orderNumber}`,
      html: `
        <p>Votre dossier <strong>${input.orderNumber}</strong> est ${statusLabel}.</p>
        <p>Montant credite dans votre cagnotte: <strong>${amount}</strong>.</p>
      `,
    });
  } catch (error) {
    log.warn("Failed to send sell order decision email", {
      order_number: input.orderNumber,
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
}

export async function sendPayoutPaidEmail(input: { customerEmail: string; amountCents: number }) {
  const amount = formatShopMoney(input.amountCents);
  try {
    await sendEmail({
      to: input.customerEmail,
      subject: "Retrait Mini Gang effectue",
      html: `<p>Votre retrait de <strong>${amount}</strong> est marque comme effectue.</p>`,
    });
  } catch (error) {
    log.warn("Failed to send payout paid email", {
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
}
