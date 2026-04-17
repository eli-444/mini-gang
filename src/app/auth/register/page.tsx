import { redirect } from "next/navigation";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;

  redirect(next ? `/auth/signup?next=${encodeURIComponent(next)}` : "/auth/signup");
}
