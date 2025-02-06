import { useState } from 'react'

import List from '@mui/material/List'
import Box from '@mui/material/Box'
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles'

import PerfectScrollbar from 'react-perfect-scrollbar'

import { LayoutProps } from 'src/@core/layouts/types'

import themeConfig from 'src/configs/themeConfig'

import Drawer from './Drawer'
import VerticalNavItems from './VerticalNavItems'
import VerticalNavHeader from './VerticalNavHeader'

import themeOptions from 'src/@core/theme/ThemeOptions'
import { useApp } from 'src/hooks/useApp'
import { formatPriceIDR } from 'src/utils/numberUtils'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { devMode } from 'src/configs/dev'
import { useAuth } from 'src/hooks/useAuth'

interface Props {
  navWidth: number
  navVisible: boolean
  collapsedNavWidth: number
  hidden: LayoutProps['hidden']
  navigationBorderWidth: number
  toggleNavVisibility: () => void
  settings: LayoutProps['settings']
  children: LayoutProps['children']
  setNavVisible: (value: boolean) => void
  saveSettings: LayoutProps['saveSettings']
  navMenuContent: LayoutProps['verticalLayoutProps']['navMenu']['content']
  navMenuBranding: LayoutProps['verticalLayoutProps']['navMenu']['branding']
  menuLockedIcon: LayoutProps['verticalLayoutProps']['navMenu']['lockedIcon']
  verticalNavItems: LayoutProps['verticalLayoutProps']['navMenu']['navItems']
  navMenuProps: LayoutProps['verticalLayoutProps']['navMenu']['componentProps']
  menuUnlockedIcon: LayoutProps['verticalLayoutProps']['navMenu']['unlockedIcon']
  afterNavMenuContent: LayoutProps['verticalLayoutProps']['navMenu']['afterContent']
  beforeNavMenuContent: LayoutProps['verticalLayoutProps']['navMenu']['beforeContent']
}

const Navigation = (props: Props) => {
  const { vendorProfile } = useAuth()
  const { t } = useTranslation()

  const {
    menuActive: groupActive,
    setMenuActive: setGroupActive,
    currentMenuActive: currentActiveGroup,
    setCurrentMenuActive: setCurrentActiveGroup
  } = useApp()
  const {
    hidden,
    settings,
    afterNavMenuContent,
    beforeNavMenuContent,
    navigationBorderWidth,
    navMenuContent: userNavMenuContent
  } = props

  const [navHover, setNavHover] = useState<boolean>(false)
  // const [groupActive, setGroupActive] = useState<string[]>([])

  const { afterVerticalNavMenuContentPosition, beforeVerticalNavMenuContentPosition } = themeConfig

  const navMenuContentProps = {
    ...props,
    navHover,
    groupActive,
    setGroupActive,
    currentActiveGroup,
    setCurrentActiveGroup
  }

  let darkTheme = createTheme(themeOptions(settings, 'dark'))

  if (themeConfig.responsiveFontSizes) {
    darkTheme = responsiveFontSizes(darkTheme)
  }
  const handleInfiniteScroll = (ref: HTMLElement) => {
    if (ref) {
      // @ts-ignore
      ref._getBoundingClientRect = ref.getBoundingClientRect

      ref.getBoundingClientRect = () => {
        // @ts-ignore
        const original = ref._getBoundingClientRect()

        return { ...original, height: Math.floor(original.height) }
      }
    }
  }

  // ** Scroll Menu
  const scrollMenu = () => {
    if (beforeVerticalNavMenuContentPosition === 'static' || !beforeNavMenuContent) {
      return
    }
  }

  const ScrollWrapper = hidden ? Box : PerfectScrollbar

  return (
    <ThemeProvider theme={darkTheme}>
      <Drawer
        {...props}
        navHover={navHover}
        setNavHover={setNavHover}
        navigationBorderWidth={navigationBorderWidth}
        navMenuProps={{
          sx: {
            zIndex: hidden ? '9999' : ''
          }
        }}
      >
        <Box
          sx={{
            p: '0 16px',
            boxShadow: '5px 1px 6px 0px rgba(47, 43, 61, 0.14)'
          }}
        >
          <VerticalNavHeader {...props} navHover={navHover} />
        </Box>

        {afterNavMenuContent && afterVerticalNavMenuContentPosition === 'fixed'
          ? afterNavMenuContent(navMenuContentProps)
          : null}

        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          {/* @ts-ignore */}
          <ScrollWrapper
            {...(hidden
              ? {
                  onScroll: () => scrollMenu(),
                  sx: { height: '100%', overflowY: 'auto', overflowX: 'hidden' }
                }
              : {
                  options: { wheelPropagation: false },
                  onScrollY: () => scrollMenu(),
                  containerRef: (ref: any) => handleInfiniteScroll(ref)
                })}
          >
            {devMode &&
              vendorProfile?.is_payment_dana_active &&
              !settings.navCollapsed &&
              !afterNavMenuContent && (
                <Link href='/funds' className='no-link'>
                  <Box
                    sx={theme => ({
                      marginX: 4,
                      marginY: 2,
                      marginBottom: -2,
                      p: 4,
                      display: 'flex',
                      justifyContent: 'space-between',
                      border: 1,
                      borderColor: theme.palette.divider,
                      borderRadius: 1,
                      backgroundColor: theme.palette.background.paper,
                      cursor: 'pointer',
                      fontWeight: 'medium',
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      }
                    })}
                  >
                    <Box>{t('Funds')}</Box>
                    <Box>{formatPriceIDR(vendorProfile?.digital_balance?.balance ?? 0)}</Box>
                  </Box>
                </Link>
              )}
            {userNavMenuContent ? (
              userNavMenuContent(navMenuContentProps)
            ) : (
              <List
                className='nav-items'
                sx={{
                  pt: 0,
                  '& > :first-of-type': { mt: '16px', top: 'unset' }
                }}
              >
                <VerticalNavItems
                  navHover={navHover}
                  groupActive={groupActive}
                  setGroupActive={setGroupActive}
                  currentActiveGroup={currentActiveGroup}
                  setCurrentActiveGroup={setCurrentActiveGroup}
                  {...props}
                />
              </List>
            )}
          </ScrollWrapper>
        </Box>
      </Drawer>
    </ThemeProvider>
  )
}

export default Navigation
