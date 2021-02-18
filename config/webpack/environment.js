const { environment } = require('@rails/webpacker')

const elm =  require('./loaders/elm')

const alias = {
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
  }
}

environment.loaders.prepend('elm', elm)
environment.config.merge(alias)

module.exports = environment
