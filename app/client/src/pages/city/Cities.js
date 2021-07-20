import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getCity } from '../../store/actions/cityAction'
import CityList from '../../components/city/CityList'

const Cities = () => {

  const dispatch = useDispatch()
  const { city } = useSelector(state => state.city)
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

  useEffect(() => {
    dispatch(getCity())
  }, [dispatch])

  if (!isAuthenticated) return null

  return (
    <main>
      <CityList cities={ city.docs } />
    </main>
  )
}

export default Cities
