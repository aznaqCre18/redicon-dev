import { Box, InputLabel, List, ListItem, styled } from '@mui/material'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import FilterOutlet from 'src/components/filter/FilterOutlet'
import MuiSwitch from 'src/pages/settings/components/Switch'
import { vendorQRISPaymentService } from 'src/services/vendor/qrisPayment'
import { DanaPaymentData } from 'src/types/apps/vendor/danaPayment'
import { ImageUpload } from 'src/components/form/ImageUpload'
import { getImageAwsUrl } from 'src/utils/imageUtils'

const MuiListItem = styled(ListItem)(() => ({
  padding: 0,
  alignItems: 'center'
}))

const MuiBorderBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
  padding: theme.spacing(1),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(3),

  display: 'flex',
  flexDirection: 'column',
  gap: 4
}))

const QrisStatisTab = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [outlet, setOutlet] = useState<number | null>(null)

  const [danaPayment, setDanaPayment] = useState<DanaPaymentData>()

  const [files, setFiles] = useState<File | null>(null)
  const [imgSrc, setImgSrc] = useState('')

  useQuery(['settings-dana-payment', outlet], {
    enabled: !!outlet,
    queryFn: () => vendorQRISPaymentService.get(outlet!),
    onSuccess: data => {
      const _data = data.data.data
      setDanaPayment(_data)

      if (_data.qr_image) setImgSrc(getImageAwsUrl(_data.qr_image as string))
    }
  })

  const { mutate } = useMutation(vendorQRISPaymentService.update, {
    onSuccess: (data: any) => {
      toast.success(t(data.data.message))

      queryClient.invalidateQueries('settings-dana-payment')
    }
  })

  const onToggleActive = (active: boolean) => {
    if (danaPayment) {
      mutate({ outlet_id: danaPayment.outlet_id, status: active, qr_image: null })
    }
  }

  useEffect(() => {
    if (files && danaPayment) {
      mutate({ outlet_id: danaPayment.outlet_id, qr_image: files, status: danaPayment.status })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])

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
            gridTemplateColumns: 'min(350px) 1fr'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', columnGap: 2 }}>
          <InputLabel>{t('Select') + ' ' + t('Outlet')}</InputLabel>
          <FilterOutlet
            multiple={false}
            label={''}
            value={outlet ? [outlet] : undefined}
            onChange={val => {
              setDanaPayment(undefined)
              setOutlet(val ? val[0] : null)
            }}
            setOutlets={val => setOutlet(val ? val[0].id : null)}
          />
        </Box>

        {danaPayment && (
          <MuiBorderBox>
            <MuiListItem
              sx={{
                mb: -2
              }}
            >
              <InputLabel>{t('Active QRIS Static')}</InputLabel>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: 2
                }}
              >
                <MuiSwitch
                  checked={danaPayment.status ?? false}
                  onChange={e => {
                    onToggleActive(e.target.checked)
                  }}
                />
              </Box>
            </MuiListItem>
            <MuiListItem sx={{ mt: 4 }}>
              <InputLabel sx={{ mr: 2, mb: 'auto' }}>{t('QRIS Image')}</InputLabel>
              <ImageUpload
                imagePreview={imgSrc}
                onChange={setFiles}
                size={{
                  height: 200,
                  width: 200
                }}
              />
            </MuiListItem>
          </MuiBorderBox>
        )}
      </List>
    </Box>
  )
}

export default QrisStatisTab
