import { 
  TableRow,
  TableCell  
} from '@material-ui/core'

const CityItem = ({ cityNo, cityName }) => {
  
  return (
    <TableRow>
      <TableCell>
        { cityNo }
      </TableCell>
      <TableCell>
        { cityName }
      </TableCell>
    </TableRow>
  )
}

export default CityItem
