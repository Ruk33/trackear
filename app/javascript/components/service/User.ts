export type User = {
  id: number,
  email: string,
  first_name: string,
  last_name: string,
  picture: string,
  company_name: string,
  company_address: string,
  company_email: string,
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch("/me.json")
  return response.json()
}
