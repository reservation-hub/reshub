import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { silentLogin } from './store/actions/authAction'
import Auth from './pages/auth/Auth'
import Prefecture from './pages/prefecture/Prefecture'
import Cookies from 'js-cookie'

function App() {

  const dispatch = useDispatch()

  useEffect(() => {
    if (Cookies.get('refreshToken')) dispatch(silentLogin())
  }, [dispatch])

  return (
    <>
      <Auth />
      <Prefecture />
    </>
  )
}

export default React.memo(App)
