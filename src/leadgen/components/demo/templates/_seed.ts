import type { OpeningHoursEntry, PageModel } from "@maps/core";

/**
 * Seed data for the local template preview harness (`/preview/[template]`).
 * Lets us iterate on a template with realistic content + photos WITHOUT
 * scraping or calling the LLM. Not used in production rendering.
 */
export interface SeedDemo {
  model: PageModel;
  rating: number;
  reviewCount: number;
  photos: string[];
  openingHours: OpeningHoursEntry[];
}

const UNSPLASH = (id: string, w = 1100) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const RISTORANTE_SEED: SeedDemo = {
  rating: 4.7,
  reviewCount: 318,
  photos: [
    UNSPLASH("1517248135467-4c7edcad34c4", 1600), // interior / hero
    UNSPLASH("1481931098730-318b6f776db0"), // pasta
    UNSPLASH("1559339352-11d035aa65de"), // plated dish
    UNSPLASH("1414235077428-338989a2e8c0"), // table ambiance
    UNSPLASH("1551183053-bf91a1d81141"), // dessert
    UNSPLASH("1555396273-367ea4eb4db5"), // sharing plates
    UNSPLASH("1504674900247-0877df9cc836"), // food plate
  ],
  openingHours: [
    { day: "Lunedì", hours: "Chiuso" },
    { day: "Martedì – Giovedì", hours: "12:30–15:00 · 19:30–23:00" },
    { day: "Venerdì – Sabato", hours: "12:30–15:30 · 19:30–23:30" },
    { day: "Domenica", hours: "12:30–15:30" },
  ],
  model: {
    meta: {
      businessName: "Osteria del Borgo Antico",
      category: "Ristorante",
      tagline: "Cucina pugliese · dal 1987",
      lang: "it",
    },
    theme: { preset: "restaurant" },
    hero: {
      headline: "Il sapore vero della Puglia, a tavola",
      sub: "Materie prime del territorio, pasta fatta a mano e una cantina che racconta i nostri vini. Nel cuore della città vecchia di Bari.",
      ctaLabel: "Prenota un tavolo",
    },
    services: [
      { title: "Pasta fatta a mano", desc: "Orecchiette, cavatelli e tagliolini tirati ogni mattina dalle nostre sfogline." },
      { title: "Materie prime locali", desc: "Pesce dell'Adriatico, ortaggi dei contadini pugliesi e olio EVO del nostro frantoio di fiducia." },
      { title: "La cantina", desc: "Oltre 120 etichette, con una selezione dedicata ai vitigni autoctoni di Puglia." },
      { title: "Eventi e cerimonie", desc: "Sale riservate per cene aziendali, compleanni e ricorrenze, con menù su misura." },
    ],
    testimonials: [
      { quote: "Orecchiette come quelle della nonna. Servizio gentile e ambiente curato, torneremo di sicuro.", author: "Marco T.", rating: 5 },
      { quote: "Pesce freschissimo e una carta dei vini sorprendente. Uno dei migliori ristoranti della città vecchia.", author: "Giulia R.", rating: 5 },
      { quote: "Atmosfera autentica nel cuore di Bari vecchia. Prezzi onesti per la qualità proposta.", author: "Antonio L.", rating: 4 },
    ],
    about: {
      title: "Tre generazioni in cucina",
      body: "Dal 1987 la famiglia Lorusso porta in tavola la vera tradizione pugliese. Quello che è iniziato come una piccola trattoria a conduzione familiare è oggi un punto di riferimento della città vecchia, dove ogni piatto nasce dalle ricette tramandate dalla nonna e dai prodotti dei produttori del territorio che conosciamo da una vita.",
    },
    contact: {
      phone: "+39 080 123 4567",
      address: "Strada Vallisa 12, Bari Vecchia",
      ctaLabel: "Prenota il tuo tavolo",
      note: "Aperto a pranzo e a cena. Prenotazione consigliata nel fine settimana.",
    },
    menu: {
      note: "Esempio di carta — i piatti cambiano con la stagione e la disponibilità del mercato.",
      sections: [
        {
          name: "Antipasti",
          items: [
            { name: "Tagliere di salumi e formaggi pugliesi", desc: "Capocollo di Martina Franca, caciocavallo podolico, burrata di Andria.", price: "€14" },
            { name: "Polpo arrostito", desc: "Su crema di ceci e cicoria ripassata.", price: "€12" },
            { name: "Sformatino di verdure di stagione", price: "€9" },
          ],
        },
        {
          name: "Primi",
          items: [
            { name: "Orecchiette alle cime di rapa", desc: "Il nostro classico, con acciuga e mollica croccante.", price: "€11" },
            { name: "Cavatelli ai frutti di mare", desc: "Cozze, vongole e gamberi dell'Adriatico.", price: "€14" },
            { name: "Tagliolini al ragù di braciole", price: "€12" },
          ],
        },
        {
          name: "Secondi",
          items: [
            { name: "Frittura di paranza", desc: "Pesce fresco del giorno.", price: "€16" },
            { name: "Tagliata di manzo podolico", desc: "Con rucola e scaglie di grana.", price: "€18" },
            { name: "Branzino al forno con patate", price: "€17" },
          ],
        },
        {
          name: "Dolci",
          items: [
            { name: "Tiramisù della casa", price: "€6" },
            { name: "Sporcamuss", desc: "Pasta sfoglia e crema, il dolce tipico barese.", price: "€5" },
            { name: "Cartellate al vincotto", price: "€6" },
          ],
        },
      ],
    },
  },
};

const IDRAULICA_SEED: SeedDemo = {
  rating: 4.9,
  reviewCount: 240,
  // Placeholder images for the preview only — real demos use Google Maps photos.
  photos: [0, 1, 2, 3, 4, 5, 6].map((i) => `https://picsum.photos/seed/idra${i}/1200/800`),
  openingHours: [
    { day: "Lunedì – Venerdì", hours: "8:00–19:00" },
    { day: "Sabato", hours: "8:00–13:00" },
    { day: "Pronto intervento", hours: "24 ore su 24, 7 giorni su 7" },
  ],
  model: {
    meta: { businessName: "Idraulica Lariana", category: "Idraulico", tagline: "Idraulico a Como dal 2009", lang: "it" },
    theme: { preset: "artisan" },
    hero: {
      headline: "Un guasto in casa? Arriviamo in giornata.",
      sub: "Riparazioni, perdite, caldaie e spurghi a Como e provincia. Idraulici certificati e assicurati, prezzi chiari prima di iniziare e pronto intervento attivo 24 ore su 24.",
      ctaLabel: "Richiedi un preventivo",
    },
    services: [
      { title: "Pronto intervento 24/7", desc: "Allagamenti, tubi rotti, perdite improvvise. Reperibili giorno e notte, anche nei festivi." },
      { title: "Riparazione perdite", desc: "Individuazione e riparazione di perdite su tubature, raccordi e scarichi, anche sotto traccia." },
      { title: "Caldaie e scaldabagni", desc: "Installazione, manutenzione e riparazione di caldaie, boiler e impianti di riscaldamento." },
      { title: "Spurghi e disostruzioni", desc: "Disostruzione di lavandini, WC e colonne di scarico con attrezzatura professionale." },
      { title: "Bagni e sanitari", desc: "Sostituzione e installazione di sanitari, docce e box doccia, con rifacimento impianti." },
      { title: "Rubinetteria e impianti", desc: "Riparazione e sostituzione di miscelatori, rubinetti e adeguamento degli impianti idrici." },
    ],
    testimonials: [
      { quote: "Tubo rotto in cucina di domenica sera. Ho chiamato e in mezz'ora erano a casa. Lavoro pulito e prezzo onesto, niente sorprese.", author: "Giulia M.", rating: 5 },
      { quote: "Hanno sostituito la caldaia in giornata e spiegato tutto con calma. Persone serie e competenti, li ho già consigliati ai vicini.", author: "Roberto B.", rating: 5 },
      { quote: "Preventivo chiaro prima di iniziare e rispettato al centesimo. Bagno rifatto a regola d'arte. Finalmente un idraulico di cui fidarsi.", author: "Sara F.", rating: 5 },
    ],
    about: {
      title: "Professionisti veri, non improvvisazione",
      body: "Idraulici qualificati che lavorano nel comasco da oltre quindici anni. Massima serietà, materiali certificati e rispetto della tua casa: copriamo, proteggiamo e lasciamo tutto in ordine come l'abbiamo trovato.",
    },
    contact: {
      phone: "333 366 5558",
      address: "Como città e provincia — Cantù, Erba, Mariano, Lomazzo e dintorni",
      ctaLabel: "Raccontaci il problema, ti richiamiamo subito",
      note: "Compila il modulo o chiamaci direttamente. Per le emergenze il telefono è la via più veloce.",
    },
  },
};

const PIZZERIA_SEED: SeedDemo = {
  rating: 4.8,
  reviewCount: 512,
  photos: RISTORANTE_SEED.photos,
  openingHours: [
    { day: "Lunedì", hours: "Chiuso" },
    { day: "Martedì – Domenica", hours: "19:00–23:30" },
  ],
  model: {
    meta: { businessName: "Pizzeria Da Michele al Borgo", category: "Pizzeria", tagline: "Forno a legna dal 1992", lang: "it" },
    theme: { preset: "restaurant" },
    restaurantStyle: "pizzeria",
    hero: {
      headline: "La vera pizza napoletana, nel forno a legna",
      sub: "Impasto a lunga lievitazione, ingredienti DOP del territorio e cottura nel forno a legna a 450°. Asporto e domicilio in tutta la zona.",
      ctaLabel: "Prenota un tavolo",
    },
    services: [
      { title: "Impasto 48 ore", desc: "Lunga lievitazione naturale per una pizza leggera e digeribile." },
      { title: "Forno a legna", desc: "Cottura a 450° su pietra refrattaria, come tradizione vuole." },
      { title: "Ingredienti DOP", desc: "Mozzarella di bufala campana, San Marzano e olio EVO del frantoio." },
      { title: "Asporto e domicilio", desc: "Ordina e ritira, o te la portiamo a casa calda e fragrante." },
    ],
    testimonials: [
      { quote: "La miglior margherita della zona, cornicione alto e leggero. Si sente l'impasto fatto bene.", author: "Davide P.", rating: 5 },
      { quote: "Forno a legna vero, ingredienti di qualità e prezzi giusti. Ci torniamo ogni venerdì.", author: "Elena R.", rating: 5 },
      { quote: "Pizza fragrante e servizio veloce anche con il locale pieno. Promossa a pieni voti.", author: "Luca M.", rating: 4 },
    ],
    about: {
      title: "Dal 1992, la pizza come una volta",
      body: "Tre generazioni di pizzaioli, lo stesso forno a legna e la stessa passione. Selezioniamo materie prime del territorio e curiamo ogni impasto con lievitazioni lunghe per offrirti una pizza leggera, profumata e autentica.",
    },
    contact: {
      phone: "081 123 4567",
      address: "Via del Borgo 8, Napoli",
      ctaLabel: "Prenota il tuo tavolo",
      note: "Aperto tutte le sere. Prenotazione consigliata nel fine settimana.",
    },
    menu: {
      note: "Esempio di carta — le pizze cambiano con la stagione.",
      sections: [
        { name: "Pizze classiche", items: [
          { name: "Margherita", desc: "San Marzano, fiordilatte, basilico, EVO.", price: "€6" },
          { name: "Marinara", desc: "Pomodoro, aglio, origano, EVO.", price: "€5" },
          { name: "Diavola", desc: "Fiordilatte, salame piccante.", price: "€8" },
        ] },
        { name: "Pizze speciali", items: [
          { name: "Bufala e crudo", desc: "Mozzarella di bufala DOP, prosciutto crudo.", price: "€11" },
          { name: "Tartufo e funghi", desc: "Crema di tartufo, funghi porcini, scaglie.", price: "€12" },
          { name: "Ortolana", desc: "Verdure di stagione grigliate.", price: "€9" },
        ] },
        { name: "Fritti", items: [
          { name: "Montanara", desc: "Pizza fritta con pomodoro e provola.", price: "€5" },
          { name: "Crocchè e arancini", price: "€4" },
        ] },
        { name: "Dolci", items: [
          { name: "Tiramisù della casa", price: "€5" },
          { name: "Pizza alla nutella", price: "€7" },
        ] },
      ],
    },
  },
};

const PESCE_SEED: SeedDemo = {
  rating: 4.8, reviewCount: 367, photos: RISTORANTE_SEED.photos,
  openingHours: [
    { day: "Lunedì", hours: "Chiuso" },
    { day: "Martedì – Domenica", hours: "12:30–15:00 · 19:30–23:00" },
  ],
  model: {
    meta: { businessName: "Ristorante La Conchiglia", category: "Ristorante di pesce", tagline: "Cucina di mare dal 1998", lang: "it" },
    theme: { preset: "restaurant" }, restaurantStyle: "pesce",
    hero: { headline: "Il mare, ogni giorno nel piatto", sub: "Pescato fresco dell'asta del porto, crudi di stagione e una cantina di bianchi del territorio. A due passi dal lungomare.", ctaLabel: "Prenota un tavolo" },
    services: [
      { title: "Pescato del giorno", desc: "Direttamente dall'asta del porto, selezionato ogni mattina." },
      { title: "Crudi e ostriche", desc: "Crudo di gambero rosso, ostriche e tartare di tonno." },
      { title: "Cantina di mare", desc: "Bianchi e bollicine selezionati per esaltare il pesce." },
      { title: "Terrazza sul mare", desc: "Tavoli all'aperto con vista, su prenotazione." },
    ],
    testimonials: [
      { quote: "Pesce freschissimo e crudi spettacolari. Vista mare e servizio impeccabile, torneremo.", author: "Chiara V.", rating: 5 },
      { quote: "Il crudo di gambero rosso è il migliore mai provato. Cantina di bianchi notevole.", author: "Marco D.", rating: 5 },
      { quote: "Ambiente elegante e piatti curati. Prezzo giusto per la qualità del pescato.", author: "Anna P.", rating: 4 },
    ],
    about: { title: "Dal porto alla tavola, da tre generazioni", body: "La nostra famiglia lavora il pesce da sempre. Ogni mattina scegliamo personalmente il pescato all'asta del porto e lo portiamo in tavola nel rispetto della tradizione marinara, con tecnica e materia prima di prima qualità." },
    contact: { phone: "0831 123 456", address: "Lungomare Colombo 14, Gallipoli", ctaLabel: "Prenota il tuo tavolo", note: "Terrazza sul mare su prenotazione. Consigliata nel fine settimana." },
    menu: { note: "Esempio di carta — cambia col pescato del giorno.", sections: [
      { name: "Crudi", items: [{ name: "Crudo di gambero rosso", price: "€16" }, { name: "Ostriche (6 pz)", price: "€18" }, { name: "Tartare di tonno", desc: "Con avocado e agrumi.", price: "€14" }] },
      { name: "Primi", items: [{ name: "Spaghetti alle vongole", price: "€14" }, { name: "Risotto ai frutti di mare", price: "€16" }, { name: "Linguine all'astice", price: "€22" }] },
      { name: "Secondi", items: [{ name: "Frittura di paranza", price: "€18" }, { name: "Branzino all'acqua pazza", price: "€20" }, { name: "Grigliata mista di pesce", price: "€24" }] },
      { name: "Dolci", items: [{ name: "Semifreddo al limone", price: "€6" }, { name: "Cannolo siciliano", price: "€6" }] },
    ] },
  },
};

const CARNE_SEED: SeedDemo = {
  rating: 4.9, reviewCount: 421, photos: RISTORANTE_SEED.photos,
  openingHours: [
    { day: "Lunedì – Giovedì", hours: "19:00–23:00" },
    { day: "Venerdì – Domenica", hours: "12:30–15:00 · 19:00–23:30" },
  ],
  model: {
    meta: { businessName: "Braceria Il Tizzone", category: "Braceria", tagline: "Carne alla brace dal 2005", lang: "it" },
    theme: { preset: "restaurant" }, restaurantStyle: "carne",
    hero: { headline: "Carne, fuoco e legna", sub: "Tagli selezionati, frollatura curata e cottura sulla brace di legna. Dalla Fiorentina alla picanha, nel cuore della montagna.", ctaLabel: "Prenota un tavolo" },
    services: [
      { title: "Tagli selezionati", desc: "Fiorentina, costata, picanha e tagli del giorno scelti dal nostro macellaio." },
      { title: "Frollatura", desc: "Carni frollate in cella dedicata per sapore e tenerezza." },
      { title: "Brace di legna", desc: "Cottura su fuoco vivo di legna, come tradizione." },
      { title: "Cantina di rossi", desc: "Etichette robuste per accompagnare la carne." },
    ],
    testimonials: [
      { quote: "Fiorentina cotta alla perfezione, frollatura che si sente. Una delle migliori braci della zona.", author: "Giorgio L.", rating: 5 },
      { quote: "Carne di qualità altissima e ambiente caldo in stile baita. Servizio attento.", author: "Paolo R.", rating: 5 },
      { quote: "Tagli eccezionali e cantina di rossi notevole. Tornerò sicuramente.", author: "Stefano M.", rating: 5 },
    ],
    about: { title: "Il rito della brace", body: "Selezioniamo allevamenti di fiducia, frolliamo le carni con cura e le cuociamo solo sulla brace di legna. È un rito lento che rispettiamo da vent'anni, per portare in tavola il vero sapore del fuoco." },
    contact: { phone: "0471 123 456", address: "Via dei Boschi 7, Ortisei", ctaLabel: "Prenota il tuo tavolo", note: "Sala interna in stile baita. Prenotazione consigliata." },
    menu: { note: "Esempio di carta — i tagli cambiano con la disponibilità.", sections: [
      { name: "Taglieri", items: [{ name: "Tagliere di salumi e formaggi di malga", price: "€16" }, { name: "Speck e crauti", price: "€10" }] },
      { name: "Dalla brace", items: [{ name: "Fiorentina (etto)", price: "€5,5" }, { name: "Costata di scottona", price: "€24" }, { name: "Picanha", price: "€20" }, { name: "Grigliata mista", price: "€26" }] },
      { name: "Contorni", items: [{ name: "Patate al forno", price: "€5" }, { name: "Verdure grigliate", price: "€6" }] },
      { name: "Dolci", items: [{ name: "Strudel di mele", price: "€6" }, { name: "Tiramisù", price: "€6" }] },
    ] },
  },
};

const ETNICO_SEED: SeedDemo = {
  rating: 4.7, reviewCount: 689, photos: RISTORANTE_SEED.photos,
  openingHours: [
    { day: "Lunedì", hours: "Chiuso" },
    { day: "Martedì – Domenica", hours: "12:00–15:00 · 19:00–23:30" },
  ],
  model: {
    meta: { businessName: "Sakura Fusion", category: "Ristorante fusion", tagline: "Cucina d'autore fusion", lang: "it" },
    theme: { preset: "restaurant" }, restaurantStyle: "etnico",
    hero: { headline: "Dove Oriente e Mediterraneo si incontrano", sub: "Sushi creativo, wok e piatti d'autore che fondono tecniche giapponesi e ingredienti del territorio. Esperienza moderna e vibrante.", ctaLabel: "Prenota un tavolo" },
    services: [
      { title: "Sushi creativo", desc: "Roll d'autore e nigiri con materie prime selezionate." },
      { title: "Wok e ramen", desc: "Saltati al wok e ramen fumanti, sapori decisi." },
      { title: "Fusion d'autore", desc: "Piatti che uniscono Oriente e Mediterraneo." },
      { title: "Cocktail bar", desc: "Signature cocktail e selezione di sake." },
    ],
    testimonials: [
      { quote: "Fusion fatta bene, mai banale. Sushi creativo e cocktail sorprendenti. Locale bellissimo.", author: "Federica T.", rating: 5 },
      { quote: "Ambiente moderno e vibrante, piatti d'autore. Esperienza diversa dal solito.", author: "Luca B.", rating: 4 },
      { quote: "Ramen top e roll originali. Servizio giovane e attento. Consigliato.", author: "Sara G.", rating: 5 },
    ],
    about: { title: "Un viaggio di sapori", body: "Nasciamo dall'incontro tra la tradizione giapponese e gli ingredienti del Mediterraneo. Il nostro chef costruisce un menù in continua evoluzione, dove tecnica orientale e materia prima locale si fondono in piatti d'autore." },
    contact: { phone: "02 1234 5678", address: "Via Tortona 22, Milano", ctaLabel: "Prenota il tuo tavolo", note: "Cocktail bar aperto fino a tardi. Prenotazione consigliata." },
    menu: { note: "Esempio di carta — il menù evolve con lo chef.", sections: [
      { name: "Antipasti", items: [{ name: "Gyoza", desc: "Ravioli ripieni, salsa ponzu.", price: "€8" }, { name: "Edamame", price: "€5" }, { name: "Tataki di tonno", price: "€12" }] },
      { name: "Sushi & Roll", items: [{ name: "Dragon roll", price: "€14" }, { name: "Salmon special", price: "€12" }, { name: "Nigiri misti (8 pz)", price: "€16" }] },
      { name: "Wok & Ramen", items: [{ name: "Ramen tonkotsu", price: "€13" }, { name: "Pad thai", price: "€12" }, { name: "Wok di manzo", price: "€14" }] },
      { name: "Dolci", items: [{ name: "Mochi (3 pz)", price: "€7" }, { name: "Cheesecake al matcha", price: "€6" }] },
    ] },
  },
};

const BARBER_SEED: SeedDemo = {
  rating: 4.8,
  reviewCount: 426,
  photos: [0, 1, 2, 3, 4, 5, 6].map((i) => `https://picsum.photos/seed/barber${i}/1200/800`),
  openingHours: [
    { day: "Lunedì", hours: "Chiuso" },
    { day: "Martedì – Venerdì", hours: "9:00–13:00 · 15:00–19:30" },
    { day: "Sabato", hours: "9:00–18:00" },
    { day: "Domenica", hours: "Chiuso" },
  ],
  model: {
    meta: { businessName: "The Black Anchor Barbershop", category: "Barbiere", tagline: "Barberia artigianale dal 2015", lang: "it" },
    theme: { preset: "beauty" },
    hero: {
      headline: "Non è solo un taglio. È un rituale.",
      sub: "Rasatura a mano libera, taglio classico e moderno, barba curata nei dettagli. Entra, scegli il tuo disco in vinile, bevi un bourbon e rilassati. La barberia come una volta, per l'uomo di oggi.",
      ctaLabel: "Prenota la tua rasatura",
    },
    services: [
      { title: "Taglio artigianale", desc: "Forbici e sfumatura a rasoio. Classico, moderno o custom: ogni taglio è studiato sulla tua testa." },
      { title: "Rasatura a mano libera", desc: "Asciugamano caldo, olio pre-barba, sapone montato a pennello e rasoio a mano libera. Il vero rituale." },
      { title: "Regolazione barba", desc: "Sagomatura e rifinitura della barba con prodotti professionali." },
      { title: "Trattamento viso", desc: "Detergente, scrub e maschera idratante post-rasatura per una pelle perfetta." },
    ],
    testimonials: [
      { quote: "Finalmente una barberia vera. Rasatura impeccabile e atmosfera pazzesca. Ci torno ogni due settimane.", author: "Andrea L.", rating: 5 },
      { quote: "Taglio migliore della mia vita. Marco è un artista, non solo un barbiere. Atmosfera fantastica.", author: "Federico M.", rating: 5 },
      { quote: "Posto curatissimo, drink offerto all'ingresso e un'attenzione al dettaglio che non trovi da nessuna parte.", author: "Davide R.", rating: 5 },
    ],
    about: { title: "La barberia come una volta", body: "The Black Anchor nasce dalla passione per l'artigianato della rasatura. Niente fretta, niente tagli industriali: qui ogni cliente ha il suo tempo, il suo rituale e la sua poltrona in pelle. Vinile in sottofondo, bourbon nel bicchiere e lame affilate a mano." },
    contact: { phone: "02 8765 4321", address: "Via Tortona 18, Milano", ctaLabel: "Vieni a trovarci", note: "Prenotazione consigliata. Walk-in benvenuti in base a disponibilità." },
  },
};

const UOMO_SEED: SeedDemo = {
  rating: 4.9,
  reviewCount: 312,
  photos: [0, 1, 2, 3, 4, 5, 6].map((i) => `https://picsum.photos/seed/uom${i}/1200/800`),
  openingHours: [
    { day: "Lunedì", hours: "Chiuso" },
    { day: "Martedì – Sabato", hours: "9:30–19:30" },
    { day: "Domenica", hours: "Chiuso" },
  ],
  model: {
    meta: { businessName: "Gentlemen's Grooming Club", category: "Parrucchiere per uomo", tagline: "Grooming maschile premium", lang: "it" },
    theme: { preset: "beauty" },
    hero: {
      headline: "L'eleganza maschile inizia dai dettagli",
      sub: "Taglio, colore, barba e trattamenti viso in un ambiente discreto e raffinato. Consulenza personalizzata, prodotti professionali e un'esperienza pensata per l'uomo contemporaneo.",
      ctaLabel: "Prenota una consulenza",
    },
    services: [
      { title: "Taglio & Styling", desc: "Taglio personalizzato con analisi della forma del viso e del tipo di capello." },
      { title: "Colore uomo", desc: "Colorazione camouflage, effetto naturale, copertura dei capelli bianchi senza effetto finto." },
      { title: "Barba & Rasatura", desc: "Sagomatura professionale e rasatura con prodotti premium." },
      { title: "Trattamento viso", desc: "Pulizia del viso, maschera e idratazione specifica per la pelle maschile." },
    ],
    testimonials: [
      { quote: "Posto incredibile. Finalmente un salone che capisce le esigenze maschili senza essere una barberia. Taglio perfetto.", author: "Stefano P.", rating: 5 },
      { quote: "Colore camouflage fatto con una delicatezza e una precisione mai viste. Sembra naturale al 100%.", author: "Marco V.", rating: 5 },
      { quote: "Da quando vado qui ho smesso di cercare. Consulenza personalizzata e risultato impeccabile ogni volta.", author: "Alberto G.", rating: 5 },
    ],
    about: { title: "L'uomo al centro", body: "Gentlemen's Grooming Club nasce per colmare il vuoto tra la barberia tradizionale e il salone femminile. Uno spazio dove l'uomo moderno può prendersi cura di sé con la stessa attenzione e qualità che merita, in un ambiente discreto e professionale." },
    contact: { phone: "06 1234 5678", address: "Via dei Condotti 42, Roma", ctaLabel: "Prenota il tuo trattamento", note: "Prenotazione consigliata. Parcheggio convenzionato a 50 metri." },
  },
};

const DONNA_SEED: SeedDemo = {
  rating: 4.8,
  reviewCount: 578,
  photos: [0, 1, 2, 3, 4, 5, 6].map((i) => `https://picsum.photos/seed/donns${i}/1200/800`),
  openingHours: [
    { day: "Lunedì", hours: "14:00–19:00" },
    { day: "Martedì – Sabato", hours: "9:00–19:30" },
    { day: "Domenica", hours: "Chiuso" },
  ],
  model: {
    meta: { businessName: "Atelier Capelli & Colore", category: "Parrucchiere per donna", tagline: "Eleganza e colore dal 2008", lang: "it" },
    theme: { preset: "beauty" },
    hero: {
      headline: "Il tuo stile, la nostra arte",
      sub: "Taglio, colore, trattamenti e acconciature in un salone luminoso nel cuore della città. Ogni testa è una tela bianca: la nostra missione è valorizzare la tua bellezza naturale.",
      ctaLabel: "Prenota il tuo trattamento",
    },
    services: [
      { title: "Taglio & Piega", desc: "Taglio su misura con consulenza personalizzata e piega con prodotti professionali." },
      { title: "Colore & Balayage", desc: "Colorazione classica, balayage, shatush e tecniche avanzate con prodotti a basso contenuto di ammoniaca." },
      { title: "Trattamenti", desc: "Ricostruzione cheratinica, lisciante brasiliano e trattamenti ristrutturanti personalizzati." },
      { title: "Acconciature", desc: "Sposa, cerimonia ed eventi speciali. Servizio a domicilio disponibile su richiesta." },
    ],
    testimonials: [
      { quote: "Mai avuto un balayage così perfetto. Elena ha una mano d'oro e il salone è una coccola dall'inizio alla fine.", author: "Francesca B.", rating: 5 },
      { quote: "Posto meraviglioso e professionale. Ogni volta esco sentendomi più bella. Consigliatissimo!", author: "Chiara M.", rating: 5 },
      { quote: "Trattamento cheratinico che mi ha salvato i capelli dopo l'estate. Professioniste vere.", author: "Valentina S.", rating: 4 },
    ],
    about: { title: "Bellezza su misura", body: "Atelier Capelli & Colore è nato nel 2008 dalla visione di Elena, stylist con oltre vent'anni di esperienza. Ogni cliente è unica: ascoltiamo, studiamo e creiamo un look che valorizzi la personalità e lo stile di vita di chi si affida a noi." },
    contact: { phone: "051 234 5678", address: "Via Indipendenza 32, Bologna", ctaLabel: "Prenota ora", note: "Prenotazione consigliata. Possibilità di parcheggio nelle vie limitrofe." },
  },
};

const UNISEX_SEED: SeedDemo = {
  rating: 4.7,
  reviewCount: 438,
  photos: [0, 1, 2, 3, 4, 5, 6].map((i) => `https://picsum.photos/seed/unisex${i}/1200/800`),
  openingHours: [
    { day: "Lunedì", hours: "Chiuso" },
    { day: "Martedì – Venerdì", hours: "9:30–13:00 · 14:30–19:30" },
    { day: "Sabato", hours: "9:00–18:00" },
    { day: "Domenica", hours: "Chiuso" },
  ],
  model: {
    meta: { businessName: "Studio 22 Hair Lab", category: "Parrucchiere", tagline: "Taglio uomo e donna · dal 2012", lang: "it" },
    theme: { preset: "beauty" },
    hero: {
      headline: "Capelli sani, stile unico. Per tutti.",
      sub: "Un salone contemporaneo dove uomo e donna trovano lo stesso livello di cura, tecnica e attenzione. Taglio, colore, barba e trattamenti in un ambiente moderno e accogliente.",
      ctaLabel: "Prenota un appuntamento",
    },
    services: [
      { title: "Taglio donna", desc: "Taglio personalizzato, analisi della forma del viso e styling con prodotti eco-friendly." },
      { title: "Taglio uomo", desc: "Dal classico allo sbarazzino, taglio sfumato e barba con attrezzatura professionale." },
      { title: "Colore & Tecnica", desc: "Balayage, colore base, meches e tecniche di schiaritura con prodotti a basso impatto." },
      { title: "Trattamenti", desc: "Ricostruzione, lisciante, trattamento antiforfora e protocolli su misura per ogni tipo di capello." },
    ],
    testimonials: [
      { quote: "Vado da Studio 22 da anni e non cambierei mai. Taglio perfetto e atmosfera super rilassata.", author: "Martina F.", rating: 5 },
      { quote: "Mia moglie mi ha portato qui e ora vengo ogni mese. Sanno trattare i capelli maschili con la stessa cura di quelli femminili.", author: "Luca T.", rating: 5 },
      { quote: "Salone moderno, team giovane e preparato. Prodotti naturali e nessuna fretta. Esperienza top.", author: "Giulia R.", rating: 4 },
    ],
    about: { title: "Un solo salone, tutte le teste", body: "Studio 22 Hair Lab nasce nel 2012 con un'idea semplice: creare uno spazio dove chiunque, indipendentemente dal genere, possa sentirsi a casa e ricevere un servizio professionale di alto livello. Abbiamo abbattuto la barriera tra 'parrucchiere per uomo' e 'parrucchiere per donna' per costruire un'esperienza unica." },
    contact: { phone: "055 123 4567", address: "Borgo San Frediano 22, Firenze", ctaLabel: "Prenota il tuo posto", note: "Prenotazione consigliata. Parcheggio a 100 metri." },
  },
};

const MODERN_SEED: SeedDemo = {
  rating: 4.9,
  reviewCount: 267,
  photos: [0, 1, 2, 3, 4, 5, 6].map((i) => `https://picsum.photos/seed/modern${i}/1200/800`),
  openingHours: [
    { day: "Lunedì – Venerdì", hours: "10:00–20:00" },
    { day: "Sabato", hours: "10:00–18:00" },
    { day: "Domenica", hours: "Chiuso" },
  ],
  model: {
    meta: { businessName: "NEON Hair Lab", category: "Salone di bellezza", tagline: "Taglio del futuro · esperienza immersiva", lang: "it" },
    theme: { preset: "beauty" },
    hero: {
      headline: "Oltre il taglio. Oltre il colore. Benvenuti nel futuro.",
      sub: "Un laboratorio creativo dove tecnologia e hair design si fondono. Prenotazione smart, consulenza AI-driven e un'esperienza sensoriale unica. Preparati a vedere i tuoi capelli sotto una nuova luce.",
      ctaLabel: "Prenota la tua esperienza",
    },
    services: [
      { title: "Taglio & Styling", desc: "Taglio di precisione con analisi 3D della forma del viso e simulazione del risultato." },
      { title: "Colorazione creativa", desc: "Tecniche di colorazione avanzate, effetti cromatici, color block e nuance personalizzate." },
      { title: "Trattamento tech", desc: "Protocolli di ricostruzione con tecnologia a ultrasuoni e cheratina a caldo per risultati immediati." },
      { title: "Consulenza immagine", desc: "Analisi del colore stagionale e consulenza di stile per un look completo e coerente." },
    ],
    testimonials: [
      { quote: "Esperienza fuori dal mondo. Simulazione 3D del taglio prima di iniziare e risultato identico. Pazzesco.", author: "Sofia L.", rating: 5 },
      { quote: "Colorazione creativa come nessun altro salone sa fare. Alex è un vero artista del colore.", author: "Tommaso B.", rating: 5 },
      { quote: "Atmosfera futuristica, professionisti preparati e un'attenzione al cliente mai vista. Ci torno e ci tornerò.", author: "Beatrice M.", rating: 5 },
    ],
    about: { title: "Dove i capelli incontrano il futuro", body: "NEON Hair Lab è il primo concept salon in Italia a unire hair design, tecnologia immersiva e consulenza su misura. Luci LED customizzabili, specchi interattivi e un team di artisti del taglio e del colore che trasformano ogni visita in un'esperienza sensoriale." },
    contact: { phone: "02 9876 5432", address: "Corso Como 10, Milano", ctaLabel: "Vivi l'esperienza", note: "Aperto su appuntamento. Walk-in benvenuti in base a disponibilità. Parcheggio sotterraneo a 30 metri." },
  },
};

export const SEED_DEMOS: Record<string, SeedDemo> = {
  "ristorante-classic": RISTORANTE_SEED,
  pizzeria: PIZZERIA_SEED,
  "pesce-mare": PESCE_SEED,
  "carne-montagna": CARNE_SEED,
  "etnico-fusion": ETNICO_SEED,
  "idraulica-pronto": IDRAULICA_SEED,
  editorial: RISTORANTE_SEED,
  "barber-shop": BARBER_SEED,
  barber: BARBER_SEED,
  uomo: UOMO_SEED,
  donna: DONNA_SEED,
  unisex: UNISEX_SEED,
  modern: MODERN_SEED,
};

export function seedFor(template: string): SeedDemo {
  return SEED_DEMOS[template] ?? RISTORANTE_SEED;
}
