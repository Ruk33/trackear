// require("turbolinks").start()
require('@rails/ujs').start()
require('chartkick')
require('chart.js')
require('@fullcalendar/core');
require('@fullcalendar/daygrid');
require('@fullcalendar/timegrid');
require('@fullcalendar/interaction');
require('@fullcalendar/list');
require('@fullcalendar/core/locales/es');

import 'tippy.js/dist/tippy.css';
import '../css/main.scss'

document.addEventListener('DOMContentLoaded', function () {
  document.dispatchEvent(new Event('turbolinks:load'))
})
