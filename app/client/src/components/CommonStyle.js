import { makeStyles } from '@material-ui/core/styles'

const CommonStyle = makeStyles({
  h255: {
    height: '255px'
  },
  mt1: {
    marginTop: '1rem'
  },
  mb1: {
    marginBottom: '1rem'
  },
  mb2: {
    marginBottom: '2rem'
  },
  bc: {
    position: 'absolute',
    top: '20%',
    left: '25%',
    right: '25%'
  },
  b1: {
    width: '100%',
    padding: '.32rem',
    fontSize: '1.2rem',
    border: '1px solid #84A8E3',
    borderRadius: '.25rem',
    backgroundColor: '#fafafa',
    cursor: 'pointer',
    color: '#999',
    '&:hover': {
      color: '#fafafa',
      backgroundColor: '#84A8E3',
      transition: '.3s ease'
    }
  },
  a1: {
    marginTop: '.6888rem',
    padding: '.2855rem',
    border: '1px solid #999',
    borderRadius: '.25rem',
    textDecoration: 'none',
    color: '#999',
    fontSize: '1.2rem',
    '&:hover': {
      borderColor: '#d3d8db',
      color: '#fafafa',
      backgroundColor: '#d3d8db',
      transition: '.3s ease'
    }
  },
  ics1: {
    width: '25px',
    height: '25px',
    margin: '.1rem -2rem 0 1rem',
    float: 'left',
  }
})

export default CommonStyle