export type Location = {
  id: number
  longitude: number
  latitude: number
}

export interface Metadata {
  elevation: number
  image?: string
  timezone: string
  continent: string
  population: number
  name: string
  asciiname: string
  country: string
  longitude: number
  admin1: string
  admin2: string
}
