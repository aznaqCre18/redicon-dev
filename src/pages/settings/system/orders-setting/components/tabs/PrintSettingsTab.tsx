import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Button,
  CircularProgress,
  InputLabel,
  List,
  ListItem,
  TextField,
  styled
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from 'react-query'
import { useAuth } from 'src/hooks/useAuth'
import MuiSwitch from 'src/pages/settings/components/Switch'
import { orderSettingService } from 'src/services/vendor/settings/order'
import {
  OrderPrintSettingData,
  OrderPrintSettingSchema,
  OrderPrintSettingType
} from 'src/types/apps/vendor/settings/order'
import { ResponseType } from 'src/types/response/response'

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

const PrintSettingsTab = () => {
  const { checkPermission } = useAuth()
  const { t } = useTranslation()

  const [orderPrintSetting, setOrderPrintSetting] = useState<OrderPrintSettingType>()

  const [showNameBusiness, setShowNameBusiness] = useState(true)

  const [showNote, setShowNote] = useState(true)

  const { handleSubmit, control, setValue } = useForm<OrderPrintSettingData>({
    mode: 'all',
    resolver: yupResolver(OrderPrintSettingSchema)
  })

  const { mutate: updateOrderPrintSetting } = useMutation(orderSettingService.updatePrintSetting, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
    }
  })

  useQuery('order-print-setting', orderSettingService.getPrintSetting, {
    onSuccess: data => {
      setOrderPrintSetting(data.data.data)

      setShowNameBusiness(data.data.data.show_outlet_name)
      setShowNote(data.data.data.show_note)

      setValue('show_logo', data.data.data.show_logo)
      setValue('outlet_name', data.data.data.outlet_name)
      setValue('show_outlet_address', data.data.data.show_outlet_address)
      setValue('show_customer_name', data.data.data.show_customer_name)
      setValue('show_customer_address', data.data.data.show_customer_address)
      setValue('show_customer_contact', data.data.data.show_customer_contact)
      setValue('show_unit_price', data.data.data.show_unit_price)
      setValue('show_msku', data.data.data.show_msku)
      setValue('show_vsku', data.data.data.show_vsku)
      setValue('show_rack', data.data.data.show_rack)
      setValue('show_shipping_price', data.data.data.show_shipping_price)
      setValue('show_shipping_type', data.data.data.show_shipping_type)
      setValue('show_payment_method', data.data.data.show_payment_method)
      setValue('note', data.data.data.note)
      setValue('show_barcode', data.data.data.show_barcode)
    },
    enabled: checkPermission('setting - order.read')
  })

  const onSubmit = (data: OrderPrintSettingData) => {
    if (orderPrintSetting && checkPermission('setting - order.update'))
      updateOrderPrintSetting({
        id: orderPrintSetting?.id,
        data: data
      })
  }

  useEffect(() => {
    setValue('show_outlet_name', showNameBusiness)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNameBusiness])

  useEffect(() => {
    setValue('show_note', showNote)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNote])

  if (!orderPrintSetting) return <CircularProgress />

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
            gridTemplateColumns: 'min(240px) 1fr'
          }
        }}
      >
        <MuiBorderBox>
          <MuiListItem>
            <InputLabel>{t('Show Logo')}</InputLabel>
            <Controller
              name={'show_logo'}
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value}
                  onChange={(e, check) => {
                    field.onChange(check)
                  }}
                />
              )}
            />
          </MuiListItem>
          <Box display={'flex'} flexDirection={'row'} gap={2} alignItems={'center'}>
            <div>
              <MuiListItem>
                <InputLabel>{t('Show Outlet Name')}</InputLabel>
                <MuiSwitch
                  checked={showNameBusiness}
                  onChange={(e, value) => setShowNameBusiness(value)}
                />
              </MuiListItem>
            </div>
            {showNameBusiness && (
              <Controller
                name={'outlet_name'}
                control={control}
                render={({ field }) => (
                  <TextField
                    label={t('Outlet Name') ?? 'Outlet Name'}
                    size={'small'}
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                  />
                )}
              />
            )}
          </Box>
          <MuiListItem>
            <InputLabel>{t('Show Outlet Address')}</InputLabel>
            <Controller
              name={'show_outlet_address'}
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value}
                  onChange={(e, check) => {
                    field.onChange(check)
                  }}
                />
              )}
            />
          </MuiListItem>
        </MuiBorderBox>
      </List>

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
            gridTemplateColumns: 'min(240px) 1fr'
          }
        }}
      >
        <MuiBorderBox>
          <MuiListItem>
            <InputLabel>{t('Show Customer Name')}</InputLabel>
            <Controller
              name={'show_customer_name'}
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value}
                  onChange={(e, check) => {
                    field.onChange(check)
                  }}
                />
              )}
            />
          </MuiListItem>
          <MuiListItem>
            <InputLabel>{t('Show Customer Address')}</InputLabel>
            <Controller
              name={'show_customer_address'}
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value}
                  onChange={(e, check) => {
                    field.onChange(check)
                  }}
                />
              )}
            />
          </MuiListItem>
          <MuiListItem>
            <InputLabel>{t('Show Customer Contact')}</InputLabel>
            <Controller
              name={'show_customer_contact'}
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value}
                  onChange={(e, check) => {
                    field.onChange(check)
                  }}
                />
              )}
            />
          </MuiListItem>
        </MuiBorderBox>
      </List>

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
            gridTemplateColumns: 'min(240px) 1fr'
          }
        }}
      >
        <MuiBorderBox>
          <MuiListItem>
            <InputLabel>{t('Show Unit Price')}</InputLabel>
            <Controller
              name={'show_unit_price'}
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value}
                  onChange={(e, check) => {
                    field.onChange(check)
                  }}
                />
              )}
            />
          </MuiListItem>
          <MuiListItem>
            <InputLabel>{t('Show MSKU')}</InputLabel>
            <Controller
              name={'show_msku'}
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value}
                  onChange={(e, check) => {
                    field.onChange(check)
                  }}
                />
              )}
            />
          </MuiListItem>
          <MuiListItem>
            <InputLabel>{t('Show VSKU')}</InputLabel>
            <Controller
              name={'show_vsku'}
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value}
                  onChange={(e, check) => {
                    field.onChange(check)
                  }}
                />
              )}
            />
          </MuiListItem>
          <MuiListItem>
            <InputLabel>{t('Show Rack')}</InputLabel>
            <Controller
              name={'show_rack'}
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value}
                  onChange={(e, check) => {
                    field.onChange(check)
                  }}
                />
              )}
            />
          </MuiListItem>
        </MuiBorderBox>
      </List>

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
            gridTemplateColumns: 'min(240px) 1fr'
          }
        }}
      >
        <MuiBorderBox>
          <MuiListItem>
            <InputLabel>{t('Show Shipping Fee')}</InputLabel>
            <Controller
              name={'show_shipping_price'}
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value}
                  onChange={(e, check) => {
                    field.onChange(check)
                  }}
                />
              )}
            />
          </MuiListItem>
          <MuiListItem>
            <InputLabel>{t('Show Shipping Method')}</InputLabel>
            <Controller
              name={'show_shipping_type'}
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value}
                  onChange={(e, check) => {
                    field.onChange(check)
                  }}
                />
              )}
            />
          </MuiListItem>
          <MuiListItem>
            <InputLabel>{t('Show Payment Method')}</InputLabel>
            <Controller
              name={'show_payment_method'}
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value}
                  onChange={(e, check) => {
                    field.onChange(check)
                  }}
                />
              )}
            />
          </MuiListItem>
        </MuiBorderBox>
      </List>

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
            gridTemplateColumns: 'min(240px) 1fr'
          }
        }}
      >
        <MuiBorderBox>
          <Box display={'flex'} flexDirection={'row'} gap={2} alignItems={'center'} mt={1}>
            <div>
              <MuiListItem>
                <InputLabel>{t('Show Footer Note')}</InputLabel>
                <MuiSwitch checked={showNote} onChange={(e, value) => setShowNote(value)} />
              </MuiListItem>
            </div>
            {showNote && (
              <Controller
                name={'note'}
                control={control}
                render={({ field }) => (
                  <TextField
                    label={t('Note') ?? 'Note'}
                    size={'small'}
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                  />
                )}
              />
            )}
          </Box>
          <MuiListItem>
            <InputLabel>{t('Show Barcode')}</InputLabel>
            <Controller
              name={'show_barcode'}
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value}
                  onChange={(e, check) => {
                    field.onChange(check)
                  }}
                />
              )}
            />
          </MuiListItem>
        </MuiBorderBox>
      </List>

      {checkPermission('setting - order.update') && (
        <Button type='submit' variant='contained'>
          {t('Save')}
        </Button>
      )}
    </form>
  )
}

export default PrintSettingsTab
