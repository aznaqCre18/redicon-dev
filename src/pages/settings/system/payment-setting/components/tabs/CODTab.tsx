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
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from 'react-query'
import { ImageUpload } from 'src/components/form/ImageUpload'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { devMode } from 'src/configs/dev'
import { useAuth } from 'src/hooks/useAuth'
import MuiSwitch from 'src/pages/settings/components/Switch'
import { vendorSettingShippingService } from 'src/services/vendor/settings/shipping'
import {
  CodSettingData,
  CodSettingSchema,
  CodSettingType
} from 'src/types/apps/vendor/settings/shipping'
import { getImageAwsUrl } from 'src/utils/imageUtils'

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
  gap: 4
}))

const CodTab = () => {
  const { checkPermission } = useAuth()
  const { t } = useTranslation()

  const [enableCOD, setEnableCOD] = useState<boolean>(false)

  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined)
  const [files, setFiles] = useState<File | null>(null)

  const [bayardiTempatUntukProdukTertentu, setBayardiTempatUntukProdukTertentu] =
    useState<boolean>(false)
  const [bayardiTempatUntukSemuaProduk, setBayardiTempatUntukSemuaProduk] = useState<boolean>(false)

  const [codSettingData, setCodSettingData] = useState<CodSettingType>()

  useQuery('settings-shipping-cod', vendorSettingShippingService.getCodSetting, {
    onSuccess: data => {
      setCodSettingData(data.data.data)
      if (data.data.data.logo) setImgSrc(getImageAwsUrl(data.data.data.logo))
    }
  })

  const { mutate } = useMutation(vendorSettingShippingService.updateCodSetting, {
    onSuccess: data => {
      toast.success(t(data.data.message))

      if (files) {
        vendorSettingShippingService.updateMediaCodSetting(files).then(res => {
          toast.success(res.data.message)
          setFiles(null)
        })
      }
    }
  })

  const { control, handleSubmit, setValue, formState } = useForm<CodSettingData>({
    mode: 'all',
    resolver: yupResolver(CodSettingSchema)
  })

  const onSubmit = (data: CodSettingData) => {
    mutate(data)
  }

  useEffect(() => {
    if (codSettingData) {
      setEnableCOD(codSettingData.is_active)

      setValue('name', codSettingData.name)
      setValue('is_active', codSettingData.is_active)
      setValue('price', codSettingData.price)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codSettingData])

  if (!codSettingData) return <CircularProgress />

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
        <MuiBorderBox>
          <MuiListItem
            sx={{
              mb: -2
            }}
          >
            <InputLabel>{t('COD Active')}</InputLabel>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                columnGap: 2
              }}
            >
              <MuiSwitch
                defaultChecked={codSettingData.is_active}
                onChange={e => {
                  setValue('is_active', e.target.checked)
                  setEnableCOD(e.target.checked)
                }}
              />
            </Box>
          </MuiListItem>
          {enableCOD && (
            <>
              <MuiListItem>
                <InputLabel sx={{ mr: 2 }}>{t('COD Logo')}</InputLabel>
                <ImageUpload
                  imagePreview={imgSrc}
                  onChange={setFiles}
                  label='1 : 2'
                  size={{
                    height: 50,
                    width: 100
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel sx={{ mr: 2 }}>{t('Text COD')}</InputLabel>
                <Controller
                  control={control}
                  name='name'
                  render={({ field: { value, ...field } }) => (
                    <TextField
                      {...field}
                      value={value ?? ''}
                      size='small'
                      placeholder={t('Text COD') ?? 'Text COD'}
                    />
                  )}
                />
              </MuiListItem>
              {devMode && (
                <>
                  <MuiListItem>
                    <InputLabel>{t('COD for specific product only')}</InputLabel>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        columnGap: 2
                      }}
                    >
                      <MuiSwitch
                        checked={bayardiTempatUntukProdukTertentu}
                        onChange={e => {
                          setBayardiTempatUntukProdukTertentu(e.target.checked)
                        }}
                      />
                    </Box>
                  </MuiListItem>
                  <MuiListItem>
                    <InputLabel>{t('COD for all products')}</InputLabel>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        columnGap: 2
                      }}
                    >
                      <MuiSwitch
                        checked={bayardiTempatUntukSemuaProduk}
                        onChange={e => {
                          setBayardiTempatUntukSemuaProduk(e.target.checked)
                        }}
                      />
                    </Box>
                  </MuiListItem>
                  <MuiListItem>
                    <InputLabel sx={{ mr: 2 }}>{t('Minimum Purchase')}</InputLabel>
                    <TextFieldNumber
                      prefix='Rp '
                      InputProps={{
                        inputProps: {
                          min: 0
                        }
                      }}
                      placeholder={(t('Minimum Purchase') ?? 'Minimum Purchase') + ' (Rp)'}
                    />
                  </MuiListItem>
                </>
              )}
              <MuiListItem>
                <InputLabel sx={{ mr: 2 }}>{t('Additional Fee Pay On Spot')}</InputLabel>
                <Controller
                  control={control}
                  name='price'
                  render={({ field }) => (
                    <TextFieldNumber
                      {...field}
                      prefix='Rp '
                      InputProps={{
                        inputProps: {
                          min: 0
                        }
                      }}
                      placeholder={
                        (t('Additional Fee Pay On Spot') ?? 'Additional Fee Pay On Spot') + ' (Rp)'
                      }
                      error={Boolean(formState.errors.price)}
                      helperText={formState.errors.price?.message}
                    />
                  )}
                />
              </MuiListItem>
            </>
          )}
        </MuiBorderBox>
      </List>

      {checkPermission('setting - payment.update') && (
        <Button type='button' variant='contained' sx={{ mt: 4 }} onClick={handleSubmit(onSubmit)}>
          {t('Save')}
        </Button>
      )}
    </Box>
  )
}

export default CodTab
