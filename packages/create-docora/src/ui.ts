import { cancel, isCancel } from '@clack/prompts'

export function handleCancel<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel('Operation cancelled.')
    process.exit(1)
  }

  return value
}
