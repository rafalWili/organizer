import type { Language, ReminderType } from './types'

export interface NotificationCopy {
  title: string
  body: string
}

export function birthdayNotification(
  language: Language,
  reminderType: ReminderType,
  firstName: string,
  age: number | null
): NotificationCopy {
  const name = firstName.trim()
  const withAge = age != null && age >= 1
  if (language === 'en') return englishCopy(reminderType, name, age, withAge)
  return polishCopy(reminderType, name, age, withAge)
}

function polishCopy(reminderType: ReminderType, name: string, age: number | null, withAge: boolean): NotificationCopy {
  if (reminderType === 'on_day') {
    return {
      title: '🎂 Dzisiaj urodziny!',
      body: withAge
        ? `Dzisiaj ${name} obchodzi ${age}. urodziny. Nie zapomnij złożyć życzeń!`
        : `Dzisiaj ${name} obchodzi urodziny. Nie zapomnij złożyć życzeń!`
    }
  }
  if (reminderType === 'days_1') {
    return {
      title: '🎂 Jutro urodziny!',
      body: withAge
        ? `Jutro ${name} obchodzi ${age}. urodziny. Przygotuj życzenia.`
        : `Jutro ${name} obchodzi urodziny. Przygotuj życzenia.`
    }
  }
  const days = reminderType === 'days_3' ? 3 : 7
  return {
    title: `🎂 Urodziny za ${days} dni`,
    body: withAge
      ? `Za ${days} dni ${name} obchodzi ${age}. urodziny.`
      : `Za ${days} dni ${name} obchodzi urodziny.`
  }
}

function englishCopy(reminderType: ReminderType, name: string, age: number | null, withAge: boolean): NotificationCopy {
  if (reminderType === 'on_day') {
    return {
      title: '🎂 Birthday today!',
      body: withAge
        ? `${name} turns ${age} today. Don't forget to send your wishes!`
        : `${name} has a birthday today. Don't forget to send your wishes!`
    }
  }
  if (reminderType === 'days_1') {
    return {
      title: '🎂 Birthday tomorrow!',
      body: withAge ? `${name} turns ${age} tomorrow.` : `${name} has a birthday tomorrow.`
    }
  }
  const days = reminderType === 'days_3' ? 3 : 7
  return {
    title: `🎂 Birthday in ${days} days`,
    body: withAge ? `${name} turns ${age} in ${days} days.` : `${name} has a birthday in ${days} days.`
  }
}

export function testNotification(language: Language): NotificationCopy {
  if (language === 'en') {
    return {
      title: 'Birthdayly',
      body: 'This is a test notification. Reminders stay on this computer.'
    }
  }
  return {
    title: 'Birthdayly',
    body: 'To jest testowe powiadomienie. Przypomnienia zostają na tym komputerze.'
  }
}
