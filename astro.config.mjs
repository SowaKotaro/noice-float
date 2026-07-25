// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  /**
   * canonical・OGP の絶対 URL・sitemap.xml・llms.txt がすべてここを起点にする。
   *
   * **noicefloat.dev で行くと決めた**（2026-07-25・ユーザー判断）。ただし
   * **取得はまだ**なので、変える可能性は残っている。変えるときに直すのは
   * この 1 行と `public/robots.txt` の `Sitemap:` 行の 2 か所だけ
   * （各ページは `Astro.site` 経由でしか URL を組み立てていない）。
   */
  site: 'https://noicefloat.dev',

  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],

    ssr: {
      // OGP 画像を焼く @resvg/resvg-js はネイティブアドオン（.node）なので
      // バンドルできない。ビルド時にしか動かないため外部化して素の require に任せる。
      external: ['@resvg/resvg-js']
    },

    build: {
      // Astro 7 の vite は rolldown 版。ssr.external だけでは効かないので
      // バンドラ側にも同じことを伝える。
      rolldownOptions: { external: ['@resvg/resvg-js'] }
    }
  }
});
