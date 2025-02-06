// ** React Imports
import { ElementType } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Imports
import Chip from '@mui/material/Chip'
import ListItem from '@mui/material/ListItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemButton, { ListItemButtonProps } from '@mui/material/ListItemButton'

// ** Configs Import
import themeConfig from 'src/configs/themeConfig'

// ** Types
import { NavLink, NavGroup } from 'src/@core/layouts/types'
import { Settings } from 'src/@core/context/settingsContext'

// ** Custom Components Imports
import UserIcon from 'src/layouts/components/UserIcon'
import Translations from 'src/layouts/components/Translations'
import CanViewNavLink from 'src/layouts/components/acl/CanViewNavLink'

// ** Util Imports
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { handleURLQueries } from 'src/@core/layouts/utils'
import fontSizeBuilder, { bigger, smaller } from 'src/@core/utils/font-size-builder'
import { Tooltip } from '@mui/material'
import { useAuth } from 'src/hooks/useAuth'
import { devMode } from 'src/configs/dev'

interface Props {
  parent?: boolean
  item: NavLink
  navHover?: boolean
  settings: Settings
  navVisible?: boolean
  collapsedNavWidth: number
  navigationBorderWidth: number
  toggleNavVisibility: () => void
  isSubToSub?: NavGroup | undefined
}

// ** Styled Components
const MenuNavLink = styled(ListItemButton)<
  ListItemButtonProps & { component?: ElementType; href: string; target?: '_blank' | undefined }
>(({ theme }) => ({
  width: '100%',
  marginLeft: theme.spacing(3.5),
  marginRight: theme.spacing(3.5),
  borderRadius: theme.shape.borderRadius,
  transition: 'padding-left .25s ease-in-out, padding-right .25s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  },
  '&.active': {
    '&, &:hover': {
      background: theme.palette.primary.main,
      '&.Mui-focusVisible': {
        background: `linear-gradient(72.47deg, ${theme.palette.primary.dark} 22.16%, ${hexToRGBA(
          theme.palette.primary.dark,
          0.7
        )} 76.47%)`
      }
    },
    '& .MuiTypography-root, & svg': {
      color: `${theme.palette.common.white} !important`
    }
  }
}))

const MenuItemTextMetaWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
  transition: 'opacity .25s ease-in-out',
  ...(themeConfig.menuTextTruncate && { overflow: 'hidden' })
}))

const VerticalNavLink = ({
  item,
  parent,
  navHover,
  settings,
  navVisible,
  isSubToSub,
  collapsedNavWidth,
  toggleNavVisibility,
  navigationBorderWidth
}: Props) => {
  // ** Hooks
  const { checkPermission, checkModuleVendor } = useAuth()
  const router = useRouter()

  // ** Vars
  const { navCollapsed, displayFont } = settings

  const icon = parent && !item.icon ? themeConfig.navSubItemIcon : item.icon

  const isNavLinkActive = () => {
    if (router.pathname === item.path || handleURLQueries(router, item.path)) {
      return true
    } else {
      return false
    }
  }

  // check permission
  // console.log('permissions', auth.permissions)

  if (!((item as any).devMode == undefined || ((item as any).devMode && devMode))) {
    return false
  }

  if (item.permission && !checkPermission(item.permission)) {
    return false
  }

  if (item.module && !checkModuleVendor(item.module)) {
    return false
  }

  return (
    <CanViewNavLink navLink={item}>
      <ListItem
        disablePadding
        className='nav-link'
        disabled={item.disabled || false}
        sx={{ mt: 1, px: '0 !important' }}
      >
        <Tooltip title={navCollapsed ? item.title : null} placement='right'>
          <MenuNavLink
            component={Link}
            {...(item.disabled && { tabIndex: -1 })}
            className={isNavLinkActive() ? 'active' : ''}
            href={item.path === undefined ? '/' : `${item.path}`}
            {...(item.openInNewTab ? { target: '_blank' } : null)}
            onClick={e => {
              if (item.path === undefined) {
                e.preventDefault()
                e.stopPropagation()
              }
              if (navVisible) {
                toggleNavVisibility()
              }
            }}
            sx={{
              py: 2,
              ...(item.disabled ? { pointerEvents: 'none' } : { cursor: 'pointer' }),
              px:
                navCollapsed && !navHover
                  ? (collapsedNavWidth - navigationBorderWidth - 22 - 28) / 8
                  : 4,
              '& .MuiTypography-root, & svg': {
                color: 'text.secondary'
              }
            }}
          >
            <ListItemIcon
              sx={{
                transition: 'margin .25s ease-in-out',
                ...(navCollapsed && !navHover ? { mr: 0 } : { mr: 2 }),
                ...(parent ? { ml: 1.5, mr: 3.5 } : {}), // This line should be after (navCollapsed && !navHover) condition for proper styling
                '& svg': {
                  // fontSize: '0.625rem'
                  fontSize: fontSizeBuilder(displayFont, {
                    small: `${0.625 * smaller}rem`,
                    default: `0.625rem`,
                    medium: `${0.625 * bigger}rem`
                  }),
                  ...(!parent
                    ? {
                        // fontSize: '1.375rem'
                        fontSize: fontSizeBuilder(displayFont, {
                          small: `${1.375 * smaller}rem`,
                          default: `1.375rem`,
                          medium: `${1.375 * bigger}rem`
                        })
                      }
                    : {}),
                  ...(parent && item.icon
                    ? {
                        // fontSize: '0.875rem'
                        fontSize: fontSizeBuilder(displayFont, {
                          small: `${0.875 * smaller}rem`,
                          default: `0.875rem`,
                          medium: `${0.875 * bigger}rem`
                        })
                      }
                    : {})
                }
              }}
            >
              <UserIcon
                icon={icon as string}
                // fontSize={fontSizeBuilder(displayFont, {
                //   small: `${0.9 * smaller}rem`,
                //   default: `2rem`,
                //   medium: `${0.9 * bigger}rem`
                // })}
              />
            </ListItemIcon>

            <MenuItemTextMetaWrapper
              sx={{
                ...(isSubToSub ? { ml: 2 } : {}),
                ...(navCollapsed && !navHover ? { opacity: 0 } : { opacity: 1 })
              }}
            >
              <Typography
                {...((themeConfig.menuTextTruncate ||
                  (!themeConfig.menuTextTruncate && navCollapsed && !navHover)) && {
                  noWrap: true
                })}
              >
                <Translations text={item.title} />
              </Typography>
              {item.badgeContent ? (
                <Chip
                  size='small'
                  label={item.badgeContent}
                  color={item.badgeColor || 'primary'}
                  sx={{
                    height: 22,
                    minWidth: 22,
                    '& .MuiChip-label': { px: 1.5, textTransform: 'capitalize' }
                  }}
                />
              ) : null}
            </MenuItemTextMetaWrapper>
          </MenuNavLink>
        </Tooltip>
      </ListItem>
    </CanViewNavLink>
  )
}

export default VerticalNavLink
