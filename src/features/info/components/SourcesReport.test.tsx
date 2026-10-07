import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import i18n from '@/i18n';
import { api } from '@/services/api';
import type { SourcesData } from '@/features/history';
import { SourcesReport } from './SourcesReport';

vi.mock('@/services/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

// What GET /api/history/sources answers, as the backend's own controller serialised it (run over
// the real editorial content): the project's own source has `url`, `license` and `licenseUrl` as an
// explicit null, and `lastReviewedAt` is null while no insight has been reviewed.
const REAL: SourcesData = {
  "sources": [
    {
      "id": "wikipedia-on-this-day",
      "name": "Wikipedia - Accadde oggi",
      "provides": "Gli eventi, le nascite, le morti e le ricorrenze di ogni giorno, con gli articoli collegati, nelle edizioni italiana e inglese.",
      "url": "https://it.wikipedia.org/",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "attributionRequired": true
    },
    {
      "id": "wikimedia-commons",
      "name": "Wikimedia Commons",
      "provides": "Le immagini: solo file ospitati su Commons, ciascuno con la propria licenza e il proprio autore, indicati nella pagina del file.",
      "url": "https://commons.wikimedia.org/",
      "license": "Per file",
      "licenseUrl": null,
      "attributionRequired": true
    },
    {
      "id": "natural-earth",
      "name": "Natural Earth",
      "provides": "I confini dei paesi (scala 1:110m) con cui la mappa e l'indice per paese collocano gli eventi.",
      "url": "https://www.naturalearthdata.com/",
      "license": "Pubblico dominio",
      "licenseUrl": "https://www.naturalearthdata.com/about/terms-of-use/",
      "attributionRequired": false
    },
    {
      "id": "century-road-editorial",
      "name": "Century Road - percorsi e approfondimenti",
      "provides": "I percorsi guidati e i blocchi «Perché conta»: bozze redatte con l'aiuto di un'intelligenza artificiale a partire dalle fonti elencate in ciascuno, non ancora riviste da una persona.",
      "url": null,
      "license": null,
      "licenseUrl": null,
      "attributionRequired": false
    }
  ],
  "coverage": {
    "index": [
      {
        "language": "it",
        "eventCount": 6800,
        "countryCount": 140,
        "oldestYear": -3000,
        "newestYear": 2025,
        "indexedAt": "2026-10-02T01:00:00Z"
      }
    ],
    "editorial": {
      "paths": 1,
      "insights": 9,
      "reviewedInsights": 0,
      "lastReviewedAt": null
    }
  },
  "limits": [
    {
      "code": "NOT_A_COMPLETE_LIST",
      "message": "Gli eventi sono quelli che Wikipedia elenca nelle pagine «Accadde oggi»: non sono un elenco completo di ciò che accadde, né una selezione fatta da Century Road."
    },
    {
      "code": "NOT_VERIFIED",
      "message": "Century Road non verifica i testi di Wikipedia: ne mostra la provenienza, non un'etichetta di affidabilità. Solo un approfondimento con una data di revisione è stato controllato da una persona sulle sue fonti."
    },
    {
      "code": "ONLY_PLACED_EVENTS",
      "message": "Le viste per paese e «Nello stesso periodo» contengono solo gli eventi con un anno il cui luogo la mappa riesce a collocare in un paese: circa la metà. Restano fuori quelli in mare e quelli in territori che la mappa non ha, come il Kosovo."
    },
    {
      "code": "TODAYS_COUNTRIES",
      "message": "I paesi sono quelli di oggi: un evento antico è attribuito al paese in cui cade oggi il suo luogo, non a quello che esisteva allora."
    },
    {
      "code": "ITALIAN_FEED_GAPS",
      "message": "L'edizione italiana di Wikipedia non ha nascite e morti: arrivano dall'inglese e sono indicate come tali."
    },
    {
      "code": "INDEX_LAGS",
      "message": "L'indice per paese viene ricostruito ogni notte: può essere indietro di un giorno rispetto a Wikipedia."
    },
    {
      "code": "APPROXIMATE_DATES_AND_PLACES",
      "message": "Una data può dipendere dal fuso orario e un luogo può essere solo quello di partenza di un evento avvenuto altrove, come la Luna: quando accade, la scheda lo dice."
    }
  ]
};

beforeEach(() => {
  vi.mocked(api.get).mockReset();
});

describe('SourcesReport, on the backend\'s real answer', () => {
  it('reads an explicit null as "no licence chosen", never printing it', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: REAL });
    const { container } = render(<SourcesReport />);
    expect(await screen.findByText('Century Road - percorsi e approfondimenti')).toBeInTheDocument();
    expect(screen.getByText(t('methodology.sources.noLicense'))).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/null|undefined/);
  });

  it('links a licence that has a page, and writes one that has none as plain text', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: REAL });
    render(<SourcesReport />);
    await screen.findByText('Wikipedia - Accadde oggi');
    expect(screen.getByRole('link', { name: /CC BY-SA 4\.0/ })).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by-sa/4.0/',
    );
    // "Per file" (Wikimedia Commons) has no licenseUrl: text, not a link to nowhere.
    expect(screen.getByText(/^Per file/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Per file/ })).not.toBeInTheDocument();
  });

  it('shows no review date, and no "verified", while nothing was reviewed', async () => {
    vi.mocked(api.get).mockResolvedValue({ success: true, data: REAL });
    const { container } = render(<SourcesReport />);
    await screen.findByText(t('methodology.sources.reviewed'));
    expect(screen.queryByText(t('methodology.sources.lastReviewed'))).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/verificat/i);
  });

  it('says the index is being prepared when it holds nothing yet', async () => {
    vi.mocked(api.get).mockResolvedValue({
      success: true,
      data: { ...REAL, coverage: { ...REAL.coverage, index: [] } },
    });
    render(<SourcesReport />);
    expect(await screen.findByText(t('methodology.sources.indexEmpty'))).toBeInTheDocument();
  });
});
