import { Button, Grid, GridProps, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useMutation, useQuery } from 'react-query'
import { vendorSettingService } from 'src/services/vendor/setting'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { VendorProductSettingData, VendorProductSettingSchema } from 'src/types/apps/vendor/setting'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import MuiSwitch from 'src/pages/settings/components/Switch'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'

const GridLabel = ({
  alignItems = 'center',
  ...props
}: {
  children: React.ReactNode
  alignItems?: 'center' | 'start' | 'flex-end'
} & Omit<GridProps, ''>) => (
  <Grid
    {...props}
    sx={{
      display: 'flex',
      alignItems: alignItems,
      justifyContent: 'start',
      paddingRight: '10px',
      ...(alignItems == 'start' && { marginTop: '10px' })
    }}
  />
)

const GeneralTab = () => {
  const { checkPermission } = useAuth()
  const { t } = useTranslation()
  const { handleSubmit, control, setValue } = useForm<VendorProductSettingData>({
    mode: 'all',
    resolver: yupResolver(VendorProductSettingSchema)
  })

  useQuery('productSetting', vendorSettingService.getVendorSetting, {
    onSuccess: data => {
      setValue('is_allow_negative_stock_sales', data.data.data.is_allow_negative_stock_sales)
      setValue(
        'can_delete_product_when_already_ordered',
        data.data.data.can_delete_product_when_already_ordered
      )
    },
    enabled: checkPermission('setting - product.read')
  })

  const { mutate: updateProductSetting } = useMutation(vendorSettingService.updateProductSetting, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
    }
  })

  const onSubmit = (data: VendorProductSettingData) => {
    if (checkPermission('setting - product.update')) updateProductSetting(data)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        margin: 4,
        gap: 4,
        flex: 1
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <GridLabel item xs={12} sm={3}>
            <Typography variant='body1'>{t('Allow Negative Stock Sales')}</Typography>
          </GridLabel>
          <Grid item xs={12} sm={9}>
            <Controller
              name={'is_allow_negative_stock_sales'}
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
          </Grid>
          <GridLabel item xs={12} sm={3}>
            <Typography variant='body1'>{t('Can Delete Product When Already Ordered')}</Typography>
          </GridLabel>
          <Grid item xs={12} sm={9}>
            <Controller
              name={'can_delete_product_when_already_ordered'}
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
          </Grid>

          {checkPermission('setting - product.update') && (
            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                {t('Save')}
              </Button>
            </Grid>
          )}
        </Grid>
      </form>
    </Box>
  )
}

export default GeneralTab
