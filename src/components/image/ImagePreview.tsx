import { Icon } from '@iconify/react'
import { Avatar, Box, Popover, Typography } from '@mui/material'
import React, { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { ThemeColor } from 'src/@core/layouts/types'
import { getInitials } from 'src/@core/utils/get-initials'
import awsConfig from 'src/configs/aws'
import { getTypeVideoOrImageFromFileName } from 'src/utils/fileUtils'
import { getImageAwsUrl } from 'src/utils/imageUtils'

interface props {
  avatar: string
  fullName: string
  badge?: string | string[]
  discount?: number
  discountType?: 'percentage' | 'nominal' | null
  hasVideo?: boolean
  isAws?: boolean
}

// color tags
// Terbaru, Diskon, Terlaris, Sold Out, Grosir
// Kuning, Merah, Merah Gold, Hitam, Biru
// #FFC107, #F44336, #FF9800, #000000, #2196F3

const colorsBadge = {
  Terbaru: '#FFC107',
  Diskon: '#F44336',
  Terlaris: '#FF9800',
  'Sold Out': '#000000',
  Grosir: '#2196F3',
  Promo: '#0057fc'
}

const ImagePreview = memo(
  ({ avatar, fullName, badge, discount, discountType, hasVideo, isAws = true }: props) => {
    const { t } = useTranslation()
    const stateNum = Math.floor(Math.random() * 6)
    const states = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
    const color = states[stateNum]

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget)
    }

    const handlePopoverClose = () => {
      setAnchorEl(null)
    }

    const open = Boolean(anchorEl)

    const isArray = Array.isArray(badge)

    if (!isArray && ((badge == 'Diskon' && discountType == 'nominal') || badge == 'Sold Out')) {
      console.log('badge', badge)

      return null
    }

    const isVideo = getTypeVideoOrImageFromFileName(avatar) == 'video'

    return (
      <Box
        position={'relative'}
        mr={3}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {badge && (badge.includes('Sold Out') || badge == 'Sold Out') && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                zIndex: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                rowGap: '2px'
              }}
            >
              <Avatar
                sx={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 100,
                  opacity: 0.5,
                  backgroundColor: 'black'
                }}
              >
                {' '}
              </Avatar>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                zIndex: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                rowGap: '2px'
              }}
            >
              <Typography variant='caption' color={'white'} fontSize={'0.8rem'} fontWeight={'bold'}>
                {t('Sold Out')}
              </Typography>
            </Box>
          </>
        )}

        {hasVideo && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                rowGap: '2px'
              }}
            >
              <Avatar
                sx={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 100,
                  opacity: 0.3,
                  backgroundColor: 'black'
                }}
              >
                {' '}
              </Avatar>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                rowGap: '2px'
              }}
            >
              <Icon icon='bi:play-fill' color={'white'} width={24} height={24} />
            </Box>
          </>
        )}

        {badge && (
          <Box
            sx={{
              position: 'absolute',
              top: 2,
              left: 2,
              zIndex: 2,
              display: 'flex',
              alignItems: 'start',
              // justifyContent: 'center',
              flexDirection: 'column',
              rowGap: '2px'
            }}
          >
            {Array.isArray(badge) ? (
              badge
                .filter(label => !(label == 'Sold Out'))
                .map((label, index) => (
                  <Typography
                    key={index}
                    sx={{
                      padding: '2px 4px',
                      backgroundColor: colorsBadge[label as keyof typeof colorsBadge],
                      borderRadius: 0.4
                    }}
                    variant='caption'
                    color={'white'}
                    fontSize={'0.4rem'}
                    fontWeight={'bold'}
                  >
                    {label === 'Diskon' ? `${discount}%` : t(label)}
                  </Typography>
                ))
            ) : (
              <Typography
                sx={{
                  padding: '2px 4px',
                  backgroundColor: colorsBadge[badge as keyof typeof colorsBadge],
                  borderRadius: 0.4
                }}
                variant='caption'
                color={'white'}
                fontSize={'0.4rem'}
                fontWeight={'bold'}
              >
                {badge === 'Diskon' ? `${discount}%` : badge}
              </Typography>
            )}
          </Box>
        )}
        {avatar.length ? (
          <>
            <CustomAvatar
              variant='square'
              src={isAws ? `${awsConfig.s3_bucket_url}/${avatar}` : avatar}
              sx={{ width: '3.875rem', height: '3.875rem', borderRadius: '3px' }}
            >
              {isVideo && (
                <video
                  src={getImageAwsUrl(avatar)}
                  poster={avatar ? '' : '/images/misc/upload-light.png'}
                  width={120}
                  height={120}
                />
              )}
            </CustomAvatar>
            <Popover
              id='mouse-over-popover'
              sx={theme => ({
                pointerEvents: 'none',
                ml: 1,
                top: -8,
                '& .MuiPopover-paper': {
                  border: `1px solid ${theme.palette.divider}`
                }
              })}
              open={open}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
              onClose={handlePopoverClose}
              disableRestoreFocus
            >
              <CustomAvatar
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                variant='square'
                src={isAws ? `${awsConfig.s3_bucket_url}/${avatar}` : avatar}
                sx={{ width: '10rem', height: '10rem', padding: 2 }}
              >
                {isVideo && (
                  <video
                    src={getImageAwsUrl(avatar)}
                    poster={avatar ? '' : '/images/misc/upload-light.png'}
                    style={{ width: '100%', height: '100%' }}
                  />
                )}
              </CustomAvatar>
            </Popover>
          </>
        ) : (
          <CustomAvatar
            variant='square'
            skin='light'
            color={color as ThemeColor}
            sx={{ fontSize: '.8rem', width: '3.875rem', height: '3.875rem' }}
          >
            {getInitials(fullName ? fullName : 'John Doe')}
          </CustomAvatar>
        )}
      </Box>
    )
  }
)

export default ImagePreview
