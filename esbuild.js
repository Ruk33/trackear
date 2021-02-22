const esbuild = require("esbuild")
const tailwindcss = require("tailwindcss")
const autoprefixer = require("autoprefixer")
const postcss = require("esbuild-plugin-postcss2").default
const alias = require("esbuild-plugin-alias")
const prod = process.env.NODE_ENV === "production"

esbuild.build({
  entryPoints: [
    "app/javascript/packs/main.js",
    "app/javascript/components/views/invoices/new.tsx",
  ],
  sourcemap: prod ? false : "inline",
  bundle: true,
  outdir: "app/assets/javascripts",
  plugins: [
    alias({
      "react-dom": prod ?
      require.resolve("react-dom") :
      require.resolve("@hot-loader/react-dom")
    }),
    postcss({
      plugins: [
        tailwindcss("./tailwind.config.js"),
        autoprefixer
      ]
    }),
  ],
  minify: prod,
  watch: !prod,
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    "global": "window",
  }
}).catch((e) => console.error(e.message))
