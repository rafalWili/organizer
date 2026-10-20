import { initials } from '@shared/names'
import type { Contact } from '@shared/types'

export function Avatar({ contact, size = 40 }: { contact: Pick<Contact, 'firstName' | 'lastName' | 'avatarUrl'>; size?: number }) {
  if (contact.avatarUrl) {
    return (
      <img
        src={contact.avatarUrl}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className="grid place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
      style={{ width: size, height: size }}
    >
      {initials(contact)}
    </span>
  )
}
