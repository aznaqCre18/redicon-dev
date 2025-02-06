// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'

import { FormControl, Box, Grid, FormControlLabel, Checkbox } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import Dialog from 'src/views/components/dialogs/Dialog'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { SubDistrictRequestType, SubDistrictDetailType } from 'src/types/apps/locationType'
import { MetaType } from 'src/types/pagination/meta'
import { locationService } from 'src/services/location'
import { customerAddressService } from 'src/services/customerAddress'
import { useTranslation } from 'react-i18next'
import { formatPhone } from 'src/utils/numberUtils'
import { useApp } from 'src/hooks/useApp'
import {
  CustomerAddressData,
  customerAddressSchema,
  CustomerAddressType
} from 'src/types/apps/customerAddressType'
import CustomTextField from 'src/components/form/CustomTextField'

interface DialogType {
  open: boolean
  toggle: () => void
  customerId: number
  selectedData?: CustomerAddressType
}

const defaultValues = {
  address: '',
  name: '',
  phone: '',
  subdistrict_id: undefined,
  postal_code: '',
  is_primary: false
}

const FormCustomerAddressDialog = ({ open, toggle, customerId, selectedData }: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<CustomerAddressData>({
    defaultValues: defaultValues,
    mode: 'all',
    resolver: yupResolver(customerAddressSchema)
  })

  const { mutate } = useMutation(customerAddressService.post, {
    onSuccess: () => {
      queryClient.invalidateQueries('customer-address-list')
      handleClose()
    }
  })

  const { mutate: mutateUpdate } = useMutation(customerAddressService.patch, {
    onSuccess: () => {
      queryClient.invalidateQueries('customer-address-list')
      handleClose()
    }
  })

  const onSubmit = (data: CustomerAddressData) => {
    if (selectedData) {
      mutateUpdate({
        id: selectedData.id,
        request: data
      })
    } else {
      mutate(data)
    }
  }

  const handleClose = () => {
    reset()
    setValue('subdistrict_id', 0)

    toggle()
  }

  const [, setSelectLocation] = useState<SubDistrictDetailType | null>(null)
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
    if (selectedData && open) {
      setValue('name', selectedData.name)
      setValue('phone', selectedData.phone)
      getOneSubDisctrict(selectedData.subdistrict_id)
      setValue('subdistrict_id', selectedData.subdistrict_id)
      setValue('postal_code', selectedData.postal_code)
      setValue('address', selectedData.address)
    } else if (open) {
      reset()
    }

    setValue('customer_id', customerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedData, open])

  console.log('errors', errors)

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        title={(selectedData ? t('Edit') : t('Add')) + ' ' + t('Customer Address')}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '15px' }}></div>
          <Grid container spacing={3} marginBottom={4}>
            <Grid item xs={12} md={6}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    {...errorInput(errors, 'name')}
                    label={t('Recipient Name')}
                    variant='outlined'
                    size='small'
                    fullWidth
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
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size='small'>
                {(!loadingGetDetailLocation || selectedData?.address.length == 0) && (
                  <Controller
                    name='subdistrict_id'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <SelectCustom
                        serverSide
                        {...field}
                        options={locationData ?? []}
                        optionKey='id'
                        onSelect={(data: SubDistrictDetailType, value) => {
                          setSelectLocation(data)
                          setValue('subdistrict_id', value, {
                            shouldValidate: true,
                            shouldDirty: true
                          })
                          setValue('district_id', data.district_id)
                          setValue('province_id', data.province_id)
                          setValue('country_id', 62)
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
                    <CustomTextField
                      {...field}
                      fullWidth
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
                  <CustomTextField
                    {...field}
                    size='small'
                    fullWidth
                    label={t('Address')}
                    rows={3}
                    multiline
                    {...errorInput(errors, 'address')}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='is_primary'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox checked={field.value} onChange={field.onChange} name={field.name} />
                    }
                    label={t('Primary Address')}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Box mt={5} sx={{ display: 'flex', justifyContent: 'end' }}>
            <Button variant='tonal' color='secondary' onClick={handleClose}>
              {t('Cancel')}
            </Button>
            <Button type='submit' variant='contained' sx={{ ml: 3 }}>
              {t('Submit')}
            </Button>
          </Box>
        </form>
      </Dialog>
    </>
  )
}

export default FormCustomerAddressDialog
