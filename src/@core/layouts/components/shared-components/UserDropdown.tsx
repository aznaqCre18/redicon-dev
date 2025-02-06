// ** React Imports
import { useState, SyntheticEvent, Fragment } from 'react'
import Link from 'next/link'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Avatar from '@mui/material/Avatar'
import { styled } from '@mui/material/styles'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Context
import { useAuth } from 'src/hooks/useAuth'

// ** Type Imports
import { Settings } from 'src/@core/context/settingsContext'
// import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Button, ButtonGroup } from '@mui/material'
import Image from 'next/image'
import React from 'react'
import { useTranslation } from 'react-i18next'
import FormChangePasswordDialog from 'src/pages/profile/component/FormChangePasswordDialog'
import awsConfig from 'src/configs/aws'
import DialogEditProfile from 'src/pages/profile/component/DialogEditProfile'
import { getInitials } from 'src/@core/utils/get-initials'
import { useApp } from 'src/hooks/useApp'

interface Props {
  hideName?: boolean
  settings: Settings
  onThemeModelOpen?: () => void
  onThemeModelClose?: () => void
  saveSettings?: (values: Settings) => void
}

const MenuItemStyled = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
  '&:hover .MuiBox-root, &:hover .MuiBox-root svg': {
    color: theme.palette.primary.main
  }
}))

const UserDropdown = (props: Props) => {
  const { t } = useTranslation()
  // ** Props
  const { hideName = false, settings, saveSettings } = props
  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  // ** Hooks
  const router = useRouter()
  const { logout, user } = useAuth()

  // ** Vars
  const { direction } = settings

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
    if (props.onThemeModelClose) {
      props.onThemeModelClose()
    }
  }

  const handleDropdownClose = (url?: string) => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  const styles = {
    px: 4,
    py: 1.75,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2.5,
      fontSize: '1.5rem',
      color: 'text.secondary'
    }
  }

  const handleLogout = () => {
    logout()
    handleDropdownClose()
  }

  // const [activeTab, setActiveTab] = useState('EN')

  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState<boolean>(false)
  const toggleChangePasswordDialog = () => setChangePasswordDialogOpen(!changePasswordDialogOpen)

  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState<boolean>(false)
  const toggleEditProfileDialog = () => setEditProfileDialogOpen(!editProfileDialogOpen)

  return (
    <Fragment>
      <Box
        onClick={handleDropdownOpen}
        sx={{
          ml: 2,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          alignContent: 'center'
        }}
      >
        <Avatar
          alt='Profile Picture'
          src={
            user?.user.profile_picture
              ? `${awsConfig.s3_bucket_url}/${user?.user.profile_picture}`
              : ''
          }
          onClick={handleDropdownOpen}
          sx={{ width: 28, height: 28, mr: 2 }}
        >
          {getInitials(user?.user.name ?? '')}
        </Avatar>
        {!hideName && (
          <>
            {user?.user.name}{' '}
            <Icon icon={'tabler:chevron-down'} style={{ marginLeft: 2 }} fontSize={'1.25rem'} />
          </>
        )}
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{
          '& .MuiMenu-paper': { width: 230, mt: 3.2 }
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <MenuItemStyled
          sx={{ p: 0 }}
          onClick={() => {
            handleDropdownClose()
            toggleEditProfileDialog()
          }}
        >
          <Box
            sx={styles}
            // component={Link} href='/profile'
          >
            <Icon icon='tabler:user-edit' />
            {t('My Profile')}
          </Box>
        </MenuItemStyled>
        {/* <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose('/account-settings')}>
          <Box sx={styles} component={Link} href='/account-settings'>
            <Icon icon='tabler:building' />
            {t('My Business')}
          </Box>
        </MenuItemStyled> */}
        <MenuItemStyled
          sx={{ p: 0 }}
          onClick={() => {
            if (props.onThemeModelOpen) {
              props.onThemeModelOpen()
              handleDropdownClose()
            }
          }}
        >
          <Box sx={styles}>
            <Icon icon='tabler:palette' />
            {t('Theme')}
          </Box>
        </MenuItemStyled>
        <MenuItemStyled
          sx={{ p: 0 }}
          onClick={() => {
            handleDropdownClose()
            toggleChangePasswordDialog()
          }}
        >
          <Box sx={styles}>
            <Icon icon='tabler:lock' />
            {t('Change Password')}
          </Box>
        </MenuItemStyled>
        <MenuItemStyled sx={{ p: 0 }} onClick={handleLogout}>
          <Box sx={styles}>
            <Icon icon='tabler:logout' />
            {t('Sign Out')}
          </Box>
        </MenuItemStyled>
        <Box
          sx={{
            p: theme => theme.spacing(2, 2, 0, 2)
          }}
        >
          <Language settings={settings} saveSettings={saveSettings} />
        </Box>
        {/* </MenuItemStyled> */}
      </Menu>
      <FormChangePasswordDialog
        open={changePasswordDialogOpen}
        toggle={toggleChangePasswordDialog}
      />
      <DialogEditProfile open={editProfileDialogOpen} toggle={toggleEditProfileDialog} />
    </Fragment>
  )
}

export default UserDropdown

const Language = ({ settings, saveSettings }: Props) => {
  // ** Hook
  const { setLang } = useApp()
  const { i18n } = useTranslation()

  const handleLangItemClick = (lang: string | undefined) => {
    setLang(lang as 'id' | 'en')
  }

  // ** Change html `lang` attribute when changing locale
  React.useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language)
  }, [i18n.language])

  return (
    // <TabContext value={i18n.language}>
    //   {[
    //     ['en', 'um'],
    //     ['fr', 'id']
    //   ].map(([n, f], index) => {
    //     return (
    //       <Tab
    //         sx={{
    //           display: 'flex',
    //           alignItems: 'center',
    //           justifyContent: 'center'
    //         }}
    //         key={index}
    //         value={i18n.language}
    //         onChange={() => {
    //           handleLangItemClick(n)
    //           saveSettings({ ...settings, direction: 'ltr' })
    //         }}
    //         label={
    //           <Box
    //             sx={{
    //               display: 'flex',
    //               alignItems: 'center',
    //               flexDirection: 'column',
    //               justifyContent: 'center',
    //               border: theme => `1px solid ${theme.palette.divider}`,
    //               height: 20,
    //               width: '100%',
    //               flex: 1
    //             }}
    //           >
    //             <Image height={20} width={20} alt={n} src={`/flags/${f}.svg`} />
    //           </Box>
    //         }
    //       />
    //     )
    //   })}
    // </TabContext>
    <>
      <ButtonGroup
        fullWidth
        variant={'outlined'}
        color='primary'
        aria-label='outlined primary button group'
      >
        {[
          ['en', 'um'],
          ['id', 'id']
        ].map(([n, f], index) => {
          return (
            <Button
              key={index}
              variant={i18n.language === n ? 'contained' : 'outlined'}
              onClick={() => {
                handleLangItemClick(n)
                if (saveSettings) saveSettings({ ...settings, direction: 'ltr' })
              }}
            >
              <Image height={20} width={20} alt={n} src={`/flags/${f}.svg`} />
            </Button>
          )
        })}
      </ButtonGroup>
    </>
  )
}
