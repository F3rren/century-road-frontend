import { getContactEmail } from "../constants";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A mailto link once a real address is set; anything else (a placeholder) is
// shown as text rather than as a link that opens an empty message to nobody.
// The address itself is decoded at render time (getContactEmail, not a plain
// constant) so it's never a plain grep-able string in the shipped source —
// see the comment on it for what that does and doesn't defend against.
export function ContactEmail() {
  const email = getContactEmail();
  if (!EMAIL_PATTERN.test(email)) return <>{email}</>;

  return (
    <a
      href={`mailto:${email}`}
      className="text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {email}
    </a>
  );
}
