import { Elm } from '../../Page/Analytics/Index'

document.addEventListener('turbolinks:load', function () {
  const parent = document.getElementById('analytics')

  if (!parent) return

  const node = document.createElement('div')

  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }

  parent.appendChild(node)

  Elm.Page.Analytics.Index.init({ node: node })
})
