import { redirect } from "next/navigation";

interface CommandeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CommandeDetailPage({ params }: CommandeDetailPageProps) {
  const { id } = await params;
  redirect(`/mon-compte/commandes/${id}`);
}
