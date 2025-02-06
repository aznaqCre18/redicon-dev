// ** Types
export type UserPermissionType = {
  id: number
  vendor_id: number
  parent_id: number | null
  name: string
}

export type UserRolePermissionType = {
  id: number
  role_id: number
  permission_id: number
}
