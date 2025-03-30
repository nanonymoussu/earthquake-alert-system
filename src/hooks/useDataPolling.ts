import { useCallback, useEffect, useRef, useState } from 'react'

type PollingHook = {
  data: unknown | null
  isConnected: boolean
  error: Error | null
}

export const useDataPolling = (url: string, interval = 60000): PollingHook => {
  const [data, setData] = useState<unknown | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const intervalRef = useRef<number | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsConnected(true)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const parsedData = await response.json()
      setData(parsedData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'))
      console.error('Failed to fetch data', err)
      setIsConnected(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
    intervalRef.current = window.setInterval(fetchData, interval)

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [url, interval, fetchData])

  return { data, isConnected, error }
}
