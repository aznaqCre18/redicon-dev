import React from 'react'
// ** React Imports
// ** MUI Imports
import { Button, InputAdornment, OutlinedInput } from '@mui/material'
import { Box } from '@mui/system'
// ** MUI Imports
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'

type TableHeaderProps = {
  onAdd?: () => void
  onSearch?: (value: string) => void
  valueSearch?: string
  title: string
  children?: React.ReactNode
  filterComponent?: React.ReactNode[]
  hideSearch?: boolean
}

const TableHeader = ({
  onAdd,
  onSearch,
  valueSearch,
  title,
  children,
  filterComponent,
  hideSearch
}: TableHeaderProps) => {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '1rem 1rem 1rem 0rem',
        marginLeft: 4
      }}
    >
      {!hideSearch && (
        <Box
          sx={{
            width: '30%',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginRight: 1
          }}
        >
          <OutlinedInput
            fullWidth
            {...(valueSearch && { value: valueSearch })}
            placeholder={`${t('Search')} ${title}...`}
            onChange={e => {
              if (onSearch) onSearch(e.target.value ?? '')
            }}
            endAdornment={
              <InputAdornment
                position='end'
                sx={{
                  cursor: 'pointer'
                }}
              >
                <Icon fontSize='1.125rem' icon='tabler:search' />
              </InputAdornment>
            }
            size='small'
          />

          {/* <Button variant='contained' sx={{ '& svg': { mr: 2 } }}>
          Search
        </Button> */}
        </Box>
      )}
      {(filterComponent ?? []).map((item, index) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginRight: 1
          }}
          key={index}
        >
          {item}
        </Box>
      ))}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '1rem',
          width: '100%'
        }}
      >
        {children}
        {onAdd && (
          <Button variant='contained' onClick={onAdd} startIcon={<Icon icon={'tabler:plus'} />}>
            {title}
          </Button>
        )}
      </Box>
    </Box>
  )
}
export default TableHeader
