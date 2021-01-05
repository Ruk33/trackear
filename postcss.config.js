let environment = {
  plugins: [
    require('autoprefixer'),
    require('postcss-import'),
    require('tailwindcss')('./app/javascript/css/tailwind.config.js'),
    require('postcss-flexbugs-fixes'),
    require('postcss-preset-env')({
      autoprefixer: {
        flexbox: 'no-2009'
      },
      stage: 3
    })
  ]
}

// if (process.env.RAILS_ENV === 'production') {
//   environment.plugins.push(
//     require('@fullhuman/postcss-purgecss')({
//       content: [
//         './app/**/*.erb',
//         './app/helpers/**/*.rb',
//         './app/javascript/**/*.js',
//         './app/javascript/**/*.elm'
//       ],
//       defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || []
//     })
//   )
// }

module.exports = environment;
