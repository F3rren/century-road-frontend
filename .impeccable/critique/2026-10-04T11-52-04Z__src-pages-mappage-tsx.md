---
target: la Mappa (src/pages/MapPage.tsx)
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\Utente\\Desktop\\Progetti informatici\\century-road\\century-road-frontend\\src\\pages\\MapPage.tsx"
target_fingerprint: "sha256:19aec4821ff605dcbcf2efbd221ce28ab4f2abbd3a883fbf5b18327aa1edc967"
target_path: "C:\\Users\\Utente\\Desktop\\Progetti informatici\\century-road\\century-road-frontend\\src\\pages\\MapPage.tsx"
timestamp: 2026-10-04T11-52-04Z
slug: src-pages-mappage-tsx
closed: true
---
Method: dual-agent (A: a6a4cfbdd563e5682 · B: ae158e51de8be7477)

## Critica: la Mappa (`src/pages/MapPage.tsx`)

Verificata dal vivo il 4 ottobre 2026: 43 eventi, 17 collocati in un paese, 12 paesi "esposti" sulla mappa.

### Punteggio di salute del design

| # | Euristica | Voto | Problema principale |
|---|---|---|---|
| 1 | Visibilità dello stato del sistema | 2 | Scegliendo un paese dal selettore il globo non si muove. Se il paese è sull'altro emisfero (l'Australia) non cambia nulla di visibile. Su mobile, una richiesta fallita lascia un globo grigio. |
| 2 | Corrispondenza col mondo reale | 3 | Righe con l'anno in testa, "a.C.", "724 anni fa": naturali. Ma la mappa scrive "Italy" e "Россия" accanto a "Italia", e la nota di licenza mostra "(url)" e "(filePageUrl)". |
| 3 | Controllo e libertà | 3 | La finestra dell'evento si chiude bene. Esc non chiude il cassetto su mobile. Il paese non è nella URL, quindi Indietro esce dalla mappa. |
| 4 | Coerenza e standard | 3 | La X fa tre cose diverse (chiudi menu, chiudi cassetto, deseleziona paese). La stessa lista ha tre nomi. I controlli di MapLibre sono fuori sistema. |
| 5 | Prevenzione degli errori | 3 | Il selettore accetta solo paesi validi. Ma 1302, 1582 e 1830 compaiono sia in "In evidenza" sia in "Tutti gli eventi", con parole diverse: uno studente può contarli due volte. |
| 6 | Riconoscere anziché ricordare | 3 | Su mobile la legenda parte chiusa, quindi il blu non è spiegato. Il suggerimento "Clicca un paese…" sta in fondo a 5.600 px di lista. |
| 7 | Flessibilità ed efficienza | 3 | I tasti 1–5 e `/` funzionano. Ma `/` non fa nulla con un paese scelto, non c'è un link "salta al contenuto" (70 Tab per arrivare al selettore di proiezione) e il paese non è condivisibile via URL. |
| 8 | Estetica e minimalismo | 3 | Calma e piatta. Ma la lista predefinita conta 48 righe con doppioni, e le etichette nere della mappa pesano più del calore. |
| 9 | Recupero dagli errori | 2 | Le tessere della mappa hanno "Riprova". Gli eventi falliti hanno una riga da 12 px senza "Riprova", e su mobile non si vede proprio. |
| 10 | Aiuto e documentazione | 3 | "Come si usa" risponde alle domande sulla mappa. La nota della legenda non porta a "Dietro i dati". |
| **Totale** | | **28/40** | **Buono, al limite inferiore della fascia (28–35)** |

### Verdetto sulla specificità del design

**Valutazione (A): il pannello è d'autore, la mappa no.**
- **Pannello.** Le righe con l'anno Literata nel margine, i filetti, le piastre Prussia e il giallo solo sulla scelta attiva non potrebbero appartenere a un altro prodotto.
- **Segnali da template:** sui segnali di frontend-design la scansione degli stili calcolati è pulita. Nessun maiuscolo, nessuna spaziatura larga, nessun monospazio, nessuna ombra, nessun "·", nessun "→", nessun crema con terracotta, nessuna griglia a schede.
- **Mappa: il problema è qui.** La mappa è la Positron standard di OpenFreeMap, con le sue etichette, la pillola bianca dei crediti e l'alone azzurro di focus di MapLibre. Il calore è un normale coroplete blu. Tolto il pannello, questa mappa potrebbe stare in qualunque sito.
- **Audacia assegnata ma non spesa.** Il punto in cui il brief mette l'audacia (la mappa come esposizione cianotipica) è il più debole della pagina. Il pixel che salta più all'occhio è il "Globo" giallo, un'impostazione.

**Scansione deterministica (B).**
- **Detector da riga di comando:** 0 rilievi sui 16 file della superficie. Il risultato è autentico: un file di controllo volutamente sbagliato ne produce 4.
- **Dentro la pagina viva**, lo script di rilevamento ha trovato cose che il codice da solo non mostra:
  - **In accordo con A:** il salto di livello dei titoli (da `h1` a `h3`, perché "Accadde oggi" è un paragrafo), e il pulsante "Eventi" che copre all'83% il credito OpenStreetMap su mobile.
  - **Solo il detector:** la sidebar anima la propria larghezza, un movimento che DESIGN.md non prevede. La nota di licenza nella finestra dell'evento corre a circa 101 caratteri per riga, oltre i 65 del sistema.
  - **Falsi positivi:** i "contenitori che tagliano" (in realtà elementi `sr-only`), il testo "coperto" dietro la finestra modale nativa (voluto), e il testo "fuori viewport" su mobile. Quest'ultimo è il cassetto chiuso: innocuo come rilievo visivo, ma è lo stesso cassetto che A ha trovato ancora raggiungibile da tastiera.
  - **Contrasto del testo:** 0 fallimenti.

**Overlay visibili:** nessun overlay affidabile è comparso nel tuo browser. La finestra di Chrome risultava nascosta e fuori schermo, quindi le iniezioni sono andate a buon fine ma con ogni probabilità non le hai viste. Le viste esatte (1440×900 e 390×844) sono state verificate in Edge headless.

### Impressione generale

Il pannello degli eventi è la parte più riuscita del rebrand: si legge come un almanacco, e la finestra di un evento è il momento migliore della pagina. La mappa invece è rimasta un componente di serie con sopra la nostra palette. E il collegamento che il prodotto promette fra le due porte, il giorno e il paese, si interrompe proprio quando funziona: un paese *con* eventi oggi non porta da nessuna parte. La singola opportunità più grande è far diventare il globo una vera stampa cianotipica: carta, solo i paesi di oggi impressi in Prussia, leggibili a colpo d'occhio anche su un proiettore.

### Cosa funziona

1. **La riga evento.** L'anno guida nel margine e il testo Literata accanto: si legge come un almanacco, non come un feed.
2. **La finestra dell'evento.** È un `<dialog>` nativo letto come la didascalia di una stampa. Le immagini di prova restano a colori veri con il loro credito, e alla chiusura il focus torna sulla riga.
3. **I ponti onesti.** Il paese senza eventi porta al suo anno intero, la legenda dichiara il metodo ("Paese dedotto…"), e l'anello di focus giallo sui pannelli Prussia segue esattamente la specifica.

### Problemi prioritari

**[P1] Un paese con eventi non porta da nessuna parte**
- **Cosa:** il link a "Il mio secolo" compare solo quando il paese ha zero eventi oggi. L'Italia, con 3 eventi, mostra 3 righe e poi carta bianca: nessun link al suo anno intero e nessuna nota di licenza. Anche la finestra dell'evento non ha link interni.
- **Perché conta:** è il cuore del brief ("un paese porta al suo anno intero") e il quinto principio del prodotto. Oggi proprio i paesi con eventi sono vicoli ciechi.
- **Correzione:**
  - Sotto ogni lista di un paese, un link persistente "Tutto l'anno di {paese}" verso `/century?country=IT`, più la nota di licenza.
  - Nella finestra, "{paese} in tutto l'anno" quando l'evento ha un paese, e "Questo giorno nell'Archivio".
- **Comando:** `$impeccable shape`

**[P1] Il calore di oggi non si vede a colpo d'occhio**
- **Cosa:** misurato sul rendering, il gradino più chiaro ha contrasto 1,00:1 contro il mare e 1,52:1 contro la terra senza eventi. Oggi ci stanno 10 dei 12 paesi esposti. La vista iniziale lascia gli Stati Uniti (3 eventi) come una falce sul bordo del globo.
- **Perché conta:** è l'unica idea forte della pagina e la promessa del primo sguardo. WCAG 1.4.11 chiede 3:1 per la grafica che porta significato, e su un proiettore in classe questi azzurri spariscono.
- **Correzione:**
  - Ricalibrare la scala perché il gradino più chiaro superi 3:1 contro terra e mare.
  - Un contorno Prussia da 1 px sui paesi con eventi.
  - Etichette della mappa più leggere, in italiano (`name:it`).
  - Aprire il globo rivolto al centro del calore di oggi.
  - Verificare tutto con il contrasto calcolato, come per i token del testo.
- **Comando:** `$impeccable colorize`

**[P1] Su mobile il cassetto chiuso resta raggiungibile da tastiera**
- **Cosa:** sotto i 1024 px i tasti Tab finiscono sulla X, sul selettore e sulle righe del cassetto chiuso, fuori schermo e marcato `aria-hidden`. Il focus diventa invisibile.
- **Inoltre:**
  - `aria-live` avvolge l'intero pannello: cambiare paese rischia di far rileggere al lettore di schermo il selettore e 48 righe.
  - "Accadde oggi" non è un titolo, quindi si salta da `h1` a `h3`.
- **Perché conta:** rompe la soglia di accessibilità del prodotto ("piena operabilità da tastiera") ed è una violazione di `aria-hidden` con focus.
- **Correzione:**
  - `inert` sul cassetto chiuso, chiusura con Esc, focus dentro all'apertura e di ritorno sul pulsante "Eventi" alla chiusura.
  - `aria-live` solo su una riga di stato breve.
  - "Accadde oggi" come `h2`.
- **Comando:** `$impeccable harden`

**[P2] Focus e controlli della mappa sotto la soglia del sistema**
- **Cosa:**
  - L'anello di focus delle righe è tagliato da `content-visibility` e si riduce a due filetti, che sembrano divisori più spessi.
  - Zoom e bussola hanno l'alone azzurro di MapLibre e misurano 29×29 px su mobile.
  - La X della legenda misura circa 26 px.
  - Il testo della legenda è a 5,1:1 e 6,4:1, sotto la regola dei 7:1.
  - Le etichette accessibili di MapLibre sono in inglese.
  - Il pulsante "Eventi" copre il credito OpenStreetMap.
- **Correzione:**
  - `ring-inset` sulla riga.
  - L'anello giallo e 44 px sui controlli MapLibre.
  - La `locale` di MapLibre dalla lingua dell'interfaccia.
  - Testo della legenda almeno a white/80.
  - Spostare il credito o il pulsante.
- **Comando:** `$impeccable polish`

**[P2] Chi esplora finisce spesso nel vuoto**
- **Cosa:**
  - 162 dei 174 paesi del selettore non hanno eventi oggi, e nulla li distingue.
  - Le voci "In evidenza" si ripetono nella lista completa.
  - Il suggerimento d'uso sta in fondo a 5.600 px.
  - Su mobile il primo schermo non dice "oggi", e una richiesta fallita sembra un giorno vuoto.
- **Correzione:**
  - Nel selettore, un gruppo "Con eventi oggi (12)" sopra "Tutti i paesi".
  - Segnare le voci in evidenza dove stanno invece di ripeterle.
  - Sottotitoli per secolo nella lista.
  - Il suggerimento sotto il selettore.
  - Il pulsante mobile come "Accadde oggi, 4 ottobre".
  - Una piastra con "Riprova" quando gli eventi non arrivano.
- **Comando:** `$impeccable distill`

### Segnali d'allarme per persona

- **Sam (lettore di schermo e tastiera):**
  - il Tab entra nel cassetto nascosto;
  - l'anello delle righe è tagliato;
  - `aria-live` rilegge tutto il pannello;
  - i titoli saltano dall'`h1` all'`h3`;
  - le etichette di MapLibre sono in inglese.
- **Alex (utente esperto):**
  - 70 Tab per arrivare alla proiezione, senza link per saltare;
  - `/` muore quando un paese è scelto;
  - nessun `?country=` da condividere.
- **Casey (mobile):**
  - controlli di zoom da 29 px e X della legenda da 26 px;
  - il pulsante "Eventi" copre i crediti;
  - nella vista di un paese, due X identiche a 65 px l'una dall'altra.
  - Questo risolve la questione aperta del brief: una sola X (chiudi il cassetto) e "Tutti i paesi" come pulsante di testo.
- **Insegnante che proietta la mappa:**
  - il celeste sparisce sul proiettore;
  - lo stesso evento compare due volte con parole diverse;
  - la licenza mostra "(url)";
  - la vista di un paese non ha una nota di licenza da citare.
- **Esploratore curioso:** sceglie l'Australia e la mappa non si muove, nulla si illumina, il pannello è vuoto. Capita nel 93% delle scelte del selettore.

### Osservazioni minori

- Le etichette dell'acqua della mappa di base sono in corsivo, contro la regola "niente corsivo".
- La pillola dei crediti mantiene il raggio di 12 px: la nostra regola in `globals.css` ha specificità più bassa.
- Gli stati vuoti sono centrati, contro "il testo resta allineato a sinistra".
- Il cassetto mobile scorre in 300 ms e la sidebar anima la larghezza: due movimenti che DESIGN.md non elenca.
- "(o usa il menu sopra)" chiama "menu" un selettore.
- La nota di licenza nella finestra corre a circa 101 caratteri per riga.
- Nella vista di un paese su desktop, tre X stanno nell'angolo in alto a sinistra.
- Nessun errore in console in nessuna esecuzione.

### Domande da considerare

1. Se il 93% delle scelte dal selettore oggi è vuoto, scegliere un paese non dovrebbe aprire il suo anno intero, con gli eventi di oggi in cima?
2. Un globo nasconde sempre un emisfero, e questo contraddice "a colpo d'occhio". La vista piatta dovrebbe essere quella predefinita, o il globo dovrebbe aprirsi rivolto al calore di oggi?
3. E se la mappa di base fosse la carta stessa (niente mare grigio, etichette solo con lo zoom) e solo i paesi di oggi fossero impressi in Prussia, come una vera cianotipia?
4. Passare sopra una riga, o metterla a fuoco, dovrebbe illuminare il suo paese, così lista e globo funzionano come un solo strumento?
