import type { Contact, ContactInput } from '@shared/types'
import type { AvatarService } from './avatarService'
import type { ContactsRepository, StoredContact } from '../database/contactsRepository'

export interface ContactService {
  list: () => Contact[]
  create: (input: ContactInput) => Contact
  update: (id: string, input: ContactInput) => Contact | null
  remove: (id: string) => boolean
}

export function createContactService(repository: ContactsRepository, avatars: AvatarService): ContactService {
  function publish(contact: StoredContact): Contact {
    const { avatarPath, ...rest } = contact
    return { ...rest, avatarUrl: avatars.publicUrl(avatarPath) }
  }

  function nextAvatarPath(id: string, current: string | null, input: ContactInput): string | null {
    if (input.avatarDataUrl) return avatars.save(id, input.avatarDataUrl)
    if (input.removeAvatar) {
      avatars.remove(current)
      avatars.removeForContact(id)
      return null
    }
    return current
  }

  return {
    list: () => repository.list().map(publish),
    create: (input) => {
      const created = repository.create(input, null)
      if (!input.avatarDataUrl) return publish(created)
      try {
        const avatarPath = avatars.save(created.id, input.avatarDataUrl)
        const updated = repository.update(created.id, { ...input, avatarDataUrl: null, removeAvatar: false }, avatarPath)
        return publish(updated ?? { ...created, avatarPath })
      } catch (error) {
        repository.remove(created.id)
        avatars.removeForContact(created.id)
        throw error
      }
    },
    update: (id, input) => {
      const existing = repository.get(id)
      if (!existing) return null
      const avatarPath = nextAvatarPath(id, existing.avatarPath, input)
      const updated = repository.update(id, input, avatarPath)
      return updated ? publish(updated) : null
    },
    remove: (id) => {
      const removed = repository.remove(id)
      if (!removed) return false
      avatars.remove(removed.avatarPath)
      avatars.removeForContact(id)
      return true
    }
  }
}
