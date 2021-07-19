import React, { useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getPrefecture } from '../../store/actions/prefectureAction'
import PrefectureList from '../../components/prefecture/PrefectureList'

const Prefecture = () => {

  const dispatch = useDispatch()
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
  const { perfecture } = useSelector(state => state.prefecture)
  
  useEffect(() => {
    dispatch(getPrefecture())
  }, [dispatch])

  return (
    <main>
      <PrefectureList prefectures={ perfecture.docs } />
    </main>
  )
}

export default Prefecture
