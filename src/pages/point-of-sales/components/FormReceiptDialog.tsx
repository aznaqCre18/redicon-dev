import { yupResolver } from '@hookform/resolvers/yup'
import { Icon } from '@iconify/react'
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  Switch,
  Table,
  TableBody,
  TextField,
  Typography,
  styled
} from '@mui/material'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'
import RadioButtonCustom from 'src/components/form/RadioButtonCustom'
import Select, { SelectOption } from 'src/components/form/select/Select'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { useApp } from 'src/hooks/useApp'
import { useAuth } from 'src/hooks/useAuth'
import { useData } from 'src/hooks/useData'
import MuiSwitch from 'src/pages/settings/components/Switch'
import { receiptService } from 'src/services/vendor/settings/point-of-sales/receipt'
import {
  ReceiptSchema,
  ReceiptSettingData,
  ReceiptSettingType
} from 'src/types/apps/vendor/settings/point-of-sales/receipt'
import { ResponseType } from 'src/types/response/response'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import Dialog from 'src/views/components/dialogs/Dialog'

const MuiListItem = styled(ListItem)(() => ({
  padding: 0,
  alignItems: 'center'
}))

const MuiBorderBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),

  display: 'flex',
  flexDirection: 'column',
  gap: 2
}))

type FormReceiptDialogType = {
  open: boolean
  toggle: () => void
  selectedData: ReceiptSettingType | null
  setSelectedData: (value: ReceiptSettingType | null) => void
}

const defaultValues: ReceiptSettingData = {
  outlet_id: 0,
  vendor_id: 0,
  destination_name: '',
  is_separate_print: 1,
  is_show_logo: 1,
  is_show_receipt_code: 1,
  is_show_receipt_number: 1,
  is_show_queue_number: 1,
  is_show_unit: 1,
  is_show_customer_address: 1,
  is_show_total_quantity: 1,
  is_show_price_type: 1,
  is_show_form_feedback: 1,
  feedback_form_type: 'Off',
  header: '',
  footer: '',
  feedback_url: '',
  receipt_number: '',
  is_show_brand_name: 1,
  is_show_merchant_name: true,
  is_show_outlet_name: 1,
  is_show_outlet_address: 1,
  is_show_outlet_email: 1,
  is_show_outlet_phone: 1,
  is_show_table_name: true,
  is_show_employee_name: true,
  is_show_order_type: true,
  is_show_order_date: true,
  is_show_cashier_name: true,
  is_show_customer_name: 1,
  is_show_customer_points: 1,
  is_show_product_prices: 1,
  is_show_subtotal: 1,
  is_show_tax: 1,
  is_show_service_charge: 1,
  is_show_total_discount: 1,
  is_show_rounding: 1,
  is_show_total: 1,
  is_show_paid: 1,
  is_show_change: 1,
  is_show_insta_pos_logo: 1,
  bottom_margin: 1,
  receipt_number_format: 1,
  online_receipt_text: 'Off',
  notes: ''
}

const FormReceiptDialog = (props: FormReceiptDialogType) => {
  const { errorInput } = useApp()
  const { toggle, open } = props
  const { checkPermission, bussiness } = useAuth()
  const { t } = useTranslation()

  const { outletData } = useData()

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ReceiptSettingData>({
    mode: 'all',
    resolver: yupResolver(ReceiptSchema),
    defaultValues: defaultValues
  })

  const [preview80mm, setPreview80mm] = useState<boolean>(true)

  const [outletListData, setOutletListData] = useState<SelectOption[]>([])

  const [outletSelect, setOutletSelect] = useState<string | undefined>(undefined)

  useEffect(() => {
    setValue('outlet_id', outletSelect as any)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outletSelect])

  useEffect(() => {
    if (outletData) {
      if (outletData.length > 0) {
        setOutletListData([
          // { value: 'all', label: 'All Outlet' },
          ...outletData.map(item => ({
            value: item.id.toString(),
            label: item.name
          }))
        ])

        const defaultOutlet = outletData.filter(item => item.is_default)
        if (defaultOutlet.length > 0) {
          setOutletSelect(defaultOutlet[0].id.toString())
        } else {
          setOutletSelect(outletData[0].id.toString())
        }
      } else {
        toast.error('Tidak ada data outlet yang aktif')
      }
    }
  }, [outletData])

  const queryClient = useQueryClient()
  const { mutate: createReceipt } = useMutation(receiptService.create, {
    onSuccess: data => {
      queryClient.invalidateQueries('receipt-list')
      toast.success(t((data as unknown as ResponseType).data.message))

      handleClose()
    }
  })

  const { mutate: updateReceipt } = useMutation(receiptService.update, {
    onSuccess: data => {
      queryClient.invalidateQueries('receipt-list')

      toast.success(t((data as unknown as ResponseType).data.message))

      handleClose()
    }
  })

  const onSubmit = (data: ReceiptSettingData) => {
    if (props.selectedData === null) {
      createReceipt(data)
    } else {
      updateReceipt({
        data: data,
        id: props.selectedData.id
      })
    }
  }

  console.log('debugx errors', errors)

  const handleClose = () => {
    props.setSelectedData(null)
    toggle()
    reset()
  }

  useEffect(() => {
    if (props.selectedData !== null) {
      reset(props.selectedData)
    } else {
      reset(defaultValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedData])

  return (
    <Dialog
      maxWidth='lg'
      open={open}
      onClose={handleClose}
      title={(props.selectedData !== null ? t('Edit') : t('Add')) + ' ' + t('Receipt')}
    >
      <Box>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container py={0} columnSpacing={8}>
            <Grid item xs={6}>
              <Controller
                name='destination_name'
                control={control}
                render={({ field }) => (
                  <List
                    sx={{
                      padding: 0,
                      margin: 0,
                      marginBottom: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      '& .MuiListItem-root': {
                        display: 'grid',
                        gridTemplateColumns: 'min(240px) 1fr'
                      }
                    }}
                  >
                    <MuiListItem>
                      <InputLabel>{t('Destination Name')}</InputLabel>
                      <TextField
                        {...field}
                        size='small'
                        {...errorInput(errors, 'destination_name')}
                      />
                    </MuiListItem>
                  </List>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name='outlet_id'
                control={control}
                render={({ field }) => (
                  <List
                    sx={{
                      padding: 0,
                      margin: 0,
                      marginBottom: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      '& .MuiListItem-root': {
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr'
                      }
                    }}
                  >
                    <MuiListItem>
                      <InputLabel>{t('Outlet')}</InputLabel>
                      <Select
                        options={outletListData}
                        value={field.value}
                        onChange={e => {
                          setOutletSelect((e?.target?.value as string) ?? undefined)
                        }}
                        {...errorInput(errors, 'outlet_id')}
                      />
                      <Box>
                        {checkPermission('setting - order.update') && (
                          <Button type='submit' variant='contained' sx={{ float: 'right' }}>
                            {t('Save')}
                          </Button>
                        )}
                      </Box>
                    </MuiListItem>
                  </List>
                )}
              />
            </Grid>
          </Grid>

          <Divider />

          <Grid container columnSpacing={4}>
            <Grid
              item
              xs={6}
              sx={{
                pt: 4,
                pr: 4,
                maxHeight: '70vh',
                overflow: 'auto'
              }}
            >
              <List
                sx={{
                  padding: 0,
                  margin: 0,
                  marginBottom: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  '& .MuiListItem-root': {
                    display: 'grid',
                    gridTemplateColumns: 'min(240px) 1fr'
                  }
                }}
              >
                <MuiBorderBox>
                  <Typography variant={'h5'} py={2}>
                    {t('Header')}
                  </Typography>
                  <Divider />
                  <Box mb={2}>
                    <MuiListItem>
                      <InputLabel>{t('Show Logo')}</InputLabel>
                      <Controller
                        name={'is_show_logo'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <Controller
                      name={'header'}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          fullWidth
                          label={t('Header') ?? 'Header'}
                          size={'small'}
                          value={field.value}
                          onChange={e => field.onChange(e.target.value)}
                        />
                      )}
                    />
                  </Box>
                </MuiBorderBox>

                <MuiBorderBox>
                  <Typography variant={'h5'} py={2}>
                    {t('Outlet')}
                  </Typography>
                  <Divider />
                  <Box mb={2}>
                    <MuiListItem>
                      <InputLabel>{t('Show Merchant Name')}</InputLabel>
                      <Controller
                        name={'is_show_merchant_name'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value}
                            onChange={(e, check) => {
                              field.onChange(check)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Outlet Name')}</InputLabel>
                      <Controller
                        name={'is_show_outlet_name'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Outlet Address')}</InputLabel>
                      <Controller
                        name={'is_show_outlet_address'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Outlet Email')}</InputLabel>
                      <Controller
                        name={'is_show_outlet_email'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Outlet Phone')}</InputLabel>
                      <Controller
                        name={'is_show_outlet_phone'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                  </Box>
                </MuiBorderBox>

                <MuiBorderBox>
                  <Typography variant={'h5'} py={2}>
                    {t('Receipt Detail')}
                  </Typography>
                  <Divider />
                  <Box mb={2}>
                    <MuiListItem>
                      <InputLabel>{t('Show Receipt Number')}</InputLabel>
                      <Controller
                        name={'is_show_receipt_number'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Order Date')}</InputLabel>
                      <Controller
                        name={'is_show_order_date'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value}
                            onChange={(e, check) => {
                              field.onChange(check)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Cashier Name')}</InputLabel>
                      <Controller
                        name={'is_show_cashier_name'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value}
                            onChange={(e, check) => {
                              field.onChange(check)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Customer Name')}</InputLabel>
                      <Controller
                        name={'is_show_customer_name'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Customer Address')}</InputLabel>
                      <Controller
                        name={'is_show_customer_address'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Customer Points')}</InputLabel>
                      <Controller
                        name={'is_show_customer_points'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Queue Number')}</InputLabel>
                      <Controller
                        name={'is_show_queue_number'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Table Name')}</InputLabel>
                      <Controller
                        name={'is_show_table_name'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value}
                            onChange={(e, check) => {
                              field.onChange(check)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Employee Name')}</InputLabel>
                      <Controller
                        name={'is_show_employee_name'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value}
                            onChange={(e, check) => {
                              field.onChange(check)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Order Type')}</InputLabel>
                      <Controller
                        name={'is_show_order_type'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value}
                            onChange={(e, check) => {
                              field.onChange(check)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                  </Box>
                </MuiBorderBox>

                <MuiBorderBox>
                  <Typography variant={'h5'} py={2}>
                    {t('Products')}
                  </Typography>
                  <Divider />
                  <Box mb={2}>
                    <MuiListItem>
                      <InputLabel>{t('Show Product Brand')}</InputLabel>
                      <Controller
                        name={'is_show_brand_name'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Product Prices')}</InputLabel>
                      <Controller
                        name={'is_show_product_prices'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Product Units')}</InputLabel>
                      <Controller
                        name={'is_show_unit'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                  </Box>
                </MuiBorderBox>

                <MuiBorderBox>
                  <Typography variant={'h5'} py={2}>
                    {t('Transaction Detail')}
                  </Typography>
                  <Divider />
                  <Box mb={2}>
                    <MuiListItem>
                      <InputLabel>{t('Show Subtotal')}</InputLabel>
                      <Controller
                        name={'is_show_subtotal'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Total Quantity')}</InputLabel>
                      <Controller
                        name={'is_show_total_quantity'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Tax')}</InputLabel>
                      <Controller
                        name={'is_show_tax'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Service Charge')}</InputLabel>
                      <Controller
                        name={'is_show_service_charge'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Discount')}</InputLabel>
                      <Controller
                        name={'is_show_total_discount'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Rounding')}</InputLabel>
                      <Controller
                        name={'is_show_rounding'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Total')}</InputLabel>
                      <Controller
                        name={'is_show_total'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                  </Box>
                </MuiBorderBox>

                <MuiBorderBox>
                  <Typography variant={'h5'} py={2}>
                    {t('Payment')}
                  </Typography>
                  <Divider />
                  <Box mb={2}>
                    <MuiListItem>
                      <InputLabel>{t('Show Paid')}</InputLabel>
                      <Controller
                        name={'is_show_paid'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Show Change')}</InputLabel>
                      <Controller
                        name={'is_show_change'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                  </Box>
                </MuiBorderBox>

                <MuiBorderBox>
                  <Typography variant={'h5'} py={2}>
                    {t('Footer')}
                  </Typography>
                  <Divider />
                  <Box mb={2}>
                    <Controller
                      name={'notes'}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          sx={{
                            mt: 2
                          }}
                          fullWidth
                          label={t('Notes') ?? 'Notes'}
                          size={'small'}
                          value={field.value}
                          onChange={e => field.onChange(e.target.value)}
                        />
                      )}
                    />
                    <MuiListItem>
                      <InputLabel>{t('Online Receipt Type')}</InputLabel>
                      <Controller
                        name={'online_receipt_text'}
                        control={control}
                        render={({ field }) => (
                          <RadioButtonCustom
                            sx={{
                              ml: 3
                            }}
                            options={[
                              { value: 'Off', label: t('Off') },
                              { value: 'URL', label: t('URL') },
                              { value: 'QR', label: t('QR') }
                            ]}
                            value={field.value}
                            onChange={value => {
                              setValue('online_receipt_text', value.value as unknown as string)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Feedback Form Type')}</InputLabel>
                      <Controller
                        name={'feedback_form_type'}
                        control={control}
                        render={({ field }) => (
                          <RadioButtonCustom
                            sx={{
                              ml: 3
                            }}
                            options={[
                              { value: 'Off', label: t('Off') },
                              { value: 'URL', label: t('URL') },
                              { value: 'QR', label: t('QR') }
                            ]}
                            value={field.value}
                            onChange={value => {
                              if (value.value == 'Off') {
                                setValue('is_show_form_feedback', 0)
                              }
                              setValue('feedback_form_type', value.value as unknown as string)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <Controller
                      name={'feedback_url'}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          sx={{
                            mt: 2
                          }}
                          fullWidth
                          label={t('Feedback Form URL') ?? 'Feedback Form URL'}
                          size={'small'}
                          value={field.value}
                          onChange={e => field.onChange(e.target.value)}
                        />
                      )}
                    />
                    <Controller
                      name={'footer'}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          sx={{
                            mt: 2
                          }}
                          fullWidth
                          label={t('Footer') ?? 'Footer'}
                          size={'small'}
                          value={field.value}
                          onChange={e => field.onChange(e.target.value)}
                        />
                      )}
                    />
                    <MuiListItem>
                      <InputLabel>{t('Show Motapos Logo')}</InputLabel>
                      <Controller
                        name={'is_show_insta_pos_logo'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                    <Controller
                      name={'bottom_margin'}
                      control={control}
                      render={({ field }) => (
                        <MuiListItem>
                          <InputLabel>{t('Bottom Margin')}</InputLabel>
                          <Box display={'flex'} alignItems={'center'} gap={1} ml={'auto'}>
                            <IconButton onClick={() => setValue('bottom_margin', field.value - 1)}>
                              <Icon icon={'mdi:minus'} />
                            </IconButton>
                            <TextFieldNumber
                              sx={{
                                mt: 2,
                                width: '60px',
                                // center
                                '& input': {
                                  textAlign: 'center'
                                }
                              }}
                              size={'small'}
                              value={field.value ?? 0}
                              onChange={e => field.onChange(e ?? 0)}
                            />
                            <IconButton onClick={() => setValue('bottom_margin', field.value + 1)}>
                              <Icon icon={'mdi:plus'} />
                            </IconButton>
                          </Box>
                        </MuiListItem>
                      )}
                    />
                  </Box>
                </MuiBorderBox>

                <MuiBorderBox>
                  <Typography variant={'h5'} py={2}>
                    {t('Other')}
                  </Typography>
                  <Divider />
                  <Box mb={2}>
                    <MuiListItem>
                      <InputLabel>{t('Separate Print')}</InputLabel>
                      <Controller
                        name={'is_separate_print'}
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            sx={{ marginLeft: 'auto' }}
                            checked={field.value == 1}
                            onChange={(e, check) => {
                              field.onChange(check ? 1 : 0)
                            }}
                          />
                        )}
                      />
                    </MuiListItem>
                  </Box>
                </MuiBorderBox>
              </List>
            </Grid>

            <Grid item xs={6} p={4}>
              <Box display={'flex'} flexDirection={'row'}>
                <Typography variant={'h6'} sx={{ mb: 2 }}>
                  {t('Preview')} {preview80mm ? '80mm' : '58mm'}
                </Typography>
                <Switch
                  sx={{
                    ml: 'auto'
                  }}
                  checked={preview80mm}
                  onChange={e => {
                    setPreview80mm(e.target.checked)
                  }}
                />
              </Box>
              <Box
                display={'flex'}
                justifyContent={'center'}
                flexDirection={'row'}
                sx={{
                  maxHeight: '60vh',
                  overflow: 'auto'
                }}
              >
                <Box
                  width={preview80mm ? '80mm' : '58mm'}
                  height={'100%'}
                  bgcolor={'white'}
                  color={'black'}
                  fontSize={'3mm'}
                  padding={2}
                >
                  <Box textAlign={'center'}>
                    {watch('is_show_logo') == 1 && (
                      <img
                        alt={'logo'}
                        src={
                          outletData.find(o => o.id == watch('outlet_id'))?.logo
                            ? getImageAwsUrl(outletData.find(o => o.id == watch('outlet_id'))!.logo)
                            : '/images/logo.png'
                        }
                        width={'50mm'}
                        style={{
                          margin: '8px',
                          filter: 'grayscale(100%)'
                        }}
                      />
                    )}
                    <Box fontWeight={'bold'}>{watch('header')}</Box>
                    {watch('is_show_merchant_name') && <Box>{bussiness?.vendor_name}</Box>}
                    {watch('is_show_outlet_name') == 1 && (
                      <Box>{outletData.find(o => o.id == watch('outlet_id'))?.name}</Box>
                    )}
                    {watch('is_show_outlet_address') == 1 && (
                      <Box>
                        {outletData.find(o => o.id == watch('outlet_id'))?.address ?? 'Jl. Example'}
                      </Box>
                    )}
                    {watch('is_show_outlet_email') == 1 && (
                      <Box>
                        {outletData.find(o => o.id == watch('outlet_id'))?.email ??
                          'example@motapos.id'}
                      </Box>
                    )}
                    {watch('is_show_outlet_phone') == 1 && (
                      <Box>
                        {outletData.find(o => o.id == watch('outlet_id'))?.phone ?? '08888888888'}
                      </Box>
                    )}
                  </Box>
                  <Table>
                    <TableBody
                      sx={{
                        '& td': {
                          m: 0,
                          p: 0
                        }
                      }}
                    >
                      <tr>
                        <td colSpan={2}>
                          {preview80mm
                            ? '=============================================='
                            : '=================================='}
                        </td>
                      </tr>
                      {watch('is_show_receipt_number') == 1 && (
                        <tr>
                          <td>{t('Receipt Number')}</td>
                          <td>: Motapos App/240921/000001</td>
                        </tr>
                      )}
                      {watch('is_show_order_date') && (
                        <tr>
                          <td>{t('Time')}</td>
                          <td>: {format(new Date(), 'dd MMM yyyy HH:mm')}</td>
                        </tr>
                      )}
                      {watch('is_show_cashier_name') && (
                        <tr>
                          <td>{t('Cashier')}</td>
                          <td>: Admin Motapos</td>
                        </tr>
                      )}
                      {watch('is_show_customer_name') == 1 && (
                        <tr>
                          <td>{t('Customer')}</td>
                          <td>: Customer 123</td>
                        </tr>
                      )}
                      {watch('is_show_customer_address') == 1 && (
                        <tr>
                          <td>{t('Address')}</td>
                          <td>: Customer St. 28</td>
                        </tr>
                      )}
                      {watch('is_show_customer_points') == 1 && (
                        <tr>
                          <td>{t('Point')}</td>
                          <td>: 88</td>
                        </tr>
                      )}
                      {watch('is_show_queue_number') == 1 && (
                        <tr>
                          <td>{t('Queue')}</td>
                          <td>: 4</td>
                        </tr>
                      )}
                      {watch('is_show_table_name') && (
                        <tr>
                          <td>{t('Table2')}</td>
                          <td>: 8</td>
                        </tr>
                      )}
                      {watch('is_show_employee_name') && (
                        <tr>
                          <td>{t('Employee')}</td>
                          <td>: Budi</td>
                        </tr>
                      )}
                      {watch('is_show_order_type') && (
                        <tr>
                          <td>{t('Order Type')}</td>
                          <td>: REGULER</td>
                        </tr>
                      )}
                      {watch('is_show_receipt_number') ||
                      watch('is_show_order_date') ||
                      watch('is_show_cashier_name') ||
                      watch('is_show_customer_name') ||
                      watch('is_show_customer_address') ||
                      watch('is_show_customer_points') ||
                      watch('is_show_queue_number') ||
                      watch('is_show_table_name') ? (
                        <tr>
                          <td colSpan={2}>
                            {preview80mm
                              ? '-------------------------------------------------------------------'
                              : '-------------------------------------------------'}
                          </td>
                        </tr>
                      ) : null}
                      <tr>
                        <td>Apple Juice</td>
                        <td
                          style={{
                            textAlign: 'right'
                          }}
                        >
                          {watch('is_show_product_prices') == 1 && '(-15.000)'}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          3 {watch('is_show_unit') == 1 && 'Cup'}{' '}
                          {watch('is_show_product_prices') == 1 && 'x 10.000'}
                        </td>
                        <td
                          style={{
                            textAlign: 'right'
                          }}
                        >
                          {watch('is_show_product_prices') == 1 && '30.000'}
                        </td>
                      </tr>
                      <tr>
                        <td>Bottle</td>
                      </tr>
                      <tr>
                        <td>
                          1 {watch('is_show_unit') == 1 && 'Bottle'}{' '}
                          {watch('is_show_product_prices') == 1 && 'x 20.000'}
                        </td>
                        <td
                          style={{
                            textAlign: 'right'
                          }}
                        >
                          {watch('is_show_product_prices') == 1 && '20.000'}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>
                          {preview80mm
                            ? '-------------------------------------------------------------------'
                            : '-------------------------------------------------'}
                        </td>
                      </tr>
                      {watch('is_show_subtotal') == 1 && (
                        <tr>
                          <td>
                            {t('Subtotal')} {watch('is_show_total_quantity') == 1 && '4 Items'}
                          </td>
                          <td
                            style={{
                              textAlign: 'right'
                            }}
                          >
                            50.000
                          </td>
                        </tr>
                      )}
                      {watch('is_show_tax') == 1 && (
                        <tr>
                          <td>{t('Tax')} (10%)</td>
                          <td
                            style={{
                              textAlign: 'right'
                            }}
                          >
                            5.000
                          </td>
                        </tr>
                      )}
                      {watch('is_show_service_charge') == 1 && (
                        <tr>
                          <td>{t('Service Charge')} (10%)</td>
                          <td
                            style={{
                              textAlign: 'right'
                            }}
                          >
                            5.000
                          </td>
                        </tr>
                      )}
                      {watch('is_show_total_discount') == 1 && (
                        <tr>
                          <td>{t('Discount')}</td>
                          <td
                            style={{
                              textAlign: 'right'
                            }}
                          >
                            (-15.000)
                          </td>
                        </tr>
                      )}
                      {watch('is_show_rounding') == 1 && (
                        <tr>
                          <td>{t('Rounding')}</td>
                          <td
                            style={{
                              textAlign: 'right'
                            }}
                          >
                            0
                          </td>
                        </tr>
                      )}
                      {watch('is_show_total') == 1 && (
                        <tr>
                          <td>{t('Total')}</td>
                          <td
                            style={{
                              textAlign: 'right'
                            }}
                          >
                            45.000
                          </td>
                        </tr>
                      )}
                      {watch('is_show_subtotal') ||
                      watch('is_show_tax') ||
                      watch('is_show_service_charge') ||
                      watch('is_show_total_discount') ||
                      watch('is_show_rounding') ||
                      watch('is_show_total') ? (
                        <tr>
                          <td colSpan={2}>
                            {preview80mm
                              ? '-------------------------------------------------------------------'
                              : '-------------------------------------------------'}
                          </td>
                        </tr>
                      ) : null}
                      {watch('is_show_paid') == 1 && (
                        <tr>
                          <td>
                            {t('Paid')} - {t('Cash')}
                          </td>
                          <td
                            style={{
                              textAlign: 'right'
                            }}
                          >
                            50.000
                          </td>
                        </tr>
                      )}
                      {watch('is_show_change') == 1 && (
                        <tr>
                          <td>{t('Change Cash')}</td>
                          <td
                            style={{
                              textAlign: 'right'
                            }}
                          >
                            5.000
                          </td>
                        </tr>
                      )}
                    </TableBody>
                  </Table>
                  {watch('notes') != '' && <Box mt={2}>{watch('notes')}</Box>}
                  {watch('online_receipt_text') != 'Off' && (
                    <Box textAlign={'center'} p={2}>
                      <Box fontWeight={'bold'}>{t('Online Receipt')}</Box>
                      {watch('online_receipt_text') == 'URL' && <Box>r.instapos.com/o/24791</Box>}
                      {watch('online_receipt_text') == 'QR' && (
                        <img
                          src={
                            'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example'
                          }
                          alt='qrCode'
                          style={{ width: '20mm', height: '20mm' }}
                        />
                      )}
                    </Box>
                  )}

                  {watch('feedback_form_type') != 'Off' && (
                    <Box textAlign={'center'} p={2}>
                      <Box fontWeight={'bold'}>{t('Feedback Form')}</Box>
                      {watch('feedback_form_type') == 'URL' && <Box>{watch('feedback_url')}</Box>}
                      {watch('feedback_form_type') == 'QR' && (
                        <img
                          src={
                            'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example'
                          }
                          alt='qrCode'
                          style={{ width: '20mm', height: '20mm' }}
                        />
                      )}
                    </Box>
                  )}

                  <Box textAlign={'center'} fontWeight={'bold'}>
                    {watch('footer')}
                  </Box>

                  {watch('is_show_insta_pos_logo') == 1 && (
                    <Box textAlign={'center'}>
                      <img
                        alt='logo'
                        src={'/images/logo-red.svg'}
                        style={{ width: '30mm', filter: 'grayscale(100%)' }}
                      />
                    </Box>
                  )}

                  <Box height={watch('bottom_margin') + 'mm'}></Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Dialog>
  )
}

export default FormReceiptDialog
