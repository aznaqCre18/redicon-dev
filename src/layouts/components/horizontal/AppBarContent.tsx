// ** MUI Imports
import Box from '@mui/material/Box'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Components
// import Autocomplete from 'src/layouts/components/Autocomplete'
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
import React from 'react'
import { ThemeCustomizerDrawer } from 'src/@core/components/customizer'
import themeConfig from 'src/configs/themeConfig'
import LayoutToggler from 'src/@core/layouts/components/shared-components/LayoutToggler'
import FullscreenToggler from 'src/@core/layouts/components/shared-components/FullscreenToggler'
// import { devMode } from 'src/configs/dev'

interface Props {
  hidden: boolean
  settings: Settings
  saveSettings: (values: Settings) => void
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
  // ** Props
  const { hidden, settings, saveSettings } = props
  const { disableCustomizer } = themeConfig

  const [open, setOpen] = React.useState<boolean>(false)

  // ** Hook
  const auth = useAuth()

  return (
    <React.Fragment>
      {disableCustomizer || hidden ? null : (
        <ThemeCustomizerDrawer open={open} onClose={() => setOpen(false)} />
      )}

      <Box
        sx={{
          // width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          {/* {!isFullscreen ? (
            <IconButton onClick={() => fullScreen()}>
              <Icon icon='tabler:window-maximize' fontSize='1.25rem' />
            </IconButton>
          ) : (
            <IconButton onClick={() => exitFullScreen()}>
              <Icon icon='tabler:window-minimize' fontSize='1.25rem' />
            </IconButton>
          )} */}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* {auth.user && <Autocomplete hidden={hidden} settings={settings} />} */}
          {/* <LanguageDropdown settings={settings} saveSettings={saveSettings} /> */}
          <FullscreenToggler />
          <LayoutToggler settings={settings} saveSettings={saveSettings} />
          <ModeToggler settings={settings} saveSettings={saveSettings} />
          {/* {devMode && <NotificationDropdown settings={settings} notifications={notifications} />} */}
          {auth.user && (
            <>
              {/* <ShortcutsDropdown settings={settings} shortcuts={shortcuts} /> */}
              <UserDropdown
                hideName
                settings={settings}
                saveSettings={saveSettings}
                // onThemeModelClose={() => setOpen(false)}
                onThemeModelOpen={() => setOpen(true)}
              />
            </>
          )}
        </Box>
      </Box>
    </React.Fragment>
  )
}

export default AppBarContent
