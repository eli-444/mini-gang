import { MiniGangErrorPage } from "@/components/mini-gang-error-page";

export default function NotFound() {
  return (
    <MiniGangErrorPage
      eyebrow="404"
      title="Page introuvable"
      message="Cette page n'existe pas ou a changé d'adresse. Vous pouvez retourner à l'accueil ou continuer la chasse aux pépites."
    />
  );
}
