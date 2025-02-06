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
import { ModuleDetailType } from 'src/types/apps/rbac'
import { rbacService } from 'src/services/rbac'

const moduleCantAccessForDefaultRole = ['User List', 'Department', 'Role']

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
}

interface PermissionRelation {
  type: 'module' | 'permission'
  indeterminate: boolean
  id: number
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
  description: yup
    .string()
    .min(3, obj => showErrors('Description', obj.value.length, obj.min))
    .required(),
  parent_permissions: yup.array(yup.boolean()),
  permissions: yup.array(yup.boolean())
})

const defaultValues: {
  name: string
  description: string
} = {
  name: '',
  description: ''
}

const moduleSort = [
  'Dashboard',
  'Order',
  'Product',
  // Stock
  'Data Stock',
  'History Stock',
  'Transfer Stock',
  'Stock Opname',
  'Adjustment Stock',
  // Customer
  'Customer',
  'Membership',
  // Purchase
  'Purchase',
  'Purchase Return',
  // Invoice / Sales
  'Invoice',
  'Invoice Return',
  'Recap',
  // Master Data
  'Category',
  'Brand',
  'Unit',
  'Supplier',
  // Online Store
  'General',
  'CMS',
  'Features',
  'Banner',
  'Shortcut',
  'Update',
  'Login Setting',
  // POS
  'Outlet',
  'Table Management',
  'Cashier',
  'Shift',
  'Device',
  // User
  'User List',
  'Role',
  'Department'
]

const UserRoleDevDialog = (props: FormRoleType) => {
  const { t } = useTranslation()
  // ** Props
  const { open, toggle } = props

  const [parentPermissionSelect, setParentPermissionSelect] = useState<number | null>(null)
  const [rolePermissions, setRolePermissions] = useState<UserRolePermissionType[]>([])
  const [modulePermissionsRelation, setModulePermissionRelation] = useState<PermissionRelation[]>(
    []
  )

  // ** Hooks
  const queryClient = useQueryClient()

  const [ModuleData, setModuleData] = useState<ModuleDetailType[]>([])

  useQuery('profile-permission', {
    queryFn: rbacService.getListModuleDetail,
    onSuccess: data => {
      setModuleData(data.data.data)

      // setPermissionData(data.data.data)
    },
    cacheTime: 0
  })

  useQuery(['role-permission-list', props.selectedData], {
    queryFn: () => rbacService.getListRolePermission(parseInt(props.selectedData ?? '0')),
    enabled: props.selectedData !== null,
    onSuccess: data => {
      setRolePermissions(data.data.data ?? [])
    },
    cacheTime: 0
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
      // const delete_permission_ids: number[] = []

      modulePermissionsRelation.map(pa => {
        pa.child.map(ch => {
          if (ch.defaultValue != ch.value) if (ch.value) add_permission_ids.push(ch.id)
          // else if (ch.role_per_id) delete_permission_ids.push(ch.role_per_id)
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

      // if (delete_permission_ids.length > 0) deleteBatchPermission.mutate(delete_permission_ids)

      // toggle()
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

      modulePermissionsRelation.map(pa => {
        pa.child.map(ch => {
          if (ch.defaultValue != ch.value)
            if (ch.value) add_permission_ids.push(ch.id)
            else if (ch.role_per_id) delete_permission_ids.push(ch.role_per_id)
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
      description: data.description
    }

    if (props.selectedData !== null) {
      patchUser.mutate({ id: props.selectedData, request })
    } else {
      mutate(request)
    }
  }

  const resetCheck = () => {
    const _parentPermissionsRelation = [...modulePermissionsRelation]
    _parentPermissionsRelation.map(parent => {
      parent.value = false
      parent.indeterminate = false
      parent.child.map(ch => {
        ch.value = false
        ch.child.map(ch2 => (ch2.value = false))
      })
    })

    setModulePermissionRelation(_parentPermissionsRelation)
  }

  useEffect(() => {
    resetCheck()
    if (open) {
      setIsDefault(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleClose = () => {
    setValue('name', '')
    setValue('description', '')
    props.setSelectedData(null)
    toggle()
    reset()
  }

  useEffect(() => {
    const _relationPermissions: PermissionRelation[] = []
    if (ModuleData.length > 0) {
      let moduleAfterSort = ModuleData.filter(item => moduleSort.includes(item.module.name)).sort(
        (a, b) => {
          return moduleSort.indexOf(a.module.name) - moduleSort.indexOf(b.module.name)
        }
      )

      moduleAfterSort = [
        ...moduleAfterSort,
        ...ModuleData.filter(item => !moduleSort.includes(item.module.name))
      ]

      moduleAfterSort.map((parent, index) => {
        _relationPermissions[index] = {
          type: 'module',
          id: parent.module.id,
          name: toUpperFirst(parent.module.name),
          value: false,
          defaultValue: false,
          parent_id: null,
          indeterminate: false,
          child: []
        }

        parent.permissions.map(permission => {
          const rolePer3 = rolePermissions.find(per => per.permission_id == permission.id)
          const checked3 = rolePer3 != null

          _relationPermissions[index].child.push({
            type: 'permission',
            id: permission.id,
            name: toUpperFirst(permission.name),
            value: checked3,
            defaultValue: checked3,
            parent_id: permission.module_id,
            indeterminate: false,
            role_per_id: rolePer3?.id ?? null,
            child: []
          })
        })

        const childGroupModule = _relationPermissions[index].child
        const countCheckModule = childGroupModule.filter(item => item.defaultValue).length
        _relationPermissions[index].indeterminate =
          countCheckModule > 0 && countCheckModule < childGroupModule.length ? true : false

        _relationPermissions[index].value = countCheckModule == childGroupModule.length
        _relationPermissions[index].defaultValue = countCheckModule == childGroupModule.length
      })
    }

    setModulePermissionRelation(
      _relationPermissions.filter(
        module => !isDefault || (isDefault && !moduleCantAccessForDefaultRole.includes(module.name))
      )
    )
  }, [ModuleData, isDefault, rolePermissions])

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
        <div>
          <Grid container spacing={2} columns={16}>
            <Grid item xs={8}>
              <Box
                border={1}
                borderRadius={1}
                sx={theme => ({
                  borderColor: theme.palette.divider
                })}
                paddingX={2}
              >
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          modulePermissionsRelation.filter(item => item.value == true).length ==
                          modulePermissionsRelation.length
                        }
                        onChange={e => {
                          const _parentPermissionsRelation = [...modulePermissionsRelation]
                          _parentPermissionsRelation.map(parent => {
                            parent.value = e.target.checked
                            parent.indeterminate = false
                            parent.child.map(ch => {
                              ch.value = e.target.checked
                              ch.child.map(ch2 => (ch2.value = e.target.checked))
                            })
                          })

                          setModulePermissionRelation(_parentPermissionsRelation)
                        }}
                      />
                    }
                    label='All Module'
                  />
                  <Divider />
                  <MenuList
                    sx={{
                      height: '300px',
                      overflowX: 'hidden'
                    }}
                  >
                    {modulePermissionsRelation.map((module, index) => (
                      <MenuItemStyled
                        key={index}
                        sx={{
                          marginX: '-6px',
                          padding: 0,
                          '& .Mui-selected': {
                            background: 'pink'
                          }
                        }}
                        selected={parentPermissionSelect == module.id}
                        onClick={() => {
                          setParentPermissionSelect(module.id)
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            sx={{
                              padding: 0,
                              marginLeft: '4px'
                            }}
                            indeterminate={module.indeterminate}
                            checked={module.value}
                            onChange={e => {
                              const _parentPermissionsRelation = [...modulePermissionsRelation]
                              _parentPermissionsRelation[index].value = e.target.checked
                              if (!e.target.checked) {
                                _parentPermissionsRelation[index].indeterminate = false
                              } else {
                                _parentPermissionsRelation[index].indeterminate = false
                              }

                              _parentPermissionsRelation[index].child.map(ch => {
                                ch.value = e.target.checked
                                ch.child.map(ch2 => (ch2.value = e.target.checked))
                              })
                              setModulePermissionRelation(_parentPermissionsRelation)
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          sx={{
                            paddingY: '0.5rem'
                          }}
                          // onClick={() => {
                          //   setParentPermissionSelect(permission.id)
                          // }}
                        >
                          {t(module.name)}
                        </ListItemText>
                        <ListItemIcon>
                          <Icon icon={'tabler:arrow-up-right'} />
                        </ListItemIcon>
                      </MenuItemStyled>
                    ))}
                  </MenuList>
                </FormGroup>
              </Box>
            </Grid>
            <Grid item xs={8}>
              <Box
                border={1}
                borderRadius={1}
                sx={theme => ({
                  borderColor: theme.palette.divider
                })}
                padding={2}
                height={'100%'}
              >
                {modulePermissionsRelation.map((permission, index) =>
                  permission.child.map((permission2, index2) => (
                    <Grid
                      container
                      key={permission2.id}
                      sx={{
                        display: permission.id != parentPermissionSelect ? 'none' : 'flex'
                      }}
                    >
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              indeterminate={permission2.indeterminate}
                              checked={permission2.value}
                              onChange={e => {
                                let checkCount1 = 0

                                const _parentPermissionsRelation = [...modulePermissionsRelation]
                                _parentPermissionsRelation[index].child[index2].value =
                                  e.target.checked

                                if (!e.target.checked) {
                                  _parentPermissionsRelation[index].child[index2].indeterminate =
                                    false
                                } else {
                                  _parentPermissionsRelation[index].child[index2].indeterminate =
                                    false
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

                                setModulePermissionRelation(_parentPermissionsRelation)
                              }}
                            />
                          }
                          label={t('PERMISSION_' + permission2.name)}
                          sx={{
                            marginRight: 4,
                            '& .MuiCheckbox-root': { paddingY: 0.4 }
                          }}
                        />
                      </Grid>
                    </Grid>
                  ))
                )}
              </Box>
            </Grid>
          </Grid>
        </div>
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

export default UserRoleDevDialog
