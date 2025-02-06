import { devMode } from 'src/configs/dev'
import { ChildrenTabs } from './children-tabs'

const accountsTabs: ChildrenTabs[] = [
  {
    name: 'Business Detail',
    caption: 'Business Detail',
    id: 'account-business-detail',
    link: '/account-settings'
  },
  ...(devMode
    ? [
        {
          name: 'Subscription',
          caption: 'Subscription',
          id: 'account-subscription',
          link: '/account-settings/subscription'
        }
      ]
    : []),
  ...(devMode
    ? [
        {
          name: 'Sessions',
          caption: 'Sessions',
          id: 'account-sessions',
          link: '/account-settings/sessions'
        }
      ]
    : []),
  ...(devMode
    ? [
        {
          name: 'Operation Record',
          caption: 'Operation Record',
          id: 'account-operation-record',
          link: '/account-settings/operation-record'
        }
      ]
    : []),
  ...(devMode
    ? [
        {
          name: 'Data Settings',
          caption: 'Data Settings',
          id: 'account-data-settings',
          link: '/account-settings/data-settings'
        }
      ]
    : [])
]

export default accountsTabs
