import { List, ListItem, InputLabel, Switch, Button, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import { Controller, useForm } from 'react-hook-form'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery } from 'react-query'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { useTranslation } from 'react-i18next'
import { outletService } from 'src/services/outlet/outlet'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import Select, { SelectOption } from 'src/components/form/select/Select'
import RadioButtonCustom from 'src/components/form/RadioButtonCustom'
import {
  TaxServiceChargeData,
  TaxServiceChargeSchema
} from 'src/types/apps/vendor/settings/point-of-sales/TaxServiceCharge'
import { taxServiceChargeService } from 'src/services/vendor/settings/point-of-sales/tax'
import { useAuth } from 'src/hooks/useAuth'

const MuiListItem = styled(ListItem)(() => ({
  padding: 0,
  alignItems: 'center'
}))

const MuiSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: theme.palette.primary.main
  },
  margin: 0
}))

const TaxServiceChargeComponent = () => {
  const { checkPermission, permissions } = useAuth()
  console.log(permissions)

  const { t } = useTranslation()

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue
  } = useForm<TaxServiceChargeData>({
    mode: 'all',
    resolver: yupResolver(TaxServiceChargeSchema)
  })

  const [serviceChargeData, setServiceChargeData] = useState<TaxServiceChargeData | undefined>(
    undefined
  )

  const [outletListData, setOutletListData] = useState<SelectOption[]>([])

  const [outletSelect, setOutletSelect] = useState<string | undefined>(undefined)

  const [isTaxActive, setIsTaxActive] = useState<boolean>(false)
  const [taxSetting, setTaxSetting] = useState<number>(0)

  const [isServiceChargeActive, setIsServiceChargeActive] = useState<boolean>(false)
  const [taxableServiceCharge, setTaxableServiceCharge] = useState<boolean>(false)

  const getOutlet = useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      const datas = data.data.data ?? []
      if (datas.length > 0) {
        setOutletListData([
          // { value: 'all', label: 'All Outlet' },
          ...datas.map(item => ({
            value: item.id.toString(),
            label: item.name
          }))
        ])

        const defaultOutlet = datas.filter(item => item.is_default)
        if (defaultOutlet.length > 0) {
          setOutletSelect(defaultOutlet[0].id.toString())
        } else {
          setOutletSelect(datas[0].id.toString())
        }
      } else {
        toast.error('Tidak ada data outlet yang aktif')
      }
    }
  })

  useQuery(['tax-service-charge-data', outletSelect], {
    queryFn: () => taxServiceChargeService.getOne(outletSelect ?? '0'),
    enabled: outletSelect !== undefined,
    onSuccess: data => {
      setServiceChargeData(data.data.data)

      setValue('id', data.data.data.id)
      setValue('vendor_id', data.data.data.vendor_id)
      setValue('status', data.data.data.status)
      setValue('tax', data.data.data.tax)
      setValue('type', data.data.data.type)

      setValue('service_charge_status', data.data.data.service_charge_status)
      setValue('service_charge', data.data.data.service_charge)
      setValue('service_charge_kena_pajak', data.data.data.service_charge_kena_pajak)

      setIsTaxActive(data.data.data.status)
      setTaxSetting(data.data.data.type)

      setIsServiceChargeActive(data.data.data.service_charge_status)
      setTaxableServiceCharge(data.data.data.service_charge_kena_pajak)
    }
  })

  const { mutate: updateTaxServiceCharge } = useMutation(taxServiceChargeService.update, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
    }
  })

  const onSubmit = (data: TaxServiceChargeData) => {
    const taxSettings = {
      status: data.status,
      tax: data.tax,
      type: data.type
    }

    const serviceChargeSettings = {
      service_charge_status: data.service_charge_status,
      service_charge: data.service_charge,
      service_charge_kena_pajak: data.service_charge_kena_pajak
    }

    const _data = {
      ...(checkPermission('tax setting.update_tax') && taxSettings),
      ...(checkPermission('tax setting.update_service_charge') && serviceChargeSettings)
    } as TaxServiceChargeData

    if (outletSelect != undefined)
      updateTaxServiceCharge({ id: parseInt(outletSelect), data: _data })
    else toast.error('Outlet belum dipilih')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* {checkPermission('shift.read') && ( */}
      <Box m={2}>
        {!getOutlet.isLoading && outletSelect != undefined && outletListData.length > 1 && (
          <Box
            p={4}
            pb={0}
            display={'flex'}
            sx={{
              flexDirection: 'row',
              gap: 2,
              alignItems: 'center'
            }}
          >
            <Typography>{t('Select Outlet')}</Typography>
            <Select
              sx={{ minWidth: 160 }}
              options={outletListData}
              value={outletSelect}
              onChange={e => {
                setOutletSelect((e?.target?.value as string) ?? undefined)
              }}
              key={1}
            />
          </Box>
        )}

        {serviceChargeData && (
          <div>
            <div>
              <Typography fontWeight={'bold'} variant='h5' mb={1} ml={4} mt={6}>
                {t('Tax')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  paddingX: 3,
                  paddingY: 3,
                  gap: 2,
                  border: 1,
                  borderColor: 'divider',
                  margin: 4,
                  borderRadius: 1
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
                  <MuiListItem>
                    <InputLabel>{t('Enable Tax')}</InputLabel>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        columnGap: 2
                      }}
                    >
                      <MuiSwitch
                        checked={isTaxActive}
                        onChange={e => {
                          setIsTaxActive(e.target.checked)
                          setValue('status', e.target.checked)
                        }}
                      />
                      {isTaxActive && (
                        <Controller
                          control={control}
                          name='tax'
                          rules={{ required: true }}
                          render={({ field }) => (
                            <TextFieldNumber
                              isFloat
                              label={t('Tax Cost') + ' (%)'}
                              suffix='%'
                              {...field}
                              error={Boolean(errors.tax)}
                              {...(errors.tax && {
                                helperText: errors.tax.message
                              })}
                              sx={{
                                width: 200,
                                ml: 2
                              }}
                              size='small'
                            />
                          )}
                        />
                      )}
                    </Box>
                  </MuiListItem>
                  {isTaxActive && (
                    <MuiListItem>
                      <InputLabel>{t('Tax Setting')}</InputLabel>
                      <RadioButtonCustom
                        sx={{
                          ml: 3
                        }}
                        options={[
                          { value: 1, label: t('Tax Before Discount') },
                          { value: 2, label: t('Tax After Discount') },
                          { value: 3, label: t('Prices Include Tax') }
                        ]}
                        value={taxSetting}
                        onChange={value => {
                          setTaxSetting(value.value as unknown as number)
                          setValue('type', value.value as unknown as number)
                        }}
                      />
                    </MuiListItem>
                  )}
                </List>
              </Box>
            </div>

            <div>
              <Typography fontWeight={'bold'} variant='h5' mb={1} ml={4} mt={6}>
                {t('Service Charge')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  paddingX: 3,
                  paddingY: 3,
                  gap: 2,
                  border: 1,
                  borderColor: 'divider',
                  margin: 4,
                  borderRadius: 1
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
                  <MuiListItem>
                    <InputLabel>{t('Enable Service Charge')}</InputLabel>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        columnGap: 2
                      }}
                    >
                      <MuiSwitch
                        checked={isServiceChargeActive}
                        onChange={e => {
                          setIsServiceChargeActive(e.target.checked)
                          setValue('service_charge_status', e.target.checked)
                        }}
                      />
                      {isServiceChargeActive && (
                        <Controller
                          control={control}
                          name='service_charge'
                          rules={{ required: true }}
                          render={({ field }) => (
                            <TextFieldNumber
                              isFloat
                              label={t('Service Charge Cost') + ' (%)'}
                              suffix='%'
                              {...field}
                              error={Boolean(errors.service_charge)}
                              {...(errors.service_charge && {
                                helperText: errors.service_charge.message
                              })}
                              sx={{
                                width: 200,
                                ml: 2
                              }}
                              size='small'
                            />
                          )}
                        />
                      )}
                    </Box>
                  </MuiListItem>
                  {isServiceChargeActive && (
                    <MuiListItem>
                      <InputLabel>{t('Taxable Service Charges')}</InputLabel>
                      <MuiSwitch
                        checked={taxableServiceCharge}
                        onChange={e => {
                          setTaxableServiceCharge(e.target.checked)
                          setValue('service_charge_kena_pajak', e.target.checked)
                        }}
                      />
                    </MuiListItem>
                  )}
                </List>
              </Box>
            </div>
          </div>
        )}

        {(checkPermission('tax setting.update_service_charge') ||
          checkPermission('tax setting.update_tax')) && (
          <Button
            type='submit'
            variant='contained'
            sx={{
              ml: 4,
              mb: 4
            }}
          >
            {t('Save')}
          </Button>
        )}
      </Box>
      {/* )} */}
    </form>
  )
}
export default TaxServiceChargeComponent
