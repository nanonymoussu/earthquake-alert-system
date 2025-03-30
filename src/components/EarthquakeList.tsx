import React from 'react'
import { EarthquakeEvent } from '../types'
import {
  getImpactLevelColor,
  getImpactLevelTextColor,
  formatDate,
  formatMagnitude,
  formatDistance,
} from '../utils/helpers'

interface EarthquakeListProps {
  earthquakes: EarthquakeEvent[]
  selectedEarthquake: EarthquakeEvent | null
  onEarthquakeSelect: (earthquake: EarthquakeEvent) => void
}

const EarthquakeList: React.FC<EarthquakeListProps> = ({
  earthquakes,
  selectedEarthquake,
  onEarthquakeSelect,
}) => {
  const safeFormatMagnitude = (magnitude: number | null | undefined) => {
    if (magnitude === null || magnitude === undefined) return 'N/A'
    return formatMagnitude(magnitude)
  }

  const safeFormatDistance = (distance: number | null | undefined) => {
    if (distance === null || distance === undefined) return 'Unknown'
    return formatDistance(distance)
  }

  return (
    <div className='overflow-auto h-full'>
      <ul className='space-y-2'>
        {earthquakes.length === 0 ? (
          <li className='p-4 text-center text-gray-500'>
            No earthquakes found matching your criteria
          </li>
        ) : (
          earthquakes.map((earthquake) => {
            const isSelected = selectedEarthquake?.id === earthquake.id
            const colorClasses = getImpactLevelColor(earthquake.impactLevel)
            const textColorClass = getImpactLevelTextColor(
              earthquake.impactLevel
            )

            return (
              <li
                key={earthquake.id}
                className={`cursor-pointer rounded-lg border-l-4 p-4 transition-all duration-200 ${colorClasses} ${
                  isSelected
                    ? 'ring-2 ring-blue-500 shadow-md'
                    : 'hover:shadow-md'
                }`}
                onClick={() => onEarthquakeSelect(earthquake)}
              >
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='font-medium'>
                      {earthquake.place || 'Unknown location'}
                    </h3>
                    <div className='mt-1 text-sm text-gray-600'>
                      {formatDate(earthquake.time)}
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${textColorClass}`}>
                    M{safeFormatMagnitude(earthquake.magnitude)}
                  </div>
                </div>

                {earthquake.distanceFromUser !== null && (
                  <div className='mt-2 text-sm text-gray-600'>
                    Distance: {safeFormatDistance(earthquake.distanceFromUser)}
                  </div>
                )}

                {earthquake.tsunami && (
                  <div className='mt-1 text-sm font-medium text-red-600'>
                    Tsunami alert
                  </div>
                )}
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}

export default EarthquakeList
