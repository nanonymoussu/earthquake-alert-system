import React from 'react'
import { FilterOptions, ImpactLevel, SortOption } from '../types'
import { AlertTriangle, Calendar, MapPin, Activity } from 'lucide-react'
import styles from '../styles/FilterPanel.module.css'

interface FilterPanelProps {
  filters: FilterOptions
  sortBy: SortOption
  onFilterChange: (newFilters: FilterOptions) => void
  onSortChange: (newSort: SortOption) => void
  userHasLocation: boolean
  onRequestLocation: () => void
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  sortBy,
  onFilterChange,
  onSortChange,
  userHasLocation,
  onRequestLocation,
}) => {
  const handleImpactLevelChange = (level: ImpactLevel) => {
    const currentLevels = [...filters.impactLevel]

    if (currentLevels.includes(level)) {
      onFilterChange({
        ...filters,
        impactLevel: currentLevels.filter((l) => l !== level),
      })
    } else {
      onFilterChange({
        ...filters,
        impactLevel: [...currentLevels, level],
      })
    }
  }

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: value ? new Date(value) : null,
      },
    })
  }

  const handleMinDistanceChange = (value: string) => {
    onFilterChange({
      ...filters,
      minDistance: value ? parseInt(value, 10) : null,
    })
  }

  const handleMagnitudeRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value)
    const currentRange = filters.magnitudeRange || { min: 0, max: 10 }
    const newRange = {
      ...currentRange,
      [type]: numValue,
    }

    if (type === 'min' && numValue > (currentRange.max || 10)) {
      newRange.min = currentRange.max
    } else if (type === 'max' && numValue < (currentRange.min || 0)) {
      newRange.max = currentRange.min
    }

    onFilterChange({
      ...filters,
      magnitudeRange: newRange,
    })
  }

  return (
    <div className='bg-white rounded-lg shadow-md p-3 space-y-2 text-sm'>
      {/* Top row with Sort and Date Range */}
      <div className='grid grid-cols-2 gap-2'>
        <div>
          <label className='text-xs text-gray-600 font-medium flex items-center mb-1'>
            <AlertTriangle size={14} className='mr-1' />
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className='w-full p-1.5 border border-gray-300 rounded-md bg-white text-sm'
          >
            <option value='time-desc'>Most recent</option>
            <option value='time-asc'>Oldest</option>
            <option value='magnitude-desc'>Largest magnitude</option>
            <option value='magnitude-asc'>Smallest magnitude</option>
            {userHasLocation && (
              <option value='distance-asc'>Nearest to me</option>
            )}
          </select>
        </div>

        <div className='flex flex-col'>
          <label className='text-xs text-gray-600 font-medium flex items-center mb-1'>
            <Calendar size={14} className='mr-1' />
            Date Range
          </label>
          <div className='grid grid-cols-2 gap-1'>
            <input
              type='date'
              value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className='w-full p-1 border border-gray-300 rounded-md text-sm'
              placeholder='From'
            />
            <input
              type='date'
              value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className='w-full p-1 border border-gray-300 rounded-md text-sm'
              placeholder='To'
            />
          </div>
        </div>
      </div>

      {/* Impact Level section */}
      <div>
        <label className='text-xs text-gray-600 font-medium flex items-center mb-1'>
          <AlertTriangle size={14} className='mr-1' />
          Impact Level
        </label>
        <div className='grid grid-cols-4 gap-1'>
          <div className='flex items-center'>
            <input
              type='checkbox'
              checked={filters.impactLevel.includes('minor')}
              onChange={() => handleImpactLevelChange('minor')}
              className='rounded text-green-600 mr-1'
              id='minor-checkbox'
            />
            <label
              htmlFor='minor-checkbox'
              className='text-green-800 text-xs cursor-pointer'
            >
              Minor
            </label>
          </div>
          <div className='flex items-center'>
            <input
              type='checkbox'
              checked={filters.impactLevel.includes('moderate')}
              onChange={() => handleImpactLevelChange('moderate')}
              className='rounded text-yellow-600 mr-1'
              id='moderate-checkbox'
            />
            <label
              htmlFor='moderate-checkbox'
              className='text-yellow-800 text-xs cursor-pointer'
            >
              Moderate
            </label>
          </div>
          <div className='flex items-center'>
            <input
              type='checkbox'
              checked={filters.impactLevel.includes('major')}
              onChange={() => handleImpactLevelChange('major')}
              className='rounded text-orange-600 mr-1'
              id='major-checkbox'
            />
            <label
              htmlFor='major-checkbox'
              className='text-orange-800 text-xs cursor-pointer'
            >
              Major
            </label>
          </div>
          <div className='flex items-center'>
            <input
              type='checkbox'
              checked={filters.impactLevel.includes('severe')}
              onChange={() => handleImpactLevelChange('severe')}
              className='rounded text-red-600 mr-1'
              id='severe-checkbox'
            />
            <label
              htmlFor='severe-checkbox'
              className='text-red-800 text-xs cursor-pointer'
            >
              Severe
            </label>
          </div>
        </div>
      </div>

      {/* Distance section */}
      <div>
        <label className='text-xs text-gray-600 font-medium flex items-center mb-1'>
          <MapPin size={14} className='mr-1' />
          Minimum Distance
        </label>
        {!userHasLocation ? (
          <button
            onClick={onRequestLocation}
            className='w-full p-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
          >
            Share my location
          </button>
        ) : (
          <div className='flex flex-col'>
            <input
              type='range'
              min='0'
              max='10000'
              step='50'
              value={filters.minDistance || 0}
              onChange={(e) => handleMinDistanceChange(e.target.value)}
              className='w-full'
            />
            <div className='flex justify-between text-xs text-gray-600 -mt-1'>
              <span>0km</span>
              <span>Show alerts {filters.minDistance || '0'}km+ away</span>
              <span>10,000km</span>
            </div>
          </div>
        )}
      </div>

      {/* Magnitude Range section */}
      <div>
        <label className='text-xs text-gray-600 font-medium flex items-center mb-1'>
          <Activity size={14} className='mr-1' />
          Magnitude Range
        </label>
        <div className='flex flex-col'>
          <div className={styles.rangeContainer}>
            <div className={styles.rangeTrack}></div>
            <input
              type='range'
              min='0'
              max='10'
              step='0.1'
              value={filters.magnitudeRange?.min ?? 0}
              onChange={(e) =>
                handleMagnitudeRangeChange('min', e.target.value)
              }
              className={styles.rangeSlider}
              style={{ zIndex: 2 }}
            />
            <input
              type='range'
              min='0'
              max='10'
              step='0.1'
              value={filters.magnitudeRange?.max ?? 10}
              onChange={(e) =>
                handleMagnitudeRangeChange('max', e.target.value)
              }
              className={styles.rangeSlider}
            />
          </div>
          <div className='flex justify-between text-xs text-gray-600 mt-2'>
            <span>{(filters.magnitudeRange?.min ?? 0).toFixed(1)}</span>
            <span>Magnitude Range</span>
            <span>{(filters.magnitudeRange?.max ?? 10).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterPanel
