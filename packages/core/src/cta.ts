import type { ThemePreset } from './schemas';

export type CtaKind = 'reservation' | 'appointment' | 'booking' | 'quote' | 'contact';

export interface CtaConfig {
  kind: CtaKind;
  title: string;
  sub: string;
  withCalendar: boolean;
  withTime: boolean;
  timeSlots: string[];
  withParty: boolean; // "coperti" stepper
  serviceLabel?: string;
  serviceOptions?: string[];
  askEmail: boolean;
  requireEmail?: boolean; // email mandatory to submit (e.g. to send a confirmation)
  phoneLabel?: string; // placeholder for the phone field (default "Telefono")
  confirmNote?: string; // small note under the contact fields ("we'll confirm here")
  withMessage: boolean;
  submitLabel: string;
  successTitle: string;
  successMsg: string;
}

const SLOTS_MEAL = ['12:30', '13:00', '13:30', '19:30', '20:00', '20:30', '21:00'];
const SLOTS_OFFICE = ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00'];
const SLOTS_SHORT = ['09:30', '11:00', '15:00', '16:30', '18:00'];

/** Category-coherent call-to-action module, derived deterministically from the theme preset. */
export function resolveCta(preset: ThemePreset): CtaConfig {
  switch (preset) {
    case 'restaurant':
      return {
        kind: 'reservation',
        title: 'Prenota un tavolo',
        sub: 'Scegli giorno, orario e numero di coperti: ti aspettiamo.',
        withCalendar: true,
        withTime: true,
        timeSlots: SLOTS_MEAL,
        withParty: true,
        askEmail: true,
        requireEmail: true,
        phoneLabel: 'Cellulare',
        confirmNote: 'Useremo email e cellulare solo per inviarti la conferma della prenotazione.',
        withMessage: false,
        submitLabel: 'Conferma prenotazione',
        successTitle: 'Prenotazione inviata!',
        successMsg: 'Grazie, ti aspettiamo. Riceverai la conferma via email e SMS a breve.',
      };
    case 'lawyer':
      return {
        kind: 'appointment',
        title: 'Richiedi un appuntamento',
        sub: 'Prenota un primo colloquio nello studio.',
        withCalendar: true,
        withTime: true,
        timeSlots: SLOTS_OFFICE,
        withParty: false,
        serviceLabel: 'Tipo di consulenza',
        serviceOptions: ['Prima consulenza', 'Assistenza pratica', 'Altro'],
        askEmail: true,
        withMessage: true,
        submitLabel: 'Richiedi appuntamento',
        successTitle: 'Richiesta inviata!',
        successMsg: 'Ti contatteremo per confermare l’appuntamento.',
      };
    case 'medical':
      return {
        kind: 'appointment',
        title: 'Prenota una visita',
        sub: 'Scegli data e orario per la tua visita.',
        withCalendar: true,
        withTime: true,
        timeSlots: SLOTS_OFFICE,
        withParty: false,
        serviceLabel: 'Prestazione',
        serviceOptions: ['Prima visita', 'Controllo', 'Altro'],
        askEmail: false,
        withMessage: false,
        submitLabel: 'Prenota visita',
        successTitle: 'Richiesta inviata!',
        successMsg: 'Ti contatteremo per confermare la visita.',
      };
    case 'beauty':
      return {
        kind: 'booking',
        title: 'Prenota un trattamento',
        sub: 'Scegli servizio, giorno e orario.',
        withCalendar: true,
        withTime: true,
        timeSlots: SLOTS_SHORT,
        withParty: false,
        serviceLabel: 'Servizio',
        serviceOptions: ['Taglio', 'Piega', 'Colore', 'Trattamento', 'Altro'],
        askEmail: false,
        withMessage: false,
        submitLabel: 'Prenota',
        successTitle: 'Richiesta inviata!',
        successMsg: 'A presto! Riceverai conferma a breve.',
      };
    case 'gym':
      return {
        kind: 'booking',
        title: 'Prenota una prova gratuita',
        sub: 'Vieni a provare: scegli giorno e orario.',
        withCalendar: true,
        withTime: true,
        timeSlots: SLOTS_SHORT,
        withParty: false,
        askEmail: false,
        withMessage: false,
        submitLabel: 'Prenota la prova',
        successTitle: 'Richiesta inviata!',
        successMsg: 'Ci vediamo in palestra! Ti ricontatteremo a breve.',
      };
    case 'artisan':
      return {
        kind: 'quote',
        title: 'Richiedi un preventivo',
        sub: 'Raccontaci di cosa hai bisogno: ti rispondiamo presto.',
        withCalendar: false,
        withTime: false,
        timeSlots: [],
        withParty: false,
        askEmail: true,
        withMessage: true,
        submitLabel: 'Richiedi preventivo',
        successTitle: 'Richiesta inviata!',
        successMsg: 'Ti invieremo un preventivo al più presto.',
      };
    case 'retail':
    case 'default':
    default:
      return {
        kind: 'contact',
        title: 'Contattaci',
        sub: 'Hai una domanda? Scrivici, ti rispondiamo a breve.',
        withCalendar: false,
        withTime: false,
        timeSlots: [],
        withParty: false,
        askEmail: true,
        withMessage: true,
        submitLabel: 'Invia messaggio',
        successTitle: 'Messaggio inviato!',
        successMsg: 'Grazie, ti risponderemo a breve.',
      };
  }
}
