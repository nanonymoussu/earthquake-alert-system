/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { FilterOptions, SortOption } from './types'
import { useGeolocation } from './hooks/useGeolocation'
import { useMapControl } from './hooks/useMapControl'
import { useEarthquakeData } from './hooks/useEarthquakeData'
import Header from './components/Header'
import FilterPanel from './components/FilterPanel'
import EarthquakeList from './components/EarthquakeList'
import Map from './components/Map'
import './App.css'

function App() {
  const [sortBy, setSortBy] = useState<SortOption>('time-desc')
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: null, end: null },
    impactLevel: [],
    minDistance: null,
    magnitudeRange: { min: 0, max: 10 },
  })

  const { userLocation, requestLocation } = useGeolocation()
  const { mapRef, selectedEarthquake, setSelectedEarthquake, zoomToLocation } =
    useMapControl()
  const { earthquakes, isLoading, isConnected, error } = useEarthquakeData(
    userLocation,
    sortBy,
    filters
  )

  const handleEarthquakeSelect = (earthquake: any) => {
    setSelectedEarthquake(earthquake)
    if (earthquake && earthquake.coordinates) {
      zoomToLocation(earthquake.coordinates)
    }
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleSortChange = (newSortOption: SortOption) => {
    setSortBy(newSortOption)
  }

  return (
    <div className='flex flex-col h-screen bg-gray-50'>
      {/* Header */}
      <Header isConnected={isConnected} />

      {/* Main content */}
      <div className='flex flex-1 overflow-hidden p-3 md:p-4 gap-3 md:gap-4'>
        {/* Left panel: Filters and earthquake list */}
        <div className='w-full md:w-1/3 flex flex-col gap-3 md:gap-4 overflow-hidden'>
          {/* Filter panel */}
          <FilterPanel
            filters={filters}
            sortBy={sortBy}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            userHasLocation={userLocation !== null}
            onRequestLocation={requestLocation}
          />

          {/* Earthquake list */}
          <div className='flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700'>
            {isLoading ? (
              <div className='flex justify-center items-center h-full'>
                <div className='animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent'></div>
              </div>
            ) : error ? (
              <div className='p-4 text-red-500 flex items-center justify-center h-full'>
                <p className='text-center'>
                  <span className='block text-3xl mb-2'>⚠️</span>
                  Error loading data: {error.message}
                </p>
              </div>
            ) : (
              <EarthquakeList
                earthquakes={earthquakes}
                selectedEarthquake={selectedEarthquake}
                onEarthquakeSelect={handleEarthquakeSelect}
              />
            )}
          </div>
        </div>

        {/* Right panel: Map */}
        <div
          className='flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-600'
          style={{ minHeight: '500px' }}
        >
          <Map
            earthquakes={earthquakes}
            userLocation={userLocation}
            selectedEarthquake={selectedEarthquake}
            mapRef={mapRef}
            onEarthquakeSelect={handleEarthquakeSelect}
          />
        </div>
      </div>
    </div>
  )
}

export default App
