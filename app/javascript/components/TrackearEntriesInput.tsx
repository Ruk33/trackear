import React, { memo, useCallback } from "react"
import { useFetchEntries } from "./hook/EntryHook"
import { Entry } from "./service/Entry"
import TrackearDateRangePicker from "./TrackearDateRangePicker"

type Props = {
  project: string,
  start: Date | null,
  end: Date | null,
  onSetStart: (value: Date | null) => void,
  onSetEnd: (value: Date | null) => void,
  onLoadEntries: (entries: Entry[]) => void,
}

function TrackearEntriesInput({ start, end, onSetStart, onSetEnd, project, onLoadEntries }: Props) {
  const { fetchEntries, fetching } = useFetchEntries()

  const loadEntries = useCallback(async (project: string, start: Date, end: Date) => {
    try {
      const entries = await fetchEntries(project, start, end)
      onLoadEntries(entries)
    } catch (e) {}
  }, [onLoadEntries])

  const onChangeEnd = useCallback((end: Date | null) => {
    onSetEnd(end)

    if (!project || !start || !end) {
      return
    }

    loadEntries(project, start, end)
  }, [onSetEnd, project, start, loadEntries])

  return (
    <TrackearDateRangePicker
      start={start}
      end={end}
      onChangeStart={onSetStart}
      onChangeEnd={onChangeEnd}
      disabled={!project || fetching}
    />
  )
}

export default memo(TrackearEntriesInput)
