import { Coordinates, ImpactLevel } from '../types'

export const getImpactLevelFromMagnitude = (magnitude: number): ImpactLevel => {
  if (magnitude < 4.0) {
    return 'minor'
  } else if (magnitude < 5.5) {
    return 'moderate'
  } else if (magnitude < 7.0) {
    return 'major'
  } else {
    return 'severe'
  }
}

export const getImpactLevelColor = (impactLevel: ImpactLevel): string => {
  switch (impactLevel) {
    case 'minor':
      return 'bg-green-100 border-green-400'
    case 'moderate':
      return 'bg-yellow-100 border-yellow-400'
    case 'major':
      return 'bg-orange-100 border-orange-400'
    case 'severe':
      return 'bg-red-100 border-red-400'
    default:
      return 'bg-gray-100 border-gray-400'
  }
}

export const getImpactLevelTextColor = (impactLevel: ImpactLevel): string => {
  switch (impactLevel) {
    case 'minor':
      return 'text-green-800'
    case 'moderate':
      return 'text-yellow-800'
    case 'major':
      return 'text-orange-800'
    case 'severe':
      return 'text-red-800'
    default:
      return 'text-gray-800'
  }
}

export const calculateDistance = (
  pointA: Coordinates,
  pointB: Coordinates
): number => {
  // Haversine formula to calculate distance between two points on the Earth
  const R = 6371 // Earth's radius in km
  const dLat = degreesToRadians(pointB.latitude - pointA.latitude)
  const dLon = degreesToRadians(pointB.longitude - pointA.longitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(pointA.latitude)) *
      Math.cos(degreesToRadians(pointB.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

export const degreesToRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}

export const formatDistance = (distance: number | null): string => {
  if (distance === null) return 'Unknown'
  if (distance < 1) return `${Math.round(distance * 1000)}m`
  return `${Math.round(distance)}km`
}

export const formatDateTime = (timestamp: number | Date): string => {
  const date = new Date(timestamp)

  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // Month is 0-indexed
  const year = date.getFullYear()

  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`
}

export const formatDate = formatDateTime

export const formatMagnitude = (magnitude: number): string => {
  return magnitude.toFixed(1)
}
