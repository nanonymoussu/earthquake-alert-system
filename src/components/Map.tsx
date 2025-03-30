/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Coordinates, EarthquakeEvent } from '../types'
import { getImpactLevelFromMagnitude, formatDateTime } from '../utils/helpers'

mapboxgl.accessToken =
  'pk.eyJ1IjoibmFub255bW91c3N1IiwiYSI6ImNtOHVlY3J6MjBtOHMybHBrOWh2MXQzaHkifQ.g9GjiCUX6uinj0mj0LsIBQ'

interface MapProps {
  earthquakes: EarthquakeEvent[]
  userLocation: Coordinates | null
  selectedEarthquake: EarthquakeEvent | null
  mapRef: React.RefObject<any>
  onEarthquakeSelect: (earthquake: EarthquakeEvent) => void
}

const Map: React.FC<MapProps> = ({
  earthquakes,
  userLocation,
  selectedEarthquake,
  mapRef,
  onEarthquakeSelect,
}) => {
  // Initialize map on component mount
  useEffect(() => {
    if (!mapboxgl.supported()) {
      console.error('Mapbox GL is not supported by your browser')
      return
    }

    // Check if container exists
    const mapContainer = document.getElementById('earthquake-map')
    if (!mapContainer) {
      console.error('Map container not found')
      return
    }

    try {
      const map = new mapboxgl.Map({
        container: 'earthquake-map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: userLocation
          ? [userLocation.longitude, userLocation.latitude]
          : [100.992541, 15.870032], // Thailand center if no user location
        zoom: userLocation ? 6 : 5,
        attributionControl: true,
      })

      map.on('error', (e) => {
        console.error('Mapbox error:', e.error)
      })

      // Set the map reference for external control
      mapRef.current = map

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Wait for map to load before adding markers
      map.on('load', () => {
        // Add user location marker if available
        if (userLocation) {
          // Create and add user location marker without storing the reference
          new mapboxgl.Marker({ color: '#0080ff' })
            .setLngLat([userLocation.longitude, userLocation.latitude])
            .addTo(map)

          // Add popup for user location
          new mapboxgl.Popup({ offset: 25 })
            .setLngLat([userLocation.longitude, userLocation.latitude])
            .setHTML('<h3>Your Location</h3>')
            .addTo(map)
        }
      })

      // Clean up on unmount
      return () => map.remove()
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }, [mapRef, userLocation])

  // Update earthquake markers when earthquake data changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.loaded()) return

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.earthquake-marker')
    existingMarkers.forEach((marker) => marker.remove())

    // Add earthquake markers
    earthquakes.forEach((earthquake) => {
      const { coordinates, magnitude, id, title } = earthquake

      // Create a custom marker element
      const markerElement = document.createElement('div')
      markerElement.className = 'earthquake-marker'
      markerElement.style.width = `${magnitude * 8}px`
      markerElement.style.height = `${magnitude * 8}px`
      markerElement.style.borderRadius = '50%'
      markerElement.style.boxShadow =
        '0 0 0 1px #ffffff, 0 0 0 2px rgba(0,0,0,0.2)'

      // Set color based on impact level
      const impactLevel = getImpactLevelFromMagnitude(magnitude)
      switch (impactLevel) {
        case 'minor':
          markerElement.style.backgroundColor = 'rgba(0, 128, 0, 0.6)'
          break
        case 'moderate':
          markerElement.style.backgroundColor = 'rgba(255, 255, 0, 0.6)'
          break
        case 'major':
          markerElement.style.backgroundColor = 'rgba(255, 165, 0, 0.6)'
          break
        case 'severe':
          markerElement.style.backgroundColor = 'rgba(255, 0, 0, 0.6)'
          break
      }

      // Apply pulse animation for selected earthquake
      if (selectedEarthquake && selectedEarthquake.id === id) {
        markerElement.classList.add('pulse')
      }

      // Create and add marker
      try {
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([coordinates.longitude, coordinates.latitude])
          .addTo(map)

        // Add popup with earthquake info
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <h3>${title}</h3>
            <p>Magnitude: ${magnitude}</p>
            <p>Time: ${formatDateTime(earthquake.time)}</p>
          `)

        // Show popup on click and trigger selection
        marker.getElement().addEventListener('click', () => {
          marker.setPopup(popup)
          onEarthquakeSelect(earthquake)
        })

        // If this is the selected earthquake, show popup by default
        if (selectedEarthquake && selectedEarthquake.id === id) {
          marker.setPopup(popup)
          popup.addTo(map)
        }
      } catch (error) {
        console.error('Error adding marker:', error)
      }
    })
  }, [earthquakes, selectedEarthquake, onEarthquakeSelect, mapRef])

  return (
    <div
      id='earthquake-map'
      className='w-full h-full rounded-lg shadow-lg'
      style={{ minHeight: '300px' }}
    />
  )
}

export default Map
