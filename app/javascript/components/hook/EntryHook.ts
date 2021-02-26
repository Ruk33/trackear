import { useState, useCallback } from "react"
import { DateTime } from "luxon"
import { Entry } from "components/service/Entry"

export function useFetchEntries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState("")

  const fetchEntries = useCallback(async (project: string, start: Date, end: Date): Promise<Entry[]> => {
    if (!project) {
      return []
    }

    setFetching(true)

    const entriesUri = `/projects/${project}/status_period.json`
    const formattedStart = DateTime.fromJSDate(start).toISODate()
    const formattedEnd = DateTime.fromJSDate(end).toISODate()

    try {
      const rawResult = await fetch(`${entriesUri}?start_date=${formattedStart}&end_date=${formattedEnd}`)
      const jsonResult = await rawResult.json()
      setEntries(jsonResult)
      setFetching(false)
      return jsonResult
    } catch (e) {
      setError("Hubo un problema al obtener los clientes.")
      setFetching(false)
    }

    return []
  }, [setFetching, setEntries, setError])

  return {
    entries,
    fetchEntries,
    fetching,
    error,
  }
}
