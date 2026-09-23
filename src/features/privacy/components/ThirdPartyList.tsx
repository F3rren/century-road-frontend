import { ExternalAnchor } from "@/components/ui/ExternalAnchor";
import type { ThirdParty } from "../data/thirdParties";

interface ThirdPartyListProps {
  providers: readonly ThirdParty[];
}

// Stacked blocks rather than a table: a table of four wide columns would have
// to scroll sideways on a phone.
export function ThirdPartyList({ providers }: ThirdPartyListProps) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {providers.map((provider) => (
        <li key={provider.id} className="py-4">
          <h3 className="font-display text-base font-semibold tracking-wide">
            {provider.name}
          </h3>
          <p className="font-mono text-[11px] text-muted-foreground">
            {provider.hosts.join(" · ")}
          </p>
          <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[8rem_1fr]">
            <dt className="text-muted-foreground">Cosa riceve</dt>
            <dd>{provider.receives}</dd>
            <dt className="text-muted-foreground">A cosa serve</dt>
            <dd>{provider.purpose}</dd>
            <dt className="text-muted-foreground">Informativa</dt>
            <dd>
              <ExternalAnchor
                href={provider.policyUrl}
                className="inline-flex min-h-11 items-center text-primary"
              >
                Informativa sulla privacy di {provider.name}
              </ExternalAnchor>
            </dd>
          </dl>
        </li>
      ))}
    </ul>
  );
}
