export type Client = {
  id: number,
  first_name: string,
  last_name: string,
  email: string,
  address: string,
}

/**
 * Get all clients associated to the
 * current logged user.
 */
export async function getAllClients(): Promise<Client[]> {
  const response = await fetch("/clients.json")
  return response.json()
}
