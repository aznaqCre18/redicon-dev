import { Icon } from '@iconify/react'
import { Box, Button, Typography } from '@mui/material'
import React from 'react'

type AddOnItemType = {
  badgeNew?: boolean
}

const AddOnItem = ({ badgeNew }: AddOnItemType) => {
  return (
    <Box border={1} borderColor={'#E8E8E8'} borderRadius={1}>
      <div
        style={{
          display: badgeNew ? 'flex' : 'none',
          placeContent: 'end'
        }}
      >
        <Box
          position={'absolute'}
          paddingX={4}
          sx={{
            backgroundColor: '#57D163',
            color: 'white',
            borderBottomLeftRadius: 4
          }}
        >
          New
        </Box>
      </div>
      <Box>
        <Box padding={2}>
          <Box display={'flex'} alignItems={'center'} gap={1} marginBottom={2}>
            <img
              src={'/images/icons/sales_force_icon.png'}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                marginRight: 3
              }}
              alt={'Sales Forces'}
            />
            <Typography variant='h5' component='div'>
              Sales Force
            </Typography>
          </Box>
          <Typography variant='body2'>
            Lorem ipsum dolor sit amet consectetur. Facilisis non amet egestas ut.
          </Typography>
        </Box>

        <Box
          padding={2}
          display={'flex'}
          justifyContent={'space-between'}
          sx={{
            backgroundColor: '#EAE7FF'
          }}
        >
          <Button size='small' variant='text' color='inherit'>
            Install
          </Button>
          <Button
            size='small'
            variant='text'
            color='inherit'
            endIcon={<Icon icon='tabler:window-maximize' fontSize='1.25rem' />}
          >
            Details
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default AddOnItem
