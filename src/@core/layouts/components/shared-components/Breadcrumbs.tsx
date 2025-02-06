import * as React from 'react'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import { Icon } from '@iconify/react'
import { Box, Chip, Menu, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { HorizontalNavItemsType } from '../../types'
import { useRouter } from 'next/router'
import { handleURLQueries } from '../../utils'
import childrenTabs from 'src/constants/children-tabs'
import { navbarDropdowns } from 'src/constants/navbar-dropdown'

type BreadcrumbsProps = {
  navItems?: HorizontalNavItemsType
}

export default function IconBreadcrumbs({ navItems }: BreadcrumbsProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const [activeMenu, setActiveMenu] = React.useState<
    {
      title: string
      icon: string | undefined
      path?: string
    }[]
  >([])

  // dropdown menu
  const [dropdownMenu, setDropdownMenu] = React.useState<
    {
      title: string
      path?: string
    }[]
  >([])

  const [menuActive, setMenuActive] = React.useState<string | null>(null)

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const getActiveMenu = () => {
    const activeMenu: any = []

    navItems?.forEach((item: any) => {
      if (item?.path?.includes(router.pathname) || handleURLQueries(router, item.path)) {
        if (item.title !== 'Dashboard') {
          activeMenu.push({
            title: item.title,
            icon: item.icon,
            path: item.path ?? undefined
          })
        }
      }

      if (item?.children?.length > 0) {
        item.children.forEach((child: any) => {
          if (child?.path?.includes(router.pathname) || handleURLQueries(router, child.path)) {
            if (!activeMenu.find((menu: any) => menu.title === child.title)) {
              activeMenu.push({
                title: child.title,
                icon: child.icon,
                path: child.path ?? undefined
              })
            }
          }

          if (child.children?.length > 0) {
            child.children.forEach((grandChild: any) => {
              if (
                grandChild?.path?.includes(router.pathname) ||
                handleURLQueries(router, grandChild.path)
              ) {
                activeMenu.push({
                  title: item.title,
                  icon: item.icon,
                  path: item.path ?? undefined
                })

                activeMenu.push({
                  title: child.title,
                  icon: child.icon,
                  path: child.path ?? undefined
                })

                activeMenu.push({
                  title: grandChild.title,
                  icon: grandChild.icon,
                  path: grandChild.path ?? undefined
                })
              }
            })
          }
        })
      }
    })

    if (activeMenu.find((item: any) => item.path == router.pathname) == undefined) {
      childrenTabs.forEach((item: any) => {
        if (item?.link == router.pathname) {
          if (activeMenu.find((menu: any) => menu.title !== item.name))
            activeMenu.push({
              title: item.name,
              path: item.link ?? undefined
            })
        }
      })
    }

    navbarDropdowns
      .filter((item: any) => item.children)
      .forEach((item: any) => {
        if (router.pathname.includes(item.link)) {
          console.log('debugx ketemu', item)
          setDropdownMenu(item.children)

          const menuActive = item.children.find((child: any) => child.link === router.pathname)
          console.log('debugx menuActive', menuActive)

          setMenuActive(menuActive?.name)

          if (activeMenu[activeMenu.length - 1].title === activeMenu[activeMenu.length - 2].title) {
            delete activeMenu[activeMenu.length - 1]
          }
        }
      })

    setActiveMenu(activeMenu)
  }

  React.useEffect(() => {
    setActiveMenu([])
    setMenuActive(null)
    setDropdownMenu([])
    getActiveMenu()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname])

  return activeMenu.length > 1 ? (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, ml: 2 }}>
      <Breadcrumbs aria-label='breadcrumb'>
        {/* <Link
          underline='hover'
          sx={{ display: 'flex', alignItems: 'center' }}
          color='inherit'
          href='/dashboard'
        >
          <Icon icon='mdi:home' style={{ marginRight: 4 }} />
          {t('Dashboard')}
        </Link> */}
        {activeMenu.map((item: any, index: number) =>
          index === activeMenu.length - 1 || item.path == undefined ? (
            <Typography
              key={index}
              sx={{ color: 'text.primary', display: 'flex', alignItems: 'center' }}
            >
              {/* {item.icon && <Icon icon={item.icon} style={{ marginRight: 4 }} />} */}
              {t(item.title)}
            </Typography>
          ) : (
            <Link
              key={index}
              underline='hover'
              sx={{ display: 'flex', alignItems: 'center' }}
              color='inherit'
              href={item.path}
            >
              {/* {item.icon && <Icon icon={item.icon} style={{ marginRight: 4 }} />} */}
              {t(item.title)}
            </Link>
          )
        )}
        {dropdownMenu.length > 0 && menuActive && (
          <Box>
            <Chip
              component='button'
              id='basic-button'
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup='true'
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {t(menuActive)}
                  <Icon icon='mdi:chevron-down' style={{ marginLeft: 4 }} fontSize={18} />
                </Box>
              }
            />
            <Menu
              id='basic-menu'
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button'
              }}
            >
              {dropdownMenu.map((item: any, index: number) => (
                <MenuItem
                  onClick={() => {
                    handleClose()
                    router.push(item.link)
                  }}
                  key={index}
                  selected={item.name === menuActive}
                >
                  {t(item.name)}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}
      </Breadcrumbs>
    </Box>
  ) : null
}
