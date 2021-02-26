import { Contract } from "./Contract";
import { calculateTrackAmount, Track } from "./Track";
import { User } from "./User";

/**
 * Entry contains all the
 * tracks registered by a
 * user.
 */
export type Entry = {
  contract: Contract,
  tracks: Track[],
  user: User,
}

/**
 * Calculate total entries amount in cash.
 */
export function calculateTotalFromEntries(entries: Entry[], ignoredTracks: Map<number, boolean>) {
  return entries.reduce((entryResult, entry) => {
    return entryResult + entry.tracks.reduce((result, track) => {
      if (ignoredTracks.get(track.id)) {
        return result
      }
      return result + calculateTrackAmount(track)
    }, 0)
  }, 0)
}

/**
 * Merge entries and the tracks inside of it
 * without leaving duplicates.
 * Useful for import trackings feature in invoice,
 * where the user can import tracks by dates and duplicates
 * may occur. With this function, we can safely merge
 * those records.
 */
export function mergeEntries(a: Entry[], b: Entry[]): Entry[] {
  const combined: Entry[] = [...a, ...b]
  const merged: Entry[] = []

  combined.forEach((entry) => {
    const userEntry = merged.find((mergedEntry) => mergedEntry.user.id == entry.user.id)

    if (!userEntry) {
      // Add a copy of the track so we don't mutate the original
      // in case we need to merge tracks
      merged.push({
        ...entry,
        tracks: entry.tracks.map(track => ({ ...track }))
      })
      return
    }

    const withoutRepeated = entry.tracks.filter((track) => {
      return !userEntry.tracks.find((userTrack) => userTrack.id === track.id)
    })

    // Safe since we are mutating our local copy
    userEntry.tracks = [
      ...userEntry.tracks,
      ...withoutRepeated,
    ]
  })

  return merged
}
