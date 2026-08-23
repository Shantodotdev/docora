export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

export const PACKAGE_MANAGERS: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun']

export function isPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as string[]).includes(value)
}

export function detectInvokingPackageManager(
  userAgent = process.env.npm_config_user_agent,
): PackageManager | undefined {
  const name = userAgent?.split('/')[0]
  return name && isPackageManager(name) ? name : undefined
}

export function detectPackageManager(
  userAgent = process.env.npm_config_user_agent,
): PackageManager {
  return detectInvokingPackageManager(userAgent) ?? 'npm'
}

export function runCommand(manager: PackageManager, script: string): string {
  return `${manager} run ${script}`
}
