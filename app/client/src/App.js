import React, { useEffect } from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { silentLogin } from './store/actions/authAction'
import Auth from './pages/auth/Auth'
import Prefecture from './pages/prefecture/Prefecture'
import history from './utils/history'
import Cookies from 'js-cookie'

function App() {

  const dispatch = useDispatch()

  useEffect(() => {
    if (Cookies.get('refreshToken')) dispatch(silentLogin())
  }, [dispatch])

  return (
    <Router history={ history }>
      <Switch>
        <Route exact path='/' component={ Auth } />
        <Route path='/pre' component={ Prefecture } />
      </Switch>
    </Router>
  )
}

export default React.memo(App)
