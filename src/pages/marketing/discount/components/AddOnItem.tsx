import { Box, Typography } from '@mui/material'
import Link from 'next/link'
import React from 'react'

type AddOnItemType = {
  data: {
    title: string
    link?: string
  }
  badgeNew?: boolean
}

const PromotionItem = ({ badgeNew, data }: AddOnItemType) => {
  return (
    <Link
      href={data.link || '#'}
      style={{
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <Box
        sx={theme => ({
          ':hover': {
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
          },
          border: 1,
          borderColor: theme.palette.divider,
          borderRadius: 1
        })}
      >
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
                {data.title}
              </Typography>
            </Box>
            <Typography variant='body2'>
              Lorem ipsum dolor sit amet consectetur. Facilisis non amet egestas ut.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Link>
  )
}

export default PromotionItem
