import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";

interface LegalPageProps {
  title: string;
  description: string;
  children: ReactNode;
}

// The frame shared by the legal pages: a scrolling page with a readable column.
export function LegalPage({ title, description, children }: LegalPageProps) {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl space-y-8 pb-8">
        <PageHeader title={title} description={description} />
        {children}
      </div>
    </div>
  );
}
