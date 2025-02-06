// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports

// ** Types Imports
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { roleService } from 'src/services/role'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'
import {
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuItemProps,
  MenuList
} from '@mui/material'
import { UserRolePermissionType } from 'src/types/apps/userPermissionType'
import { styled } from '@mui/material/styles'
import { Icon } from '@iconify/react'
import { toUpperFirst } from 'src/utils/stringUtils'
import { useTranslation } from 'react-i18next'
import { rbacService } from 'src/services/rbac'
import { RoleModuleGroup } from 'src/types/apps/rbac'

const parentModuleCantAccessForDefaultRole = ['User']

const MenuItemStyled = styled(MenuItem)<MenuItemProps>(() => ({
  '&.Mui-selected': {
    backgroundColor: 'rgb(115 103 240 / 50%)!important'
  }
}))

interface FormRoleType {
  open: boolean
  toggle: () => void
  selectedData: string | null
  setSelectedData: (value: string | null) => void
}

interface UserData {
  name: string
  description: string
  is_active: 'Active' | 'Inactive'
}

interface PermissionRelation {
  type: 'parent_module' | 'module' | 'permission'
  indeterminate: boolean
  id: number
  is_group?: boolean
  name: string
  parent_id: number | null
  defaultValue: boolean
  value: boolean
  role_per_id?: number | null
  child: PermissionRelation[]
}

const showErrors = (field: string, valueLen: number, min: number) => {
  if (valueLen === 0) {
    return `${field} field is required`
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} must be at least ${min} characters`
  } else {
    return ''
  }
}

const schema = yup.object().shape({
  name: yup
    .string()
    .min(3, obj => showErrors('Name', obj.value.length, obj.min))
    .required(),
  description: yup.string(),
  is_active: yup.string().oneOf(['Active', 'Inactive']),
  parent_permissions: yup.array(yup.boolean()),
  permissions: yup.array(yup.boolean())
})

const defaultValues: {
  name: string
  description: string
  is_active: 'Active' | 'Inactive'
} = {
  name: '',
  description: '',
  is_active: 'Active'
}

const moduleSort = [
  'Dashboard',
  'List Order',
  'Order',
  'Product',

  // Stock
  'Stock',
  'Stock|Data Stock',
  'Stock|History Stock',
  'Stock|Transfer Stock',
  'Stock|Stock Opname',
  'Stock|Adjustment Stock',

  // Customer
  'Customer',
  'Customer|Customer',
  'Customer|Membership',

  // Purchase
  'Purchase',
  'Purchase|Purchase',
  'Purchase|Purchase Return',

  // Invoice / Sales
  'Invoice',
  'Invoice|Invoice',
  'Invoice|Invoice Return',
  'Invoice|Recap',

  'Commission',
  'Cost',

  'Reports',

  // Master Data
  'Master Data',
  'Master Data|Category',
  'Master Data|Brand',
  'Master Data|Unit',
  'Master Data|Supplier',

  // Online Store
  'Online Store',
  'Online Store|General',
  'Online Store|CMS',
  'Online Store|Features',
  'Online Store|Banner',
  'Online Store|Shortcut',
  'Online Store|Update',
  'Online Store|Login Setting',

  // POS
  'Point of Sales',
  'Point of Sales|Outlet',
  'Point of Sales|Table Management',
  'Point of Sales|Cashier',
  'Point of Sales|Shift',
  'Point of Sales|Device',

  // User
  'User',
  'User|User List',
  'User|Role',
  'User|Department',

  // Setting
  'Setting',
  'Setting|Product',
  'Setting|Order',
  'Setting|Shipping',
  'Setting|Payment'
]

const FromUserRoleGroupDialog = (props: FormRoleType) => {
  const { t } = useTranslation()
  // ** Props
  const { open, toggle } = props

  const [expandedGroup, setExpandedGroup] = useState<number[]>([])

  const handleModuleClick = (permission: PermissionRelation, permission2: PermissionRelation) => {
    setShowModule(permission)
    setShowPermissions(permission2)
    setPermissionSelect(permission2)
  }

  const toggleGroup = (permission: PermissionRelation) => {
    if (permission.is_group) {
      const groupId = permission.id
      if (groupId) {
        if (expandedGroup.includes(groupId)) {
          setExpandedGroup(expandedGroup.filter(id => id !== groupId))
        } else {
          setExpandedGroup([...expandedGroup, groupId])
        }
      }
    } else {
      handleModuleClick(permission, permission.child[0])
    }
  }

  const isGroupExpanded = (groupId: number) => expandedGroup.includes(groupId)
  const [parentPermissionSelect, setParentPermissionSelect] = useState<number[]>([])

  const setPermissionSelect = (relantion: PermissionRelation) => {
    setParentPermissionSelect([relantion.parent_id!, relantion.id])
  }

  const isModuleParentSelected = (permissionId: number) =>
    parentPermissionSelect.length == 2 && parentPermissionSelect[0] == permissionId

  const isModuleSelected = (permissionId: number) =>
    parentPermissionSelect.length == 2 && parentPermissionSelect[1] == permissionId

  const [showModule, setShowModule] = useState<PermissionRelation | undefined>(undefined)
  const [showPermissions, setShowPermissions] = useState<PermissionRelation | undefined>(undefined)
  const [rolePermissions, setRolePermissions] = useState<UserRolePermissionType[]>([])
  const [parentPermissionsRelation, setParentPermissionRelation] = useState<PermissionRelation[]>(
    []
  )

  // ** Hooks
  const queryClient = useQueryClient()

  const [parentModule, setParentModule] = useState<RoleModuleGroup[]>([])

  useQuery('profile-permission', {
    queryFn: rbacService.getListModuleGroup,
    onSuccess: data => {
      const datas = data.data.data.grouped_module
      const datasWithIndex = datas.map((item, index) => ({
        ...item,
        id: index + 1,
        is_group: true
      }))

      const ungroupedModule = data.data.data.ungrouped_module

      const datasWithIndexLength = datas.length

      const aa: RoleModuleGroup[] = ungroupedModule.map((item, index) => ({
        id: datasWithIndexLength + index + 1,
        is_group: false,
        group: item.module.name,
        list_module: [
          {
            module: item.module,
            permissions: item.permissions
          }
        ]
      }))
      datasWithIndex.push(...aa)

      setParentModule(datasWithIndex)
    }
  })

  useQuery(['role-permission-list', props.selectedData], {
    queryFn: () => rbacService.getListRolePermission(parseInt(props.selectedData ?? '0')),
    onSuccess: data => {
      setRolePermissions(data.data.data)
    }
  })

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(schema)
  })

  const { mutate, isLoading } = useMutation(roleService.postRole, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      const add_permission_ids: number[] = []
      const delete_permission_ids: number[] = []

      parentPermissionsRelation.map(pa => {
        // if (pa.defaultValue != pa.value)
        //   if (pa.value) add_permission_ids.push(pa.id)
        //   else if (pa.role_per_id) delete_permission_ids.push(pa.role_per_id)

        pa.child.map(ch => {
          // if (ch.defaultValue != ch.value)
          //   if (ch.value) add_permission_ids.push(ch.id)
          //   else if (ch.role_per_id) delete_permission_ids.push(ch.role_per_id)

          ch.child.map(ch2 => {
            if (ch2.defaultValue != ch2.value)
              if (ch2.value) add_permission_ids.push(ch2.id)
              else if (ch2.role_per_id) delete_permission_ids.push(ch2.role_per_id)
          })
        })
      })

      const role_id = (data as unknown as { data: { data: { id: number } } }).data.data.id

      if (add_permission_ids.length > 0)
        add_permission_ids.map(item =>
          addPermission.mutate({
            role_id: role_id,
            permission_id: item
          })
        )

      if (delete_permission_ids.length > 0) deleteBatchPermission.mutate(delete_permission_ids)

      toggle()
      reset()
      queryClient.invalidateQueries('role-list')
    }
  })

  const [isDefault, setIsDefault] = useState(false)

  useQuery({
    queryFn: () => roleService.getRole(props.selectedData ?? '0'),
    enabled: props.selectedData !== null,
    onSuccess: (data: any) => {
      const resp = data.data.data
      setValue('name', resp.name)
      setValue('description', resp.description)
      setValue('is_active', resp.is_active ?? 'Inactive')
      setIsDefault(resp.is_default)
    },
    cacheTime: 0
  })

  const addPermission = useMutation(roleService.postRolePermission, {})

  const deleteBatchPermission = useMutation(roleService.deleteBatchRolePermission, {})

  const patchUser = useMutation(roleService.patchRole, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      const add_permission_ids: number[] = []
      const delete_permission_ids: number[] = []

      parentPermissionsRelation.map(pa => {
        // if (pa.defaultValue != pa.value)
        //   if (pa.value) add_permission_ids.push(pa.id)
        //   else if (pa.role_per_id) delete_permission_ids.push(pa.role_per_id)

        pa.child.map(ch => {
          // if (ch.defaultValue != ch.value)
          //   if (ch.value) add_permission_ids.push(ch.id)
          //   else if (ch.role_per_id) delete_permission_ids.push(ch.role_per_id)

          ch.child.map(ch2 => {
            if (ch2.defaultValue != ch2.value)
              if (ch2.value) add_permission_ids.push(ch2.id)
              else if (ch2.role_per_id) delete_permission_ids.push(ch2.role_per_id)
          })
        })
      })

      const role_id = (data as unknown as { data: { data: { id: number } } }).data.data.id

      if (add_permission_ids.length > 0)
        add_permission_ids.map(item =>
          addPermission.mutate({
            role_id: role_id,
            permission_id: item
          })
        )

      if (delete_permission_ids.length > 0) deleteBatchPermission.mutate(delete_permission_ids)

      toggle()
      reset()
      queryClient.invalidateQueries('role-list')
    }
  })

  const onSubmit = (data: UserData) => {
    const request = {
      name: data.name,
      description: data.description,
      is_active: data.is_active
    }
    if (props.selectedData !== null) {
      patchUser.mutate({ id: props.selectedData, request })
    } else {
      mutate(request)
    }
  }

  const resetCheck = () => {
    const _parentPermissionsRelation = [...parentPermissionsRelation]
    _parentPermissionsRelation.map(parent => {
      parent.value = false
      parent.indeterminate = false
      parent.child.map(ch => {
        ch.value = false
        ch.child.map(ch2 => (ch2.value = false))
      })
    })

    setParentPermissionRelation(_parentPermissionsRelation)
  }

  useEffect(() => {
    resetCheck()
    setShowPermissions(undefined)
    setShowModule(undefined)
    setParentPermissionSelect([])
    setExpandedGroup([])

    if (open) {
      setIsDefault(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, props.selectedData])

  const handleClose = () => {
    setValue('name', '')
    setValue('description', '')
    setValue('is_active', 'Active')
    props.setSelectedData(null)
    toggle()
    reset()
  }

  useEffect(() => {
    const _relationPermissions: PermissionRelation[] = []
    if (parentModule.length > 0) {
      let parentModuleAfterSort = parentModule
        .filter(item => moduleSort.includes(item.group))
        .sort((a, b) => {
          return moduleSort.indexOf(a.group) - moduleSort.indexOf(b.group)
        })

      parentModuleAfterSort = [
        ...parentModuleAfterSort,
        ...parentModule.filter(item => !moduleSort.includes(item.group))
      ]

      parentModuleAfterSort.map((parent, index) => {
        _relationPermissions[index] = {
          type: 'parent_module',
          id: parent.id,
          is_group: parent.is_group,
          name: toUpperFirst(parent.group),
          value: false,
          defaultValue: false,
          parent_id: null,
          indeterminate: false,
          child: []
        }

        const prefixModule = parent.group
        let parentPermissionsAfterSort = parent.list_module
          .filter(item => moduleSort.includes(prefixModule + '|' + item.module.name))
          .sort((a, b) => {
            return (
              moduleSort.indexOf(prefixModule + '|' + a.module.name) -
              moduleSort.indexOf(prefixModule + '|' + b.module.name)
            )
          })

        parentPermissionsAfterSort = [
          ...parentPermissionsAfterSort,
          ...parent.list_module.filter(
            item => !moduleSort.includes(prefixModule + '|' + item.module.name)
          )
        ]

        parentPermissionsAfterSort.map((module, index2) => {
          _relationPermissions[index].child.push({
            type: 'module',
            id: module.module.id,
            name: toUpperFirst(module.module.name),
            value: false,
            defaultValue: false,
            parent_id: parent.id,
            indeterminate: false,
            child: []
          })

          let modulePermissionsAfterSort = module.permissions
            .filter(item => moduleSort.includes(item.name))
            .sort((a, b) => {
              return moduleSort.indexOf(a.name) - moduleSort.indexOf(b.name)
            })

          modulePermissionsAfterSort = [
            ...modulePermissionsAfterSort,
            ...module.permissions.filter(item => !moduleSort.includes(item.name))
          ]

          modulePermissionsAfterSort.map(permission => {
            const rolePer3 = rolePermissions.find(per => per.permission_id == permission.id)
            const checked3 = rolePer3 != null

            _relationPermissions[index].child[index2].child.push({
              type: 'permission',
              id: permission.id,
              name: permission.name,
              child: [],
              indeterminate: false,
              parent_id: module.module.id,
              value: checked3,
              defaultValue: checked3,
              role_per_id: rolePer3?.id
            })
          })

          const childModule = _relationPermissions[index].child[index2].child
          const countCheckPermission = childModule.filter(item => item.defaultValue).length
          _relationPermissions[index].child[index2].indeterminate =
            countCheckPermission > 0 && countCheckPermission < childModule.length
          _relationPermissions[index].child[index2].value =
            countCheckPermission == childModule.length
          _relationPermissions[index].child[index2].defaultValue =
            countCheckPermission == childModule.length
        })

        const childGroupModule = _relationPermissions[index].child
        const countCheckModule = childGroupModule.filter(item => item.defaultValue).length
        const hasIndeterminate = childGroupModule.filter(item => item.indeterminate).length > 0
        _relationPermissions[index].indeterminate =
          countCheckModule > 0 && countCheckModule < childGroupModule.length
            ? true
            : hasIndeterminate

        _relationPermissions[index].value = countCheckModule == childGroupModule.length
        _relationPermissions[index].defaultValue = countCheckModule == childGroupModule.length
      })
    }

    setParentPermissionRelation(
      _relationPermissions.filter(
        item =>
          !isDefault || (isDefault && !parentModuleCantAccessForDefaultRole.includes(item.name))
      )
    )
  }, [parentModule, rolePermissions, isDefault])

  return (
    <Dialog
      maxWidth='md'
      title={(props.selectedData !== null ? t('Edit') : t('Add')) + ' ' + t('Role')}
      open={open}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Controller
              name='name'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  sx={{ mb: 4 }}
                  label={t('Role')}
                  placeholder='Cashier'
                  error={Boolean(errors.name)}
                  {...(errors.name && { helperText: errors.name.message })}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name='description'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  sx={{ mb: 4 }}
                  label={t('Description')}
                  placeholder='This role has full cashier privileges.'
                  error={Boolean(errors.description)}
                  {...(errors.description && { helperText: errors.description.message })}
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box
              border={1}
              borderRadius={1}
              sx={theme => ({
                borderColor: theme.palette.divider
              })}
              paddingX={2}
              height={'100%'}
            >
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      indeterminate={
                        parentPermissionsRelation.filter(item => item.value || item.indeterminate)
                          .length > 0 &&
                        parentPermissionsRelation.filter(item => item.value || item.indeterminate)
                          .length < parentPermissionsRelation.length
                      }
                      checked={
                        parentPermissionsRelation.filter(item => item.value == true).length ==
                        parentPermissionsRelation.length
                      }
                      onChange={e => {
                        const _parentPermissionsRelation = [...parentPermissionsRelation]
                        _parentPermissionsRelation.map(parent => {
                          parent.value = e.target.checked
                          parent.indeterminate = false
                          parent.child.map(ch => {
                            ch.value = e.target.checked
                            ch.indeterminate = false
                            ch.child.map(ch2 => (ch2.value = e.target.checked))
                          })
                        })

                        setParentPermissionRelation(_parentPermissionsRelation)
                      }}
                    />
                  }
                  label={t('All Module')}
                />
                <Divider />
                <MenuList
                  sx={{
                    height: '300px',
                    overflowX: 'hidden'
                  }}
                >
                  {parentPermissionsRelation.map((permission, index) => (
                    <div key={index}>
                      <MenuItemStyled
                        sx={{
                          marginX: '-6px',
                          padding: 0,
                          '& .Mui-selected': {
                            background: 'pink'
                          }
                        }}
                        selected={isModuleParentSelected(permission.id)}
                      >
                        <ListItemIcon>
                          <Checkbox
                            sx={{
                              padding: 0,
                              marginLeft: '4px'
                            }}
                            indeterminate={permission.indeterminate}
                            checked={permission.value}
                            onChange={e => {
                              const _parentPermissionsRelation = [...parentPermissionsRelation]
                              _parentPermissionsRelation[index].value = e.target.checked
                              if (!e.target.checked) {
                                _parentPermissionsRelation[index].indeterminate = false
                              } else {
                                _parentPermissionsRelation[index].indeterminate = false
                              }

                              _parentPermissionsRelation[index].child.map(ch => {
                                ch.value = e.target.checked
                                ch.indeterminate = false
                                ch.child.map(ch2 => (ch2.value = e.target.checked))
                              })
                              setParentPermissionRelation(_parentPermissionsRelation)
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          sx={{
                            paddingY: '0.2rem'
                          }}
                          onClick={() => {
                            toggleGroup(permission)
                          }}
                        >
                          {t(permission.name)}
                        </ListItemText>
                        <ListItemIcon
                          onClick={() => {
                            toggleGroup(permission)
                          }}
                        >
                          {permission.is_group ? (
                            <>
                              {isGroupExpanded(permission.id) ? (
                                <Icon icon={'tabler:minus'} />
                              ) : (
                                <Icon icon={'tabler:plus'} />
                              )}
                            </>
                          ) : (
                            <Icon icon={'tabler:arrow-up-right'} />
                          )}
                        </ListItemIcon>
                      </MenuItemStyled>
                      {permission.is_group && (
                        <Collapse in={isGroupExpanded(permission.id)}>
                          {permission.child.map((permission2, index2) => (
                            <MenuItemStyled
                              key={permission2.id}
                              sx={{
                                marginX: '-6px',
                                padding: 0,
                                '& .Mui-selected': {
                                  background: 'pink'
                                }
                              }}
                              selected={isModuleSelected(permission2.id)}
                              onClick={() => {
                                handleModuleClick(permission, permission2)
                              }}
                            >
                              <ListItemIcon>
                                <Checkbox
                                  sx={{
                                    padding: 0,
                                    marginLeft: 8
                                  }}
                                  indeterminate={permission2.indeterminate}
                                  checked={permission2.value}
                                  onChange={e => {
                                    let checkCount1 = 0

                                    const _parentPermissionsRelation = [
                                      ...parentPermissionsRelation
                                    ]
                                    _parentPermissionsRelation[index].child[index2].value =
                                      e.target.checked

                                    if (!e.target.checked) {
                                      _parentPermissionsRelation[index].child[
                                        index2
                                      ].indeterminate = false
                                    } else {
                                      _parentPermissionsRelation[index].child[
                                        index2
                                      ].indeterminate = false
                                    }
                                    _parentPermissionsRelation[index].child[index2].child.map(
                                      ch => (ch.value = e.target.checked)
                                    )

                                    const parent1 = _parentPermissionsRelation[index]
                                    parent1.child
                                      .filter(item => item.value && item.id != permission2.id)
                                      .map(() => {
                                        checkCount1++
                                      })

                                    if (!e.target.checked) {
                                      parent1.value = false
                                    } else {
                                      checkCount1++

                                      parent1.value = checkCount1 == parent1.child.length
                                    }
                                    parent1.indeterminate = checkCount1 > 0 && !parent1.value

                                    setParentPermissionRelation(_parentPermissionsRelation)
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                sx={{
                                  paddingY: '0.2rem'
                                }}
                              >
                                {t(permission2.name)}
                              </ListItemText>
                              <ListItemIcon>
                                <Icon icon={'tabler:arrow-up-right'} />
                              </ListItemIcon>
                            </MenuItemStyled>
                          ))}
                        </Collapse>
                      )}
                    </div>
                  ))}
                </MenuList>
              </FormGroup>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              border={1}
              borderRadius={1}
              sx={theme => ({
                borderColor: theme.palette.divider
              })}
            >
              <Box
                sx={{
                  overflowX: 'hidden'
                }}
                padding={2}
                height={'354px'}
              >
                {showPermissions?.child.map(permission3 => (
                  <FormControlLabel
                    sx={{
                      display: 'block',
                      paddingY: '0.2rem'
                    }}
                    key={permission3.id}
                    control={
                      <Checkbox
                        sx={{
                          paddingY: 0
                        }}
                        checked={permission3.value}
                        onChange={e => {
                          let checkCount1 = 0
                          let checkCount2 = 0

                          const _parentPermissionsRelation = [...parentPermissionsRelation]

                          const parent1 = showModule!
                          const parent2 = showPermissions

                          const child = parent2.child.find(item => item.id == permission3.id)

                          parent1.child
                            .filter(item => item.value && item.id != parent2.id)
                            .map(() => {
                              checkCount1++
                            })

                          parent2.child
                            .filter(item => item.value && item.id != permission3.id)
                            .map(() => {
                              checkCount2++
                            })

                          if (child) child.value = e.target.checked

                          if (!e.target.checked) {
                            parent2.value = false
                          } else {
                            checkCount2++
                            parent2.value = checkCount2 == parent2.child.length
                          }

                          if (!parent2.value) {
                            parent1.value = false
                          } else {
                            checkCount1++

                            parent1.value = checkCount1 == parent1.child.length
                          }

                          parent2.indeterminate = checkCount2 > 0 && !parent2.value
                          parent1.indeterminate = checkCount2 > 0 && !parent1.value

                          setParentPermissionRelation(_parentPermissionsRelation)
                        }}
                      />
                    }
                    label={t(permission3.name)}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose} sx={{ mr: 3 }}>
            {t('Cancel')}
          </Button>
          <Button type='submit' variant='contained' disabled={isLoading}>
            {t('Save')}
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default FromUserRoleGroupDialog
