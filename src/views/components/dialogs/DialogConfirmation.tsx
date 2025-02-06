// ** React Imports

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  handleClose: () => void
  handleConfirm: () => void
  loading: boolean
  name: string
  action?: string
}

const DialogConfirmation = (props: Props) => {
  const { t } = useTranslation()
  // ** Props
  const { open, handleClose, handleConfirm, loading, name, action } = props

  const _action = action ?? 'Delete'

  return (
    <>
      <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 512 } }}
      >
        <DialogContent
          sx={{
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Box
            sx={{
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center',
              '& svg': { mb: 8, color: 'warning.main' }
            }}
          >
            <Icon icon='tabler:alert-circle' fontSize='5.5rem' />
            <Typography variant='h4' sx={{ mb: 5, color: 'text.secondary' }}>
              {t('title_confirm').replace('{action}', t(_action)).replace('{name}', t(name))}
            </Typography>
            <Typography>
              {t('message_confirm')
                .replace('{action}', t(_action).toLocaleLowerCase())
                .replace('{name}', t(name).toLocaleLowerCase())}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button
            variant='contained'
            sx={{ mr: 2 }}
            onClick={() => handleConfirm()}
            disabled={loading}
          >
            {t('btn_yes').replace('{action}', t(_action).toLocaleLowerCase())}
          </Button>
          <Button variant='tonal' color='secondary' onClick={() => handleClose()}>
            {t('Cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DialogConfirmation
