import React from 'react'
import { Activity, AlertCircle, Globe } from 'lucide-react'

interface HeaderProps {
  isConnected: boolean
}

const Header: React.FC<HeaderProps> = ({ isConnected }) => {
  return (
    <header className='bg-gradient-to-r from-blue-600 to-blue-800 shadow-md p-3 md:p-4 flex items-center justify-between'>
      <div className='flex items-center space-x-3'>
        <div className='bg-white p-2 rounded-full shadow-lg'>
          <Activity size={24} className='text-red-500' />
        </div>
        <div>
          <h1 className='text-xl md:text-2xl font-bold text-white tracking-tight'>
            Earthquake Alert System
          </h1>
          <p className='text-xs text-blue-100 hidden md:block'>
            Real-time monitoring and notifications
          </p>
        </div>
      </div>

      <div className='flex items-center'>
        <div className='hidden md:flex items-center mr-4 text-white'>
          <Globe size={18} className='mr-2' />
          <span className='text-sm'>Global Monitoring</span>
        </div>

        <div className='flex items-center bg-white bg-opacity-20 py-1 px-3 rounded-full backdrop-blur-sm'>
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-500'
            } shadow-sm`}
          ></div>
          <span className='text-sm text-white ml-2'>
            {isConnected ? 'Live Feed' : 'Disconnected'}
          </span>
          {!isConnected && (
            <AlertCircle size={16} className='ml-1 text-red-300' />
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
