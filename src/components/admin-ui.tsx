export const inputClass =
  "w-full border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring";

export const labelClass =
  "block text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground";

export const buttonClass =
  "inline-flex items-center justify-center bg-primary px-6 py-2.5 text-[0.68rem] uppercase tracking-[0.24em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50";

export const ghostButtonClass =
  "inline-flex items-center justify-center border border-border px-4 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50";

export function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8">
      <h1 className="font-serif text-3xl text-brand">{title}</h1>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="border border-border bg-background p-6">{children}</div>;
}
