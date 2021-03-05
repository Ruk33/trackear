export function getCsrfToken(): string {
  return document.getElementsByName("csrf-token")[0].content
}

export function getCsrfAsHeader() {
  return { "X-CSRF-Token": getCsrfToken() }
}
