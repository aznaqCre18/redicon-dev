// ** React Imports
import { ChangeEvent, useEffect, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { maxLimitPagination } from 'src/types/pagination/pagination'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports

// ** Types Imports
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'
import { outletService } from 'src/services/outlet/outlet'
import { OutletData, OutletSchema } from 'src/types/apps/outlet/outlet'
import { Avatar, Grid, IconButton, Typography } from '@mui/material'
import SelectCustom from 'src/components/form/select/SelectCustom'
import {
  DistrictType,
  LocationRequestType,
  ProvinceType,
  SubDistrictType
} from 'src/types/apps/locationType'
import { locationProvinceService } from 'src/services/location/province'
import { locationDistrictService } from 'src/services/location/discrict'
import { locationSubDistrictService } from 'src/services/location/subdistrict'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import { useTranslation } from 'react-i18next'
import { useApp } from 'src/hooks/useApp'
import { Icon } from '@iconify/react'
import { formatPhone } from 'src/utils/numberUtils'

interface FormOutletType {
  open: boolean
  toggle: () => void
  selectedData: string | null
  setSelectedData: (value: string | null) => void
}

const FormOutletDialog = (props: FormOutletType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  // ** Props
  const { open, toggle } = props

  const [files, setFiles] = useState<File | null>(null)
  const [imgSrc, setImgSrc] = useState('')
  const [inputValue, setInputValue] = useState('')

  // ** Hooks
  const queryClient = useQueryClient()
  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm<OutletData>({
    defaultValues: {
      country_id: 62
    },
    mode: 'all',
    resolver: yupResolver(OutletSchema)
  })

  const { mutate: setLogo } = useMutation(outletService.setLogo, {
    onSuccess: () => {
      queryClient.invalidateQueries('outlet-list')
    }
  })

  const { mutate, isLoading } = useMutation(outletService.postOutlet, {
    onSuccess: (data: any) => {
      const resp = data.data.data
      const id = resp.id

      if (files) {
        setLogo({ id: id, file: files })
      }

      toast.success(t((data as unknown as ResponseType).data.message))

      handleClose()
      queryClient.invalidateQueries('outlet-list')
    }
  })

  const getUserOutlet = useMutation(outletService.getOutlet, {
    onSuccess: data => {
      setValue('name', data.data.data.outlet.name)
      setValue('phone', data.data.data.outlet.phone)
      setValue('email', data.data.data.outlet.email)
      setValue('description', data.data.data.outlet.description)
      setValue('address', data.data.data.outlet.address)
      setValue('province_id', data.data.data.outlet.province_id)
      setValue('district_id', data.data.data.outlet.district_id)
      setValue('subdistrict_id', data.data.data.outlet.subdistrict_id)

      if (data.data.data.address.province.id != 0) {
        setProvinces([data.data.data.address.province])
        setProvince(data.data.data.address.province)
      }

      if (data.data.data.address.district.id != 0) {
        setDistricts([data.data.data.address.district])
        setDistrict(data.data.data.address.district)
      }

      if (data.data.data.address.sub_district.id != 0) {
        setSubDistricts([data.data.data.address.sub_district])
        setSubDistrict(data.data.data.address.sub_district)
      }

      if (data.data.data.outlet.logo) {
        setImgSrc(getImageAwsUrl(data.data.data.outlet.logo))
      }
    }
  })

  const patchOutlet = useMutation(outletService.patchOutlet, {
    onSuccess: (data: any) => {
      const resp = data.data.data
      const id = resp.id

      if (files) {
        setLogo({ id: id, file: files })
      }

      toast.success(t((data as unknown as ResponseType).data.message))
      handleClose()
      queryClient.invalidateQueries('outlet-list')
    }
  })

  const onSubmit = (data: OutletData) => {
    if (props.selectedData !== null) {
      patchOutlet.mutate({ id: props.selectedData, data: data })
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

  useEffect(() => {
    if (props.selectedData && open) {
      getUserOutlet.mutate(props.selectedData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedData, open])

  const handleClose = () => {
    setFiles(null)
    setImgSrc('')
    setInputValue('')

    toggle()
    reset()
  }

  // ADDRESS

  // useEffect(() => {
  //   if (addressStore) {
  //     getProvince({ ...provinceOptions, id: addressStore.province_id })
  //     getDistrict({
  //       ...districtOptions,
  //       province_id: addressStore.province_id,
  //       id: addressStore.district_id
  //     })
  //     getSubDistrict({
  //       ...subDistrictOptions,
  //       province_id: addressStore.province_id,
  //       district_id: addressStore.district_id,
  //       id: addressStore.subdistrict_id
  //     })
  //   }
  // }, [addressStore])

  // const { mutate: updateAddressStore } = useMutation(vendorStoreService.setAddress)

  const [provinceOptions, setProvinceOptions] = useState<LocationRequestType>({
    ...maxLimitPagination,
    name: ''
  })
  const [province, setProvince] = useState<ProvinceType | null>(null)
  const [provinces, setProvinces] = useState<ProvinceType[]>([])
  const { mutate: getProvince } = useMutation(locationProvinceService.getAll, {
    onSuccess: data => {
      if (provinceOptions.id) {
        setProvince(data.data.data.find(item => item.id === provinceOptions.id) ?? null)

        setProvinceOptions({ ...provinceOptions, id: undefined })
      } else setProvinces(data.data.data ?? [])
    }
  })

  useEffect(() => {
    getProvince(provinceOptions)
  }, [getProvince, provinceOptions])

  const [districtOptions, setDistrictOptions] = useState<LocationRequestType>({
    ...maxLimitPagination,
    name: ''
  })
  const [district, setDistrict] = useState<DistrictType | null>(null)
  const [districts, setDistricts] = useState<DistrictType[]>([])
  const { mutate: getDistrict } = useMutation(locationDistrictService.getAll, {
    onSuccess: data => {
      if (districtOptions.id) {
        setDistrict(data.data.data.find(item => item.id === districtOptions.id) ?? null)

        setDistrictOptions({ ...districtOptions, id: undefined })
      } else setDistricts(data.data.data ?? [])
    }
  })

  useEffect(() => {
    if (province)
      getDistrict({
        ...districtOptions,
        province_id: province.id
      })
  }, [getDistrict, districtOptions, province])

  const [subDistrictOptions, setSubDistrictOptions] = useState<LocationRequestType>({
    ...maxLimitPagination,
    name: ''
  })
  const [subDistrict, setSubDistrict] = useState<SubDistrictType | null>(null)
  const [subDistricts, setSubDistricts] = useState<SubDistrictType[]>([])
  const { mutate: getSubDistrict } = useMutation(locationSubDistrictService.getAll, {
    onSuccess: data => {
      if (subDistrictOptions.id) {
        setSubDistrict(data.data.data.find(item => item.id === subDistrictOptions.id) ?? null)

        setSubDistrictOptions({ ...subDistrictOptions, id: undefined })
      } else setSubDistricts(data.data.data ?? [])
    }
  })

  useEffect(() => {
    if (district)
      getSubDistrict({
        ...subDistrictOptions,
        district_id: district.id
      })
  }, [getSubDistrict, subDistrictOptions, district])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={(props.selectedData !== null ? t('Edit') : t('Add')) + ' Outlet'}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display={'flex'} justifyContent={'center'}>
          <IconButton component='label'>
            <Avatar src={imgSrc} sx={{ width: '72px', height: '72px' }} alt='Profile Pic'>
              <Box alignItems={'center'} display={'flex'} flexDirection={'column'}>
                <Icon icon='bi:image' width={24} height={24} />
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
                  label={t('Outlet Name') ?? 'Outlet Name'}
                  placeholder='Outlet Cikini'
                  {...errorInput(errors, 'name')}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
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
                  }}
                  fullWidth
                  label={t('Phone') ?? 'Phone'}
                  placeholder='081xxx'
                  type='tel'
                  {...errorInput(errors, 'phone')}
                  InputProps={{
                    inputMode: 'tel'
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field: { ...field } }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={t('Email') ?? 'Email'}
                  placeholder='email@example.com'
                  type='email'
                  {...errorInput(errors, 'email')}
                  InputProps={{
                    inputMode: 'email'
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name='description'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  multiline
                  rows={2}
                  fullWidth
                  label={t('Description') ?? 'Description'}
                  placeholder='Description'
                  {...errorInput(errors, 'description')}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <SelectCustom
              fullWidth
              label='Negara'
              options={[{ id: 62, name: 'Indonesia' }]}
              optionKey='id'
              labelKey='name'
              value={62}
            />
          </Grid>
          {!getUserOutlet.isLoading && (
            <>
              <Grid item xs={6}>
                <Controller
                  name='province_id'
                  control={control}
                  rules={{ required: true }}
                  render={() => (
                    <SelectCustom
                      defaultValueId={props.selectedData ?? undefined}
                      fullWidth
                      serverSide
                      label='Provinsi'
                      options={provinces}
                      optionKey='id'
                      labelKey='name'
                      onSelect={value => {
                        setProvince(value)
                      }}
                      onInputChange={(_e, value) =>
                        setProvinceOptions({ ...provinceOptions, name: value })
                      }
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <SelectCustom
                  serverSide
                  label='Kabupaten/Kota'
                  options={districts}
                  optionKey='id'
                  labelKey='name'
                  value={district?.id ?? ''}
                  onSelect={value => {
                    setDistrict(value)
                  }}
                  onInputChange={(_e, value) =>
                    setDistrictOptions({ ...provinceOptions, name: value })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <SelectCustom
                  serverSide
                  label='Kecamatan'
                  options={subDistricts}
                  optionKey='id'
                  labelKey='name'
                  value={subDistrict?.id ?? ''}
                  onSelect={value => {
                    setSubDistrict(value)

                    if (province && district) {
                      setValue('province_id', province?.id)
                      setValue('district_id', district?.id)
                      setValue('subdistrict_id', value.id)
                    }
                  }}
                  onInputChange={(_e, value) =>
                    setSubDistrictOptions({ ...provinceOptions, name: value })
                  }
                />
              </Grid>
            </>
          )}
          <Grid item xs={12}>
            <Controller
              name='address'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  multiline
                  rows={2}
                  fullWidth
                  label={t('Address') ?? 'Address'}
                  placeholder='Jl. xxx'
                  {...errorInput(errors, 'address')}
                />
              )}
            />
          </Grid>
        </Grid>
        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
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

export default FormOutletDialog
