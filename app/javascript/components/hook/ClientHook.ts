import { useCallback, useState } from "react"
import { Client, getAllClients } from "components/service/Client"

export function useFetchClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState("")

  const fetchClients = useCallback(async function () {
    setFetching(true)

    try {
      const result = await getAllClients()
      setClients(result)
      setFetching(false)
      return result
    } catch (e) {
      setError("Hubo un error al obtener tus clientes. Por favor, intentalo mas tarde.")
      setFetching(false)
    }

    return []
  }, [setFetching, setClients, setError])

  return {
    error,
    fetching,
    clients,
    fetchClients,
  }
}
