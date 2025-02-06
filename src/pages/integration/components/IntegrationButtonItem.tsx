import { useTheme } from '@mui/material/styles'
import { Button, Typography } from '@mui/material'
import React from 'react'

export type IntegrationButtonItemProps = {
  onClick: () => void
  label: string
  src: string
}

const IntegrationButtonItem = ({ onClick, label, src }: IntegrationButtonItemProps) => {
  // ** States
  const theme = useTheme()

  return (
    <Button fullWidth variant='outlined' sx={{ justifyContent: 'left' }} onClick={onClick}>
      <img
        src={src}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '6px',
          marginRight: theme.spacing(3),
          objectFit: 'contain'
        }}
        alt={label.toLowerCase()}
      />
      <div>
        <Typography variant='h5'>{label}</Typography>
      </div>
    </Button>
  )
}

export default IntegrationButtonItem
