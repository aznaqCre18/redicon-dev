import { List, ListItem, InputLabel, Button, Typography, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import RadioButtonCustom from 'src/components/form/RadioButtonCustom'
import { useMutation, useQuery } from 'react-query'
import { vendorSettingService } from 'src/services/vendor/setting'
import { Controller, useForm } from 'react-hook-form'
import {
  StoreGeneralSettingData,
  StoreGeneralSettingSchema
} from 'src/types/apps/vendor/settings/store'
import { yupResolver } from '@hookform/resolvers/yup'
import { storeSettingService } from 'src/services/vendor/settings/store'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

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

// const MuiSwitch = styled(Switch)(({ theme }) => ({
//   '& .MuiSwitch-switchBase.Mui-checked': {
//     color: theme.palette.primary.main
//   },
//   margin: 0
// }))

const GeneralComponent = () => {
  const { t } = useTranslation()
  const [informationMaintenance, setInformationMaintenance] = useState<number>(1)

  const { handleSubmit, setValue, control } = useForm<StoreGeneralSettingData>({
    mode: 'all',
    resolver: yupResolver(StoreGeneralSettingSchema)
  })

  useQuery('store-general-setting', vendorSettingService.getVendorSetting, {
    onSuccess: data => {
      setValue('is_maintenance', data.data.data.is_maintenance)
      setValue('maintenance_detail', data.data.data.maintenance_detail)

      setInformationMaintenance(data.data.data.is_maintenance ? 1 : 2)
    }
  })

  const { mutate } = useMutation(storeSettingService.updateVendorStoreGeneralSetting, {
    onSuccess: data => {
      toast.success(t(data.data.message))
    }
  })

  const onSubmit = (data: StoreGeneralSettingData) => {
    mutate(data)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
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
          Informasi Aplikasi
        </Typography>

        <MuiBorderBox>
          <MuiListItem>
            <InputLabel>Tampilkan Informasi Maintenance</InputLabel>
            <RadioButtonCustom
              value={informationMaintenance}
              sx={{
                ml: 3
              }}
              options={[
                { value: 1, label: 'Tampilkan' },
                { value: 2, label: 'Sembunyikan' }
              ]}
              onChange={data => {
                setValue('is_maintenance', (data.value as number) === 1)
                setInformationMaintenance(data.value as number)
              }}
            />
          </MuiListItem>
          {informationMaintenance == 1 && (
            <MuiListItem
              sx={{
                alignItems: 'flex-start'
              }}
            >
              <InputLabel>Isi Informasi Maintenance</InputLabel>
              <Box ml={3} mb={2}>
                <Controller
                  name='maintenance_detail'
                  control={control}
                  render={({ field: { value, ...field } }) => (
                    <TextField
                      sx={{
                        '& .MuiInputBase-root': {
                          padding: 2,
                          paddingLeft: 3,
                          paddingRight: 3
                        }
                      }}
                      multiline
                      rows={4}
                      fullWidth
                      {...field}
                      value={value}
                    />
                  )}
                />
              </Box>
            </MuiListItem>
          )}
        </MuiBorderBox>
      </List>
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
            Save
          </Button>
        </Box>
      </List>
    </Box>
  )
}
export default GeneralComponent
