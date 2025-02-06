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
import { profileService } from 'src/services/profile'
import { ProfilPermissionType } from 'src/types/apps/profileType'
import { toUpperFirst } from 'src/utils/stringUtils'
import { useTranslation } from 'react-i18next'

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
  type: 'parent_module' | 'module' | 'permission'
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

// const modules: string[] = [
//   'Dashboard',
//   'Order',
//   'Product',
//   'Stock',
//   'Customer',
//   '3rd Party add on',
//   'Integration',
//   'Setting'
// ]

// const permissions = ['Product', 'Category', 'Brand', 'Unit']

const UserRoleDialog = (props: FormRoleType) => {
  const { t } = useTranslation()
  // ** Props
  const { open, toggle } = props

  const [parentPermissionSelect, setParentPermissionSelect] = useState<number | null>(null)
  const [rolePermissions, setRolePermissions] = useState<UserRolePermissionType[]>([])
  const [parentPermissionsRelation, setParentPermissionRelation] = useState<PermissionRelation[]>(
    []
  )

  // ** Hooks
  const queryClient = useQueryClient()

  const [permissionData, setPermissionData] = useState<ProfilPermissionType[]>([])

  useQuery('profile-permission', {
    queryFn: profileService.getProfilePermission,
    onSuccess: data => {
      setPermissionData(data.data.data)
    }
  })

  useQuery(['role-permission-list', props.selectedData], {
    queryFn: () => roleService.getListRolePermission(parseInt(props.selectedData ?? '0')),
    onSuccess: data => {
      setRolePermissions(data.data.data ?? [])
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

  const getUserRole = useMutation(roleService.getRole, {
    onSuccess: (data: any) => {
      const resp = data.data.data
      setValue('name', resp.name)
      setValue('description', resp.description)
    }
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
      description: data.description
    }
    if (props.selectedData !== null) {
      patchUser.mutate({ id: props.selectedData, request })
    } else {
      mutate(request)
    }
  }

  useEffect(() => {
    if (props.selectedData && open) {
      getUserRole.mutate(props.selectedData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedData, open])

  const handleClose = () => {
    setValue('name', '')
    setValue('description', '')
    props.setSelectedData(null)
    toggle()
    reset()
  }

  useEffect(() => {
    const _relationPermissions: PermissionRelation[] = []
    if (permissionData.length > 0) {
      permissionData.map((parent, index) => {
        let countCheckedPermission2 = 0
        _relationPermissions[index] = {
          type: 'parent_module',
          id: parent.id,
          name: toUpperFirst(parent.name),
          value: false,
          defaultValue: false,
          parent_id: null,
          indeterminate: false,
          child: []
        }

        parent.modules.map((module, index2) => {
          _relationPermissions[index].child.push({
            type: 'module',
            id: module.id,
            name: toUpperFirst(module.name),
            value: false,
            defaultValue: false,
            parent_id: module.parent_id,
            indeterminate: false,
            child: []
          })
          module.permissions.map(permission => {
            const rolePer3 = rolePermissions.find(per => per.permission_id == permission.id)
            const checked3 = rolePer3 != null
            countCheckedPermission2 += checked3 ? 1 : 0

            _relationPermissions[index].child[index2].child.push({
              type: 'permission',
              id: permission.id,
              name: permission.name,
              child: [],
              indeterminate: false,
              parent_id: module.id,
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

          // _relationPermissions[index].indeterminate = countCheckPermission > 0
        })

        const childGroupModule = _relationPermissions[index].child
        const countCheckModule = childGroupModule.filter(item => item.defaultValue).length
        _relationPermissions[index].indeterminate =
          countCheckModule > 0 && countCheckModule < childGroupModule.length
            ? true
            : countCheckedPermission2 > 0

        _relationPermissions[index].value = countCheckModule == childGroupModule.length
        _relationPermissions[index].defaultValue = countCheckModule == childGroupModule.length
      })
    }

    setParentPermissionRelation(_relationPermissions)
  }, [permissionData, rolePermissions])

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
          <Grid item xs={4}>
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
                            ch.child.map(ch2 => (ch2.value = e.target.checked))
                          })
                        })

                        setParentPermissionRelation(_parentPermissionsRelation)
                      }}
                    />
                  }
                  label='All Module'
                />
                <Divider />
                <MenuList>
                  {parentPermissionsRelation.map((permission, index) => (
                    <MenuItemStyled
                      key={index}
                      sx={{
                        marginX: '-6px',
                        padding: 0,
                        '& .Mui-selected': {
                          background: 'pink'
                        }
                      }}
                      selected={parentPermissionSelect == permission.id}
                      onClick={() => {
                        setParentPermissionSelect(permission.id)
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          sx={{
                            padding: 0,
                            marginLeft: '4px'
                          }}
                          indeterminate={
                            permission.indeterminate
                            // getValues().permissions.filter(per => per == true).length > 0 &&
                            // getValues().permissions.filter(per => per == true).length !=
                            //   getValues().permissions.length
                          }
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
                              ch.child.map(ch2 => (ch2.value = e.target.checked))
                            })
                            setParentPermissionRelation(_parentPermissionsRelation)
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
                        {permission.name}
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
              paddingX={2}
              height={'100%'}
            >
              {parentPermissionsRelation.map((permission, index) =>
                permission.child.map((permission2, index2) => (
                  <Grid
                    container
                    key={permission2.id}
                    sx={{
                      display: permission.id != parentPermissionSelect ? 'none' : 'flex'
                    }}
                  >
                    <Grid item xs={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            indeterminate={permission2.indeterminate}
                            checked={permission2.value}
                            onChange={e => {
                              let checkCount1 = 0

                              const _parentPermissionsRelation = [...parentPermissionsRelation]
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

                              setParentPermissionRelation(_parentPermissionsRelation)
                            }}
                          />
                        }
                        label={permission2.name}
                        sx={{ marginRight: 4 }}
                      />
                    </Grid>
                    <Grid item xs={8}>
                      {permission2.child
                        .filter(item => item.parent_id == permission2.id)
                        .map((permission3, index3) => {
                          return (
                            <FormControlLabel
                              key={permission3.id}
                              control={
                                <Checkbox
                                  checked={permission3.value}
                                  onChange={e => {
                                    let checkCount1 = 0
                                    let checkCount2 = 0

                                    const _parentPermissionsRelation = [
                                      ...parentPermissionsRelation
                                    ]

                                    const parent1 = _parentPermissionsRelation[index]
                                    const parent2 = parent1.child[index2]

                                    const child = parent2.child[index3]

                                    parent1.child
                                      .filter(item => item.value && item.id != permission2.id)
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
                              label={permission3.name}
                            />
                          )
                        })}
                      <Divider />
                    </Grid>
                  </Grid>
                ))
              )}
            </Box>
          </Grid>
        </Grid>
        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose} sx={{ mr: 3 }}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' disabled={isLoading}>
            Save
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default UserRoleDialog
