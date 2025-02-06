/* eslint-disable jsx-a11y/alt-text */
import { Box } from '@mui/material'
import React from 'react'
import { getImageAwsUrl } from 'src/utils/imageUtils'

type MiniImageProps = {
  image: string | null
}

const MiniImage = ({ image }: MiniImageProps) => {
  if (!image || image === '') {
    return null
  }

  return (
    <Box
      sx={{
        borderRadius: '0.1rem',
        border: '1px solid #e0e0e0',
        textAlign: 'center',
        backgroundColor: 'white',
        p: 0.4,
        width: '2rem',
        height: '1.4rem'
      }}
    >
      <img
        src={getImageAwsUrl(image)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    </Box>
  )
}

export default MiniImage
