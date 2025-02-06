// ** MUI Imports
import Icon from 'src/@core/components/icon'
import Avatar from '@mui/material/Avatar'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { Box, Typography } from '@mui/material'
import Link from 'next/link'

interface NavItemType {
  tab: string
  item: {
    name: string
    caption: string
    id: string
    link: string
    icon: string
  }
}

const NavItem = ({ tab, item }: NavItemType) => {
  const RenderAvatar = tab === item.id ? CustomAvatar : Avatar

  return (
    <Link href={item.link} style={{ textDecoration: 'none' }}>
      <div style={{ display: 'flex' }}>
        <div>
          <RenderAvatar variant='rounded' {...(tab === item.id && { skin: 'filled' })}>
            <Icon icon={item.icon} fontSize='1.5rem' />
          </RenderAvatar>
        </div>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: '15px',
            marginBottom: '15px'
          }}
        >
          <Typography
            noWrap
            variant='body2'
            sx={{ color: tab === item.id ? 'primary.main' : 'text.primary', fontWeight: 600 }}
          >
            {item.name}
          </Typography>
          <Typography noWrap variant='body2'>
            {item.caption}
          </Typography>
        </Box>
      </div>
    </Link>
  )
}

export default NavItem
