import apiEndpoint from '../../utils/api/axios'
import {
  CITIES_REQUEST_START,
  CITIES_REQUEST_SUCCESS,
  CITIES_REQUEST_FAILURE
} from '../types/citiesTypes'

export const citiesRequestStart = () => {
  return {
    type: CITIES_REQUEST_START
  }
}

export const citiesRequestFailure = (err) => {
  return {
    type: CITIES_REQUEST_FAILURE,
    paylaod: err.response.data
  }
}

export const getCities = () => async dispatch => {

  dispatch(citiesRequestStart())
  try {
    const res = apiEndpoint.getCities()
    dispatch({
      type: CITIES_REQUEST_SUCCESS,
      payload: res.dada
    })
  } catch (e) {
    dispatch(citiesRequestFailure())
  }

}

export const getOneCities = (id) => async dispatch => {

  dispatch(citiesRequestStart())
  try {
    const res = apiEndpoint.getOneCities(id)
    dispatch({
      type: CITIES_REQUEST_SUCCESS,
      payload: res.dada
    })
  } catch (e) {
    dispatch(citiesRequestFailure())
  }
  
}