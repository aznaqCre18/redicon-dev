// ** React Imports
import { ReactNode, useEffect, useState } from 'react'

// ** MUI Imports
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Layout Imports
// !Do not remove this Layout import
import Layout from 'src/@core/layouts/Layout'

// ** Navigation Imports
import VerticalNavItems, { navigationArray } from 'src/navigation/vertical'
import HorizontalNavItems from 'src/navigation/horizontal'

// ** Component Import
// Uncomment the below line (according to the layout type) when using server-side menu
// import ServerSideVerticalNavItems from './components/vertical/ServerSideNavItems'
// import ServerSideHorizontalNavItems from './components/horizontal/ServerSideNavItems'

import VerticalAppBarContent from './components/vertical/AppBarContent'
import HorizontalAppBarContent from './components/horizontal/AppBarContent'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'
import { useDispatch } from 'react-redux'
import { handleSetLayout } from 'src/store/apps/layout'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'
import { useRouter } from 'next/router'
import React from 'react'
import generalSettingList from 'src/constants/general-settings-tabs'
import systemSettingList from 'src/constants/system-setting-list'
import childrenTabs from 'src/constants/children-tabs'
import promotionItemsList from 'src/constants/promotion-list'
import { setTitlePage } from 'src/utils/metaUtils'
import accountsTabs from 'src/constants/accounts-tabs'
import { useResizeMainWrapper } from 'src/hooks/useResizeMainWrapper'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'
import { devMode } from 'src/configs/dev'
import { Box, Typography } from '@mui/material'
import { useApp } from 'src/hooks/useApp'
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { navbarDropdowns } from 'src/constants/navbar-dropdown'

type ActivePageTypes = {
  title: string
  icon?: string
}
interface Props {
  children: ReactNode
  contentHeightFixed?: boolean
}

const UserLayout = ({ children, contentHeightFixed }: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { menuActive, setMenuActive, currentMenuActive } = useApp()
  const { checkPermission, user } = useAuth()
  const vendorId = user?.user.vendor_id
  const { t } = useTranslation()
  // ** Hooks
  const [hideExpandedCurrent, setHideExpandedCurrent] = useState<boolean>(false)
  const [expandedItem, setExpandedItem] = useState<string | undefined>(undefined)
  const { settings, saveSettings } = useSettings()
  const dispatch = useDispatch()
  const store = useSelector((state: RootState) => state.layout)

  // ** Vars for server side navigation
  // const { menuItems: verticalMenuItems } = ServerSideVerticalNavItems()
  // const { menuItems: horizontalMenuItems } = ServerSideHorizontalNavItems()

  /**
   *  The below variable will hide the current layout menu at given screen size.
   *  The menu will be accessible from the Hamburger icon only (Vertical Overlay Menu).
   *  You can change the screen size from which you want to hide the current layout menu.
   *  Please refer useMediaQuery() hook: https://mui.com/material-ui/react-use-media-query/,
   *  to know more about what values can be passed to this hook.
   *  ! Do not change this value unless you know what you are doing. It can break the template.
   */
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

  useEffect(() => {
    dispatch(handleSetLayout({ ...store.hiddenNavbar, sm: hidden }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, hidden])

  if (hidden && settings.layout === 'horizontal') {
    settings.layout = 'vertical'
  }

  const router = useRouter()

  const activePage = React.useMemo(() => {
    const activePage = navigationArray.find((item: any) => item.path === router.pathname)
    const promotionItem = promotionItemsList.find(item => item.link === router.pathname)
    const accountSubMenu = accountsTabs.find(item => item.link === router.pathname)
    const generalSubmenu = generalSettingList.find(item => item.link === router.pathname)
    const systemSubmenu = systemSettingList.find(item => item.link === router.pathname)
    const childrenSubMenu = childrenTabs.find(item => item.link === router.pathname)
    const isNavbarDropdowns = navbarDropdowns.find(item => router.pathname.includes(item.link))

    if (!activePage?.children) {
      if (generalSubmenu) {
        if (!checkPermission(generalSubmenu.permission)) {
          router.push('/401')
        }

        return {
          title: generalSubmenu?.name
        }
      }
      if (systemSubmenu) {
        if (!checkPermission(systemSubmenu.permission)) {
          router.push('/401')
        }

        return {
          title: systemSubmenu?.name
        }
      }
      if (childrenSubMenu) {
        if (!checkPermission(childrenSubMenu.permission)) {
          router.push('/401')
        }

        let name = childrenSubMenu?.name

        if (name.includes(' > ')) {
          const names = name.split(' > ')

          name = names.map(item => t(item)).join(' > ')
        }

        return {
          title: name
        }
      }
      if (isNavbarDropdowns) {
        if (!checkPermission(isNavbarDropdowns.permission)) {
          router.push('/401')
        }

        const titleActive = isNavbarDropdowns.children?.find(item => item.link === router.pathname)
        // get max children title
        const width = isNavbarDropdowns.children?.map(item => t(item.name)?.length ?? 0) ?? []
        const max = Math.max(...width)

        if (!checkPermission(titleActive?.permission)) {
          router.push('/401')
        }

        return {
          title: titleActive?.name ?? isNavbarDropdowns.name,
          width: max,
          children: isNavbarDropdowns.children
        }
      }
      if (accountSubMenu) {
        if (!checkPermission(accountSubMenu.permission)) {
          router.push('/401')
        }

        return {
          title: accountSubMenu?.name
        }
      }
      if (promotionItem) {
        if (!checkPermission(promotionItem.permission)) {
          router.push('/401')
        }

        return {
          title: promotionItem?.name
        }
      }
    }

    return activePage as ActivePageTypes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname])

  useEffect(() => {
    let title = activePage?.title

    if (title && title.includes(' > ')) {
      const titles = title.split(' > ')

      // last title
      title = titles[titles.length - 1]
    }
    setTitlePage(t(title))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, router.query])

  // HOOK FOR GET MAIN CONTENT WIDTH
  const { handleResizeMainWrapper } = useResizeMainWrapper()
  // const [navCollapsed, setNavCollapsed] = React.useState<boolean>(false)

  const handleWindowSizeChange = () => {
    const mainWrapper = document.getElementsByClassName('layout-content-wrapper')

    if (mainWrapper.length > 0) {
      const width = mainWrapper[0].clientWidth
      const height = mainWrapper[0].clientHeight

      handleResizeMainWrapper(width, height)
    }
    // setWidth(window.innerWidth);
    // isMobile = window.innerWidth < 700 ? true : false;
  }

  useEffect(() => {
    // setNavCollapsed(settings.navCollapsed)
    window.addEventListener('resize', handleWindowSizeChange)
    handleWindowSizeChange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useEffect(() => {
  //   console.log('settings.layout', settings.layout)

  //   handleWindowSizeChange()
  // }, [settings.layout, settings.navCollapsed])

  const [verticalNavItems, setVerticalNavItems] = useState<VerticalNavItemsType>(
    VerticalNavItems()
      .filter((item: any) => item.devMode == undefined || (item.devMode && devMode))
      .filter((item: any) => {
        if (item.permission) {
          return checkPermission(item.permission)
        }

        return true
      })
  )
  const isCurrentMenuActive = currentMenuActive.find(item => item === 'Reports')

  useEffect(() => {
    let _menuActive = menuActive

    if (
      isCurrentMenuActive &&
      hideExpandedCurrent &&
      _menuActive.find(item => item === 'Reports')
    ) {
      _menuActive = []
    }

    if ((!isCurrentMenuActive && _menuActive) || (isCurrentMenuActive && !hideExpandedCurrent)) {
      menuActive.forEach(item => {
        const found = verticalNavItems.find((navItem: any) => navItem.title === item) as any
        if (found) {
          if (found.expanded) {
            setExpandedItem(found.title)
            // setHideExpandedCurrent(false)
          }
        }
      })
    }

    if (!(_menuActive.length == 0 && menuActive.length == 0)) {
      setMenuActive(_menuActive)
    }

    if (menuActive.find(item => item === 'Reports')) {
      setHideExpandedCurrent(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuActive])

  useEffect(() => {
    let _verticalNavItems = VerticalNavItems().filter((item: any) => {
      if (item.permission) {
        return checkPermission(item.permission)
      }

      return true
    })

    if (expandedItem) {
      const expandedItemIndex = verticalNavItems.findIndex(
        (item: any) => item.title === expandedItem
      )
      if (expandedItemIndex > -1) {
        _verticalNavItems = (verticalNavItems[expandedItemIndex] as any).children

        // jika vendorId == 69
        if (!(vendorId == 69) && !devMode) {
          console.log('_verticalNavItems', _verticalNavItems)

          _verticalNavItems = _verticalNavItems.filter((item: any) => {
            if (item.permission) {
              return item.permission != 'vendor-69'
            }

            return true
          })
        }
      }
    }

    setVerticalNavItems(_verticalNavItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideExpandedCurrent, expandedItem])

  return (
    <Layout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      contentHeightFixed={contentHeightFixed}
      verticalLayoutProps={{
        navMenu: {
          afterContent: expandedItem
            ? () => (
                <Box mx={4} px={4} mt={4} mb={-2}>
                  <Box
                    width={'100%'}
                    onClick={() => {
                      if (isCurrentMenuActive) {
                        setHideExpandedCurrent(true)
                      }
                      setExpandedItem(undefined)
                      // const menu = currentMenuActive.filter(item => item !== expandedItem)
                      // if (menu) {
                      //   setHideExpandedCurrent(true)
                      // }

                      setMenuActive([])

                      // promise(() => {
                      // router.push('/dashboard')
                      // }, 100)
                    }}
                  >
                    <Typography
                      className='hover-underline'
                      variant='body2'
                      sx={{
                        color: 'primary.main'
                      }}
                    >
                      {t('Back')}
                    </Typography>
                  </Box>
                  <Typography
                    variant='h1'
                    sx={{
                      color: 'text.primary',
                      fontSize: 20,
                      fontWeight: 600
                    }}
                  >
                    {t(expandedItem)}
                  </Typography>
                </Box>
              )
            : undefined,
          navItems: verticalNavItems

          // Uncomment the below line when using server-side menu in vertical layout and comment the above line
          // navItems: verticalMenuItems
        },
        appBar: {
          content: props => (
            // Header
            <VerticalAppBarContent
              activePage={activePage}
              hidden={hidden}
              settings={settings}
              saveSettings={saveSettings}
              toggleNavVisibility={props.toggleNavVisibility}
            />
          )
        }
      }}
      {...(settings.layout === 'horizontal' && {
        horizontalLayoutProps: {
          navMenu: {
            navItems: HorizontalNavItems()

            // Uncomment the below line when using server-side menu in horizontal layout and comment the above line
            // navItems: horizontalMenuItems
          },
          appBar: {
            content: () => (
              <HorizontalAppBarContent
                hidden={hidden}
                settings={settings}
                saveSettings={saveSettings}
              />
            )
          }
        }
      })}
    >
      {children}
    </Layout>
  )
}

export default UserLayout
