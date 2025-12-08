import antfu from '@antfu/eslint-config'

export default antfu(
  {
    unocss: true,
    formatters: true,
    pnpm: true,
    rules: {
      'antfu/top-level-function': 'off',
      'ts/no-use-before-define': 'off',
    },
  },
)
