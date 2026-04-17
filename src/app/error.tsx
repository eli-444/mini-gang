'use client';

export default function GlobalError({ error }: { error: Error }) {
  console.error(error);
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-[#FFF9F4]">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900">
            Oups, quelque chose s&apos;est mal passé.
          </h1>
          <p className="mt-2 text-sm text-neutral-700">
            Réessaie dans quelques instants. Si le problème persiste, contacte le Mini Gang.
          </p>
        </div>
      </body>
    </html>
  );
}
