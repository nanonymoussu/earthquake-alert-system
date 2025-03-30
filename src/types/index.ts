export type Coordinates = {
  latitude: number
  longitude: number
}

export type ImpactLevel = 'minor' | 'moderate' | 'major' | 'severe'

export type EarthquakeEvent = {
  id: string
  title: string
  time: number
  coordinates: Coordinates
  magnitude: number
  depth: number
  impactLevel: ImpactLevel
  place: string
  url: string
  felt: number | null
  tsunami: boolean
  distanceFromUser: number | null
}

export type SortOption =
  | 'mag-desc'
  | 'mag-asc'
  | 'time-desc'
  | 'time-asc'
  | 'distance-asc'
  | 'distance-desc'

export type FilterOptions = {
  dateRange: {
    start: Date | null
    end: Date | null
  }
  impactLevel: ImpactLevel[]
  minDistance: number | null
  magnitudeRange: {
    min: number
    max: number
  }
}

export type UserSettings = {
  userLocation: Coordinates | null
  sortBy: SortOption
  filters: FilterOptions
}
