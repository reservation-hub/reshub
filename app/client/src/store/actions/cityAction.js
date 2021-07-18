import apiEndpoint from '../../utils/api/axios'
import {
  CITY_REQUEST_START,
  CITY_REQUEST_SUCCESS,
  CITY_REQUEST_FAILURE
} from '../types/citiesTypes'

export const citiesRequestStart = () => {
  return {
    type: CITY_REQUEST_START
  }
}

export const citiesRequestFailure = err => {
  return {
    type: CITY_REQUEST_FAILURE,
    paylaod: err.response.data
  }
}

export const getCity = () => async dispatch => {

  dispatch(citiesRequestStart())
  try {
    const res = await apiEndpoint.getCities()
    dispatch({
      type: CITY_REQUEST_SUCCESS,
      payload: res.dada
    })
  } catch (e) {
    dispatch(citiesRequestFailure())
  }

}

export const getOneCity = id => async dispatch => {

  dispatch(citiesRequestStart())
  try {
    const res = await apiEndpoint.getOneCities(id)
    dispatch({
      type: CITY_REQUEST_SUCCESS,
      payload: res.dada
    })
  } catch (e) {
    dispatch(citiesRequestFailure())
  }
  
}