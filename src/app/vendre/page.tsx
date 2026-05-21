import Link from "next/link";
import { getSiteContentSettings } from "@/lib/site-content-settings";

export default async function VendrePage() {
  const settings = await getSiteContentSettings();
  const isOpen = settings.sell_service_enabled;
  const title = isOpen ? "Proposer un colis Mini Gang." : "Le rachat arrive bientot.";
  const closedText =
    settings.sell_closed_message ||
    "Le parcours de rachat, la cagnotte et les dossiers vendeurs sont volontairement desactives pour le lancement en Suisse. La boutique se concentre d'abord sur les pieces disponibles, les paiements en CHF et la livraison en Suisse.";
  const openText =
    settings.sell_explanation_text ||
    "Preparez un colis de 10 a 50 vetements propres, sans taches et sans trous. Mini Gang vous donnera une fourchette claire avant validation.";

  return (
    <div className="bg-[var(--mg-bg)] text-[var(--mg-on-dark)]">
      <section className="mg-container min-h-[auto] py-16 md:min-h-[790px] md:py-36">
        <p className="mg-hand-title text-[2.1rem] text-[var(--mg-pop-sun)] md:text-6xl">VENDRE MES VETEMENTS</p>
        <h1 className="mt-2 text-[2.25rem] font-black leading-none md:text-7xl">{title}</h1>

        <div className="mt-8 max-w-[96rem] space-y-7 text-[1.45rem] font-black leading-[1.03] md:mt-14 md:space-y-12 md:text-5xl">
          <p>{isOpen ? openText : closedText}</p>
          <p>
            Pour proposer un lot ou poser une question, envoyez-nous quelques photos, tailles, marques et etats des
            vetements.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 md:mt-14 md:gap-10">
          <Link href={isOpen ? "/vendre/commencer" : "/contact"} className="mg-button mg-button-pink text-base md:text-2xl">
            Vendre avec Mini Gang
          </Link>
          <Link href="/boutique" className="mg-button mg-button-yellow text-base md:text-2xl">
            Voir les pieces
          </Link>
        </div>
      </section>
    </div>
  );
}
