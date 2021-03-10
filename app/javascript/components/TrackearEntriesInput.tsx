import React, { memo, useCallback, useEffect } from "react"
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
  disabled?: boolean,
}

function TrackearEntriesInput({ start, end, onSetStart, onSetEnd, project, onLoadEntries, disabled }: Props) {
  const { fetchEntries, fetching } = useFetchEntries()

  const loadEntries = useCallback(async (project: string, start: Date, end: Date) => {
    try {
      const entries = await fetchEntries(project, start, end)
      onLoadEntries(entries)
    } catch (e) {}
  }, [onLoadEntries])

  useEffect(() => {
    if (!project || !start || !end) {
      return
    }

    loadEntries(project, start, end)
  }, [project, start, end, loadEntries])

  return (
    <TrackearDateRangePicker
      start={start}
      end={end}
      onChangeStart={onSetStart}
      onChangeEnd={onSetEnd}
      disabled={!project || fetching || disabled}
    />
  )
}

export default memo(TrackearEntriesInput)
