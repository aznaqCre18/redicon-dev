import { ReactElement } from 'react'

import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'

interface FooterIllustrationsV2Prop {
  height?: number
  image?: ReactElement | string
  className?: string
}
const MaskImg = styled('img')(({ theme }) => ({
  bottom: 0,
  height: 300,
  width: '100%',
  position: 'absolute',
  [theme.breakpoints.down(1540)]: {
    height: 250
  }
}))

const FooterIllustrationsV2 = (props: FooterIllustrationsV2Prop) => {
  const { image, height, className } = props

  const theme = useTheme()

  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const renderImage = () => {
    if (!image) {
      return (
        <MaskImg
          alt='mask'
          className={className}
          {...(height && { height })}
          src={`/images/pages/auth-v2-mask-${theme.palette.mode}.png`}
        />
      )
    }

    if (typeof image === 'string') {
      return <MaskImg alt='mask' src={image} className={className} {...(height && { height })} />
    }

    return image
  }

  if (!hidden) return renderImage()

  return null
}

export default FooterIllustrationsV2
