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
