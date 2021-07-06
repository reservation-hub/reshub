import { makeStyles } from '@material-ui/core/styles'

const LoginStyle = makeStyles({
  loginRoot: {
    height: '100vh',
    position: 'relative',
    backgroundColor: '#84A8E3'
  },
  headerFooter: {
    padding: '0',
    color: '#FAFAFA'
  },
  formBox: {
    padding: '2rem',
    borderRadius: '.5rem',
    backgroundColor: '#FAFAFA'
  },
  public: {
    marginTop: '.5rem',
    marginBottom: '2rem'
  },
  input: {
    '& .MuiInput-underline:before': {
      borderBottom: '1px solid #84A8E3'
    }
  }
})

export default LoginStyle