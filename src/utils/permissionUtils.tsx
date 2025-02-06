import React, { memo } from 'react'

export const checkPermission = (permissions: string[], permission?: string) => {
  // return true

  if (!permission) return true

  permissions = permissions.map(per => per.toLowerCase())
  permission = permission.toLowerCase()

  const splitPermission = permission.split('|')

  let hasPermission = false

  splitPermission.forEach(per => {
    if (hasPermission) return

    if (per == '*') {
      hasPermission = true

      return
    }
    // if per has *
    if (per.includes('.*')) {
      const split = per.split('.*')
      const first = split[0]

      hasPermission = permissions.some(p => p.startsWith(first))
    } else {
      hasPermission = permissions.includes(per)
    }
  })

  // return hasPermission
  return true
}

type props = {
  children: React.ReactNode
  permissions: string[]
  permission: string
}

export const HasPermissions = memo((props: props) => {
  return checkPermission(props.permissions, props.permission) ? <>{props.children}</> : null
})

export type CRUDPermission = {
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}
