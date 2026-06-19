import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="overflow-hidden bg-[var(--mg-bg)] text-[var(--mg-on-dark)]">
      <section className="mg-container relative grid gap-10 py-14 md:grid-cols-[1fr_0.92fr] md:gap-12 md:py-28">
        <div className="relative z-10">
          <h1 className="mg-hand-title mb-7 inline-block rounded-b-xl border-b-[0.14em] border-[var(--mg-pop-rose)] pb-[0.02em] text-[2.65rem] md:mb-10 md:text-7xl">
            A PROPOS
          </h1>
          <div className="mg-page-copy max-w-[48rem] text-[1.65rem] md:text-[3.35rem]">
            <p>
              Nous sommes <span className="text-[var(--mg-pop-rose)]">Nicole</span> et{" "}
              <span className="text-[var(--mg-pop-rose)]">Celia</span>, les fondatrices du Mini Gang. Amies et anciennes
              collegues, nous nous sommes rencontrees en travaillant toutes les deux comme{" "}
              <span className="text-[var(--mg-pop-sun)]">visual merchandisers</span>, apres avoir ete formees au metier
              de <span className="text-[var(--mg-pop-rose)]">couturiere</span>.
            </p>

            <p className="mt-8 md:mt-12">
              Aujourd&apos;hui, nous sommes aussi mamans, et{" "}
              <span className="text-[var(--mg-pop-sun)]">
                les vetements d&apos;enfants qui deviennent trop petits a la vitesse de l&apos;eclair
              </span>
              , on connait bien. C&apos;est de la qu&apos;est nee l&apos;idee du Mini Gang : une{" "}
              <span className="text-[var(--mg-pop-rose)]">plateforme de seconde main</span> pour les enfants de 0 a 12
              ans, simple, pratique et pensee pour les familles d&apos;aujourd&apos;hui.
            </p>
          </div>
        </div>

        <div className="relative min-h-[330px] md:min-h-[660px]">
          <Image src="/brand/design/founders-framed.png" alt="Nicole et Celia, fondatrices de Mini Gang" fill priority className="object-contain object-center" sizes="50vw" />
        </div>
      </section>

      <section className="mg-container relative grid gap-8 py-8 md:grid-cols-[0.82fr_1fr] md:py-16">
        <div className="relative min-h-[260px] md:min-h-[430px]">
          <Image src="/brand/design/salopette-yellow.png" alt="" fill className="object-contain object-left-bottom" sizes="42vw" />
        </div>
        <div className="mg-page-copy max-w-[49rem] self-center text-[1.55rem] md:text-[3.15rem]">
          <p>
            Nous adorons imaginer des univers, des lieux et des moments qui rassemblent. C&apos;est cette envie de creer de
            beaux moments qui nourrit aussi les evenements Mini Gang.
          </p>
          <p className="mt-8 md:mt-12">
            Nous croyons profondement en une consommation plus{" "}
            <span className="text-[var(--mg-pop-sun)]">locale</span>, au soutien des createurs et des artisans, et a des
            alternatives plus <span className="text-[var(--mg-pop-rose)]">douces et durables</span> au quotidien. Avec le
            Mini Gang, notre reve est simple : faire de{" "}
            <span className="text-[var(--mg-pop-rose)]">la seconde main le premier reflexe des familles</span>.
          </p>
        </div>
      </section>

      <section className="mg-container relative py-14 md:py-24">
        <div className="max-w-[72rem]">
          <h2 className="mg-hand-title inline-block rounded-b-xl border-b-[0.14em] border-[var(--mg-pop-sun)] pb-[0.02em] text-[2.4rem] md:text-6xl">
            NOTRE VISION
          </h2>
          <p className="mt-6 max-w-[70rem] text-[1.5rem] font-black leading-[1.02] md:mt-8 md:text-5xl">
            Faire de la seconde main le premier reflexe des familles. Avec Le Mini Gang, nous voulons aider les familles
            a mieux consommer, sans renoncer ni au style, ni a la simplicite.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 md:mt-10 md:gap-6">
            <Link href="/vendre" className="mg-button mg-button-pink text-base md:text-lg">
              Vendre avec Mini Gang
            </Link>
            <Link href="/boutique" className="mg-button mg-button-yellow text-base md:text-lg">
              Voir les pieces
            </Link>
          </div>
        </div>
        <Image
          src="/brand/design/tee-shirt-blue.png"
          alt=""
          width={360}
          height={503}
          className="absolute -right-20 top-0 hidden w-[26rem] rotate-6 md:block"
        />
      </section>
    </div>
  );
}
