// import { theme } from './.nuxt/types/tailwind.config';
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  devtools: { enabled: true },
  colorMode: {
    preference: 'light'
  },
  typescript: {
    strict: true,
    typeCheck: false,
  }
})
