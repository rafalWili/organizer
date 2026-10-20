export function displayName(contact: { firstName: string; lastName: string | null }): string {
  const last = contact.lastName?.trim() ?? ''
  return last ? `${contact.firstName.trim()} ${last}` : contact.firstName.trim()
}

export function contactIdentity(contact: {
  firstName: string
  lastName: string | null
  birthDay: number
  birthMonth: number
}): string {
  const first = contact.firstName.trim().toLocaleLowerCase('pl')
  const last = (contact.lastName ?? '').trim().toLocaleLowerCase('pl')
  return `${first}|${last}|${contact.birthMonth}|${contact.birthDay}`
}

export function initials(contact: { firstName: string; lastName: string | null }): string {
  const first = contact.firstName.trim().charAt(0)
  const last = contact.lastName?.trim().charAt(0) ?? ''
  return `${first}${last}`.toLocaleUpperCase('pl')
}
