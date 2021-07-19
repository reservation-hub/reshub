//----------------------------------
// redux create sotre modules
//----------------------------------

import { createStore, applyMiddleware, compose } from 'redux'
import { rootReducer } from './reducers/rootReducer'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import setAuthToken from '../utils/setAuthToken'
import Cookies from 'js-cookie'

const persistConfig = {
  key: 'root',
  storage
}

const enhancedReducer = persistReducer(persistConfig, rootReducer)

const middleware = [thunk, logger]

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  enhancedReducer, composeEnhancer(applyMiddleware(...middleware))
)

const token = Cookies.get('refreshToken')
if (token) {
  setAuthToken(token)
}

export default store