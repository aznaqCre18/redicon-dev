import { Icon } from '@iconify/react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography
} from '@mui/material'
import { Box } from '@mui/system'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import Avatar from '../image/Avatar'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import { getInitials } from 'src/@core/utils/get-initials'
import { formatDateOnly } from 'src/utils/dateUtils'

const pathNoDialog = ['/account-settings/subscription', '/account-settings/subscription/add']

const DialogOutletExpired = () => {
  const [open, setOpen] = React.useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const outlets = user?.outlets ?? []

  const allOutletExpired = outlets
    .map(outlet => new Date(outlet.expired_at!).getTime())
    .every(expired => expired < Date.now())

  const outletsExpired = outlets.filter(
    outlet => new Date(outlet.expired_at!).getTime() < Date.now()
  )

  const hasExpired = outletsExpired.length > 0

  useEffect(() => {
    // check if dismissed
    const dismissed = localStorage.getItem('dismissed_outlet_expired')

    if (user) {
      if (!allOutletExpired && dismissed === `${formatDateOnly(new Date())}-${user!.user.id}`) {
        setOpen(false)

        return
      }

      if ((allOutletExpired || hasExpired) && !pathNoDialog.includes(pathname)) {
        if (allOutletExpired && pathname != '/expired') {
          router.push('/expired')
        }
        setOpen(true)

        return
      } else if (pathNoDialog.includes(pathname)) {
        setOpen(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleClose = () => {
    setOpen(false)

    // save to local storage
    localStorage.setItem(
      'dismissed_outlet_expired',
      `${formatDateOnly(new Date())}-${user!.user.id}`
    )
  }

  return (
    <Dialog open={open} maxWidth='md' fullWidth>
      <DialogTitle sx={{ py: 4 }}>
        <Typography variant='h5' sx={{ mb: 2 }}>
          {allOutletExpired ? 'All Outlet Expired' : 'Some Outlet Expired'}
        </Typography>
      </DialogTitle>
      {!allOutletExpired && (
        <IconButton
          aria-label='close'
          onClick={handleClose}
          sx={theme => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500]
          })}
        >
          <Icon icon='mdi:close' />
        </IconButton>
      )}
      <DialogContent dividers>
        <Box sx={{ my: 4 }}>
          Your subscription is expired. To continue using our services, please renew your
          subscription now.
        </Box>
        {outletsExpired.map(outlet => (
          <Box
            key={outlet.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: theme => '1px solid ' + theme.palette.divider,
              p: 4,
              borderRadius: 1,
              my: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={getImageAwsUrl(outlet.logo ?? '')} sx={{ width: 40, height: 40 }}>
                {getInitials(outlet.name)}
              </Avatar>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  ml: 2
                }}
              >
                <Typography variant='h6'>{outlet.name}</Typography>
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  {outlet.address}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary'
                }}
              >
                Expired at {outlet.expired_at ? formatDateOnly(outlet.expired_at) : '-'}
              </Typography>
            </Box>
          </Box>
        ))}
      </DialogContent>
      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Button
          onClick={() => router.push('/account-settings/subscription/add')}
          variant='contained'
        >
          Renew Subscription
        </Button>
        {!allOutletExpired ? (
          <Button onClick={handleClose} variant='outlined'>
            Close
          </Button>
        ) : (
          <>
            <Button
              onClick={() => router.push('/account-settings/subscription')}
              variant='outlined'
            >
              Manage Subscription
            </Button>
            <Button onClick={logout} variant='outlined' color='error'>
              Logout
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default DialogOutletExpired
