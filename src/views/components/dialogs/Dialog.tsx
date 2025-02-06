import { Icon } from '@iconify/react'
import {
  Box,
  Dialog as MuiDialog,
  IconButton,
  Typography,
  styled,
  DialogTitleProps,
  DialogContent,
  SxProps,
  Theme
} from '@mui/material'

type dialogProps = {
  open: boolean
  onClose: () => void
  enableCloseBackdrop?: boolean
  title: string
  children?: JSX.Element | JSX.Element[]
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
  sx?: SxProps<Theme>
}

const Header = styled(Box)<DialogTitleProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const Dialog = ({
  open,
  onClose,
  title,
  children,
  maxWidth,
  enableCloseBackdrop = false,
  sx
}: dialogProps) => {
  return (
    <MuiDialog
      scroll='body'
      open={open}
      sx={sx}
      onClose={(_, reason) => {
        if (['backdropClick'].includes(reason) && enableCloseBackdrop) onClose()
        else if (['escapeKeyDown'].includes(reason)) onClose()
      }}
      fullWidth
      maxWidth={maxWidth}
    >
      <Header paddingBottom={'0.5rem !important'}>
        <Typography variant='h5'>{title}</Typography>
        <IconButton
          size='small'
          onClick={onClose}
          sx={{
            p: '0.438rem',
            borderRadius: 1,
            color: 'text.primary',
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>
      <DialogContent>{children}</DialogContent>
    </MuiDialog>
  )
}

export default Dialog
