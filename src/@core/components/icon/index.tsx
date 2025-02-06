// ** Icon Imports
import { Icon, IconProps } from '@iconify/react'

const IconifyIcon = ({ icon, ...rest }: IconProps) => {
  return (
    <Icon
      icon={icon}
      {...rest}
      // fontSize='1.375rem'
    />
  )
}

export default IconifyIcon
