// require("turbolinks").start()
require('@rails/ujs').start()
require('chartkick')
require('chart.js')
require('@fullcalendar/core')
require('@fullcalendar/daygrid')
require('@fullcalendar/timegrid')
require('@fullcalendar/interaction')
require('@fullcalendar/list')
require('@fullcalendar/core/locales/es')

require('../../../node_modules/tippy.js/dist/tippy.css')
require('../../../node_modules/tailwindcss/tailwind.css')
import '../css/main.scss'

document.addEventListener('DOMContentLoaded', function () {
  document.dispatchEvent(new Event('turbolinks:load'))
})
