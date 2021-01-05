import tippy from 'tippy.js';
import { createPopper } from '@popperjs/core';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';

let container = document.getElementById('calendar-container')
let newTrackModal = document.getElementById('newTrack');
let newTrackFrom = document.getElementById('activity_track_from');
let summary = document.getElementById('summary')

document.getElementById('cancel-invoice-form').addEventListener('click', function(e) {
  e.preventDefault();
  newTrackModal.style = 'display: none'
})

let element = document.getElementById('calendar')
let calendar = new Calendar(
  element,
  {
    noEventsText: 'No hay registros en este período',
    locale: esLocale,
    initialView: 'listMonth',
    timeZone: 'UTC',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    events: {
      url: window.location.href + '.json',
      method: 'GET',
      startParam: 'logs[from]',
      endParam: 'logs[to]',
    },
    buttonText: {
      today: 'Hoy'
    },
    headerToolbar: {
      left: 'title',
      center: 'dayGridMonth,timeGridWeek',
      right: 'listMonth'
    },
    footerToolbar: {
      right: 'today prevYear,prev,next,nextYear'
    },
    views: {
      dayGridMonth: { buttonText: 'Vista calendario' },
      timeGridWeek: { buttonText: 'Semana' },
      listMonth: { buttonText: 'Todos los registros del mes' }
    },
    eventDidMount: function(info) {
      tippy(info.el, { content: info.event.title });
    },
    dateClick: function(info) {
      newTrackFrom.valueAsDate = info.date
      newTrackModal.style = 'display: block'
      createPopper(container, newTrackModal, { placement: 'right-start' });
    },
    eventSourceSuccess: function(e) {
      let sum = 0;
      if (!e) return e;
      for (let i = 0; i < e.length; i++) {
        if (!e[i]) continue;
        sum += Number(e[i].calendar_billable)
      }
      summary.innerText = `$${sum.toFixed(2)}`;
      return e;
    },
    eventBackgroundColor: '#6dc4f4',
    eventDisplay: 'block',
    displayEventTime: false
  }
)

calendar.render();
