export type Project = {
  id: string,
  name: string,
}

/**
 * Get all the projects of the current
 * logged in user.
 */
export async function getAllProjects(): Promise<Project[]> {
  const result = await fetch("/projects.json")
  return result.json()
}
