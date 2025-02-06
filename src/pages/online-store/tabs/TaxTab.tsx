import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, InputLabel, List, ListItem, styled } from '@mui/material'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from 'react-query'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { useApp } from 'src/hooks/useApp'
import { useAuth } from 'src/hooks/useAuth'
import MuiSwitch from 'src/pages/settings/components/Switch'
import { vendorSettingService } from 'src/services/vendor/setting'
import {
  VendorSettingType,
  VendorTaxSettingData,
  VendorTaxSettingSchema
} from 'src/types/apps/vendor/setting'
import { ResponseType } from 'src/types/response/response'

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

const TaxTab = () => {
  const { checkPermission } = useAuth()
  const { errorInput } = useApp()
  const { t } = useTranslation()
  const [isFixTaxProductActive, setIsFixTaxProductActive] = useState<boolean>(false)
  const [isShippingTaxByWeightActive, setIsShippingTaxByWeightActive] = useState<boolean>(false)

  const [vendorSetting, setVendorSetting] = useState<VendorSettingType>()

  const { handleSubmit, control, formState, setValue } = useForm<VendorTaxSettingData>({
    defaultValues: {
      is_shipping_tax_by_weight_checkout_active: false,
      shipping_tax_by_weight: 0
    },
    mode: 'all',
    resolver: yupResolver(VendorTaxSettingSchema)
  })

  useQuery('productSetting', vendorSettingService.getVendorSetting, {
    onSuccess: data => {
      setVendorSetting(data.data.data)
    },
    enabled: checkPermission('online store - tax.read')
  })

  const { mutate: updateTaxSetting } = useMutation(vendorSettingService.updateTaxSetting, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
    }
  })

  const onSubmit = (data: VendorTaxSettingData) => {
    if (!checkPermission('online store - tax.update')) return

    updateTaxSetting(data)
  }

  useEffect(() => {
    if (vendorSetting) {
      setValue(
        'is_shipping_tax_by_weight_checkout_active',
        vendorSetting.is_shipping_tax_by_weight_checkout_active
      )
      setValue('shipping_tax_by_weight', vendorSetting.shipping_tax_by_weight)
      setValue(
        'is_fix_tax_product_checkout_active',
        vendorSetting.is_fix_tax_product_checkout_active
      )

      setIsShippingTaxByWeightActive(vendorSetting.is_shipping_tax_by_weight_checkout_active)
      setIsFixTaxProductActive(vendorSetting.is_fix_tax_product_checkout_active)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorSetting])

  useEffect(() => {
    console.log(formState.errors)
  }, [formState.errors])

  if (!vendorSetting) return <div>Loading...</div>

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
              gridTemplateColumns: 'min(420px) 1fr'
            }
          }}
        >
          <MuiBorderBox>
            <MuiListItem>
              <InputLabel>{t('Active Fix Tax Product in Checkout')}</InputLabel>

              <MuiSwitch
                checked={isFixTaxProductActive}
                onChange={(event, checked) => {
                  setIsFixTaxProductActive(checked)

                  setValue('is_fix_tax_product_checkout_active', checked)
                }}
              />
            </MuiListItem>
            {isFixTaxProductActive && (
              <MuiListItem>
                <InputLabel>{t('Mass Edit Fix Tax in Product')}</InputLabel>
                <Controller
                  control={control}
                  name='fix_tax_products'
                  render={({ field: { onChange, name, value } }) => (
                    <TextFieldNumber
                      isFloat
                      prefix='Rp '
                      label='Fix Tax Product'
                      name={name}
                      value={value}
                      onChange={onChange}
                      error={Boolean(formState.errors.fix_tax_products)}
                      helperText={formState.errors.fix_tax_products?.message}
                    />
                  )}
                />
              </MuiListItem>
            )}
            <MuiListItem>
              <InputLabel>{t('Active Shipping Tax by Weight in Checkout')}</InputLabel>
              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: 2
                }}
              >
                <MuiSwitch
                  checked={isShippingTaxByWeightActive}
                  onChange={(event, checked) => {
                    setIsShippingTaxByWeightActive(checked)

                    setValue('is_shipping_tax_by_weight_checkout_active', checked)
                  }}
                />
              </Box>
            </MuiListItem>
            {isShippingTaxByWeightActive && (
              <MuiListItem>
                <InputLabel>{t('Shipping Tax per Kg')}</InputLabel>
                <Controller
                  control={control}
                  name='shipping_tax_by_weight'
                  render={({ field: { value, ...field } }) => (
                    <TextFieldNumber
                      isFloat
                      prefix='Rp '
                      value={value ?? 0}
                      {...field}
                      {...errorInput(formState.errors, 'shipping_tax_by_weight')}
                    />
                  )}
                />
              </MuiListItem>
            )}
          </MuiBorderBox>
        </List>

        {checkPermission('online store - tax.update') && (
          <Button type='submit' variant='contained' sx={{ mt: 4 }}>
            {t('Save')}
          </Button>
        )}
      </Box>
    </form>
  )
}

export default TaxTab
