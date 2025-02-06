import { Box, CardContent, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

const CardSummary = ({
  title,
  value,
  color,
  isHidden,
  onClick
}: {
  title?: string
  value?: string | number
  color?: string
  isHidden?: boolean
  onClick?: () => void
}) => {
  const { t } = useTranslation()

  return (
    <Box
      onClick={onClick}
      sx={{
        border: theme => `1px solid ${theme.palette.divider}`,
        borderRadius: theme => `${theme.shape.borderRadius}px`,
        ...(color && {
          ...(!isHidden && {
            borderBottom: 4,
            borderBottomColor: color
          })
        })
      }}
    >
      <CardContent
        sx={{
          px: 4,
          py: 2,
          pb: '0.5rem !important'
        }}
      >
        <Typography variant='h6' color={'secondary.main'} fontWeight={'bold'} fontSize={14}>
          {t(title ?? '') ?? title}
        </Typography>
        <Typography variant='h6' fontWeight={'medium'}>
          {value}
        </Typography>
      </CardContent>
    </Box>
  )
}
export default CardSummary
