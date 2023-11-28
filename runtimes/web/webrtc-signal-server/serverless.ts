import type { AWS } from '@serverless/typescript'

const config: AWS = {
  service: 'wasm4-signal-server',

  package: {
    individually: true,
  },

  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    timeout: 25,
    deploymentMethod: 'direct',
    versionFunctions: false,
  },

  functions: {
    main: {
      handler: 'src/main.handler',
      events: [
        {
          websocket: {
            route: '$connect',
          }
        },
        {
          websocket: {
            route: '$default',
          }
        }
      ]
    },
  },

  custom: {
    esbuild: {
      sourcemap: true,
    },
  },

  plugins: [
    'serverless-esbuild',
    'serverless-offline',
  ],
}

module.exports = config
