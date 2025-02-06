export interface moduleType {
  id: number
  name: string
  description: string
  show_on_web: boolean
  created_at: Date
  created_by: null
  updated_at: Date
  updated_by: null
}

export interface PermissionType {
  id: number
  module_id: number
  name: string
  created_at: Date
  created_by: null
  updated_at: Date
  updated_by: null
}

export interface ModuleDetailType {
  module: moduleType
  permissions: PermissionType[]
}

export interface RolePermissionData {
  role_id: number
  permission_id: number
}

export interface RolePermissionType extends RolePermissionData {
  id: number
  created_at: Date
  created_by: null
  updated_at: Date
  updated_by: null
}

export interface RoleModuleGroupResponse {
  grouped_module: RoleModuleGroup[]
  ungrouped_module: ListModule[]
}

export interface RoleModuleGroup {
  id: number
  group: string
  is_group: boolean
  list_module: ListModule[]
}

export interface ListModule {
  module: Module
  permissions: Permission[]
}

export interface Module {
  id: number
  name: string
  slug: string
  description: string
  created_at: Date
  created_by: null
  updated_at: Date
  updated_by: null
  show_on_pos: boolean
  show_on_web: boolean
  sort_position: number
}

export interface Permission {
  id: number
  module_id: number
  name: string
  created_at: Date
  created_by: null
  updated_at: Date
  updated_by: null
  sort_position: number
}
