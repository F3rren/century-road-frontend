import { useEffect } from "react";
import { BRAND_NAME } from "@/components/ui/Wordmark";

const DESCRIPTION_SELECTOR = 'meta[name="description"]';

function getDescriptionTag(): HTMLMetaElement {
  let tag = document.querySelector<HTMLMetaElement>(DESCRIPTION_SELECTOR);
  if (!tag) {
    // Defensive only — index.html always ships this tag as the static,
    // non-JS-visible default, so this branch shouldn't run in practice.
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
    document.head.appendChild(tag);
  }
  return tag;
}

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} · ${BRAND_NAME}`;
    getDescriptionTag().setAttribute("content", description);
  }, [title, description]);
}
