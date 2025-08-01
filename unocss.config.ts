import { defineConfig } from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno, transformerDirectives } from 'unocss'
import { presetDaisy } from '@ameinhardt/unocss-preset-daisy'

export default defineConfig({
  presets: [
    await presetDaisy(),
    presetUno(),
    presetAttributify(),
    presetIcons(),
  ],
  transformers: [
    transformerDirectives(),
  ],
})
