import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { loginStart, googleLogin } from '../../store/actions/authAction'
import useInput from '../../utils/useInput'
import Login from '../../components/auth/LoginForm'

const Auth = () => {

  const dispatch = useDispatch()

  const [value, setValue] = useInput({
    email: '', password: ''
  })

  const onSubmit = useCallback(e => {
    e.preventDefault()
    dispatch(loginStart(value.email, value.password))
  }, [dispatch, value.email, value.password])

  const googleHandler = useCallback(
    response => {
      dispatch(googleLogin(response))
    }, [dispatch]
  )
  
  return(
    <Login 
      value={ value } 
      setValue={ setValue } 
      onSubmit={ onSubmit } 
      googleHandler={ googleHandler }
    />
  ) 
}

export default Auth