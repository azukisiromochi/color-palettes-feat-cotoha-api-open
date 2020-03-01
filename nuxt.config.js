const webpack = require('webpack')

const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

module.exports = {
  srcDir: './client/',
  mode: 'spa',
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      }
    ]
  },
  env: {
    baseUrl
  },
  serverMiddleware: ['~~/api/'],
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [
    // Bulma Doc: https://bulma.io/documentation/
    { src: '~/assets/css/bulma/core.scss', lang: 'sass' }
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt-community/modules/tree/master/packages/bulma
    '@nuxtjs/bulma',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    // Doc: https://github.com/Developmint/nuxt-webfontloader
    'nuxt-webfontloader',
    // Doc: https://www.npmjs.com/package/vue-scrollto
    'vue-scrollto/nuxt',
    // Doc: https://github.com/nuxt-community/style-resources-module
    '@nuxtjs/style-resources',
    // Doc: https://www.npmjs.com/package/nuxt-fontawesome
    'nuxt-fontawesome'
  ],
  webfontloader: {
    google: {
      families: ['Sawarabi+Mincho', 'Noto+Serif+JP']
    }
  },
  styleResources: {
    sass: ['~/assets/css/bulma/utilities.scss']
  },
  fontawesome: {
    component: 'fa'
  },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** Build configuration
   */
  build: {
    postcss: {
      preset: {
        features: {
          customProperties: false
        }
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        _: 'lodash'
      })
    ],
    extend(config, ctx) {}
  }
}
