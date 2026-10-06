interface PageHeaderProps {
  title: string;
  description?: string;
  // Set when the title and description are in another language than the interface's
  // (the hand-written content is Italian only).
  lang?: string;
}

export function PageHeader({ title, description, lang }: PageHeaderProps) {
  return (
    <div lang={lang} className="border-b border-border pb-4">
      <h1 className="text-page-title font-display">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
