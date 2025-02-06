import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, CircularProgress, InputLabel, List, ListItem, styled } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from 'react-query'
import RadioButtonCustom from 'src/components/form/RadioButtonCustom'
import { useAuth } from 'src/hooks/useAuth'
import { vendorSettingService } from 'src/services/vendor/setting'
import {
  VendorOrderSettingData,
  VendorOrderSettingSchema,
  VendorSettingType
} from 'src/types/apps/vendor/setting'

const MuiListItem = styled(ListItem)(() => ({
  padding: 0,
  alignItems: 'center'
}))

const MuiBorderBox = styled(Box)(() => ({
  // border: `1px solid ${theme.palette.divider}`,
  // borderRadius: theme.shape.borderRadius,
  // padding: theme.spacing(1),
  // paddingLeft: theme.spacing(3),
  // paddingRight: theme.spacing(3),

  display: 'flex',
  flexDirection: 'column',
  gap: 2
}))

const OrderTab = () => {
  const { checkPermission } = useAuth()
  const { t } = useTranslation()
  const [vendorSettingData, setVendorSettingData] = useState<VendorSettingType>()

  useQuery('vendor-setting', vendorSettingService.getVendorSetting, {
    onSuccess: data => {
      setVendorSettingData(data.data.data)
    },
    enabled: checkPermission('setting - order.read')
  })

  const { mutate: updateOrderOnlineStore } = useMutation(
    vendorSettingService.updateOrderStoreSetting,
    {
      onSuccess: data => {
        toast.success(t(data.data.message))
      }
    }
  )

  const { handleSubmit, setValue } = useForm<VendorOrderSettingData>({
    mode: 'all',
    resolver: yupResolver(VendorOrderSettingSchema)
  })

  const onSubmit = (data: VendorOrderSettingData) => {
    if (checkPermission('setting - order.update')) updateOrderOnlineStore(data)
  }

  useEffect(() => {
    if (vendorSettingData) {
      setValue('reset_order_number_type', vendorSettingData.reset_order_number_type)
      setValue('reset_order_number_type_pos', vendorSettingData.reset_order_number_type_pos)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorSettingData])

  if (!vendorSettingData) return <CircularProgress />

  return (
    <Box>
      <List
        sx={{
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '& .MuiListItem-root': {
            display: 'grid',
            gridTemplateColumns: 'min(200px) 1fr'
          }
        }}
      >
        <MuiBorderBox>
          <MuiListItem>
            <InputLabel>{t('Order ID') + ' ' + t('Online Store')}</InputLabel>
            <Box sx={{ ml: 4 }}>
              <RadioButtonCustom
                value={vendorSettingData.reset_order_number_type ?? 'NEVER'}
                options={[
                  { label: t('Daily'), value: 'DAY' },
                  { label: t('Monthly'), value: 'MONTH' },
                  { label: t('Yearly'), value: 'YEAR' },
                  { label: t('Never'), value: 'NEVER' }
                ]}
                onChange={value =>
                  setValue(
                    'reset_order_number_type',
                    value.value as 'DAY' | 'MONTH' | 'YEAR' | 'NEVER'
                  )
                }
              />
            </Box>
          </MuiListItem>

          <MuiListItem>
            <InputLabel>{t('Order ID') + ' ' + t('POS')}</InputLabel>
            <Box sx={{ ml: 4 }}>
              <RadioButtonCustom
                value={vendorSettingData.reset_order_number_type_pos ?? 'NEVER'}
                options={[
                  { label: t('Daily'), value: 'DAY' },
                  { label: t('Monthly'), value: 'MONTH' },
                  { label: t('Yearly'), value: 'YEAR' },
                  { label: t('Never'), value: 'NEVER' }
                ]}
                onChange={value =>
                  setValue(
                    'reset_order_number_type_pos',
                    value.value as 'DAY' | 'MONTH' | 'YEAR' | 'NEVER'
                  )
                }
              />
            </Box>
          </MuiListItem>
        </MuiBorderBox>
      </List>

      {checkPermission('setting - order.update') && (
        <Button variant='contained' onClick={handleSubmit(onSubmit)}>
          Save
        </Button>
      )}
    </Box>
  )
}

export default OrderTab
