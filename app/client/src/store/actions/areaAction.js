import apiEndpoint from '../../utils/api/apiEndpoint'
import { 
  AREA_REQUEST_START,
  AREA_REQUEST_SUCCESS,
  AREA_REQUEST_FAILURE
 } from '../types/areaTypes'

const areaRequestStart = () => {
  return {
    type: AREA_REQUEST_START
  }
}

const fetchArea = area => {
  return {
    type: AREA_REQUEST_SUCCESS,
    payload: area
  }
}

const areaRequestFailure = err => {
  return {
    type: AREA_REQUEST_FAILURE,
    payload: err
  }
}

export const getArea = () => async dispatch => {
  
  dispatch(areaRequestStart())
  try {
    const res = await apiEndpoint.getArea()
    dispatch(fetchArea(res.data))
  } catch (e) {
    dispatch(areaRequestFailure(e.response.data))
  }

}

export const getOneArea = id => async dispatch => {
  
  dispatch(areaRequestStart())
  try {
    const res = await apiEndpoint.getOneArea(id)
    dispatch(fetchArea(res.data))
  } catch (e) {
    dispatch(areaRequestFailure(e.response.data))
  }
  
}