// ** React Imports
import { useEffect } from 'react'

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
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'
import { Grid } from '@mui/material'
import { SupplierData, SupplierSchema } from 'src/types/apps/supplier'
import { supplierService } from 'src/services/supplier'
import { useTranslation } from 'react-i18next'
import { useApp } from 'src/hooks/useApp'

interface FormType {
  open: boolean
  toggle: () => void
  selectedData: string | null
}

const FormDialogSupplier = (props: FormType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  // ** Props
  const { open, toggle } = props

  // ** Hooks
  const queryClient = useQueryClient()
  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm<SupplierData>({
    mode: 'all',
    resolver: yupResolver(SupplierSchema)
  })

  const { mutate, isLoading } = useMutation(supplierService.create, {
    onSuccess: (data: any) => {
      toast.success(t((data as unknown as ResponseType).data.message))

      reset({
        name: '',
        address: '',
        phone_number: '',
        credit_term: 0
      })
      // handleClose()
      queryClient.invalidateQueries('supplier-list')
    }
  })

  const getData = useMutation(supplierService.getOne, {
    onSuccess: (data: any) => {
      setValue('name', data.data.data.name, {
        shouldValidate: true
      })
      setValue('address', data.data.data.address)
      setValue('phone_number', data.data.data.phone_number)
      setValue('credit_term', data.data.data.credit_term)
    }
  })

  const update = useMutation(supplierService.update, {
    onSuccess: (data: any) => {
      toast.success(t((data as unknown as ResponseType).data.message))
      handleClose()
      queryClient.invalidateQueries('supplier-list')
    }
  })

  const onSubmit = (data: SupplierData) => {
    if (props.selectedData !== null) {
      update.mutate({ id: props.selectedData, data: data })
    } else {
      mutate(data)
    }
  }

  useEffect(() => {
    if (props.selectedData && open) {
      getData.mutate(props.selectedData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedData, open])

  const handleClose = () => {
    toggle()
    reset()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={
        props.selectedData !== null
          ? `${t('Edit')} ${t('Supplier')}`
          : `${t('Add')} ${t('Supplier')}`
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Controller
              name='name'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={`${t('Name')} Supplier`}
                  placeholder='Supplier Cikini'
                  {...errorInput(errors, 'name')}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name='phone_number'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='number'
                  label={t('Phone')}
                  placeholder='081xxx'
                  {...errorInput(errors, 'phone_number')}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} mb={2}>
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
                  label={t('Address')}
                  placeholder='Jl. xxx'
                  {...errorInput(errors, 'address')}
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Controller
            name='credit_term'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='number'
                label={t('Credit Term') + ' (' + t('Days') + ')'}
                {...errorInput(errors, 'credit_term')}
              />
            )}
          />
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

export default FormDialogSupplier
