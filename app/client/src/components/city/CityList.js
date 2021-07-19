import {
  Paper, 
  Table,
  TableHead, 
  TableBody, 
  TableRow,
  TableCell,
  Typography  
} from '@material-ui/core'
import CityItem from './CityItem'

const CityList = ({ cities }) => {
  
  return (
    <Paper>
      <Typography variant='h4'>
        City List
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              No
            </TableCell>
            <TableCell>
              City
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { cities && cities.map(
            (city, index) => (
              <CityItem
                key={ index }
                cityNo={ index }
                cityName={ city.name }
              />
            )
          ) }
        </TableBody>
      </Table>
    </Paper>
  )
}

export default CityList
