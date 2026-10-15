import { useTranslation } from 'react-i18next';

// Said once at the top of every page of the editorial content, rather than left for the reader to
// find out: the texts are drafts written with the help of an AI and not yet reviewed by a person
// (the sources are shown with each one), and they exist in Italian only, whatever the interface
// language.
export function EditorialNotice() {
  const { t, i18n } = useTranslation();
  return (
    <div className="space-y-1 text-sm text-muted-foreground">
      <p>{t('editorial.draft')}</p>
      {i18n.language !== 'it' && <p>{t('editorial.italianOnly')}</p>}
    </div>
  );
}
