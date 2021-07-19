import React, { useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getPrefecture } from '../../store/actions/prefectureAction'
import PrefectureList from '../../components/prefecture/PrefectureList'
import history from '../../utils/history'

const Prefecture = () => {

  const dispatch = useDispatch()
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
  const prefecture = useSelector(state => state.prefecture)
  console.log(isAuthenticated)
  
  useEffect(() => {
    dispatch(getPrefecture())
  }, [])

  if(!isAuthenticated) return <Redirect to='/' />

  return (
    <PrefectureList />
  )
}

export default Prefecture
