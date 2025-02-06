// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Components
import Autocomplete from 'src/layouts/components/Autocomplete'
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
// import LanguageDropdown from 'src/@core/layouts/components/shared-components/LanguageDropdown'
// import NotificationDropdown, {
//   NotificationsType
// } from 'src/@core/layouts/components/shared-components/NotificationDropdown'
// import ShortcutsDropdown, {
//   ShortcutsType
// } from 'src/@core/layouts/components/shared-components/ShortcutsDropdown'

// ** Hook Import
import { useAuth } from 'src/hooks/useAuth'
import { Typography } from '@mui/material'
import { ThemeCustomizerDrawer } from 'src/@core/components/customizer'
import themeConfig from 'src/configs/themeConfig'
import React from 'react'
import useAppBarButton from 'src/hooks/useAppBarButton'
import { devMode } from 'src/configs/dev'
import { useTranslation } from 'react-i18next'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { useRouter } from 'next/router'
import FullscreenToggler from 'src/@core/layouts/components/shared-components/FullscreenToggler'
// import { useRouter } from 'next/router'
// import VerticalNavHeader from 'src/@core/layouts/components/vertical/navigation/VerticalNavHeader'

type ActivePageTypes = {
  title: string
}
interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
  activePage?: ActivePageTypes
}

// const notifications: NotificationsType[] = [
//   {
//     meta: 'Today',
//     avatarAlt: 'Flora',
//     title: 'Congratulation Flora! 🎉',
//     avatarImg: '/images/avatars/4.png',
//     subtitle: 'Won the monthly best seller badge'
//   },
//   {
//     meta: 'Yesterday',
//     avatarColor: 'primary',
//     subtitle: '5 hours ago',
//     avatarText: 'Robert Austin',
//     title: 'New user registered.'
//   },
//   {
//     meta: '11 Aug',
//     avatarAlt: 'message',
//     title: 'New message received 👋🏻',
//     avatarImg: '/images/avatars/5.png',
//     subtitle: 'You have 10 unread messages'
//   },
//   {
//     meta: '25 May',
//     title: 'Paypal',
//     avatarAlt: 'paypal',
//     subtitle: 'Received Payment',
//     avatarImg: '/images/misc/paypal.png'
//   },
//   {
//     meta: '19 Mar',
//     avatarAlt: 'order',
//     title: 'Received Order 📦',
//     avatarImg: '/images/avatars/3.png',
//     subtitle: 'New order received from John'
//   },
//   {
//     meta: '27 Dec',
//     avatarAlt: 'chart',
//     subtitle: '25 hrs ago',
//     avatarImg: '/images/misc/chart.png',
//     title: 'Finance report has been generated'
//   }
// ]

// const shortcuts: ShortcutsType[] = [
//   {
//     title: 'Calendar',
//     url: '/calendar',
//     icon: 'tabler:calendar',
//     subtitle: 'Appointments'
//   },
//   {
//     title: 'Invoice App',
//     url: '/invoice/list',
//     icon: 'tabler:file-invoice',
//     subtitle: 'Manage Accounts'
//   },
//   {
//     title: 'User App',
//     icon: 'tabler:users',
//     url: '/user/list',
//     subtitle: 'Manage Users'
//   },
//   {
//     url: '/roles',
//     icon: 'tabler:lock',
//     subtitle: 'Permissions',
//     title: 'Role Management'
//   },
//   {
//     subtitle: 'CRM',
//     title: 'Dashboard',
//     url: '/dashboards/crm',
//     icon: 'tabler:device-analytics'
//   },
//   {
//     title: 'Settings',
//     icon: 'tabler:settings',
//     subtitle: 'Account Settings',
//     url: '/pages/account-settings/account'
//   },
//   {
//     icon: 'tabler:help',
//     title: 'Help Center',
//     url: '/pages/help-center',
//     subtitle: 'FAQs & Articles'
//   },
//   {
//     title: 'Dialogs',
//     icon: 'tabler:square',
//     subtitle: 'Useful Popups',
//     url: '/pages/dialog-examples'
//   }
// ]

const AppBarContent = (props: Props) => {
  const { t } = useTranslation()
  const router = useRouter()
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props
  const { navCollapsed } = settings
  const { disableCustomizer } = themeConfig
  // ** Hook
  const auth = useAuth()

  const [open, setOpen] = React.useState<boolean>(false)

  // const router = useRouter()
  // console.log(router)

  // useAppBarButton
  const appBarButton = useAppBarButton()

  // custom dropdown on title

  return (
    <React.Fragment>
      {/* Theme Customizer */}
      {disableCustomizer || hidden ? null : (
        <ThemeCustomizerDrawer open={open} onClose={() => setOpen(false)} />
      )}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {!hidden && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={() => saveSettings({ ...settings, navCollapsed: !navCollapsed })}
              >
                <Icon icon='tabler:menu-2' fontSize='1.25rem' />
              </IconButton>
              {(props?.activePage as any)?.children ? (
                <Box
                  sx={{
                    width:
                      (
                        ((props?.activePage as any)?.width > 15 ? 0.6 : 0.8) *
                        (props?.activePage as any)?.width
                      ).toString() + 'rem'
                  }}
                >
                  <SelectCustom
                    options={(props?.activePage as any)?.children
                      .filter((item: any) => (item.devMode && !devMode ? false : true))
                      .map((item: any) => ({
                        label: t(item.name),
                        value: item.link
                      }))}
                    optionKey={'value'}
                    labelKey={'label'}
                    value={router.pathname}
                    onChange={e => {
                      console.log(e)
                    }}
                    onSelect={e => {
                      router.push(e.value)
                    }}
                  />
                </Box>
              ) : (
                props?.activePage?.title && (
                  <Typography variant='h6'>{t(props.activePage?.title)}</Typography>
                )
              )}
            </Box>

            {appBarButton.buttonLeft && (
              <Box display='flex' gap={2} ml={8}>
                {appBarButton.buttonLeft}
              </Box>
            )}
          </>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            justifyContent: 'space-between',
            flex: 1,
            paddingLeft: theme => (hidden && !settings.navHidden ? theme.spacing(6) : 0)
          }}
        >
          <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            {hidden && !settings.navHidden ? (
              <IconButton
                color='inherit'
                sx={{ ml: -2.75 }}
                onClick={() => {
                  saveSettings({ ...settings, navCollapsed: false })
                  toggleNavVisibility()
                }}
              >
                <Icon fontSize='1.5rem' icon='tabler:menu-2' />
              </IconButton>
            ) : null}
            {hidden && !settings.navHidden
              ? props?.activePage?.title && (
                  <>
                    {(props?.activePage as any)?.children ? (
                      <Box
                        sx={{
                          width:
                            (
                              ((props?.activePage as any)?.width > 15 ? 0.6 : 0.8) *
                              (props?.activePage as any)?.width
                            ).toString() + 'rem'
                        }}
                      >
                        <SelectCustom
                          options={(props?.activePage as any)?.children
                            .filter((item: any) => (item.devMode && !devMode ? false : true))
                            .map((item: any) => ({
                              label: t(item.name),
                              value: item.link
                            }))}
                          optionKey={'value'}
                          labelKey={'label'}
                          value={router.pathname}
                          onChange={e => {
                            console.log(e)
                          }}
                          onSelect={e => {
                            router.push(e.value)
                          }}
                        />
                      </Box>
                    ) : (
                      props?.activePage?.title && (
                        <Typography variant='h6'>{t(props.activePage?.title)}</Typography>
                      )
                    )}
                    {appBarButton.buttonLeft && (
                      <Box display='flex' gap={2} ml={8}>
                        {appBarButton.buttonLeft}
                      </Box>
                    )}
                  </>
                )
              : null}
          </Box>

          {appBarButton.buttonRight ? (
            <Box
              sx={{
                justifyContent: 'flex-end',
                display: 'flex',
                gap: 2,
                flex: 1,
                paddingLeft: theme => (hidden && !settings.navHidden ? theme.spacing(6) : 0)
              }}
            >
              {appBarButton.buttonRight}
            </Box>
          ) : (
            <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
              {auth.user && <Autocomplete hidden={hidden} settings={settings} />}
              {/* <LanguageDropdown settings={settings} saveSettings={saveSettings} /> */}
              <FullscreenToggler />
              <ModeToggler settings={settings} saveSettings={saveSettings} />
              {auth.user && (
                <>
                  {/* {devMode && (
                    <>
                      <ShortcutsDropdown settings={settings} shortcuts={shortcuts} />
                      <NotificationDropdown settings={settings} notifications={notifications} />
                    </>
                  )} */}
                  <UserDropdown
                    settings={settings}
                    saveSettings={saveSettings}
                    // onThemeModelClose={() => setOpen(false)}
                    onThemeModelOpen={() => setOpen(true)}
                  />
                </>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </React.Fragment>
  )
}

export default AppBarContent
