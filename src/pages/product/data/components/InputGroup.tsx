import { TextField, FormControl, Select, MenuItem, InputAdornment } from '@mui/material'
import { styled } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import { memo } from 'react'

const InputGroup = memo(() => {
  const InputGroupComponent = styled('div')(({ theme }) => {
    return {
      display: 'inline-block',
      transition: '0.1s',
      marginBottom: 10,
      border: '0px solid',
      borderRadius: '8px',
      '&:has(div > .Mui-focused)': {
        boxShadow: 'none',
        dropShadow: 0,
        border: `1px solid ${theme.palette.primary.main}`
      },
      '& .select-input-group': {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderRight: 0,
        boxShadow: 'none',
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          boxShadow: 'none',
          borderColor: 'transparent'
        },
        '.MuiOutlinedInput-notchedOutline': {
          borderRight: 0
        }
      },
      '& .text-input-group *': {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderLeft: 0,
        boxShadow: 'none !important',
        outline: 'none',
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'transparent'
        }
      }
    }
  })

  return (
    <InputGroupComponent style={{ position: 'relative' }}>
      <FormControl size='small'>
        <Select
          placeholder='Product Name'
          className='select-input-group'
          id='demo-simple-select-outlined'
          defaultValue={10}
        >
          <MenuItem value={10}>Product Name</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
      <TextField
        variant='outlined'
        className='text-input-group'
        placeholder='Search'
        size='small'
        InputProps={{
          endAdornment: (
            <InputAdornment
              position='end'
              sx={{
                cursor: 'pointer'
              }}
              // onClick={() => alert('search')}
            >
              <Icon fontSize='1.125rem' icon='tabler:search' />
            </InputAdornment>
          )
        }}
      />
    </InputGroupComponent>
  )
})

export default InputGroup
