/**
 * postcss.config.js
 * Tells Next.js to run Tailwind and Autoprefixer over our CSS.
 * Tailwind reads tailwind.config.js; Autoprefixer adds vendor prefixes
 * (like -webkit-) so the site behaves consistently across browsers.
 *
 * Note: this file uses CommonJS (module.exports) on purpose, because
 * create-next-app does not set "type": "module" in package.json.
 */

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};