// ** MUI Imports
import Icon from 'src/@core/components/icon'
import { List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface NavType {
  tab: string
  list: any[]
}

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
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <ListItem disablePadding>
      <ListItemButton selected={tab === item.id} onClick={() => router.push(item.link)}>
        <ListItemAvatar>
          <Icon icon={item.icon} fontSize={20} />
        </ListItemAvatar>
        <ListItemText primary={t(item.name)} />
      </ListItemButton>
    </ListItem>
  )
}

// ** Demo Components Imports
const Nav = ({ tab, list }: NavType) => {
  return (
    <List disablePadding>
      {list.map((item, index) => (
        <NavItem tab={tab} item={item} key={index} />
      ))}
    </List>
  )
}

export default Nav
