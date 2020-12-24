// require("turbolinks").start()
require('@rails/ujs').start()
require('chartkick')
require('chart.js')

import '../css/main.scss'

document.addEventListener('DOMContentLoaded', function () {
  document.dispatchEvent(new Event('turbolinks:load'))
})
