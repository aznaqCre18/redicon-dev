// ** React Imports
import { ChangeEvent, useEffect, useState } from 'react'

import awsConfig from 'src/configs/aws'

// ** MUI Imports
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types Imports
import {
  Avatar,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  Tooltip,
  Typography
} from '@mui/material'
import { userService } from 'src/services/user'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { roleService } from 'src/services/role'
import { departmentService } from 'src/services/department'
import { ResponseType } from 'src/types/response/response'
import { toast } from 'react-hot-toast'
import { defaultPagination, maxLimitPagination } from 'src/types/pagination/pagination'
import { outletService } from 'src/services/outlet/outlet'
import SelectCustom from 'src/components/form/select/SelectCustom'
import Dialog from 'src/views/components/dialogs/Dialog'
import SelectChip from 'src/components/form/select/SelectChip'
import { pluck } from 'src/utils/arrayUtils'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { randomString } from 'src/utils/stringUtils'
import { useTranslation } from 'react-i18next'
import { vendorService } from 'src/services/vendor'
import { UserDetailType } from 'src/types/apps/userTypes'
import { useAuth } from 'src/hooks/useAuth'
import { useApp } from 'src/hooks/useApp'
import CustomTextField from 'src/components/form/CustomTextField'
import { formatPhone } from 'src/utils/numberUtils'
import { EmployeeType } from 'src/types/apps/employee'
import { employeeService } from 'src/services/employee'
import { customerService } from 'src/services/customer'
import { CustomerType } from 'src/types/apps/customerType'

interface AddUserType {
  open: boolean
  toggle: () => void
  selectedUser: string | null
  setSelectedUser: (value: string | null) => void
}

interface UserData {
  code: string
  name: string
  username: string
  email: string
  phone: string
  password: string
  password_confirmation?: string
  outlet_ids: number[]
  employee_id: number | null
  customer_id: number | null
  role_id: number
  department_id: number
  language_id: number
  is_supervisor: boolean
  pin?: number
}

const schema = yup
  .object()
  .shape({
    email: yup.string().email().required().label('Email'),
    phone: yup
      .string()
      // first character is 08 or +62
      .matches(/^(08|\+62)/, 'Phone number must start with 08 or +62')
      // .min(10)
      // .max(13)
      .test('len', 'Phone must be at 10 to 13 characters', val => {
        // delete 0 or +62
        const phone = val?.replace(/^(0|\+62)/, '')
        if (phone) {
          return phone.length >= 9 && phone.length <= 12
        }

        return true
      })
      .required()
      .label('Phone'),
    name: yup.string().min(3).required().label('Name'),
    username: yup.string().min(3).required().label('Username'),
    pin: yup.string().min(6).nullable().label('PIN'),
    role_id: yup.number().required().label('Role'),
    department_id: yup.number().required().label('Department'),
    language_id: yup.number().required().label('Languange'),
    outlet_ids: yup.array(yup.number()).required().label('Outlet').min(1, 'Outlet is required'),
    is_supervisor: yup.boolean().optional().label('Supervisor'),
    // password nullable or min 8
    password: yup
      .string()
      .test('len', 'Password must be at least 6 characters', val => {
        if (val) {
          return val.length >= 6
        }

        return true
      })
      .label('Password'),
    password_confirmation: yup
      .string()
      .nullable()
      .oneOf([yup.ref('password'), null], 'Passwords must match')
      .label('Password Confirmation')
  })
  .required()

const generatePin = () => Math.floor(Math.random() * (999999 - 100000)) + 100000

const defaultPassword = 'Admin123$'

const defaultValues = {
  code: '',
  email: '',
  name: '',
  password: defaultPassword,
  password_confirmation: defaultPassword,
  username: '',
  phone: '',
  language_id: 1,
  employee_id: null,
  customer_id: null,
  pin: 123456,
  is_supervisor: false
}

// const showPasswordValue = atom<boolean>(false)

const AddUserDialog = (props: AddUserType) => {
  const { errorInput } = useApp()
  const { user } = useAuth()

  const { t } = useTranslation()
  // ** Props
  const { open, toggle } = props
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const [isShowPin, setIsShowPin] = useState(false)

  const [imgSrc, setImgSrc] = useState('')
  const [files, setFiles] = useState<File | null>(null)
  const [inputFileValue, setInputFileValue] = useState('')

  // check email available
  const [msgErrEmail, setMsgErrEmail] = useState<string>('')
  const [isEmailAvailable, setIsEmailAvailable] = useState(true)
  const { mutate: checkEmailAvailable, isLoading: isLoadingCheckEmailAvailable } = useMutation(
    vendorService.checkEmailAvailable,
    {
      onSuccess: () => {
        setIsEmailAvailable(true)
      },
      onError: () => {
        setIsEmailAvailable(false)
        setMsgErrEmail('Email is already registered')
      }
    }
  )

  //  check phone available

  const [msgErrPhone, setMsgErrPhone] = useState<string>('')
  const [isPhoneAvailable, setIsPhoneAvailable] = useState(true)
  const { mutate: checkPhoneAvailable, isLoading: isLoadingCheckPhoneAvailable } = useMutation(
    vendorService.checkPhoneAvailable,
    {
      onSuccess: () => {
        setIsPhoneAvailable(true)
      },
      onError: () => {
        setIsPhoneAvailable(false)
        setMsgErrPhone('Phone number is already registered')
      }
    }
  )

  // ** Hooks
  const queryClient = useQueryClient()
  const {
    reset,
    control,
    setValue,
    handleSubmit,
    getValues,
    formState: { errors },
    watch
  } = useForm<UserData>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(schema)
  })

  const isSupervisor = watch('is_supervisor')

  const {
    data: roleData,
    refetch: refetchRole,
    isLoading: loadingRoleData
  } = useQuery('role-list', {
    queryFn: () => roleService.getListRole(defaultPagination),
    onSuccess: data => {
      if (data?.data.data && data.data.data.length == 1) {
        setValue('role_id', data.data.data[0].id)
      }
    }
  })
  const {
    data: departmentData,
    refetch: refetchDepartment,
    isLoading: loadingDepartementData
  } = useQuery('department-list', {
    queryFn: () => departmentService.getListDepartment(defaultPagination),
    onSuccess: data => {
      if (data?.data.data && data.data.data.length == 1) {
        setValue('department_id', data.data.data[0].id)
      }
    }
  })

  const channelData: any[] = []

  const storeData: any[] = []

  const [outletData, setOutletData] = useState<OutletType[]>([])
  const [employeeData, setEmployeeData] = useState<EmployeeType[]>([])
  const [customerData, setCustomerData] = useState<CustomerType[]>([])

  useQuery('user-outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      setOutletData(data.data.data ?? [])

      if (data?.data.data && data.data.data.length == 1) {
        setValue('outlet_ids', [data.data.data[0].id])
      }
    }
  })

  useQuery('user-employee-list', {
    queryFn: () => employeeService.getListActive(maxLimitPagination),
    onSuccess: data => {
      setEmployeeData(data.data.data ?? [])
    }
  })

  useQuery('user-customer-list', {
    queryFn: () => customerService.getListCustomerActive(maxLimitPagination),
    onSuccess: data => {
      setCustomerData(data.data.data ?? [])
    }
  })

  const resetForm = () => {
    setValue('email', '')
    setValue('name', '')
    setValue('password', '')
    setValue('username', '')
    setValue('phone', '')

    // setChannel('0')
    // setStore('0')
    props.setSelectedUser(null)

    reset()
  }

  const handleClose = () => {
    toggle()
    resetForm()
  }

  const { mutate: updateProfilePicture } = useMutation(userService.updateImage, {
    onSuccess: () => {
      queryClient.invalidateQueries('user-list')
    }
  })

  const { mutate, isLoading } = useMutation(userService.postUser, {
    onSuccess: (data: any) => {
      const resp = data.data.data
      const id = resp.id

      if (files) {
        updateProfilePicture({ id: id, file: files })
      }

      toast.success(t('Success!!! Your default password is') + ' ' + defaultPassword, {
        duration: 5000
      })
      queryClient.invalidateQueries('user-list')

      resetForm()
      // handleClose()
    }
  })

  const [oldUser, setOldUser] = useState<UserDetailType | null>(null)

  const getUser = useMutation(userService.getUser, {
    onSuccess: data => {
      const resp = data.data.data
      setValue('name', resp.user.name)
      setValue('username', resp.user.username)
      setValue('email', resp.user.email)
      setValue('phone', resp.user.phone)
      setValue('role_id', resp.user.role_id)
      setValue('department_id', resp.user.department_id)
      setValue('employee_id', resp.user.employee_id ?? null)
      setValue('customer_id', resp.user.customer_id ?? null)
      setValue('is_supervisor', resp.user.is_supervisor ?? false)

      setOldUser(resp)

      if (resp.user.profile_picture)
        setImgSrc(`${awsConfig.s3_bucket_url}/${resp.user.profile_picture}`)
    }
  })

  // update value form outlet
  useEffect(() => {
    if (getUser.data && outletData) {
      const userOutletOld = getUser.data.data.data.outlet ?? []

      const select = outletData.filter(
        item => userOutletOld.filter(_item => item.id == _item.outlet_id).length > 0
      )

      setValue('outlet_ids', pluck(select ?? [], 'id'))

      console.log('select', select)
      console.log('outletData', outletData)

      if (select.length == 0 && userOutletOld.length > 0) {
        setValue(
          'outlet_ids',
          userOutletOld.map(item => item.outlet_id)
        )
      } else if (select.length == 0 && userOutletOld.length == 0) {
        setValue('outlet_ids', [outletData[0].id])
      }
    }
  }, [getUser.data, outletData, setValue])

  const patchUser = useMutation(userService.patchUser, {
    onSuccess: (data: any) => {
      const resp = data.data.data
      const id = resp.id

      if (files) {
        updateProfilePicture({ id: id, file: files })
      }
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('user-list')
      handleClose()
    }
  })

  const onSubmit = (data: UserData) => {
    // replace data.phone first 0 to +62
    if (data.phone.charAt(0) === '0') {
      data.phone = '+62' + data.phone.substr(1)
    }

    let outlet_ids: number[] = []
    if (props.selectedUser && outletData && getUser.data) {
      const select = outletData.filter(
        item =>
          (getUser.data.data.data.outlet ?? []).filter(_item => item.id == _item.outlet_id).length >
          0
      )

      const old = pluck(select ?? [], 'id')
      const newOutlet = data.outlet_ids ?? []

      const addOutlet = newOutlet.filter(item => !old.includes(item))

      const removeOutlet = old.filter(item => !newOutlet.includes(item))

      if (addOutlet.length > 0 || removeOutlet.length > 0) {
        outlet_ids = data.outlet_ids
      }
    }

    if (!props.selectedUser) outlet_ids = data.outlet_ids

    const request = {
      name: data.name,
      username: data.username,
      email: data.email,
      phone: data.phone,
      role_id: data.role_id,
      department_id: data.department_id,
      outlet_ids: outlet_ids,
      employee_id: data.employee_id ?? null,
      customer_id: data.customer_id ?? null,
      is_supervisor: data.is_supervisor,
      language_id: 1,
      pin: data.pin,
      ...(props.selectedUser == null
        ? { password: data.password }
        : {
            password: user?.superadmin ? data.password : undefined
          })
    }

    if (props.selectedUser !== null) {
      patchUser.mutate({ id: props.selectedUser, request })
    } else {
      mutate(request)
    }
  }

  const generatePinValue = () => {
    setIsShowPin(true)
    setValue('pin', generatePin())
  }

  useEffect(() => {
    setImgSrc('')
    setOldUser(null)

    if (props.selectedUser && open) {
      getUser.mutate(props.selectedUser)
      setIsShowPin(false)
      setIsPasswordVisible(false)
      setValue('pin', undefined)
      setValue('password', '')
      setValue('password_confirmation', '')
    } else if (open) {
      setValue('code', randomString(6))
      setIsShowPin(true)
      setIsPasswordVisible(false)
      setValue('pin', 123456)
      setValue('password', defaultPassword)
      setValue('password_confirmation', defaultPassword)
      setValue('is_supervisor', false)
    }
    refetchDepartment()
    refetchRole()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedUser, open])

  const handleInputImageChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      setFiles(files[0])

      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(files[0])
      if (reader.result !== null) {
        setInputFileValue(reader.result as string)
      }
    }
  }

  if (loadingRoleData || loadingDepartementData) return <CircularProgress />

  console.log('form errors', errors)

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={(props.selectedUser !== null ? t('Edit') : t('Add')) + ' ' + t('User')}
    >
      <Box display='flex' justifyContent={'center'} marginBottom={4}>
        <IconButton component='label'>
          <Avatar src={imgSrc} sx={{ width: '72px', height: '72px' }} alt='Profile Pic'>
            <Box alignItems={'center'} display={'flex'} flexDirection={'column'}>
              <Icon icon='bi:person' width={24} height={24} />
              <Typography variant='caption'>Upload</Typography>
            </Box>
          </Avatar>
          <input
            hidden
            type='file'
            value={inputFileValue}
            accept='image/png, image/jpeg'
            onChange={handleInputImageChange}
            id='account-settings-upload-image'
          />
        </IconButton>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container columnSpacing={2}>
          <Grid item xs={6}>
            <Controller
              name='code'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  sx={{ mb: 4 }}
                  label={t('Code')}
                  placeholder='1234'
                  {...errorInput(errors, 'code')}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title='Generate Code' placement='top'>
                        <IconButton
                          edge='end'
                          onClick={() => {
                            setValue('code', randomString(6))
                          }}
                        >
                          <Icon icon='subway:random' fontSize={16} />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name='username'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  sx={{ mb: 4 }}
                  label={t('Username')}
                  placeholder='raisa01'
                  {...errorInput(errors, 'username')}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name='name'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  sx={{ mb: 4 }}
                  label={t('Name')}
                  placeholder='Raisa'
                  {...errorInput(errors, 'name')}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, ...field } }) => (
                <CustomTextField
                  {...field}
                  onChange={e => {
                    onChange(e)

                    if (e.target.value != '') {
                      if (props.selectedUser && oldUser?.user.email == e.target.value)
                        setIsEmailAvailable(true)
                      else checkEmailAvailable(e.target.value)
                    } else {
                      setIsEmailAvailable(true)
                    }
                  }}
                  fullWidth
                  type='email'
                  label='Email'
                  sx={{ mb: 4 }}
                  {...errorInput(errors, 'email', !isEmailAvailable)}
                  {...(!isEmailAvailable && { helperText: msgErrEmail })}
                  placeholder='raisa@email.com'
                  InputProps={{
                    endAdornment: isLoadingCheckEmailAvailable ? (
                      <InputAdornment position='end'>
                        <Icon icon={'eos-icons:loading'} fontSize={18} />
                      </InputAdornment>
                    ) : isEmailAvailable && !Boolean(errors.email) ? (
                      getValues().email ? (
                        <InputAdornment position='end'>
                          <Icon icon={'bi:check'} fontSize={18} color='green' />
                        </InputAdornment>
                      ) : (
                        <></>
                      )
                    ) : (
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setValue('email', '')} edge='end'>
                          <Icon icon={'bi:x'} fontSize={18} color='red' />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name='phone'
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, ...field } }) => (
                <CustomTextField
                  {...field}
                  onChange={e => {
                    const value = formatPhone(e.target.value)

                    onChange(value)

                    if (value != '') {
                      if (props.selectedUser && oldUser?.user.phone == value)
                        setIsPhoneAvailable(true)
                      else checkPhoneAvailable(value)
                    } else {
                      setIsPhoneAvailable(true)
                    }
                  }}
                  fullWidth
                  type='tel'
                  sx={{ mb: 4 }}
                  label={t('Phone')}
                  placeholder='0812-3456-7890'
                  {...errorInput(errors, 'phone', !isPhoneAvailable)}
                  {...(!isPhoneAvailable && { helperText: msgErrPhone })}
                  InputProps={{
                    inputMode: 'tel',
                    endAdornment: isLoadingCheckPhoneAvailable ? (
                      <InputAdornment position='end'>
                        <Icon icon={'eos-icons:loading'} fontSize={18} />
                      </InputAdornment>
                    ) : isPhoneAvailable && !Boolean(errors.phone) ? (
                      getValues().phone ? (
                        <InputAdornment position='end'>
                          <Icon icon={'bi:check'} fontSize={18} color='green' />
                        </InputAdornment>
                      ) : (
                        <></>
                      )
                    ) : (
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setValue('phone', '')} edge='end'>
                          <Icon icon={'bi:x'} fontSize={18} color='red' />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}></Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name='department_id'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <SelectCustom
                  serverSide
                  {...field}
                  {...errorInput(errors, 'department_id')}
                  options={departmentData?.data.data ?? []}
                  optionKey={'id'}
                  labelKey={'name'}
                  placeholder={t('Department') ?? 'Department'}
                  label={t('Department') ?? 'Department'}
                  onSelect={(data, value) => {
                    setValue('department_id', value, {
                      shouldValidate: true,
                      shouldDirty: true
                    })
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={(roleData?.data.data ?? []).length > 1 ? 6 : 12}>
            <Controller
              name='role_id'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <SelectCustom
                  {...field}
                  {...errorInput(errors, 'role_id')}
                  options={roleData?.data.data ?? []}
                  optionKey={'id'}
                  labelKey={'name'}
                  placeholder={t('Role') ?? 'Role'}
                  label={t('Role') ?? 'Role'}
                  onSelect={(data, value) => {
                    setValue('role_id', value, {
                      shouldValidate: true,
                      shouldDirty: true
                    })
                  }}
                />
              )}
            />
          </Grid>
          {channelData.length > 0 && (
            <Grid item xs={12} md={6}>
              <SelectCustom
                options={channelData}
                optionKey={'id'}
                labelKey={'name'}
                placeholder='Channel'
                label='Channel'
                required={false}
                nullableText='None'
                // onSelect={item => {
                //   setDepartment(item.id)
                // }}
              />
            </Grid>
          )}

          {storeData.length > 0 && (
            <Grid item xs={12} md={6}>
              <SelectCustom
                // defaultValue={[].find(item => item.id.toString() == channel)}
                options={storeData}
                optionKey={'id'}
                labelKey={'name'}
                placeholder='Store'
                label='Store'
                required={false}
                nullableText='None'
                // onSelect={item => {
                //   setDepartment(item.id)
                // }}
              />
            </Grid>
          )}

          {(outletData ?? []).length > 1 && (
            <Grid item xs={12} mt={2}>
              <Controller
                name='outlet_ids'
                control={control}
                rules={{ required: true }}
                render={({ field: { value } }) => (
                  <SelectChip
                    label='Outlet'
                    multiple
                    {...errorInput(errors, 'outlet_ids')}
                    options={outletData ?? []}
                    optionKey={'id'}
                    labelKey={'name'}
                    placeholder='Outlet'
                    onSelect={item => {
                      setValue('outlet_ids', pluck(item ?? [], 'id'), { shouldValidate: true })
                    }}
                    value={value}
                    onSelectAll={() => {
                      setValue('outlet_ids', pluck(outletData ?? [], 'id'), {
                        shouldValidate: true
                      })
                    }}
                    onShowButton={() => {
                      window.open('/point-of-sales#Outlet', '_blank')
                    }}
                  />
                )}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6} mt={2}>
            <Controller
              name='employee_id'
              control={control}
              rules={{ required: true }}
              render={({ field: { value } }) => (
                <SelectCustom
                  label={t('Employee') ?? 'Employee'}
                  {...errorInput(errors, 'employee_id')}
                  options={employeeData ?? []}
                  optionKey={'id'}
                  labelKey={'name'}
                  placeholder={t('Employee') ?? 'Employee'}
                  onSelect={item => {
                    setValue('employee_id', item.id ?? null, { shouldValidate: true })
                  }}
                  value={value}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6} mt={2}>
            <Controller
              name='customer_id'
              control={control}
              rules={{ required: true }}
              render={({ field: { value } }) => (
                <SelectCustom
                  label={t('Customer') ?? 'Customer'}
                  {...errorInput(errors, 'customer_id')}
                  options={customerData ?? []}
                  optionKey={'id'}
                  labelKey={'name'}
                  placeholder={t('Customer') ?? 'Customer'}
                  onSelect={item => {
                    setValue('customer_id', item.id ?? null, { shouldValidate: true })
                  }}
                  value={value}
                />
              )}
            />
          </Grid>

          {props.selectedUser && user?.superadmin && (
            <>
              <Grid item xs={6}>
                <Controller
                  name='password'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, ...field } }) => (
                    <CustomTextField
                      {...field}
                      defaultValue={value || ''}
                      size='small'
                      type={isPasswordVisible ? 'text' : 'password'}
                      fullWidth
                      sx={{ mt: 4 }}
                      label={t('Change Password')}
                      {...errorInput(errors, 'password')}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                              edge='end'
                            >
                              <Icon
                                fontSize='1.25rem'
                                icon={isPasswordVisible ? 'tabler:eye' : 'tabler:eye-off'}
                              />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name='password_confirmation'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, ...field } }) => (
                    <CustomTextField
                      {...field}
                      defaultValue={value || ''}
                      type={isPasswordVisible ? 'text' : 'password'}
                      size='small'
                      fullWidth
                      sx={{ mt: 4 }}
                      label={t('New Password Confirmation')}
                      {...errorInput(errors, 'password_confirmation')}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                              edge='end'
                            >
                              <Icon
                                fontSize='1.25rem'
                                icon={isPasswordVisible ? 'tabler:eye' : 'tabler:eye-off'}
                              />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Grid>
            </>
          )}

          <Grid item xs={8} mt={2}>
            <Controller
              name='pin'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  label='PIN'
                  InputProps={{
                    endAdornment: isShowPin ? (
                      <IconButton
                        aria-label='copy pin'
                        edge='end'
                        onClick={() => {
                          if (isShowPin) {
                            toast.success(t('Copy PIN to clipboard'))

                            navigator.clipboard.writeText((getValues().pin ?? '').toString())
                          }
                        }}
                      >
                        <Icon icon='ph:copy' />
                      </IconButton>
                    ) : undefined
                  }}
                  fullWidth
                  type={isShowPin ? 'text' : 'password'}
                  sx={{ mb: 4 }}
                  error={Boolean(errors.pin)}
                  {...(errors.pin && { helperText: errors.pin.message })}
                />
              )}
            />
          </Grid>
          <Grid item xs={4} mt={2} alignSelf={'end'} mb={4}>
            <Button fullWidth variant='outlined' onClick={generatePinValue}>
              {t('Generate PIN')}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Controller
              name='is_supervisor'
              control={control}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { value, ...field } }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={isSupervisor} />}
                  label={t('Supervisor')}
                />
              )}
            />
          </Grid>
        </Grid>
        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='outlined' onClick={handleClose}>
            {t('Cancel')}
          </Button>
          <Button type='submit' variant='contained' disabled={isLoading} sx={{ ml: 3 }}>
            {t('Submit')}
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default AddUserDialog
