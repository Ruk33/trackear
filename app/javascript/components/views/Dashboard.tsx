import React, { useEffect, useState, useRef, useCallback } from "react"
import { toDate } from "date-fns-tz"
import { formatISO } from "date-fns"
import TrackearDateRangePicker from "components/TrackearDateRangePicker"

type Props = {
  formId: string,
  fromFieldId: string,
  toFieldId: string,
}

type MaybeDate = Date | null

export default function Dashboard(props: Props) {
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState(0)
  const [start, setStart] = useState<MaybeDate>(null)
  const [end, setEnd] = useState<MaybeDate>(null)

  const form = useRef<HTMLFormElement>()
  const from = useRef<HTMLInputElement>()
  const to = useRef<HTMLInputElement>()

  const onSelectStart = useCallback((value: MaybeDate) => {
    setStart(value)
    setSelecting((prevSelecting) => prevSelecting + 1)
  }, [])

  const onSelectEnd = useCallback((value: MaybeDate) => {
    setEnd(value)
    setSelecting((prevSelecting) => prevSelecting + 1)
  }, [])

  useEffect(() => {
    form.current = document.getElementById(props.formId) as HTMLFormElement
    from.current = document.getElementById(props.fromFieldId) as HTMLInputElement
    to.current = document.getElementById(props.toFieldId) as HTMLInputElement

    if (from.current && from.current.value) {
      setStart(toDate(from.current.value))
    }

    if (to.current && to.current.value) {
      setEnd(toDate(to.current.value))
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    if (!start || !end) {
      return
    }

    if (!from.current || !to.current) {
      return
    }

    const asDate = { representation: "date" }

    from.current.value = formatISO(start, asDate)
    to.current.value = formatISO(end, asDate)

    if (selecting < 2) {
      return
    }

    if (!form || !form.current) {
      return
    }

    form.current.submit()
  }, [start, end, selecting])

  if (loading) {
    return <div />;
  }

  return (
    <TrackearDateRangePicker
      start={start}
      end={end}
      onChangeStart={onSelectStart}
      onChangeEnd={onSelectEnd}
    />
  )
}
