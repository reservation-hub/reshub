import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { silentLogin } from './store/actions/authAction'
import Auth from './pages/auth/Auth'
import Prefecture from './pages/prefecture/Prefecture'
import Cities from './pages/city/Cities'
import Cookies from 'js-cookie'
import ModalOverlay from './components/modal/Modal'

function App() {

  const dispatch = useDispatch()

  useEffect(() => {
    if (Cookies.get('refreshToken')) dispatch(silentLogin())
  }, [dispatch])

  return (
    <>
      <Auth />
      <Prefecture />
      <Cities />
      <ModalOverlay />
    </>
  )
}

export default React.memo(App)
