import type { Language } from '@shared/types'

export interface LookCopy {
  tagline: string
  promoTitle: string
  promoBody: string
  welcome: string
  upcomingLine: string
  personHas: string
  peopleHave: string
  within7: string
  nearest: string
  seeAll: string
  stats: string
  contactsWord: string
  thisMonthWord: string
  weekWord: string
  monthView: string
  weekView: string
  listView: string
  legendBirthday: string
  legendSoon: string
  legendWeek: string
  legendMonth: string
  turnsAge: string
  reminderOn: string
  noReminder: string
  search: string
  addContact: string
  previewTitle: string
  previewHint: string
  general: string
  appearance: string
  importExport: string
  exportData: string
  importData: string
  todayBang: string
  emptyPreview: string
}

const pl: LookCopy = {
  tagline: 'Urodziny zawsze w zasięgu ręki',
  promoTitle: 'Małe okazje budują wielkie relacje',
  promoBody: 'Birthdayly pomaga Ci pamiętać o tym, co naprawdę ważne.',
  welcome: 'Witaj ponownie',
  upcomingLine: 'Masz {count} nadchodzące urodziny. Czas na dobre życzenia!',
  personHas: 'osoba ma urodziny',
  peopleHave: 'osoby mają urodziny',
  within7: 'w ciągu najbliższych 7 dni',
  nearest: 'Najbliższe urodziny',
  seeAll: 'Zobacz wszystkie',
  stats: 'Statystyki',
  contactsWord: 'kontaktów',
  thisMonthWord: 'w tym miesiącu',
  weekWord: 'najbliższych 7 dni',
  monthView: 'Miesiąc',
  weekView: 'Tydzień',
  listView: 'Lista',
  legendBirthday: 'Urodziny',
  legendSoon: 'Nadchodzące (do 7 dni)',
  legendWeek: 'W tym tygodniu',
  legendMonth: 'W tym miesiącu',
  turnsAge: 'Kończy {age} lat',
  reminderOn: 'Przypomnienie ustawione',
  noReminder: 'Brak przypomnienia',
  search: 'Szukaj kontaktów...',
  addContact: 'Dodaj kontakt',
  previewTitle: 'Podgląd powiadomienia',
  previewHint: 'Tak będzie wyglądać powiadomienie na Twoim komputerze.',
  general: 'Ogólne',
  appearance: 'Wygląd',
  importExport: 'Import / Eksport',
  exportData: 'Eksportuj dane',
  importData: 'Importuj dane',
  todayBang: 'Dzisiaj!',
  emptyPreview: 'Dodaj osobę, a tutaj pojawi się jej przypomnienie.'
}

const en: LookCopy = {
  tagline: 'Birthdays always within reach',
  promoTitle: 'Small moments build close relationships',
  promoBody: 'Birthdayly helps you remember what really matters.',
  welcome: 'Welcome back',
  upcomingLine: 'You have {count} upcoming birthdays. Time for a kind wish!',
  personHas: 'person has a birthday',
  peopleHave: 'people have birthdays',
  within7: 'within the next 7 days',
  nearest: 'Upcoming birthdays',
  seeAll: 'See all',
  stats: 'Statistics',
  contactsWord: 'contacts',
  thisMonthWord: 'this month',
  weekWord: 'next 7 days',
  monthView: 'Month',
  weekView: 'Week',
  listView: 'List',
  legendBirthday: 'Birthday',
  legendSoon: 'Upcoming (7 days)',
  legendWeek: 'This week',
  legendMonth: 'This month',
  turnsAge: 'Turns {age}',
  reminderOn: 'Reminder set',
  noReminder: 'No reminder',
  search: 'Search contacts...',
  addContact: 'Add contact',
  previewTitle: 'Notification preview',
  previewHint: 'This is how a reminder will look on your computer.',
  general: 'General',
  appearance: 'Appearance',
  importExport: 'Import / Export',
  exportData: 'Export data',
  importData: 'Import data',
  todayBang: 'Today!',
  emptyPreview: 'Add a person to preview their reminder.'
}

export function look(language: Language): LookCopy {
  return language === 'en' ? en : pl
}
