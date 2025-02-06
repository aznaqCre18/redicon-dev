// ** MUI Imports
import Card from '@mui/material/Card'
import Chip, { ChipProps } from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Component Import
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { Box, SxProps, Theme } from '@mui/material'
import { ThemeColor } from 'src/@core/layouts/types'
import { formatNumber } from 'src/utils/numberUtils'
import Link from 'next/link'

export type CardStatsVerticalProps = {
  total: number
  title: string
  chipText: string
  avatarIcon: string
  sx?: SxProps<Theme>
  avatarSize?: number
  avatarColor?: ThemeColor
  iconSize?: number | string
  chipColor?: ChipProps['color']
  linkCard?: string
  linkChip?: string
}

const CardStatsVertical = (props: CardStatsVerticalProps) => {
  // ** Props
  const {
    sx,
    total,
    title,
    chipText,
    avatarIcon,
    avatarSize = 44,
    iconSize = '1.75rem',
    chipColor = 'primary',
    avatarColor = 'primary'
  } = props

  const RenderChip = chipColor === 'default' ? Chip : CustomChip

  return (
    <Link
      href={props.linkCard || ''}
      style={{
        textDecoration: 'none'
      }}
    >
      <Card
        sx={{
          ...sx,
          ...{
            '&:hover': {
              boxShadow: '0 4px 25px 0 rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
              transition: '0.2s'
            }
          }
        }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography sx={{ mb: 1 }} variant='body2'>
                {title}
              </Typography>
              <Typography sx={{ mb: 3.5 }} variant='h5'>
                {formatNumber(total)}
              </Typography>
              <Link
                href={props.linkChip || props.linkCard || ''}
                style={{
                  textDecoration: 'none'
                }}
              >
                <RenderChip
                  label={chipText}
                  color={chipColor}
                  {...(chipColor === 'default'
                    ? {
                        sx: {
                          borderRadius: '4px',
                          color: 'text.secondary',
                          '&:hover': {
                            backgroundColor: theme => `${theme.palette.primary.main} !important`,
                            cursor: 'pointer',
                            color: theme => `${theme.palette.primary.contrastText} !important`
                          }
                        }
                      }
                    : { rounded: true, skin: 'light' })}
                />
              </Link>
            </Box>
            <Box>
              <CustomAvatar
                skin='light'
                variant='rounded'
                color={avatarColor}
                sx={{ mb: 3.5, width: avatarSize, height: avatarSize }}
              >
                <Icon icon={avatarIcon} fontSize={iconSize} />
              </CustomAvatar>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Link>
  )
}

export default CardStatsVertical
