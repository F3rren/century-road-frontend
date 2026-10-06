import { useTranslation } from 'react-i18next';

// The hand-written content exists in Italian only, whatever the interface language: said once at
// the top of every page of it, rather than left for the reader to find out.
export function EditorialNotice() {
  const { t, i18n } = useTranslation();
  if (i18n.language === 'it') return null;
  return <p className="text-sm text-muted-foreground">{t('editorial.italianOnly')}</p>;
}
