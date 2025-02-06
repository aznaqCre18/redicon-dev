// ** React Imports
import { useEffect, Fragment, useState, SyntheticEvent } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import ListItem from '@mui/material/ListItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemButton from '@mui/material/ListItemButton'

// ** Third Party Imports
import clsx from 'clsx'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Configs Import
import themeConfig from 'src/configs/themeConfig'

// ** Utils
import { hasActiveChild, removeChildren } from 'src/@core/layouts/utils'

// ** Type Import
import { NavGroup, LayoutProps } from 'src/@core/layouts/types'

// ** Custom Components Imports
import VerticalNavItems from './VerticalNavItems'
import UserIcon from 'src/layouts/components/UserIcon'
import Translations from 'src/layouts/components/Translations'
import CanViewNavGroup from 'src/layouts/components/acl/CanViewNavGroup'
import fontSizeBuilder, { bigger, smaller } from 'src/@core/utils/font-size-builder'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { usePopper } from 'react-popper'
import { ClickAwayListener, Fade, Paper } from '@mui/material'
import HorizontalNavItems from '../../horizontal/navigation/HorizontalNavItems'

interface Props {
  item: NavGroup
  navHover: boolean
  parent?: NavGroup
  navVisible?: boolean
  groupActive: string[]
  collapsedNavWidth: number
  currentActiveGroup: string[]
  navigationBorderWidth: number
  settings: LayoutProps['settings']
  isSubToSub?: NavGroup | undefined
  saveSettings: LayoutProps['saveSettings']
  setGroupActive: (values: string[]) => void
  setCurrentActiveGroup: (items: string[]) => void
}

const MenuItemTextWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
  transition: 'opacity .25s ease-in-out',
  ...(themeConfig.menuTextTruncate && { overflow: 'hidden' })
}))

const NavigationMenu = styled(Paper)(({ theme }) => ({
  overflowY: 'auto',
  padding: theme.spacing(2, 0),
  maxHeight: 'calc(100vh - 13rem)',
  backgroundColor: theme.palette.background.paper,
  ...(themeConfig.menuTextTruncate ? { width: 250 } : { minWidth: 250 }),
  '& > :not(:last-child)': {
    marginBottom: theme.spacing(1)
  },

  '&::-webkit-scrollbar': {
    width: 6
  },
  '&::-webkit-scrollbar-thumb': {
    borderRadius: 20,
    background: hexToRGBA(theme.palette.mode === 'light' ? '#B0ACB5' : '#575468', 0.6)
  },
  '&::-webkit-scrollbar-track': {
    borderRadius: 20,
    background: 'transparent'
  },
  '& .MuiList-root': {
    paddingTop: 0,
    paddingBottom: 0
  },
  '& .menu-group.Mui-selected': {
    backgroundColor: theme.palette.action.hover
  }
}))

const VerticalNavGroup = (props: Props) => {
  // ** Props
  const {
    item,
    parent,
    settings,
    navHover,
    navVisible,
    isSubToSub,
    groupActive,
    setGroupActive,
    collapsedNavWidth,
    currentActiveGroup,
    setCurrentActiveGroup,
    navigationBorderWidth
  } = props

  // ** Hooks & Vars
  const router = useRouter()
  const currentURL = router.asPath
  const { direction, navCollapsed, verticalNavToggleType, displayFont } = settings

  // State
  const { horizontalMenuToggle, horizontalMenuAnimation } = themeConfig

  const WrapperCondition = horizontalMenuToggle === 'click'
  const MainWrapper = WrapperCondition ? ClickAwayListener : 'div'

  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [popperElement] = useState(null)
  const [, setAnchorEl] = useState<Element | null>(null)
  const [referenceElement] = useState(null)

  const { update } = usePopper(referenceElement, popperElement, {
    placement: 'right',
    modifiers: [
      {
        enabled: true,
        name: 'offset'
      },
      {
        enabled: true,
        name: 'flip'
      }
    ]
  })

  // ** Accordion menu group open toggle
  const toggleActiveGroup = (item: NavGroup, parent: NavGroup | undefined) => {
    let openGroup = groupActive

    // ** If Group is already open and clicked, close the group
    if (openGroup.includes(item.title)) {
      openGroup.splice(openGroup.indexOf(item.title), 1)

      // If clicked Group has open group children, Also remove those children to close those groups
      if (item.children) {
        removeChildren(item.children, openGroup, currentActiveGroup)
      }
    } else if (parent) {
      // ** If Group clicked is the child of an open group, first remove all the open groups under that parent
      if (parent.children) {
        removeChildren(parent.children, openGroup, currentActiveGroup)
      }

      // ** After removing all the open groups under that parent, add the clicked group to open group array
      if (!openGroup.includes(item.title)) {
        openGroup.push(item.title)
      }
    } else {
      // ** If clicked on another group that is not active or open, create openGroup array from scratch

      // ** Empty Open Group array
      openGroup = []

      // ** push Current Active Group To Open Group array
      if (currentActiveGroup.every(elem => groupActive.includes(elem))) {
        openGroup.push(...currentActiveGroup)
      }

      // ** Push current clicked group item to Open Group array
      if (!openGroup.includes(item.title)) {
        openGroup.push(item.title)
      }
    }
    setGroupActive([...openGroup])
  }

  // ** Menu Group Click
  const handleGroupClick = () => {
    if (navCollapsed) {
      return
    }
    const openGroup = groupActive
    if (verticalNavToggleType === 'collapse') {
      if (openGroup.includes(item.title)) {
        openGroup.splice(openGroup.indexOf(item.title), 1)
      } else {
        openGroup.push(item.title)
      }
      setGroupActive([...openGroup])
    } else {
      toggleActiveGroup(item, parent)
    }
  }

  const handleGroupOpen = (event: SyntheticEvent) => {
    if (!navCollapsed) {
      return
    }

    setAnchorEl(event.currentTarget)
    setMenuOpen(true)
    update ? update() : null
  }

  const handleGroupClose = () => {
    setAnchorEl(null)
    setMenuOpen(false)
  }

  useEffect(() => {
    if (hasActiveChild(item, currentURL)) {
      if (!groupActive.includes(item.title)) groupActive.push(item.title)
    } else {
      const index = groupActive.indexOf(item.title)
      if (index > -1) groupActive.splice(index, 1)
    }
    setGroupActive([...groupActive])
    setCurrentActiveGroup([...groupActive])

    // Empty Active Group When Menu is collapsed and not hovered, to fix issue route change
    if (navCollapsed && !navHover) {
      setGroupActive([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath])

  useEffect(() => {
    if (navCollapsed && !navHover) {
      setGroupActive([])
    }

    if ((navCollapsed && navHover) || (groupActive.length === 0 && !navCollapsed)) {
      setGroupActive([...currentActiveGroup])
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navCollapsed, navHover])

  useEffect(() => {
    if (groupActive.length === 0 && !navCollapsed) {
      setGroupActive([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navHover])

  const icon = parent && !item.icon ? themeConfig.navSubItemIcon : item.icon

  const menuGroupCollapsedStyles = navCollapsed && !navHover ? { opacity: 0 } : { opacity: 1 }

  const AnimationWrapper = horizontalMenuAnimation ? Fade : Fragment

  return (
    <CanViewNavGroup navGroup={item}>
      <Fragment>
        <ListItem
          disablePadding
          className='nav-group'
          onClick={handleGroupClick}
          onMouseEnter={handleGroupOpen}
          sx={{ mt: 1, px: '0 !important', flexDirection: 'column' }}
        >
          {navCollapsed ? (
            <MainWrapper onClickAway={handleGroupClose} onMouseLeave={handleGroupClose}>
              <ListItemButton
                className={clsx({
                  'Mui-selected':
                    groupActive.includes(item.title) || currentActiveGroup.includes(item.title)
                })}
                sx={{
                  py: 2,
                  mx: 3.5,
                  borderRadius: 1,
                  width: theme => `calc(100% - ${theme.spacing(3.5 * 2)})`,
                  transition: 'padding-left .25s ease-in-out, padding-right .25s ease-in-out',
                  px:
                    navCollapsed && !navHover
                      ? (collapsedNavWidth - navigationBorderWidth - 22 - 28) / 8
                      : 4,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  },
                  '& .MuiTypography-root, & :not(.menu-item-meta) > svg': {
                    color: 'text.secondary'
                  },
                  '&.Mui-selected': {
                    background: theme =>
                      `linear-gradient(72.47deg, ${
                        theme.direction === 'ltr'
                          ? theme.palette.primary.main
                          : hexToRGBA(theme.palette.primary.main, 0.7)
                      } 22.16%, ${
                        theme.direction === 'ltr'
                          ? hexToRGBA(theme.palette.primary.main, 0.7)
                          : theme.palette.primary.main
                      } 76.47%)`,
                    '&:hover': {
                      backgroundColor: 'action.selected'
                    },
                    '& :not(.menu-item-meta) > svg': {
                      color: theme => `${theme.palette.common.white} !important`
                    }
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    transition: 'margin .25s ease-in-out',
                    ...(parent && navCollapsed && !navHover ? {} : { mr: 2 }),
                    ...(navCollapsed && !navHover ? { mr: 0 } : {}), // this condition should come after (parent && navCollapsed && !navHover) condition for proper styling
                    ...(parent && item.children ? { ml: 1.5, mr: 3.5 } : {})
                  }}
                >
                  <UserIcon
                    icon={icon as string}
                    fontSize={fontSizeBuilder(displayFont, {
                      small: `${1.375 * smaller}rem`,
                      default: `1.375rem`,
                      medium: `${1.375 * bigger}rem`
                    })}
                  />
                </ListItemIcon>
                <AnimationWrapper
                  {...(horizontalMenuAnimation && {
                    in: menuOpen,
                    timeout: { exit: 300, enter: 400 }
                  })}
                >
                  <Box
                    // style={styles.popper}
                    // ref={setPopperElement}
                    // {...attributes.popper}
                    sx={{
                      zIndex: theme => theme.zIndex.appBar,
                      position: 'fixed !important',
                      pl: 13
                    }}
                  >
                    <NavigationMenu
                      sx={{
                        overflowY: 'auto',
                        overflowX: 'visible',
                        maxHeight: 'calc(100vh - 21rem)',
                        boxShadow: 0,
                        border: theme => `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <HorizontalNavItems {...props} hasParent horizontalNavItems={item.children} />
                    </NavigationMenu>
                  </Box>
                </AnimationWrapper>
              </ListItemButton>
            </MainWrapper>
          ) : (
            <ListItemButton
              className={clsx({
                'Mui-selected':
                  groupActive.includes(item.title) || currentActiveGroup.includes(item.title)
              })}
              sx={{
                py: 2,
                mx: 3.5,
                borderRadius: 1,
                width: theme => `calc(100% - ${theme.spacing(3.5 * 2)})`,
                transition: 'padding-left .25s ease-in-out, padding-right .25s ease-in-out',
                px:
                  navCollapsed && !navHover
                    ? (collapsedNavWidth - navigationBorderWidth - 22 - 28) / 8
                    : 4,
                '&:hover': {
                  backgroundColor: 'action.hover'
                },
                '& .MuiTypography-root, & :not(.menu-item-meta) > svg': {
                  color: 'text.secondary'
                },
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                  '&:hover': {
                    backgroundColor: 'action.selected'
                  },
                  '& .MuiTypography-root, & :not(.menu-item-meta) > svg': {
                    color: 'text.primary'
                  },
                  '& .menu-item-meta > svg': {
                    color: 'text.secondary'
                  },
                  '&.Mui-focusVisible': {
                    backgroundColor: 'action.focus',
                    '&:hover': {
                      backgroundColor: 'action.focus'
                    }
                  }
                }
              }}
            >
              <ListItemIcon
                sx={{
                  transition: 'margin .25s ease-in-out',
                  ...(parent && navCollapsed && !navHover ? {} : { mr: 2 }),
                  ...(navCollapsed && !navHover ? { mr: 0 } : {}), // this condition should come after (parent && navCollapsed && !navHover) condition for proper styling
                  ...(parent && item.children ? { ml: 1.5, mr: 3.5 } : {})
                }}
              >
                <UserIcon
                  icon={icon as string}
                  fontSize={fontSizeBuilder(displayFont, {
                    small: `${1.375 * smaller}rem`,
                    default: `1.375rem`,
                    medium: `${1.375 * bigger}rem`
                  })}
                />
              </ListItemIcon>
              <MenuItemTextWrapper
                sx={{ ...menuGroupCollapsedStyles, ...(isSubToSub ? { ml: 2 } : {}) }}
              >
                <Typography
                  {...((themeConfig.menuTextTruncate ||
                    (!themeConfig.menuTextTruncate && navCollapsed && !navHover)) && {
                    noWrap: true
                  })}
                >
                  <Translations text={item.title} />
                </Typography>
                <Box
                  className='menu-item-meta'
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    '& svg': {
                      color: 'text.disabled',
                      transition: 'transform .25s ease-in-out',
                      ...(groupActive.includes(item.title) && {
                        transform: direction === 'ltr' ? 'rotate(90deg)' : 'rotate(-90deg)'
                      })
                    }
                  }}
                >
                  {item.badgeContent ? (
                    <Chip
                      size='small'
                      label={item.badgeContent}
                      color={item.badgeColor || 'primary'}
                      sx={{
                        mr: 2,
                        height: 22,
                        minWidth: 22,
                        '& .MuiChip-label': { px: 1.5, textTransform: 'capitalize' }
                      }}
                    />
                  ) : null}
                  <Icon
                    fontSize='1.125rem'
                    icon={direction === 'ltr' ? 'tabler:chevron-right' : 'tabler:chevron-left'}
                  />
                </Box>
              </MenuItemTextWrapper>
            </ListItemButton>
          )}

          <Collapse
            component='ul'
            onClick={e => e.stopPropagation()}
            in={groupActive.includes(item.title)}
            sx={{
              pl: 0,
              width: '100%',
              ...menuGroupCollapsedStyles,
              transition: 'all 0.25s ease-in-out'
            }}
          >
            <VerticalNavItems
              {...props}
              parent={item}
              navVisible={navVisible}
              verticalNavItems={item.children}
              isSubToSub={parent && item.children ? item : undefined}
            />
          </Collapse>
        </ListItem>
      </Fragment>
    </CanViewNavGroup>
  )
}

export default VerticalNavGroup
