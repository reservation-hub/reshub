//----------------------------------
// redux create sotre modules
//----------------------------------

import { createStore, applyMiddleware, compose } from 'redux'
import persistReducer from './reducers/rootReducer'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import setAuthToken from '../utils/setAuthToken'
import Cookies from 'js-cookie'


const middleware = [thunk, logger]

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  persistReducer, composeEnhancer(applyMiddleware(...middleware))
)

const token = Cookies.get('refreshToken')
if (token) {
  setAuthToken(token)
}

export default store