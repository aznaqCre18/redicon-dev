import { getInitials } from 'src/@core/utils/get-initials'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getImageAwsUrl } from 'src/utils/imageUtils'

// ** renders client column
type props = {
  url: string
  name: string
}
const RenderImageAws = ({ url, name }: props) => {
  const stateNum = Math.floor(Math.random() * 6)
  const states: ('success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | undefined)[] =
    ['success', 'error', 'warning', 'info', 'primary', 'secondary']
  const color: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | undefined =
    states[stateNum]

  return (
    <CustomAvatar
      skin='light'
      color={color}
      sx={{ fontSize: '.7rem', width: '2.5rem', height: '2.5rem', borderRadius: '4px' }}
      src={getImageAwsUrl(url)}
    >
      {getInitials(name)}
    </CustomAvatar>
  )
}

export default RenderImageAws
