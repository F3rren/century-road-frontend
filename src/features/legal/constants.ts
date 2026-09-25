// Who runs the site: the data controller on the privacy page and the operator
// on the terms. Both values are printed on those pages exactly as written, so
// they have to be real.
export const OPERATOR_NAME = "Samuele Alessandro Di Silvestri";

// Base64, decoded at render time (ContactEmail.tsx), not a plain string here.
// A bundler's minifier constant-folds "a" + "b" string literals back into one
// at build time, so splitting the address into two consts wouldn't survive
// the production build — atob() is a runtime browser call, not something
// bundlers evaluate ahead of time, so this is the one split that actually
// keeps the address out of the shipped source as a plain, grep-able string.
// It only raises the bar against basic scrapers that regex the page/bundle
// for an email pattern — anything that runs a real browser still reads it
// off the rendered page, same as a human visitor does.
const CONTACT_EMAIL_B64 = "c2FtdWVsZWRpc2lsdmVzdHJpQGdtYWlsLmNvbQ==";
export function getContactEmail(): string {
  return atob(CONTACT_EMAIL_B64);
}
