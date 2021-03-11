import { useCallback, useState } from "react"
import { getCurrentUser, User } from "components/service/User"

export function useFetchCurrentUser() {
  const [user, setUser] = useState<User | undefined>(undefined)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState("")

  const fetchUser = useCallback(async function () {
    setFetching(true)

    try {
      const result = await getCurrentUser()
      setUser(result)
      setFetching(false)
      return result
    } catch (e) {
      setError("Hubo un error al obtener el usuario. Por favor, intentalo mas tarde.")
      setFetching(false)
    }

    return undefined
  }, [setFetching, setUser, setError])

  return {
    error,
    fetching,
    user,
    fetchUser,
  }
}
