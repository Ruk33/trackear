import React, { ChangeEvent, memo, useCallback, useEffect, useMemo } from "react"
import { useFetchProjects } from "./hook/ProjectHook"
import TrackearFetching from "./TrackearFetching"
import TrackearSelectInput, { SelectOption } from "./TrackearSelectInput"

type ProjectSelectProps = {
  /*
   * Selected project id.
   */
  project: string,
  onProjectsLoaded: () => void,
  onSelectProject: (project: string) => void,
}

function TrackearProjectSelectInput({ project, onProjectsLoaded, onSelectProject }: ProjectSelectProps) {
  const { projects, fetchProjects, fetching, error } = useFetchProjects()

  const handleSelectProject = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    onSelectProject(e.target.value)
  }, [onSelectProject])

  const projectOptions: SelectOption[] = useMemo(() => {
    return projects.map((project) => ({
      id: project.id,
      label: project.name,
      value: project.id,
    }))
  }, [projects])

  const onFetchProjects = useCallback(async () => {
    await fetchProjects()
    onProjectsLoaded()
  }, [fetchProjects, onProjectsLoaded])

  useEffect(() => {
    onFetchProjects()
  }, [onFetchProjects])

  return (
    <TrackearFetching loading={fetching} error={error}>
      <TrackearSelectInput
        placeholder="Seleccionar proyecto"
        options={projectOptions}
        value={project}
        onChange={handleSelectProject}
      />
    </TrackearFetching>
  )
}

export default memo(TrackearProjectSelectInput)
