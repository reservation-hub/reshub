import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getPrefecture } from '../../store/actions/prefectureAction'
import PrefectureList from '../../components/prefecture/PrefectureList'
import history from '../../utils/history'

const Prefecture = () => {

  const dispatch = useDispatch()
  const { prefecture } = useSelector(state => state.prefecture)
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

  useEffect(() => {
    dispatch(getPrefecture())
  }, [dispatch])

  if (!isAuthenticated) return null

  return (
    <main>
      {/* <PrefectureList prefectures={ prefecture.docs } /> */}
    </main>
  )
}

export default Prefecture
