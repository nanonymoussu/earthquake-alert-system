/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef, useState } from 'react'
import { Coordinates, EarthquakeEvent } from '../types'

type MapControl = {
  mapRef: React.RefObject<any>
  selectedEarthquake: EarthquakeEvent | null
  setSelectedEarthquake: (earthquake: EarthquakeEvent | null) => void
  zoomToLocation: (coordinates: Coordinates) => void
  zoomToUserLocation: (coordinates: Coordinates | null) => void
}

export const useMapControl = (): MapControl => {
  const mapRef = useRef<any>(null)
  const [selectedEarthquake, setSelectedEarthquake] =
    useState<EarthquakeEvent | null>(null)

  const zoomToLocation = useCallback((coordinates: Coordinates) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [coordinates.longitude, coordinates.latitude],
        zoom: 10,
        duration: 1000,
      })
    }
  }, [])

  const zoomToUserLocation = useCallback((coordinates: Coordinates | null) => {
    if (coordinates && mapRef.current) {
      mapRef.current.flyTo({
        center: [coordinates.longitude, coordinates.latitude],
        zoom: 10,
        duration: 1000,
      })
    }
  }, [])

  return {
    mapRef,
    selectedEarthquake,
    setSelectedEarthquake,
    zoomToLocation,
    zoomToUserLocation,
  }
}
