import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { reportRouteChange } from '../utils/runtimeDebug'

export default function RouteDebugProbe() {
  const location = useLocation()

  useEffect(() => {
    reportRouteChange(location.pathname)
  }, [location.pathname])

  return null
}
