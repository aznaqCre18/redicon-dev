// ** React Imports
import { ChangeEvent, useEffect, useState } from 'react'

import awsConfig from 'src/configs/aws'

// ** MUI Imports
import Button from '@mui/material/Button'

import {
  TextField,
  FormControl,
  Box,
  Grid,
  Avatar,
  IconButton,
  InputAdornment,
  Typography
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { customerService } from 'src/services/customer'
import {
  CustomerData,
  CustomerDetailType,
  CustomerSchema,
  CustomerWalkinSchema
} from 'src/types/apps/customerType'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'
import { membershipService } from 'src/services/membership'
import { defaultPagination, maxLimitPagination } from 'src/types/pagination/pagination'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { SubDistrictRequestType, SubDistrictDetailType } from 'src/types/apps/locationType'
import { MetaType } from 'src/types/pagination/meta'
import { locationService } from 'src/services/location'
import { customerAddressService } from 'src/services/customerAddress'
import { Icon } from '@iconify/react'
import { MembershipType } from 'src/types/apps/membershipType'
import FormMembership from '../../membership/dialog/FormMembership'
import { randomString } from 'src/utils/stringUtils'
import { useTranslation } from 'react-i18next'
import { formatPhone, randomInt } from 'src/utils/numberUtils'
import { useApp } from 'src/hooks/useApp'
import { EmployeeType } from 'src/types/apps/employee'
import { employeeService } from 'src/services/employee'
import { SelectOption } from 'src/components/form/select/Select'
import { VendorStoreFeatureSettingData } from 'src/types/apps/vendor/setting'
import { vendorSettingService } from 'src/services/vendor/setting'

interface DialogType {
  open: boolean
  toggle: () => void
  selectedCustomer: CustomerDetailType | null
  setSelectedCustomer: (value: CustomerDetailType | null) => void
}

const defaultPassword = '123456'

const FormCustomerDialog = ({
  open,
  toggle,
  selectedCustomer,
  setSelectedCustomer
}: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()

  // form
  const [files, setFiles] = useState<File | null>(null)
  const [imgSrc, setImgSrc] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [employeeData, setEmployeeData] = useState<SelectOption[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>(undefined)

  const [vendorSetting, setVendorSetting] = useState<VendorStoreFeatureSettingData | undefined>(
    undefined
  )

  useQuery('vendor-setting', {
    queryFn: () => vendorSettingService.getVendorSetting(),
    onSuccess: data => {
      setVendorSetting(data.data.data)
    }
  })

  useEffect(() => {
    setValue('employee_id', selectedEmployeeId, {
      shouldValidate: true,
      shouldDirty: true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployeeId])

  const [openDialogAdd, setOpenDialogAdd] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const queryClient = useQueryClient()
  // query for form

  useQuery('employee-list', {
    queryFn: () => employeeService.getList({ ...maxLimitPagination }),
    onSuccess: data => {
      if (data.data.data)
        setEmployeeData(
          data.data.data.map((item: EmployeeType) => ({ label: item.name, value: item.id }))
        )
      else setEmployeeData([])
    }
  })

  const isWalkin = Boolean(selectedCustomer && selectedCustomer.customer.code === 'walkin')

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<
    CustomerData & {
      subdistrict_id: number
      postal_code: string
      address: string
    }
  >({
    defaultValues: {
      address: '',
      code: '',
      email: '',
      membership_id: undefined,
      name: '',
      phone: '',
      username: '',
      password: defaultPassword,
      password_confirmation: defaultPassword,
      language_id: 1,
      subdistrict_id: undefined,
      postal_code: ''
    },
    mode: 'all',
    resolver: isWalkin ? yupResolver(CustomerWalkinSchema) : yupResolver(CustomerSchema)
  })

  const { data: dataMembership } = useQuery(['membership-list-active'], {
    queryFn: () =>
      membershipService.getList({
        is_active: 'true',
        ...defaultPagination
      })
    // onSuccess: data => {
    //   if (data.data.data) {
    //     if (data.data.data.length > 0) setValue('membership_id', data.data.data[0].id)
    //   }
    // }
  })

  const { mutate: updateProfilePicture } = useMutation(customerService.updateImage)

  const { mutate: createCustomerAddress } = useMutation(customerAddressService.post, {
    onSuccess: () => {
      queryClient.invalidateQueries('customer-list')
    }
  })

  const { mutate: updateCustomerAddress } = useMutation(customerAddressService.patch, {
    onSuccess: () => {
      queryClient.invalidateQueries('customer-list')
    }
  })

  const { mutate: changePassword } = useMutation(customerService.changePassword, {
    onSuccess: () => {
      queryClient.invalidateQueries('customer-list')
    }
  })

  const { mutate, isLoading } = useMutation(customerService.postCustomer, {
    onSuccess: (data: any) => {
      const resp = data.data.data
      const id = resp.id

      if (files) {
        updateProfilePicture({ id: id, file: files })
      }

      if (selectLocation)
        createCustomerAddress({
          customer_id: id as number,
          postal_code: getValues('postal_code'),
          address: getValues('address'),
          name: getValues('name'),
          phone: getValues('phone'),
          country_id: 62,
          province_id: selectLocation.province_id,
          district_id: selectLocation.district_id,
          subdistrict_id: selectLocation.id,
          latitude: 0,
          longitude: 0,
          note: '',
          label: 'Address 1',
          is_primary: true
        })

      toast.success(t('Success!!! Your default password is') + ' ' + defaultPassword, {
        duration: 5000
      })

      reset()

      setValue('password', defaultPassword)
      setValue('password_confirmation', defaultPassword)

      setValue('code', randomString(6))
      setValue('username', 'u' + randomString(5))
      setValue('maximum_order_qty_product_in_cart', undefined)

      if (dataMembership && dataMembership?.data.data.length === 1) {
        const membership = dataMembership?.data.data.find(item => item.level === 1)
        if (membership) setValue('membership_id', membership.id)
      }

      // handleClose()
      queryClient.invalidateQueries('customer-list')
    }
  })

  const { mutate: mutateUpdate, isLoading: isLoadingUpdate } = useMutation(
    customerService.patchCustomer,
    {
      onSuccess: (data: any) => {
        const resp = data.data.data
        const id = resp.id

        if (files) {
          updateProfilePicture({ id: id, file: files })
        }

        const password = getValues('password') === null ? '' : getValues('password')
        if (
          selectedCustomer &&
          password !== '' &&
          getValues('password') == getValues('password_confirmation')
        ) {
          changePassword({
            id: id as number,
            password: password!
          })
        }

        if (selectLocation && selectedCustomer && selectedCustomer.address.length === 0) {
          createCustomerAddress({
            customer_id: id as number,
            postal_code: getValues('postal_code'),
            address: getValues('address'),
            name: getValues('name'),
            phone: getValues('phone'),
            country_id: 62,
            province_id: selectLocation.province_id,
            district_id: selectLocation.district_id,
            subdistrict_id: selectLocation.id,
            latitude: 0,
            longitude: 0,
            note: '',
            label: 'Address 1',
            is_primary: true
          })
        } else if (selectLocation && selectedCustomer && selectedCustomer.address.length > 0) {
          updateCustomerAddress({
            id: selectedCustomer.address[0].customer_address.id,
            request: {
              customer_id: id as number,
              postal_code: getValues('postal_code'),
              address: getValues('address'),
              name: getValues('name'),
              phone: getValues('phone'),
              country_id: 62,
              province_id: selectLocation.province_id,
              district_id: selectLocation.district_id,
              subdistrict_id: selectLocation.id,
              latitude: selectedCustomer.address[0].customer_address.latitude,
              longitude: selectedCustomer.address[0].customer_address.longitude,
              note: selectedCustomer.address[0].customer_address.note,
              label: selectedCustomer.address[0].customer_address.label,
              is_primary: false
            }
          })
        }

        toast.success(t((data as unknown as ResponseType).data.message))
        handleClose()
        queryClient.invalidateQueries('customer-list')
      }
    }
  )

  const onSubmit = (data: CustomerData) => {
    // replace data.phone first 0 to +62
    if (!selectedCustomer && (!data.phone || data.phone === '')) {
      data.phone = `0800${randomInt(1000, 9999)}${randomInt(1000, 9999)}`
    }

    if (data.phone.charAt(0) === '0') {
      data.phone = '+62' + data.phone.substr(1)
    }

    if (!selectedCustomer && (!data.email || data.email === '')) {
      data.email = `${data.name.replace(/\s/g, '').toLowerCase()}${randomInt(1000, 9999)}@mail.com`
    }

    if (selectedCustomer !== null) {
      mutateUpdate({ id: selectedCustomer.customer.id, request: data })
    } else {
      mutate(data)
    }
  }

  const handleInputImageChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      setFiles(files[0])

      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(files[0])
      if (reader.result !== null) {
        setInputValue(reader.result as string)
      }
    }
  }

  const handleClose = () => {
    reset()
    setValue('subdistrict_id', 0)

    toggle()
    setSelectedCustomer(null)
  }

  const [selectLocation, setSelectLocation] = useState<SubDistrictDetailType | null>(null)
  const [locationData, setLocationData] = useState<SubDistrictDetailType[]>([])
  const [, setLocationMeta] = useState<MetaType>()

  const [paginationData, setPaginationData] = useState<SubDistrictRequestType>({
    limit: 100,
    page: 1,
    query: '',
    order: 'id',
    sort: 'asc'
  })

  useQuery(['location-list', paginationData], {
    queryFn: () => locationService.getSubDistrict(paginationData),
    onSuccess: data => {
      setLocationData(data.data.data)
      setLocationMeta(data.data.meta)
    }
  })

  const { mutate: getOneSubDisctrict, isLoading: loadingGetDetailLocation } = useMutation(
    locationService.getOneSubDistrict,
    {
      onSuccess: data => {
        setLocationData(
          [data.data.data].map(item => ({
            ...item,
            subdistrict_name: `${item.subdistrict_name}, ${item.district_name}, ${item.province_name}`
          }))
        )
        setSelectLocation(data.data.data)
      }
    }
  )

  useEffect(() => {
    setImgSrc('')
    if (selectedCustomer && open) {
      setValue('password', null)
      setValue('password_confirmation', null)

      setValue('code', selectedCustomer.customer.code)
      setValue('username', selectedCustomer.customer.username)
      setValue('name', selectedCustomer.customer.name)
      setValue('email', selectedCustomer.customer.email)
      setValue('phone', selectedCustomer.customer.phone)
      setValue('membership_id', selectedCustomer.customer.membership_id)
      setValue(
        'maximum_order_qty_product_in_cart',
        selectedCustomer.customer.maximum_order_qty_product_in_cart
      )
      setValue(
        'maximum_order_quantity_per_customer_in_cart',
        selectedCustomer.customer.maximum_order_quantity_per_customer_in_cart
      )

      setValue('credit_term', selectedCustomer.customer.credit_term)

      if (selectedCustomer.customer.profile_picture)
        setImgSrc(
          selectedCustomer.customer.profile_picture
            ? `${awsConfig.s3_bucket_url}/${selectedCustomer.customer.profile_picture}`
            : ''
        )

      if (selectedCustomer.address.length > 0) {
        getOneSubDisctrict(selectedCustomer.address[0].customer_address.subdistrict_id)
        setValue('subdistrict_id', selectedCustomer.address[0].customer_address.subdistrict_id)
        setValue('postal_code', selectedCustomer.address[0].customer_address.postal_code)
        setValue('address', selectedCustomer.address[0].customer_address.address)
      }
    } else if (open) {
      setValue('password', defaultPassword)
      setValue('password_confirmation', defaultPassword)

      setValue('code', randomString(6))
      setValue('username', 'u' + randomString(5))
      setValue('maximum_order_qty_product_in_cart', undefined)
      setValue('maximum_order_quantity_per_customer_in_cart', undefined)
      setValue('credit_term', undefined)

      if (dataMembership && dataMembership?.data.data.length === 1) {
        const membership = dataMembership?.data.data.find(item => item.level === 1)
        if (membership) setValue('membership_id', membership.id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer, open])

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        title={(selectedCustomer ? t('Edit') : t('Add')) + ' ' + t('Requestor')}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display={'flex'} justifyContent={'center'}>
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
                value={inputValue}
                accept='image/png, image/jpeg'
                onChange={handleInputImageChange}
                id='account-settings-upload-image'
              />
            </IconButton>
          </Box>
          <div style={{ marginBottom: '15px' }}></div>
          <Grid container spacing={3} marginBottom={4}>
            {selectedCustomer && (
              <>
                <Grid item xs={6}>
                  <Controller
                    name='code'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        disabled={isWalkin}
                        {...field}
                        {...errorInput(errors, 'code')}
                        label={t('Code')}
                        variant='outlined'
                        size='small'
                        fullWidth
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
                      <TextField
                        disabled={isWalkin}
                        {...field}
                        {...errorInput(errors, 'username')}
                        label={t('Username')}
                        variant='outlined'
                        size='small'
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} md={6}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    {...errorInput(errors, 'name')}
                    label={t('Requestor Name')}
                    variant='outlined'
                    size='small'
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    disabled={isWalkin}
                    {...field}
                    {...errorInput(errors, 'email')}
                    label={t('Email')}
                    variant='outlined'
                    size='small'
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              {!isWalkin ? (
                <Controller
                  name='phone'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, ...field } }) => (
                    <TextField
                      {...field}
                      onChange={e => {
                        const value = formatPhone(e.target.value)
                        onChange(value)
                      }}
                      {...errorInput(errors, 'phone')}
                      label={t('Phone')}
                      variant='outlined'
                      size='small'
                      type='tel'
                      fullWidth
                      inputProps={{ inputMode: 'tel' }}
                    />
                  )}
                />
              ) : (
                <TextField
                  value={selectedCustomer?.customer.phone ?? ''}
                  disabled={isWalkin}
                  label={t('Phone')}
                  variant='outlined'
                  size='small'
                  type='tel'
                  fullWidth
                  inputProps={{ inputMode: 'tel' }}
                />
              )}
            </Grid>
            {dataMembership && (
              <Grid item xs={12} md={6}>
                <Controller
                  name='membership_id'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectCustom
                      isFloating
                      {...field}
                      {...errorInput(errors, 'membership_id')}
                      options={dataMembership?.data.data ?? []}
                      optionKey='id'
                      labelKey='name'
                      label={t('Membership') ?? 'Membership'}
                      onSelect={(data: MembershipType, value) => {
                        setValue('membership_id', value, {
                          shouldValidate: true,
                          shouldDirty: true
                        })
                      }}
                      // onAddButton={() => {
                      //   setOpenDialogAdd(true)
                      // }}
                      // onShowButton={() => {
                      //   window.open('/customer/membership', '_blank')
                      // }}
                    />
                  )}
                />
              </Grid>
            )}
            <Grid item xs={6}>
              <FormControl fullWidth size='small'>
                {(!loadingGetDetailLocation || selectedCustomer?.address.length == 0) && (
                  <Controller
                    name='subdistrict_id'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <SelectCustom
                        disabled={isWalkin}
                        serverSide
                        {...field}
                        isFloating
                        options={locationData ?? []}
                        optionKey='id'
                        onSelect={(data: SubDistrictDetailType, value) => {
                          setSelectLocation(data)
                          setValue('subdistrict_id', value, {
                            shouldValidate: true,
                            shouldDirty: true
                          })
                        }}
                        label={t('Location') ?? 'Location'}
                        labelKey='subdistrict_name'
                        onInputChange={(event, newInputValue) => {
                          if (newInputValue && event?.type === 'change') {
                            const valueSelection = locationData?.find(
                              item => item.subdistrict_name == newInputValue
                            )

                            if (valueSelection) return
                            setPaginationData({
                              limit: paginationData.limit,
                              page: 1,
                              query: newInputValue,
                              order: paginationData.order,
                              sort: paginationData.sort
                            })
                          }
                        }}
                        renderLabel={options => {
                          if (!options) return ''

                          return (
                            options.subdistrict_name +
                            ', ' +
                            options.district_name +
                            ', ' +
                            options.province_name
                          )
                        }}
                        {...errorInput(errors, 'subdistrict_id')}
                      />
                    )}
                  />
                )}
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size='small'>
                <Controller
                  name='postal_code'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      disabled={isWalkin}
                      {...field}
                      size='small'
                      label={t('Postal Code')}
                      {...errorInput(errors, 'postal_code')}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='address'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    disabled={isWalkin}
                    {...field}
                    size='small'
                    fullWidth
                    label={t('Address')}
                    {...errorInput(errors, 'address')}
                  />
                )}
              />
            </Grid>
            {vendorSetting?.is_maximum_order_product_in_cart && (
              <Grid item xs={6}>
                <Controller
                  name='maximum_order_qty_product_in_cart'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      {...errorInput(errors, 'maximum_order_qty_product_in_cart')}
                      label={t('Maximum Order Product in Cart')}
                      variant='outlined'
                      size='small'
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}
            {vendorSetting?.is_maximum_order_quantity_per_customer_in_cart && (
              <Grid item xs={6}>
                <Controller
                  name='maximum_order_quantity_per_customer_in_cart'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      {...errorInput(errors, 'maximum_order_quantity_per_customer_in_cart')}
                      label={t('Maximum Total Qty In Cart')}
                      variant='outlined'
                      size='small'
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}
            {/* <Grid item xs={6}>
              <SelectCustom
                isFloating
                value={selectedEmployeeId}
                options={employeeData}
                optionKey={'value'}
                labelKey={'label'}
                label={t('Employee') ?? 'Employee'}
                onSelect={(data: any, value) => {
                  setSelectedEmployeeId(value)
                }}
              />
            </Grid> */}
            {/* <Grid item xs={6}>
              <Controller
                name='credit_term'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    {...errorInput(errors, 'credit_term')}
                    label={t('Credit') + ' (' + t('Days') + ')'}
                    variant='outlined'
                    size='small'
                    fullWidth
                  />
                )}
              />
            </Grid> */}
          </Grid>
          {selectedCustomer && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Controller
                  name='password'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      disabled={isWalkin}
                      {...field}
                      size='small'
                      type={isPasswordVisible ? 'text' : 'password'}
                      fullWidth
                      label={t('New Password')}
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
                  render={({ field }) => (
                    <TextField
                      disabled={isWalkin}
                      {...field}
                      type={isPasswordVisible ? 'text' : 'password'}
                      size='small'
                      fullWidth
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
            </Grid>
          )}
          <Box mt={5} sx={{ display: 'flex', justifyContent: 'end' }}>
            <Button variant='tonal' color='secondary' onClick={handleClose}>
              {t('Cancel')}
            </Button>
            <Button
              disabled={isLoading || isLoadingUpdate}
              type='submit'
              variant='contained'
              sx={{ ml: 3 }}
            >
              {t('Submit')}
            </Button>
          </Box>
        </form>
      </Dialog>
      <FormMembership
        open={openDialogAdd}
        toggle={() => setOpenDialogAdd(false)}
        selectedData={null}
        setSelectedData={() => {
          console.log()
        }}
      />
    </>
  )
}

export default FormCustomerDialog
