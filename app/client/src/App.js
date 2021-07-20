import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { silentLogin } from './store/actions/authAction'
import Login from './pages/auth/Login'
import Prefecture from './pages/prefecture/Prefecture'
import Cities from './pages/city/Cities'
import Cookies from 'js-cookie'
import ModalOverlay from './components/modal/Modal'
import Users from './pages/user/Users'

function App() {

  const dispatch = useDispatch()

  useEffect(() => {
    if (Cookies.get('refreshToken')) dispatch(silentLogin())
  }, [dispatch])

  return (
    <>
      <Login />
      {/* <Prefecture />
      <Cities />
      <ModalOverlay /> */}
      <Users />
    </>
  )
}

export default React.memo(App)
