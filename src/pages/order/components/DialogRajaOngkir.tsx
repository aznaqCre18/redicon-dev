// ** React Imports
import { useState } from 'react'

// ** MUI Imports

import { Box, CircularProgress, Grid, Typography } from '@mui/material'
import { useQuery } from 'react-query'
import Dialog from 'src/views/components/dialogs/Dialog'
import { useTranslation } from 'react-i18next'
import { formatPriceIDR } from 'src/utils/numberUtils'
import { RajaOngkirData } from 'src/types/apps/rajaOngkir'
import { rajaOngkirService } from 'src/services/rajaOngkir'

interface DialogType {
  open: boolean
  toggle: () => void
  shippingName: string
  weight: number
  subdistrict_id: number
  onSelected: (data: RajaOngkirData) => void
}

const DialogRajaOngkir = ({
  open,
  toggle,
  shippingName,
  weight,
  subdistrict_id,
  onSelected
}: DialogType) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)

  const [rajaOngkirData, setRajaOngkirData] = useState<RajaOngkirData[]>([])

  useQuery(['raja-ongkir', { subdistrict_id, weight }], {
    queryFn: () => rajaOngkirService.get({ subdistrict_id, weight }),
    onSuccess: response => {
      setRajaOngkirData(response?.data?.data.data ?? [])
      setLoading(false)
    }
  })

  const handleSelected = (data: RajaOngkirData) => {
    console.log(data)

    onSelected(data)
    toggle()
  }

  return (
    <>
      <Dialog open={open} onClose={toggle} title={t('Service Shipping') + ' ' + shippingName}>
        <div style={{ marginBottom: '15px' }}></div>
        {loading ? (
          <Box textAlign='center'>
            <CircularProgress />
          </Box>
        ) : (
          <></>
        )}
        <Grid container spacing={3} marginBottom={4}>
          {rajaOngkirData
            .filter(item => item.name == shippingName)
            .map((data, index) => (
              <Grid item xs={4} key={index}>
                <Box
                  sx={theme => ({
                    border: '1px solid #e0e0e0',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  })}
                  onClick={() => handleSelected(data)}
                >
                  <Box fontWeight={'bold'} fontSize={18} mb={2}>
                    {formatPriceIDR(data.price)}
                  </Box>
                  <Box fontWeight={500}>{data.service}</Box>
                  <Typography variant='caption'>{data.name}</Typography>
                  <Box>
                    {t('Estimation')} {data.estimation.toLocaleLowerCase()}
                  </Box>
                </Box>
              </Grid>
            ))}
        </Grid>
      </Dialog>
    </>
  )
}

export default DialogRajaOngkir
