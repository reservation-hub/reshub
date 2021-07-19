import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CityList from '../../components/city/CityList'
import { getCity } from '../../store/actions/cityAction'

const Cities = () => {

  const dispatch = useDispatch()
  const { city } = useSelector(state => state.city)

  useEffect(() => {
    dispatch(getCity())
  }, [dispatch])

  return (
    <main>
      <CityList cities={ city.docs } />
    </main>
  )
}

export default Cities
