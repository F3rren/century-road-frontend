// Every outside service the browser talks to while the site is in use, with
// what each one receives. The hosts come from the code (MapView.tsx) and from
// the requests measured in a real session; keep this list in step with them.
export interface ThirdParty {
  id: string;
  name: string;
  hosts: readonly string[];
  receives: string;
  purpose: string;
  policyUrl: string;
}

export const THIRD_PARTIES: readonly ThirdParty[] = [
  {
    id: "openfreemap",
    name: "OpenFreeMap",
    hosts: ["tiles.openfreemap.org"],
    receives:
      "Il tuo indirizzo IP e le tessere della mappa richieste, che indicano la zona che stai guardando.",
    purpose:
      "Mostrare la mappa di base: stile, tessere, caratteri e simboli.",
    policyUrl: "https://openfreemap.org/privacy/",
  },
  {
    id: "cloudfront",
    name: "Amazon CloudFront",
    hosts: ["d2ad6b4ur7yvpq.cloudfront.net"],
    receives: "Il tuo indirizzo IP e la richiesta del file.",
    purpose:
      "Scaricare i confini dei paesi (dati Natural Earth), usati per colorare e selezionare i paesi sulla mappa.",
    policyUrl: "https://aws.amazon.com/privacy/",
  },
  {
    id: "wikimedia",
    name: "Wikimedia",
    hosts: ["upload.wikimedia.org", "thumb.wikimedia.org"],
    receives:
      "Il tuo indirizzo IP, il browser che usi e l'indirizzo del sito da cui parte la richiesta.",
    purpose:
      "Mostrare le immagini degli articoli collegati a un evento, solo quando ne apri i dettagli.",
    policyUrl: "https://foundation.wikimedia.org/wiki/Policy:Privacy_policy",
  },
  {
    id: "hosting",
    name: "Railway (hosting)",
    hosts: ["il dominio del sito e quello dell'API"],
    receives:
      "Il tuo indirizzo IP, data e ora, la pagina o il dato richiesto e informazioni sul browser, come su ogni server web.",
    purpose:
      "Consegnare il sito, rispondere alla richiesta degli eventi e garantire sicurezza e funzionamento del servizio.",
    policyUrl: "https://railway.com/legal/privacy",
  },
];
