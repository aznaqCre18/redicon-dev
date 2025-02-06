import { getInitials } from 'src/@core/utils/get-initials'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** renders client column
const renderImages = (props: { full_name?: string; src?: string }) => {
  const { full_name, src } = props
  const stateNum = Math.floor(Math.random() * 6)
  const states: ('success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | undefined)[] =
    ['success', 'error', 'warning', 'info', 'primary', 'secondary']
  const color: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | undefined =
    states[stateNum]

  return (
    <CustomAvatar
      src={src}
      skin='light'
      color={color}
      sx={{ fontSize: '.7rem', width: '2.5rem', height: '2.5rem', borderRadius: '4px' }}
    >
      {getInitials(full_name ? full_name : 'John Doe')}
    </CustomAvatar>
  )
}

export default renderImages
