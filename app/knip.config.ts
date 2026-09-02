import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  ignore: [
    'src/components/ui/**',
    // Registry iconiq instalado como material de componentes (uso sob demanda)
    'src/components/iconiq/**',
    'src/tanstack-table.d.ts',
  ],
  // Dependências das partes ainda não ligadas do material iconiq (a pasta
  // src/components/iconiq está no ignore, então o knip não vê esses usos)
  ignoreDependencies: [
    'embla-carousel-react',
    '@radix-ui/react-toolbar',
    '@radix-ui/react-use-controllable-state',
    'vaul',
    'input-otp',
    'next-themes',
    '@radix-ui/react-alert-dialog',
    '@radix-ui/react-avatar',
    '@radix-ui/react-checkbox',
    '@radix-ui/react-collapsible',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-scroll-area',
    '@radix-ui/react-select',
    '@radix-ui/react-separator',
    '@radix-ui/react-tooltip',
  ],
}

export default config