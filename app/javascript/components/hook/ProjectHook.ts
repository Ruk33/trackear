import { useCallback, useState } from "react"
import { Project, getAllProjects } from "components/service/Project"

export function useFetchProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState("")

  const fetchProjects = useCallback(async function() {
    setFetching(true)

    try {
      const projects = await getAllProjects()
      setProjects(projects)
    } catch (e) {
      setError("Hubo un problema al obtener los proyectos.")
    }

    setFetching(false)
  }, [setFetching, setProjects, setError])

  return {
    projects,
    fetching,
    error,
    fetchProjects,
  }
}
