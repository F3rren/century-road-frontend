import { CONTACT_EMAIL } from "../constants";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A mailto link once a real address is set; anything else (a placeholder) is
// shown as text rather than as a link that opens an empty message to nobody.
export function ContactEmail() {
  if (!EMAIL_PATTERN.test(CONTACT_EMAIL)) return <>{CONTACT_EMAIL}</>;

  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {CONTACT_EMAIL}
    </a>
  );
}
