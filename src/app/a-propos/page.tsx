import Image from "next/image";
import Link from "next/link";
import { InstagramEmbed } from "@/components/instagram-embed";

const roseAccent = "text-[var(--mg-pop-rose)]";
const sunAccent = "text-[var(--mg-pop-sun)]";

export default function AboutPage() {
  return (
    <div className="relative mx-auto max-w-5xl overflow-visible py-6 md:py-10">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-screen -translate-x-1/2 lg:block">
        <div className="absolute left-[-2rem] top-8 h-[22rem] w-[15rem] rotate-[-4deg] opacity-70 xl:left-0 xl:w-[17rem]">
          <Image src="/brand/salopette.png" alt="" fill aria-hidden className="object-contain object-left" sizes="18rem" />
        </div>
        <div className="absolute right-[-2.5rem] top-[12rem] h-[25rem] w-[17rem] rotate-[5deg] opacity-78 xl:right-[-0.5rem] xl:w-[19rem]">
          <Image src="/brand/hero-skate.png" alt="" fill aria-hidden className="object-contain object-right" sizes="20rem" />
        </div>
        <div className="absolute left-[1.5rem] top-[34rem] h-[13rem] w-[9.5rem] rotate-[-10deg] opacity-62 xl:left-[4rem] xl:w-[10.5rem]">
          <Image src="/brand/tee-shirt.png" alt="" fill aria-hidden className="object-contain object-left" sizes="11rem" />
        </div>
        <div className="absolute right-[1rem] top-[48rem] h-[16rem] w-[11rem] rotate-[8deg] opacity-68 xl:right-[4rem] xl:w-[12rem]">
          <Image src="/brand/tee-shirt.png" alt="" fill aria-hidden className="object-contain object-right" sizes="12rem" />
        </div>
      </div>

      <section className="relative z-10 max-w-4xl">
        <p className={`text-xs font-black uppercase tracking-[0.24em] ${sunAccent}`}>À propos</p>
        <div className="mt-8 space-y-8 text-2xl font-black leading-[1.12] tracking-[-0.04em] text-[var(--mg-on-dark)] md:text-4xl md:leading-[1.08]">
          <p>
            Nous sommes <span className={roseAccent}>Nicole et Célia</span>, les fondatrices du Mini Gang. Amies et
            anciennes collègues, nous nous sommes rencontrées en travaillant toutes les deux comme{" "}
            <span className={sunAccent}>visual merchandiser</span>, après avoir été formées (il y a déjà quelque temps !)
            au métier de couturière.
          </p>
          <p>
            Aujourd’hui, nous sommes aussi <span className={roseAccent}>mamans</span>, et autant vous dire que les
            vêtements d’enfants qui deviennent trop petits à la vitesse de l’éclair… on connaît bien ! C’est donc de là
            qu’est née l’idée du Mini Gang : une plateforme de{" "}
            <span className={sunAccent}>seconde main</span> pour les enfants de 0 à 12 ans, simple, pratique et pensée
            pour les familles d’aujourd’hui.
          </p>
          <p>
            Nous adorons imaginer des <span className={roseAccent}>univers</span>, des lieux et des moments qui
            rassemblent. Avant le Mini Gang, nous avons déjà mené plusieurs projets ensemble, notamment autour du wedding
            design avec la création du Studio Noff. C’est d’ailleurs cette envie de{" "}
            <span className={sunAccent}>créer de beaux moments</span> qui a naturellement donné naissance aux événements
            du Mini Gang, comme avec notre tout premier marché.
          </p>
          <p>
            Nous croyons profondément en une consommation plus locale, au soutien des{" "}
            <span className={roseAccent}>créateurs et des artisans</span>, et à des alternatives plus douces et durables
            au quotidien. Avec le Mini Gang, notre rêve est simple : faire de la seconde main le{" "}
            <span className={sunAccent}>premier réflexe des familles</span>.
          </p>
        </div>
      </section>

      <section className="relative z-10 mt-12 border-t border-white/24 pt-8 md:mt-16 md:pt-10">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr),auto] md:items-end">
          <div className="max-w-3xl">
            <p className={`text-xs font-black uppercase tracking-[0.24em] ${sunAccent}`}>Notre vision</p>
            <h1 className="mt-4 text-4xl font-black leading-none tracking-[-0.05em] text-[var(--mg-on-dark)] md:text-6xl">
              Faire de la <span className={roseAccent}>seconde main</span> le premier réflexe des familles.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-bold leading-7 text-[var(--mg-on-dark-muted)] md:text-lg">
              Avec Le Mini Gang, nous voulons aider les familles à mieux consommer, sans renoncer ni au{" "}
              <span className={sunAccent}>style</span>, ni à la simplicité.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/vendre" className="rounded-full bg-[var(--mg-pop-sun)] px-5 py-2.5 text-sm font-black text-[var(--mg-ink)]">
              Vendre avec Mini Gang
            </Link>
            <Link href="/boutique" className="rounded-full border border-white/45 px-5 py-2.5 text-sm font-black text-[var(--mg-on-dark)]">
              Voir les pièces
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 mt-12 border-t border-white/24 pt-8 md:mt-16 md:pt-10">
        <div className="mb-6">
          <p className={`text-xs font-black uppercase tracking-[0.24em] ${sunAccent}`}>Dans le gang</p>
          <h2 className="mt-3 text-3xl font-black leading-none tracking-[-0.04em] text-[var(--mg-on-dark)] md:text-5xl">
            Nos derniers <span className={roseAccent}>posts</span>
          </h2>
        </div>

        <div className="max-w-xl">
          <article className="rounded-lg border border-white/24 bg-white p-3 text-[var(--mg-ink)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-black uppercase tracking-[0.14em]">Instagram</h3>
              <Link href="https://www.instagram.com/leminigang/" target="_blank" rel="noreferrer" className="text-xs font-black underline">
                @leminigang
              </Link>
            </div>
            <InstagramEmbed />
          </article>
        </div>
      </section>
    </div>
  );
}
