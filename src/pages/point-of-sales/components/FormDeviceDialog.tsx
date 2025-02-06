// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports

// ** Types Imports
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { Grid } from '@mui/material'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { DeviceData, DeviceType } from 'src/types/apps/vendor/settings/point-of-sales/device'
import { deviceService } from 'src/services/vendor/settings/point-of-sales/device'
import { outletService } from 'src/services/outlet/outlet'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { DeviceSchema } from 'src/types/apps/vendor/settings/point-of-sales/device'
import { useTranslation } from 'react-i18next'

interface FormOutletType {
  open: boolean
  toggle: () => void
  selectedData: DeviceType | null
  setSelectedData: (value: DeviceType | null) => void
}

const FormDeviceDialog = (props: FormOutletType) => {
  const { t } = useTranslation()
  // ** Props
  const { open, toggle, selectedData } = props

  const [defaultOutletId, setDefaultOutletId] = useState<number | undefined>()
  const [outletId, setOutletId] = useState<number | undefined>()
  const [outletData, setOutletData] = useState<OutletType[]>([])

  // ** Hooks
  const queryClient = useQueryClient()
  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm<DeviceData>({
    mode: 'all',
    resolver: yupResolver(DeviceSchema)
  })

  const { isLoading: isLoadingOutlet } = useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      setOutletData(data.data.data)

      if (data.data.data.length > 0) {
        const defaultOutlet = data.data.data.filter(item => item.is_default)
        if (defaultOutlet.length > 0) setDefaultOutletId(defaultOutlet[0].id)
        else setDefaultOutletId(data.data.data[0].id)

        if (data.data.data.length === 1) {
          setOutletId(data.data.data[0].id)
        }
      }
    }
  })

  const { mutate, isLoading } = useMutation(deviceService.create, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      toggle()
      reset()
      queryClient.invalidateQueries('device-list')
    }
  })

  const update = useMutation(deviceService.update, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      toggle()
      reset()
      queryClient.invalidateQueries('device-list')
    }
  })

  const onSubmit = (data: DeviceData) => {
    if (props.selectedData !== null) {
      update.mutate({ id: props.selectedData.id, data: data })
    } else {
      mutate(data)
    }
  }

  const handleClose = () => {
    props.setSelectedData(null)
    toggle()
    reset()
  }

  useEffect(() => {
    if (outletId) {
      setValue('outlet_id', outletId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outletId])

  useEffect(() => {
    if (open && defaultOutletId) {
      if (!selectedData) {
        setValue('device_name', '')

        setValue('outlet_id', defaultOutletId)
        setOutletId(defaultOutletId)
      } else {
        setValue('device_name', selectedData.device_name)
        setValue('outlet_id', selectedData.outlet_id)
        setOutletId(selectedData.outlet_id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedData, defaultOutletId])

  console.log('errors', errors)

  return (
    <Dialog
      maxWidth='xs'
      open={open}
      onClose={handleClose}
      title={(props.selectedData !== null ? t('Edit') : t('Add')) + ' ' + t('Device')}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name='device_name'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  autoFocus
                  fullWidth
                  label={t('Device Name')}
                  placeholder='Samsung Galaxy S21'
                  error={Boolean(errors.device_name)}
                  {...(errors.device_name && { helperText: errors.device_name.message })}
                />
              )}
            />
          </Grid>
          {!isLoadingOutlet && outletData.length > 1 && (
            <>
              <Grid item xs={12}>
                <Controller
                  name='outlet_id'
                  control={control}
                  rules={{ required: true }}
                  render={field => (
                    <SelectCustom
                      value={field.field.value}
                      fullWidth
                      label={'Outlet'}
                      options={outletData}
                      optionKey='id'
                      labelKey='name'
                      onSelect={value => {
                        setValue('outlet_id', value.id)
                      }}
                    />
                  )}
                />
              </Grid>
            </>
          )}
        </Grid>
        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' type='button' onClick={handleClose}>
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

export default FormDeviceDialog
