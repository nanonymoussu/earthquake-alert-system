/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import {
  Coordinates,
  EarthquakeEvent,
  FilterOptions,
  SortOption,
} from '../types'
import { useDataPolling } from './useDataPolling'
import {
  calculateDistance,
  getImpactLevelFromMagnitude,
} from '../utils/helpers'

const API_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'

const STORAGE_KEY = 'earthquake_data_history'
const DISPLAY_LIMIT = 500

export const useEarthquakeData = (
  userLocation: Coordinates | null,
  sortBy: SortOption,
  filters: FilterOptions
) => {
  const [earthquakes, setEarthquakes] = useState<EarthquakeEvent[]>(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      return storedData ? JSON.parse(storedData) : []
    } catch (e) {
      console.error('Failed to load stored earthquake data:', e)
      return []
    }
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const { data, isConnected, error } = useDataPolling(API_URL, 360000)

  const processEarthquakeData = useCallback(
    (rawData: any): EarthquakeEvent[] => {
      if (!rawData || !rawData.features) return []

      const limitedFeatures = rawData.features.slice(0, 1000)

      return limitedFeatures.map((feature: any) => {
        const { id, properties, geometry } = feature
        const [longitude, latitude, depth] = geometry.coordinates

        const distanceFromUser = userLocation
          ? calculateDistance(userLocation, { latitude, longitude })
          : null

        const magnitude = properties.mag

        return {
          id,
          title: properties.title,
          time: properties.time,
          coordinates: { latitude, longitude },
          magnitude,
          depth,
          impactLevel: getImpactLevelFromMagnitude(magnitude),
          place: properties.place,
          url: properties.url,
          felt: properties.felt,
          tsunami: !!properties.tsunami,
          distanceFromUser,
        }
      })
    },
    [userLocation]
  )

  const timeoutRef = useRef<number | null>(null)
  const debouncedSaveToLocalStorage = useCallback((data: EarthquakeEvent[]) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (e) {
        console.error('Failed to save earthquake data to localStorage:', e)
      }
      timeoutRef.current = null
    }, 5000)
  }, [])

  const filterEarthquakes = useMemo(() => {
    return (events: EarthquakeEvent[]): EarthquakeEvent[] => {
      return events.filter((event) => {
        // Date range filter
        if (
          filters.dateRange.start &&
          new Date(event.time) < filters.dateRange.start
        )
          return false
        if (
          filters.dateRange.end &&
          new Date(event.time) > filters.dateRange.end
        )
          return false

        // Impact level filter
        if (
          filters.impactLevel.length > 0 &&
          !filters.impactLevel.includes(event.impactLevel)
        )
          return false

        // Distance filter
        if (
          filters.minDistance !== null &&
          event.distanceFromUser !== null &&
          event.distanceFromUser < filters.minDistance
        )
          return false

        // Magnitude range filter
        if (
          filters.magnitudeRange &&
          (event.magnitude < filters.magnitudeRange.min ||
            event.magnitude > filters.magnitudeRange.max)
        )
          return false

        return true
      })
    }
  }, [filters])

  const sortEarthquakes = useMemo(() => {
    return (events: EarthquakeEvent[]): EarthquakeEvent[] => {
      const sortedEvents = [...events]

      switch (sortBy) {
        case 'mag-desc':
          return sortedEvents.sort((a, b) => b.magnitude - a.magnitude)
        case 'mag-asc':
          return sortedEvents.sort((a, b) => a.magnitude - b.magnitude)
        case 'time-desc':
          return sortedEvents.sort((a, b) => b.time - a.time)
        case 'time-asc':
          return sortedEvents.sort((a, b) => a.time - b.time)
        case 'distance-asc':
          return sortedEvents.sort((a, b) => {
            if (a.distanceFromUser === null && b.distanceFromUser === null)
              return 0
            if (a.distanceFromUser === null) return 1
            if (b.distanceFromUser === null) return -1
            return a.distanceFromUser - b.distanceFromUser
          })
        default:
          return sortedEvents
      }
    }
  }, [sortBy])

  useEffect(() => {
    if (data) {
      const processedData = processEarthquakeData(data)

      setEarthquakes((prevEarthquakes) => {
        const existingIds = new Set(prevEarthquakes.map((eq) => eq.id))
        const newEarthquakes = processedData.filter(
          (eq) => !existingIds.has(eq.id)
        )

        if (newEarthquakes.length === 0) {
          return prevEarthquakes
        }

        const combinedEarthquakes = [...prevEarthquakes, ...newEarthquakes]

        debouncedSaveToLocalStorage(combinedEarthquakes)

        return combinedEarthquakes
      })

      setIsLoading(false)
    }
  }, [data, processEarthquakeData, debouncedSaveToLocalStorage])

  useEffect(() => {
    const CLEANUP_KEY = 'last_earthquake_cleanup'
    const now = Date.now()
    const lastCleanup = parseInt(localStorage.getItem(CLEANUP_KEY) || '0')

    if (now - lastCleanup > 24 * 60 * 60 * 1000) {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

      setEarthquakes((prevEarthquakes) => {
        const filteredEarthquakes = prevEarthquakes.filter(
          (quake) => new Date(quake.time) > oneYearAgo
        )

        if (filteredEarthquakes.length !== prevEarthquakes.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEarthquakes))
        }

        localStorage.setItem(CLEANUP_KEY, now.toString())
        return filteredEarthquakes
      })
    }
  }, [])

  const getSortedAndFilteredEarthquakes = useMemo(() => {
    const filteredData = filterEarthquakes(earthquakes)
    const sortedData = sortEarthquakes(filteredData)

    return sortedData.slice(0, DISPLAY_LIMIT)
  }, [earthquakes, filterEarthquakes, sortEarthquakes])

  return {
    earthquakes: getSortedAndFilteredEarthquakes,
    isLoading,
    isConnected,
    error,
  }
}
