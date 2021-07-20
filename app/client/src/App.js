import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { silentLogin } from './store/actions/authAction'

import { Router, Route,Switch } from 'react-router-dom'
import Home from './pages/home/Home'
import Error from './pages/error/Error'
import history from './utils/history'
import Login from './pages/auth/Login'
import Prefecture from './pages/prefecture/Prefecture'
import Cities from './pages/city/Cities'
import Cookies from 'js-cookie'
import ModalOverlay from './components/modal/Modal'
import Users from './pages/user/Users'




const  App = () => {
     
  const dispatch = useDispatch()

  useEffect(() => {
    if (Cookies.get('refreshToken')) dispatch(silentLogin())
  }, [dispatch])

  return (
    <>
      <Router history={history}>
        <Switch>
          <Route exact path='/' component={ Home }/>
          <Route path='/auth' component={ Login } /> 
          {/* <Route path='/shop' component={ SalonList } /> */}
          <Route path='/pre' component={ Prefecture }/>
          <Route path='/city' component={ Cities } />
          <Route component={ Error } />
        </Switch>
      </Router>
    </>
  )
}

export default React.memo(App)
