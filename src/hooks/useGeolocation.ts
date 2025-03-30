import { useEffect, useState } from 'react'
import { Coordinates } from '../types'

type GeolocationHook = {
  userLocation: Coordinates | null
  error: string | null
  isLoading: boolean
  requestLocation: () => void
}

export const useGeolocation = (): GeolocationHook => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsLoading(false)
      },
      (error) => {
        setError(`Unable to retrieve your location: ${error.message}`)
        setIsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  useEffect(() => {
    requestLocation()
  }, [])

  return { userLocation, error, isLoading, requestLocation }
}
