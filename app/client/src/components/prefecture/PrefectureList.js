import React from 'react'
import PrefectureItem from './PrefectureItem'
import {
  Paper, 
  Table,
  TableHead, 
  TableBody, 
  TableRow,
  TableCell  
} from '@material-ui/core'

const PrefectureList = ({ prefectures }) => {

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              No
            </TableCell>
            <TableCell>
              Prefecture
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { prefectures && prefectures.map(
            (pre, index) => (
              <PrefectureItem 
                key={ index } 
                pre={ pre } 
                preNo={ index } 
              />
            )
          ) }
        </TableBody>
      </Table>
    </Paper>
  )
}

export default PrefectureList