import { Box, Button, Grid, InputLabel, ListItem } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import CustomTextField from 'src/@core/components/mui/text-field'
import RadioButtonCustom from 'src/components/form/RadioButtonCustom'
import { useAuth } from 'src/hooks/useAuth'
import MuiSwitch from 'src/pages/settings/components/Switch'

const MidtransTab = () => {
  const { checkPermission } = useAuth()
  const { t } = useTranslation()
  const [midtransStatusCheckout, setMidtransStatusCheckout] = useState<boolean>(false)

  return (
    <Box>
      <Grid container columnSpacing={2}>
        <Grid item xs={12} md={5}>
          <ListItem
            sx={{
              padding: 0
            }}
          >
            <InputLabel>{t('Midtrans Status Checkout')}</InputLabel>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                columnGap: 2
              }}
            >
              <MuiSwitch
                checked={midtransStatusCheckout}
                onChange={e => {
                  setMidtransStatusCheckout(e.target.checked)
                }}
              />
            </Box>
          </ListItem>
        </Grid>
        <Grid item container xs={12} md={7} rowGap={1} alignItems={'center'}>
          <Grid item xs={12} md={6}>
            <InputLabel
              sx={{
                textAlign: 'right',
                marginRight: 4
              }}
            >
              {t('Midtrans Checkout Payment')}
            </InputLabel>
          </Grid>
          <Grid item xs={12} md={6}>
            <RadioButtonCustom
              options={[
                {
                  label: 'Sandbox',
                  value: 'sandbox'
                },
                {
                  label: 'Production',
                  value: 'production'
                }
              ]}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} md={4}>
          <InputLabel>{t('Merchant ID Midtrans')}</InputLabel>
          <CustomTextField
            fullWidth
            placeholder={t('Merchant ID Midtrans') ?? 'Merchant ID Midtrans'}
            // value={state.minimumStockAlert}
            // onChange={e => onChangeState('minimumStockAlert', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InputLabel>{t('Client Key Midtrans')}</InputLabel>
          <CustomTextField
            fullWidth
            placeholder={t('Client Key Midtrans') ?? 'Client Key Midtrans'}
            // value={state.minimumStockAlert}
            // onChange={e => onChangeState('minimumStockAlert', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InputLabel>{t('Server Key Midtrans')}</InputLabel>
          <CustomTextField
            fullWidth
            placeholder={t('Server Key Midtrans') ?? 'Server Key Midtrans'}
            // value={state.minimumStockAlert}
            // onChange={e => onChangeState('minimumStockAlert', e.target.value)}
          />
        </Grid>
      </Grid>

      {checkPermission('setting - payment.update') && (
        <Button variant='contained' sx={{ mt: 4 }}>
          {t('Save')}
        </Button>
      )}
    </Box>
  )
}

export default MidtransTab
