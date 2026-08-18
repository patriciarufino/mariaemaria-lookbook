import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";

import { getSiteContent } from "@/lib/public-content.functions";
import { useTrackVisit } from "@/lib/track-visit";
import { LookCard } from "@/components/look-card";
import { LookRotator } from "@/components/look-rotator";
import { Brand, RichText } from "@/components/rich-text";

const contentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteContent(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQuery),
  head: () => ({
    meta: [
      { title: "Maria e Maria — Lookbook Sob Medida" },
      {
        name: "description",
        content:
          "Lookbook digital Maria e Maria — Curadoria 2026. Vestidos, conjuntos e macacões selecionados peça a peça.",
      },
      { property: "og:title", content: "Maria e Maria — Lookbook Sob Medida" },
      {
        property: "og:description",
        content: "Uma coleção autoral onde moda e cliente se encontram. Lookbook — Curadoria 2026.",
      },
    ],
  }),
  errorComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-6 text-center text-muted-foreground">
      Não foi possível carregar o lookbook agora. Atualize a página.
    </div>
  ),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(contentQuery);
  useTrackVisit("/");
  const t = (key: string, fallback = "") => data.texts[key] ?? fallback;
  const on = (key: string) => data.sections[key] !== false;

  const number = data.settings["whatsapp_number"] ?? "";
  const defaultMessage = data.settings["whatsapp_default_message"] ?? "";
  const buttonLabel = data.settings["whatsapp_button_text"] || t("look_button", "Quero este look");

  const mosaic = data.looks
    .flatMap((l) => [l.full_look_image, l.detail_image])
    .filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-background">
      {on("hero") && (
        <header className="border-b border-border px-6 py-16 text-center md:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            <div className="flex items-center gap-4">
              <span className="hidden h-px w-12 bg-border sm:block" />
              <p className="eyebrow">{t("topbar_eyebrow")}</p>
              <span className="hidden h-px w-12 bg-border sm:block" />
            </div>

            <Brand className="mt-16 font-serif text-3xl tracking-[0.12em] text-brand md:text-4xl" />

            <p className="mt-16 font-serif text-2xl italic leading-relaxed text-brand md:text-[1.75rem]">
              {t("topbar_quote")}
            </p>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t("topbar_subtitle")}
            </p>
          </div>
        </header>
      )}

      <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5">
          <Brand className="font-serif text-[0.7rem] tracking-[0.18em] text-brand" />
          <div className="flex items-center gap-8 text-sm text-foreground">
            <a href="#colecao" className="transition-opacity hover:opacity-60">
              {t("nav_link_1")}
            </a>
            <a href="#novidades" className="transition-opacity hover:opacity-60">
              {t("nav_link_2")}
            </a>
          </div>
        </div>
      </nav>

      {on("hero") && (
        <section className="border-b border-border px-6 py-24 text-center md:py-32">
          <div className="mx-auto max-w-4xl">
            <p className="eyebrow">{t("hero_eyebrow")}</p>
            <h1 className="display mt-8 text-[2.75rem] md:text-[4.5rem]">
              <RichText value={t("hero_title")} />
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
              {t("hero_subtitle")}
            </p>
            <a
              href="#colecao"
              className="mt-12 inline-flex items-center justify-center bg-primary px-10 py-4 text-[0.72rem] uppercase tracking-[0.32em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("hero_cta")}
            </a>
          </div>
        </section>
      )}

      {on("colecao") && (
        <section id="colecao" className="px-6 py-24 md:py-28">
          <div className="mx-auto max-w-[1200px]">
            <p className="eyebrow">{t("collection_eyebrow")}</p>
            <h2 className="display mt-4 text-[2.5rem] md:text-5xl">{t("collection_title")}</h2>
            <p className="mt-6 max-w-3xl text-[0.95rem] leading-relaxed text-muted-foreground">
              {t("collection_description")}
            </p>

            <div className="mt-14">
              <LookRotator looks={data.looks} label="Em destaque agora" />
            </div>


            <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {data.looks.map((look) => (
                <LookCard
                  key={look.id}
                  look={look}
                  buttonLabel={buttonLabel}
                  whatsappHref={waHref(number, look.whatsapp_message || defaultMessage)}
                  consultants={data.consultants}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {on("lookbook") && (
        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[220px_1fr] lg:gap-16">
            <div>
              <p className="eyebrow">{t("lookbook_eyebrow")}</p>
              <h2 className="display mt-6 text-[2.25rem]">{t("lookbook_title")}</h2>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                {t("lookbook_description")}
              </p>
              <Link
                to="/lookbook"
                className="mt-8 inline-flex items-center justify-center bg-primary px-8 py-4 text-[0.72rem] uppercase leading-relaxed tracking-[0.32em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t("lookbook_cta")}
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {mosaic.map((src) => (
                <Link key={src} to="/lookbook" className="block">
                  <img
                    src={src}
                    alt="Peça da coleção Maria e Maria"
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover transition-opacity hover:opacity-80"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {on("sempre_novo") && (
        <section id="novidades" className="bg-surface-alt px-6 py-28 text-center">
          <div className="mx-auto max-w-2xl">
            <p className="eyebrow">{t("new_eyebrow")}</p>
            <h2 className="display mt-6 text-[2.5rem] md:text-[3.25rem]">{t("new_title")}</h2>
            <p className="mt-8 text-[0.95rem] leading-relaxed text-muted-foreground">
              {t("new_description")}
            </p>
          </div>
        </section>
      )}

      {on("rodape") && (
        <footer className="px-6 py-20 text-center">
          <Brand className="font-serif text-xl tracking-[0.12em] text-brand" />
          <p className="mx-auto mt-8 max-w-xl font-serif text-lg italic leading-relaxed text-muted-foreground">
            {t("footer_message")}
          </p>
          <p className="mt-10 text-xs text-muted-foreground">{t("footer_copyright")}</p>
        </footer>
      )}

      {number && (
        <a
          href={waHref(number, defaultMessage)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar no WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      )}
    </div>
  );
}
