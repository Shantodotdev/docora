/**
 * @param {import('next').NextConfig & { contentDir?: string }} [nextConfig]
 * @returns {import('next').NextConfig}
 */
export function withDocora(nextConfig = {}) {
  const { contentDir = 'content', ...rest } = nextConfig

  const transpilePackages = new Set(rest.transpilePackages ?? [])
  transpilePackages.add('docora')

  return {
    ...rest,
    transpilePackages: [...transpilePackages],
    outputFileTracingIncludes: {
      ...rest.outputFileTracingIncludes,
      '/**/*': [`./${contentDir}/**/*`],
    },
  }
}

export default withDocora
