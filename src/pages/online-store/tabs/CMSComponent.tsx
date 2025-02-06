import { List, ListItem, InputLabel, Button, Switch, Typography, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import RadioButtonCustom from 'src/components/form/RadioButtonCustom'
import {
  StoreSettingCMSData,
  StoreSettingCMSSchema,
  StoreSettingCMSType
} from 'src/types/apps/vendor/settings/store'
import { useMutation, useQuery } from 'react-query'
import { storeSettingService } from 'src/services/vendor/settings/store'
import toast from 'react-hot-toast'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'

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

const MuiSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: theme.palette.primary.main
  },
  margin: 0
}))

const CMSComponent = () => {
  const { checkPermission } = useAuth()

  const { t } = useTranslation()
  const [storeSetting, setStoreSetting] = useState<StoreSettingCMSType>()

  useQuery('store-setting-cms', storeSettingService.cms, {
    onSuccess: data => {
      setStoreSetting(data.data.data)
    }
  })

  const { mutate: updateStoreSetting } = useMutation(storeSettingService.updateCms, {
    onSuccess: data => {
      toast.success(t(data.data.message))
    }
  })

  const { control, handleSubmit, setValue } = useForm<StoreSettingCMSData>({
    mode: 'all',
    resolver: yupResolver(StoreSettingCMSSchema)
  })

  const onSubmit = (data: StoreSettingCMSData) => {
    updateStoreSetting(data)
  }

  useEffect(() => {
    if (storeSetting) {
      setValue('is_show_category_in_header', storeSetting.is_show_category_in_header)
      setValue('is_show_navigation_in_header', storeSetting.is_show_navigation_in_header)
      setValue('is_show_category_in_body', storeSetting.is_show_category_in_body)
      setValue('is_show_banners', storeSetting.is_show_banners)
      setValue('is_show_shorcuts', storeSetting.is_show_shorcuts)
      setValue('is_show_brands', storeSetting.is_show_brands)
      setValue('show_sub_category', storeSetting.show_sub_category)
      setValue('show_products_by', storeSetting.show_products_by)
      setValue('show_categories_by', storeSetting.show_categories_by)
      setValue('is_show_variant_image', storeSetting.is_show_variant_image)
      setValue('is_show_related_products', storeSetting.is_show_related_products)
      setValue('show_stock_product', storeSetting.show_stock_product)
      setValue('is_show_column_variant_one', storeSetting.is_show_column_variant_one)
      setValue('is_show_column_variant_two', storeSetting.is_show_column_variant_two)
      setValue('is_show_column_stock', storeSetting.is_show_column_stock)
      setValue('join_column_color_size_stock', storeSetting.join_column_color_size_stock)
      setValue(
        'is_show_out_of_stock_variant_product',
        storeSetting.is_show_out_of_stock_variant_product
      )
      setValue('is_show_out_of_stock_product', storeSetting.is_show_out_of_stock_product)
      setValue(
        'is_show_checkout_deadline_time_information',
        storeSetting.is_show_checkout_deadline_time_information
      )
      setValue('is_show_checkout_button', storeSetting.is_show_checkout_button)
      setValue('is_show_pay_on_spot_button', storeSetting.is_show_pay_on_spot_button)
      setValue('checkout_button_text', storeSetting.checkout_button_text)
      setValue('pay_on_spot_button_text', storeSetting.pay_on_spot_button_text)
      setValue('view_detail_product_variant', storeSetting.view_detail_product_variant ?? 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSetting])

  if (!storeSetting) return <div>Loading...</div>

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
      {checkPermission('cms.read') && (
        <>
          <List
            sx={{
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              '& .MuiListItem-root': {
                display: 'grid',
                gridTemplateColumns: 'min(280px) 1fr'
              }
            }}
          >
            <Typography fontWeight={'bold'} variant='h5' mb={1}>
              {t('Dashboard')}
            </Typography>

            <MuiBorderBox>
              <MuiListItem>
                <InputLabel>{t('Show Category In Header')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.is_show_category_in_header}
                  onChange={(event, checked) => {
                    setValue('is_show_category_in_header', checked)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Show Navigation In Header')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.is_show_navigation_in_header}
                  onChange={(event, checked) => {
                    setValue('is_show_navigation_in_header', checked)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Show Category In Body')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.is_show_category_in_body}
                  onChange={(event, checked) => {
                    setValue('is_show_category_in_body', checked)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Show Banner')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.is_show_banners}
                  onChange={(event, checked) => {
                    setValue('is_show_banners', checked)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Show Shortcut')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.is_show_shorcuts}
                  onChange={(event, checked) => {
                    setValue('is_show_shorcuts', checked)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Show Brand')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.is_show_brands}
                  onChange={(event, checked) => {
                    setValue('is_show_brands', checked)
                  }}
                />
              </MuiListItem>
            </MuiBorderBox>

            <Typography fontWeight={'bold'} variant='h5' mb={1} mt={3}>
              {t('Product')}
            </Typography>

            <MuiBorderBox>
              <MuiListItem>
                <InputLabel>{t('Show Sub Category')}</InputLabel>
                <RadioButtonCustom
                  sx={{
                    ml: 3
                  }}
                  options={[
                    { value: 1, label: t('Tab Bar') },
                    { value: 2, label: t('Category Icon') }
                  ]}
                  value={storeSetting.show_sub_category}
                  onChange={value => {
                    setValue('show_sub_category', value.value as number)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Product Sort By')}</InputLabel>
                <RadioButtonCustom
                  sx={{
                    ml: 3
                  }}
                  options={[
                    { value: 1, label: t('Newest') },
                    { value: 2, label: t('Numbering') },
                    { value: 3, label: t('Random') }
                  ]}
                  value={storeSetting.show_products_by}
                  onChange={value => {
                    setValue('show_products_by', value.value as number)
                  }}
                />
              </MuiListItem>
              <MuiListItem
                sx={{
                  my: 2
                }}
              >
                <InputLabel>{t('Category Sort By')}</InputLabel>
                <RadioButtonCustom
                  sx={{
                    ml: 3
                  }}
                  options={[
                    { value: 1, label: t('Newest') },
                    { value: 2, label: t('Numbering') },
                    { value: 3, label: t('Random') }
                  ]}
                  value={storeSetting.show_categories_by}
                  onChange={value => {
                    setValue('show_categories_by', value.value as number)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Show Detail Variant Product')}</InputLabel>
                <RadioButtonCustom
                  sx={{
                    ml: 3
                  }}
                  options={[
                    { value: 1, label: t('Table') },
                    { value: 2, label: t('Default') }
                  ]}
                  value={storeSetting.view_detail_product_variant}
                  onChange={value => {
                    setValue('view_detail_product_variant', value.value as number)
                  }}
                />
              </MuiListItem>
            </MuiBorderBox>

            <Typography fontWeight={'bold'} variant='h5' mb={1} mt={3}>
              {t('Product Detail')}
            </Typography>

            <MuiBorderBox>
              <MuiListItem>
                <InputLabel>{t('Show Variant Image')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.is_show_variant_image}
                  onChange={(event, checked) => {
                    setValue('is_show_variant_image', checked)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Show Related Products')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.is_show_related_products}
                  onChange={(event, checked) => {
                    setValue('is_show_related_products', checked)
                  }}
                />
              </MuiListItem>
              {/* <MuiListItem>
            <InputLabel>Tampilkan Informasi Ongkir</InputLabel>
            <MuiSwitch />
          </MuiListItem> */}
              {/* <MuiListItem>
            <InputLabel>Tampilkan Halaman Detail Produk</InputLabel>
            <RadioButtonCustom
              sx={{
                ml: 3
              }}
              options={[
                { value: 'default', label: 'Default' },
                { value: 'table', label: 'Table' }
              ]}
            />
          </MuiListItem> */}
              <MuiListItem>
                <InputLabel>{t('Show Stock')}</InputLabel>
                <RadioButtonCustom
                  sx={{
                    ml: 3
                  }}
                  options={[
                    { value: 1, label: t('Number2') },
                    { value: 2, label: t('Status') }
                  ]}
                  value={storeSetting.show_stock_product}
                  onChange={value => {
                    setValue('show_stock_product', value.value as number)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Show Column Color')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.is_show_column_variant_one}
                  onChange={(event, checked) => {
                    setValue('is_show_column_variant_one', checked)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Show Column Size')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.is_show_column_variant_two}
                  onChange={(event, checked) => {
                    setValue('is_show_column_variant_two', checked)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Show Column Stock')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.is_show_column_stock}
                  onChange={(event, checked) => {
                    setValue('is_show_column_stock', checked)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Join Column Column Color & Size & Stock')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.join_column_color_size_stock}
                  onChange={(event, checked) => {
                    setValue('join_column_color_size_stock', checked)
                  }}
                />
              </MuiListItem>
              {/* <MuiListItem>
            <InputLabel>Tampilkan Total Stok</InputLabel>
            <MuiSwitch />
          </MuiListItem> */}
              <MuiListItem>
                <InputLabel>{t('Show Out Of Stock Variant Product')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.is_show_out_of_stock_variant_product}
                  onChange={(event, checked) => {
                    setValue('is_show_out_of_stock_variant_product', checked)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Show Out Of Stock Product')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.is_show_out_of_stock_product}
                  onChange={(event, checked) => {
                    setValue('is_show_out_of_stock_product', checked)
                  }}
                />
              </MuiListItem>
            </MuiBorderBox>

            <Typography fontWeight={'bold'} variant='h5' mb={1} mt={3}>
              {t('Trolley')}
            </Typography>

            <MuiBorderBox>
              <MuiListItem>
                <InputLabel>{t('Show Checkout Deadline Time Information')}</InputLabel>
                <MuiSwitch
                  defaultChecked={storeSetting.is_show_checkout_deadline_time_information}
                  onChange={(event, checked) => {
                    setValue('is_show_checkout_deadline_time_information', checked)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Checkout Button')}</InputLabel>
                <Box display={'flex'} flexDirection={'row'} gap={2} alignItems={'center'}>
                  <MuiSwitch
                    defaultChecked={storeSetting.is_show_checkout_button}
                    onChange={(event, checked) => {
                      setValue('is_show_checkout_button', checked)
                    }}
                  />
                  <Controller
                    control={control}
                    name='checkout_button_text'
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    render={({ field: { value, ...field } }) => (
                      <TextField
                        label={t('Checkout Button Text') ?? 'Checkout Button Text'}
                        {...field}
                        defaultValue={storeSetting.checkout_button_text}
                        size={'small'}
                      />
                    )}
                  />
                </Box>
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Pay On Spot Button')}</InputLabel>
                <Box display={'flex'} flexDirection={'row'} gap={2} alignItems={'center'}>
                  <MuiSwitch
                    defaultChecked={storeSetting.is_show_pay_on_spot_button}
                    onChange={(event, checked) => {
                      setValue('is_show_pay_on_spot_button', checked)
                    }}
                  />

                  <Controller
                    control={control}
                    name='pay_on_spot_button_text'
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    render={({ field: { value, ...field } }) => (
                      <TextField
                        sx={{
                          mt: 2
                        }}
                        label={t('Pay On Spot Button Text') ?? 'Pay On Spot Button Text'}
                        defaultValue={storeSetting.pay_on_spot_button_text}
                        {...field}
                        size={'small'}
                      />
                    )}
                  />
                </Box>
              </MuiListItem>
            </MuiBorderBox>
          </List>
          {checkPermission('cms.update') && (
            <List
              sx={{
                padding: 0,
                margin: 0,
                '& .MuiListItem-root': {
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: 'min(280px) 1fr',
                  padding: 0,
                  margin: 0
                }
              }}
            >
              <Box
                sx={{
                  mt: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Button type='button' onClick={handleSubmit(onSubmit)} variant='contained'>
                  {t('Save')}
                </Button>
              </Box>
            </List>
          )}
        </>
      )}
    </Box>
  )
}
export default CMSComponent
