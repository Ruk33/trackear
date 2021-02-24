import { DateTime } from "luxon"

/**
 * Track is the entry of work
 * registered by a user. It
 * contains a from and a to
 * date from where we can
 * calculate it's quantity.
 */
export type Track = {
  id: number,
  description: string,
  from: string,
  to: string,
  project_rate: string,
  user_rate: string,
}

export function hoursFromTrack(track: Track) {
  return DateTime
  .fromISO(track.to)
  .diff(DateTime.fromISO(track.from), "hours")
  .hours
}

export function hoursAndMinutesFromTrack(track: Track) {
  return DateTime
  .fromISO(track.to)
  .diff(DateTime.fromISO(track.from), ["hours", "minutes"])
  .toObject()
}

export function calculateTrackAmount(track: Track) {
  const hours = hoursFromTrack(track)
  const rate = Number(track.project_rate) || 0
  return Number((rate * hours).toFixed(2))
}

/**
 * Calculate hours and minutes from track and
 * return a string with a format HH:MM
 */
export function formatQtyTrack(track: Track): string {
  const diff = hoursAndMinutesFromTrack(track)
  const safeHours = Number(diff.hours) || 0
  const safeMinutes = Number(diff.minutes) || 0
  const hours = safeHours < 10 ? `0${safeHours}` : `${safeHours}`
  const ceilMinutes = Math.ceil(safeMinutes)
  const minutes = ceilMinutes < 10 ? `0${ceilMinutes}` : `${ceilMinutes}`

  return `${hours}:${minutes}`
}

/**
 * Updates hours and minutes from track.
 * This allows to easily update how much time is
 * logged in a track.
 */
export function setHoursAndMinutesFromTrack(track: Track, hours: number, minutes: number) {
  const newDate =
    DateTime
    .fromISO(track.from)
    .plus({ hours: hours, minutes: minutes })
    .toISO()

  track.to = newDate
}
