import type { FieldError, Language } from './types'

export interface Messages {
  appName: string
  navLabel: string
  nav: {
    dashboard: string
    calendar: string
    contacts: string
    settings: string
  }
  actions: {
    add: string
    edit: string
    remove: string
    save: string
    cancel: string
    close: string
    today: string
    exportJson: string
    exportCsv: string
    importData: string
    testNotification: string
    checkReminders: string
    confirmImport: string
    quit: string
    open: string
    ok: string
    remindLater: string
  }
  dashboard: {
    morning: string
    evening: string
    subtitle: string
    statsContacts: string
    statsMonth: string
    statsWeek: string
    today: string
    tomorrow: string
    next7: string
    next30: string
    all: string
    empty: string
    daysLeft: string
  }
  calendar: {
    title: string
    subtitle: string
    selectedEmpty: string
    outsideMonth: string
    birthdays: string
  }
  contacts: {
    title: string
    subtitle: string
    search: string
    sort: string
    sortName: string
    sortUpcoming: string
    sortCreated: string
    empty: string
    noResults: string
    age: string
    next: string
    deleteTitle: string
    deleteBody: string
  }
  form: {
    createTitle: string
    editTitle: string
    firstName: string
    lastName: string
    day: string
    month: string
    year: string
    yearHint: string
    notes: string
    avatar: string
    avatarHint: string
    removeAvatar: string
    reminders: string
    onDay: string
    dayBefore: string
    threeDays: string
    sevenDays: string
    reminderTime: string
    reminderTimeHint: string
    ownTime: string
    inheritedTime: string
    snoozeTitle: string
    snoozeBody: string
    snoozeSave: string
  }
  settings: {
    title: string
    subtitle: string
    appearance: string
    appearanceHint: string
    theme: string
    themeLight: string
    themeDark: string
    themeSystem: string
    language: string
    languagePl: string
    languageEn: string
    notifications: string
    notificationsHint: string
    enabled: string
    enabledHint: string
    reminderTime: string
    reminderTimeHint: string
    defaultReminders: string
    grace: string
    graceHint: string
    application: string
    applicationHint: string
    autoLaunch: string
    autoLaunchHint: string
    tray: string
    trayHint: string
    feb29: string
    feb29Hint: string
    feb28: string
    mar1: string
    data: string
    dataHint: string
    testHint: string
    offlineHint: string
  }
  importPreview: {
    title: string
    summary: string
    duplicateChoice: string
    merge: string
    skip: string
    statusOk: string
    statusDuplicate: string
    statusInvalid: string
    empty: string
  }
  toast: {
    saved: string
    deleted: string
    settingsSaved: string
    exported: string
    imported: string
    testSent: string
    remindersChecked: string
    snoozed: string
    error: string
  }
  errors: Record<string, string>
  weekdays: string[]
  loading: string
  version: string
}

const pl: Messages = {
  appName: 'Birthdayly',
  navLabel: 'Nawigacja',
  nav: { dashboard: 'Pulpit', calendar: 'Kalendarz', contacts: 'Kontakty', settings: 'Ustawienia' },
  actions: {
    add: 'Dodaj urodziny',
    edit: 'Edytuj',
    remove: 'Usuń',
    save: 'Zapisz',
    cancel: 'Anuluj',
    close: 'Zamknij',
    today: 'Dzisiaj',
    exportJson: 'Eksportuj JSON',
    exportCsv: 'Eksportuj CSV',
    importData: 'Importuj',
    testNotification: 'Test powiadomienia',
    checkReminders: 'Sprawdź przypomnienia',
    confirmImport: 'Importuj zaznaczone',
    quit: 'Zakończ',
    open: 'Otwórz',
    ok: 'OK',
    remindLater: 'Przypomnij później'
  },
  dashboard: {
    morning: 'Dzień dobry',
    evening: 'Dobry wieczór',
    subtitle: 'Masz urodziny bliskich w zasięgu ręki. Czas na dobre życzenia!',
    statsContacts: 'Osób',
    statsMonth: 'W tym miesiącu',
    statsWeek: 'Najbliższe 7 dni',
    today: 'Dzisiaj',
    tomorrow: 'Jutro',
    next7: 'Najbliższe 7 dni',
    next30: 'Najbliższe 30 dni',
    all: 'Wszystkie nadchodzące',
    empty: 'Brak urodzin w tym zakresie.',
    daysLeft: 'Pozostało'
  },
  calendar: {
    title: 'Kalendarz',
    subtitle: 'Planuj urodziny, bądź na bieżąco i nie przegap żadnej ważnej osoby!',
    selectedEmpty: 'Tego dnia nikt nie obchodzi urodzin.',
    outsideMonth: 'Dzień z innego miesiąca',
    birthdays: 'Urodziny'
  },
  contacts: {
    title: 'Kontakty',
    subtitle: 'Zarządzaj swoimi kontaktami i nigdy nie zapominaj o ważnych urodzinach.',
    search: 'Szukaj po imieniu, nazwisku lub notatce',
    sort: 'Sortowanie',
    sortName: 'Imię i nazwisko',
    sortUpcoming: 'Najbliższe urodziny',
    sortCreated: 'Ostatnio dodane',
    empty: 'Nie ma jeszcze żadnej osoby. Dodaj pierwsze urodziny.',
    noResults: 'Nic nie pasuje do wyszukiwania.',
    age: 'Wiek',
    next: 'Następne urodziny',
    deleteTitle: 'Usunąć tę osobę?',
    deleteBody: 'Kontakt i jego przypomnienia zostaną usunięte z tego komputera. Tej operacji nie można cofnąć.'
  },
  form: {
    createTitle: 'Dodaj nowy kontakt',
    editTitle: 'Edycja osoby',
    firstName: 'Imię',
    lastName: 'Nazwisko',
    day: 'Dzień',
    month: 'Miesiąc',
    year: 'Rok urodzenia',
    yearHint: 'Opcjonalny. Wiek liczymy tylko wtedy, gdy rok jest znany.',
    notes: 'Notatki',
    avatar: 'Zdjęcie',
    avatarHint: 'PNG, JPEG albo WebP, maksymalnie 2 MB.',
    removeAvatar: 'Usuń zdjęcie',
    reminders: 'Przypomnienia',
    onDay: 'W dniu urodzin',
    dayBefore: '1 dzień wcześniej',
    threeDays: '3 dni wcześniej',
    sevenDays: '7 dni wcześniej',
    reminderTime: 'Godzina przypomnienia',
    reminderTimeHint: 'Tylko dla tej osoby. Bez własnej godziny używana jest godzina z ustawień.',
    ownTime: 'Własna godzina',
    inheritedTime: 'Godzina z ustawień',
    snoozeTitle: 'Przypomnij później',
    snoozeBody: 'Nowa godzina dotyczy tylko dzisiejszego przypomnienia. Stała godzina tej osoby zostaje bez zmian.',
    snoozeSave: 'Ustaw na dziś'
  },
  settings: {
    title: 'Ustawienia',
    subtitle: 'Dostosuj Birthdayly do swoich potrzeb.',
    appearance: 'Wygląd',
    appearanceHint: 'Motyw i język interfejsu.',
    theme: 'Motyw',
    themeLight: 'Jasny',
    themeDark: 'Ciemny',
    themeSystem: 'Systemowy',
    language: 'Język',
    languagePl: 'Polski',
    languageEn: 'English',
    notifications: 'Powiadomienia',
    notificationsHint: 'Natywne powiadomienia systemu. Działają tylko, gdy aplikacja jest uruchomiona, także z zasobnika.',
    enabled: 'Włącz powiadomienia',
    enabledHint: 'Gdy wyłączone, harmonogram nic nie wysyła. Test nadal działa.',
    reminderTime: 'Godzina przypomnień',
    reminderTimeHint: 'Domyślna godzina dla osób bez własnej godziny.',
    defaultReminders: 'Domyślne przypomnienia dla nowych osób',
    grace: 'Okno karencji (godziny)',
    graceHint: 'Po tym czasie zaległe przypomnienie nie zostanie wysłane. Wyłączony komputer nie dostanie powiadomienia.',
    application: 'Aplikacja',
    applicationHint: 'Start z systemem i praca w tle.',
    autoLaunch: 'Uruchamiaj przy logowaniu',
    autoLaunchHint: 'Dotyczy następnego logowania. Aplikacja nie wstanie, gdy komputer jest wyłączony.',
    tray: 'Minimalizuj do zasobnika',
    trayHint: 'Zamknięcie okna zostawia Birthdayly w zasobniku. Zakończenie jest w menu ikony.',
    feb29: 'Urodziny 29 lutego',
    feb29Hint: 'W latach nieprzestępnych świętujemy w wybranym dniu.',
    feb28: '28 lutego',
    mar1: '1 marca',
    data: 'Dane',
    dataHint: 'Eksport i import nie nadpisują kontaktów bez podglądu.',
    testHint: 'Wysyła przykładowe powiadomienie systemu.',
    offlineHint: 'Birthdayly nie wysyła danych do sieci i nie wymaga konta.'
  },
  importPreview: {
    title: 'Podgląd importu',
    summary: 'Poprawne: {valid}. Duplikaty: {duplicates}. Błędne: {invalid}.',
    duplicateChoice: 'Gdy osoba już istnieje',
    merge: 'Scal z istniejącym kontaktem',
    skip: 'Pomiń duplikaty',
    statusOk: 'Gotowe',
    statusDuplicate: 'Duplikat',
    statusInvalid: 'Błąd',
    empty: 'Plik nie zawiera wierszy do importu.'
  },
  toast: {
    saved: 'Zapisano osobę.',
    deleted: 'Usunięto osobę.',
    settingsSaved: 'Zapisano ustawienia.',
    exported: 'Zapisano plik.',
    imported: 'Import zakończony.',
    testSent: 'Wysłano testowe powiadomienie.',
    remindersChecked: 'Sprawdzono przypomnienia.',
    snoozed: 'Dzisiejsze przypomnienie przesunięte.',
    error: 'Nie udało się wykonać operacji.'
  },
  errors: {
    required: 'To pole jest wymagane.',
    tooLong: 'Tekst jest za długi.',
    invalid: 'Nieprawidłowa wartość.',
    invalidDate: 'Podaj prawdziwą datę urodzin.',
    invalidYear: 'Rok musi mieścić się między 1900 a bieżącym rokiem.',
    futureBirth: 'Data urodzenia nie może być z przyszłości.',
    feb29Year: '29 lutego występuje tylko w roku przestępnym.',
    invalidAvatar: 'Wybierz obraz PNG, JPEG albo WebP do 2 MB.',
    invalidTime: 'Podaj godzinę w formacie GG:MM.',
    laterTime: 'Wybierz godzinę późniejszą niż teraz.',
    invalidGrace: 'Okno karencji musi mieć od 1 do 168 godzin.',
    notFound: 'Nie znaleziono osoby.',
    import: 'Nie udało się odczytać pliku.',
    header: 'Plik CSV ma nieprawidłowy nagłówek.',
    empty: 'Plik jest pusty.'
  },
  weekdays: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'],
  loading: 'Wczytywanie…',
  version: 'Wersja'
}

const en: Messages = {
  appName: 'Birthdayly',
  navLabel: 'Navigation',
  nav: { dashboard: 'Dashboard', calendar: 'Calendar', contacts: 'Contacts', settings: 'Settings' },
  actions: {
    add: 'Add birthday',
    edit: 'Edit',
    remove: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    today: 'Today',
    exportJson: 'Export JSON',
    exportCsv: 'Export CSV',
    importData: 'Import',
    testNotification: 'Test notification',
    checkReminders: 'Check reminders',
    confirmImport: 'Import rows',
    quit: 'Quit',
    open: 'Open',
    ok: 'OK',
    remindLater: 'Remind later'
  },
  dashboard: {
    morning: 'Good morning',
    evening: 'Good evening',
    subtitle: 'Birthdays, reminders, and a calendar that stay on this computer.',
    statsContacts: 'People',
    statsMonth: 'This month',
    statsWeek: 'Next 7 days',
    today: 'Today',
    tomorrow: 'Tomorrow',
    next7: 'Next 7 days',
    next30: 'Next 30 days',
    all: 'All upcoming',
    empty: 'No birthdays in this range.',
    daysLeft: 'Remaining'
  },
  calendar: {
    title: 'Calendar',
    subtitle: 'Birthdays land on their dates. Select a day to see who is celebrating.',
    selectedEmpty: 'Nobody celebrates on this day.',
    outsideMonth: 'Day from another month',
    birthdays: 'Birthdays'
  },
  contacts: {
    title: 'Contacts',
    subtitle: 'Add, search, and sort the people you want to remember.',
    search: 'Search by name or note',
    sort: 'Sort',
    sortName: 'Name',
    sortUpcoming: 'Next birthday',
    sortCreated: 'Recently added',
    empty: 'No people yet. Add the first birthday.',
    noResults: 'Nothing matches this search.',
    age: 'Age',
    next: 'Next birthday',
    deleteTitle: 'Delete this person?',
    deleteBody: 'The contact and reminders will be removed from this computer. This cannot be undone.'
  },
  form: {
    createTitle: 'New birthday',
    editTitle: 'Edit person',
    firstName: 'First name',
    lastName: 'Last name',
    day: 'Day',
    month: 'Month',
    year: 'Birth year',
    yearHint: 'Optional. Age is calculated only when the year is known.',
    notes: 'Notes',
    avatar: 'Photo',
    avatarHint: 'PNG, JPEG, or WebP, up to 2 MB.',
    removeAvatar: 'Remove photo',
    reminders: 'Reminders',
    onDay: 'On the birthday',
    dayBefore: '1 day before',
    threeDays: '3 days before',
    sevenDays: '7 days before',
    reminderTime: 'Reminder time',
    reminderTimeHint: 'Only for this person. Without a custom time, the settings time is used.',
    ownTime: 'Custom time',
    inheritedTime: 'Time from settings',
    snoozeTitle: 'Remind later',
    snoozeBody: 'The new time applies only to today’s reminder. This person’s usual time stays the same.',
    snoozeSave: 'Set for today'
  },
  settings: {
    title: 'Settings',
    subtitle: 'Appearance, reminders, and backups stay on this device.',
    appearance: 'Appearance',
    appearanceHint: 'Theme and interface language.',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    language: 'Language',
    languagePl: 'Polski',
    languageEn: 'English',
    notifications: 'Notifications',
    notificationsHint: 'Native system notifications. They run only while Birthdayly is open, including from the tray.',
    enabled: 'Enable notifications',
    enabledHint: 'When off, the scheduler stays quiet. The test button still works.',
    reminderTime: 'Reminder time',
    reminderTimeHint: 'Default time for people without their own time.',
    defaultReminders: 'Default reminders for new people',
    grace: 'Grace period (hours)',
    graceHint: 'Overdue reminders are skipped after this window. A shut-down computer cannot show them.',
    application: 'Application',
    applicationHint: 'Login start and background mode.',
    autoLaunch: 'Launch at login',
    autoLaunchHint: 'Applies on the next sign-in. The app cannot start while the computer is off.',
    tray: 'Minimize to tray',
    trayHint: 'Closing the window leaves Birthdayly in the tray. Quit is in the tray menu.',
    feb29: 'February 29 birthdays',
    feb29Hint: 'In non-leap years the celebration moves to the chosen day.',
    feb28: 'February 28',
    mar1: 'March 1',
    data: 'Data',
    dataHint: 'Import never overwrites contacts without a preview.',
    testHint: 'Sends a sample system notification.',
    offlineHint: 'Birthdayly does not send data over the network and does not require an account.'
  },
  importPreview: {
    title: 'Import preview',
    summary: 'Valid: {valid}. Duplicates: {duplicates}. Invalid: {invalid}.',
    duplicateChoice: 'When a person already exists',
    merge: 'Merge into the existing contact',
    skip: 'Skip duplicates',
    statusOk: 'Ready',
    statusDuplicate: 'Duplicate',
    statusInvalid: 'Error',
    empty: 'The file has no rows to import.'
  },
  toast: {
    saved: 'Person saved.',
    deleted: 'Person deleted.',
    settingsSaved: 'Settings saved.',
    exported: 'File saved.',
    imported: 'Import finished.',
    testSent: 'Test notification sent.',
    remindersChecked: 'Reminders checked.',
    snoozed: 'Today’s reminder was moved.',
    error: 'The operation failed.'
  },
  errors: {
    required: 'This field is required.',
    tooLong: 'This text is too long.',
    invalid: 'Invalid value.',
    invalidDate: 'Enter a real birthday.',
    invalidYear: 'Year must be between 1900 and the current year.',
    futureBirth: 'A birthday cannot be in the future.',
    feb29Year: 'February 29 only exists in a leap year.',
    invalidAvatar: 'Choose a PNG, JPEG, or WebP image up to 2 MB.',
    invalidTime: 'Use HH:MM.',
    laterTime: 'Choose a time later than now.',
    invalidGrace: 'Grace period must be from 1 to 168 hours.',
    notFound: 'Person not found.',
    import: 'The file could not be read.',
    header: 'The CSV header is invalid.',
    empty: 'The file is empty.'
  },
  weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  loading: 'Loading…',
  version: 'Version'
}

export function messages(language: Language): Messages {
  return language === 'en' ? en : pl
}

export function errorText(language: Language, code: string): string {
  return messages(language).errors[code] ?? messages(language).errors.invalid ?? code
}

export function formatFieldErrors(language: Language, errors: FieldError[]): string {
  return errors.map((error) => errorText(language, error.code)).join(' ')
}

export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''))
}
