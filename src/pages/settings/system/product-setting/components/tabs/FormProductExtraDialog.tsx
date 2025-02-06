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
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'
import { OutletType } from 'src/types/apps/outlet/outlet'
import {
  Checkbox,
  Grid,
  IconButton,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ProductExtraData, ProductExtraSchema, ProductExtraType } from 'src/types/apps/productExtra'
import { productExtraService } from 'src/services/product/extra'
import FilterOutlet from 'src/components/filter/FilterOutlet'
import RadioButtonCustom from 'src/components/form/RadioButtonCustom'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { Icon } from '@iconify/react'

interface FormOutletType {
  open: boolean
  toggle: () => void
  selectedData: ProductExtraType | null
  setSelectedData: (value: ProductExtraType | null) => void
}

const FormProductExtraDialog = (props: FormOutletType) => {
  const { t } = useTranslation()
  // ** Props
  const { open, toggle, selectedData } = props

  const [outletIds, setOutletIds] = useState<number[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [outletData, setOutletData] = useState<OutletType[]>([])
  const [defaultOutletId, setDefaultOutletId] = useState<number | undefined>()

  // ** Hooks
  const queryClient = useQueryClient()
  const {
    reset,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors }
  } = useForm<ProductExtraData>({
    mode: 'all',
    resolver: yupResolver(ProductExtraSchema)
  })

  const { mutate, isLoading } = useMutation(productExtraService.post, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      toggle()
      reset()
      queryClient.invalidateQueries('product-extra-list')
    }
  })

  const update = useMutation(productExtraService.patch, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      toggle()
      reset()
      queryClient.invalidateQueries('product-extra-list')
    }
  })

  const onSubmit = (data: ProductExtraData) => {
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
    if (outletIds) {
      setValue('outlet_ids', outletIds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outletIds])

  useEffect(() => {
    if (open && defaultOutletId) {
      if (!selectedData) {
        reset({
          outlet_ids: [defaultOutletId],
          name: '',
          type: 'OPTIONAL',
          choice_type: 'SINGLE',
          minimum_choice: 0,
          maximum_choice: 10,
          is_active: true,
          items: []
        })
      } else {
        setValue('name', selectedData.name, {
          shouldValidate: true
        })
        setValue('outlet_ids', selectedData.outlet_ids)
        setValue('type', selectedData.type)
        setValue('choice_type', selectedData.choice_type)
        setValue('minimum_choice', selectedData.minimum_choice)
        setValue('maximum_choice', selectedData.maximum_choice)
        setValue('is_active', selectedData.is_active)
        setValue('items', selectedData.items)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedData, defaultOutletId])

  console.log('errors', errors)

  return (
    <Dialog
      maxWidth='md'
      open={open}
      onClose={handleClose}
      title={(props.selectedData !== null ? t('Edit') : t('Add')) + ' ' + t('Product Extra')}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={8}>
          <Grid item xs={12} md={6} container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    autoFocus
                    fullWidth
                    label={t('Name')}
                    placeholder='Extra Jelly'
                    error={Boolean(errors.name)}
                    {...(errors.name && { helperText: errors.name.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='outlet_ids'
                control={control}
                render={({ field }) => (
                  <FilterOutlet
                    value={field.value}
                    onChange={value => setOutletIds(value ?? [])}
                    setOutlets={value => {
                      if (value.length == 1) {
                        setDefaultOutletId(value[0].id)
                      }
                      setOutletData(value)
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <InputLabel>{t('Type')}</InputLabel>
              <Controller
                name='type'
                control={control}
                render={({ field }) => (
                  <RadioButtonCustom
                    value={field.value ?? 'OPTIONAL'}
                    onChange={value =>
                      field.onChange('type', value.value as 'REQUIRED' | 'OPTIONAL')
                    }
                    options={[
                      {
                        label: 'Optional',
                        value: 'OPTIONAL'
                      },
                      {
                        label: 'Required',
                        value: 'REQUIRED'
                      }
                    ]}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <InputLabel>{t('Choice Type')}</InputLabel>
              <Controller
                name='choice_type'
                control={control}
                render={({ field }) => (
                  <RadioButtonCustom
                    value={field.value ?? 'SINGLE'}
                    onChange={value => field.onChange('type', value.value as 'MULTIPLE' | 'SINGLE')}
                    options={[
                      {
                        label: 'Single',
                        value: 'SINGLE'
                      },
                      {
                        label: 'Multiple',
                        value: 'MULTIPLE'
                      }
                    ]}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <InputLabel>{t('Minimum Choice')}</InputLabel>
              <Controller
                name='minimum_choice'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextFieldNumber
                    {...field}
                    autoFocus
                    fullWidth
                    isFloat
                    placeholder='0'
                    error={Boolean(errors.minimum_choice)}
                    {...(errors.minimum_choice && { helperText: errors.minimum_choice.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <InputLabel>{t('Maximum Choice')}</InputLabel>
              <Controller
                name='maximum_choice'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextFieldNumber
                    {...field}
                    autoFocus
                    fullWidth
                    isFloat
                    placeholder='10'
                    error={Boolean(errors.maximum_choice)}
                    helperText={errors.maximum_choice?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} md={6} container spacing={2} sx={{ height: 'fit-content' }}>
            <Grid
              item
              xs={12}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 'fit-content'
              }}
            >
              <Typography variant='h6'>{t('Extra Items')}</Typography>
              <Button
                variant='contained'
                onClick={() => {
                  setValue(
                    'items',
                    [
                      ...getValues('items'),
                      {
                        name: '',
                        selling_price: 0,
                        is_active: true
                      }
                    ],
                    { shouldValidate: true }
                  )
                }}
              >
                {t('Add Item')}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  border: theme => `1px solid ${theme.palette.divider}`,
                  borderRadius: 2
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        // first
                        '& th:first-of-type': {
                          pl: theme => `${theme.spacing(4)} !important`
                        },
                        // last
                        '& th:last-of-type': {
                          pr: theme => `${theme.spacing(4)} !important`
                        }
                      }}
                    >
                      <TableCell sx={{ p: 2 }}>{t('Name')}</TableCell>
                      <TableCell sx={{ p: 2 }}>{t('Price')}</TableCell>
                      <TableCell sx={{ p: 2 }}>{t('Active')}</TableCell>
                      <TableCell sx={{ p: 2 }}>{t('Action')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <Controller
                    name='items'
                    control={control}
                    render={({ field: { value } }) =>
                      (value ?? []).length > 0 ? (
                        <TableBody>
                          {(value ?? []).map((item, index) => {
                            return (
                              <TableRow
                                key={index}
                                sx={{
                                  verticalAlign: 'top', // first
                                  '& td:first-of-type': {
                                    pl: theme => `${theme.spacing(4)} !important`
                                  },
                                  // last
                                  '& td:last-of-type': {
                                    pr: theme => `${theme.spacing(4)} !important`
                                  }
                                }}
                              >
                                <TableCell sx={{ p: 2 }}>
                                  <Controller
                                    name={`items.${index}.name`}
                                    control={control}
                                    render={({ field }) => (
                                      <CustomTextField
                                        {...field}
                                        autoFocus
                                        fullWidth
                                        placeholder='Extra Jelly'
                                        error={Boolean(errors.items?.[index]?.name)}
                                        helperText={errors.items?.[index]?.name?.message}
                                      />
                                    )}
                                  />
                                </TableCell>
                                <TableCell sx={{ p: 2 }}>
                                  <Controller
                                    name={`items.${index}.selling_price`}
                                    control={control}
                                    render={({ field }) => (
                                      <TextFieldNumber
                                        {...field}
                                        autoFocus
                                        fullWidth
                                        isFloat
                                        prefix='Rp '
                                        placeholder='0'
                                        error={Boolean(errors.items?.[index]?.selling_price)}
                                        // {...(errors.items?.[index]?.selling_price && {
                                        //   helperText: errors.items?.[index]?.selling_price.message
                                        // })}
                                      />
                                    )}
                                  />
                                </TableCell>
                                <TableCell sx={{ p: 2 }}>
                                  <Controller
                                    name={`items.${index}.is_active`}
                                    control={control}
                                    render={({ field }) => (
                                      <Checkbox
                                        checked={field.value}
                                        onChange={e => field.onChange(e.target.checked)}
                                      />
                                    )}
                                  />
                                </TableCell>
                                <TableCell sx={{ p: 2 }}>
                                  <IconButton
                                    onClick={() => {
                                      setValue(
                                        'items',
                                        getValues('items').filter((_, i) => i !== index),
                                        { shouldDirty: true, shouldValidate: true }
                                      )
                                    }}
                                  >
                                    <Icon icon='tabler:trash' fontSize={20} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      ) : (
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ p: 2, textAlign: 'center' }} colSpan={4}>
                              {t('No Data')}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      )
                    }
                  />
                </Table>
              </Box>
              {errors.items && <Typography color='error'>{errors.items.message}</Typography>}
            </Grid>
          </Grid>
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

export default FormProductExtraDialog
