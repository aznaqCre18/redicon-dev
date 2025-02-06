import React from 'react'
import { Box } from '@mui/system'
import BottomPaginationContainer from './container'
import { InputLabel, MenuItem, Pagination, Select } from '@mui/material'

const MUIPagination = () => {
  return (
    <BottomPaginationContainer
      sx={{
        paddingLeft: theme => theme.spacing(12)
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          paddingLeft: theme => theme.spacing(0, 4)
        }}
      >
        <InputLabel>Items per page:</InputLabel>
        <Select
          placeholder='1'
          size='small'
          sx={{
            maxWidth: 60
          }}
          defaultValue={'1'}
          value={'1'}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((item, index) => (
            <MenuItem key={index} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Pagination
          count={10}
          shape='rounded'
          color='primary'
          sx={{
            paddingTop: theme => theme.spacing(2),
            paddingBottom: theme => theme.spacing(2)
          }}
        />
      </Box>
    </BottomPaginationContainer>
  )
}
export default MUIPagination
