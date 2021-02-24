import { Client, getAllClients } from "components/service/Client"
import { useState } from "react"

export function useFetchClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState("")

  async function fetchClients() {
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
  }

  return {
    error,
    fetching,
    clients,
    fetchClients,
  }
}
