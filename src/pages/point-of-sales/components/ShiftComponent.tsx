import { List, ListItem, InputLabel, Switch, Button, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import { Controller, useForm } from 'react-hook-form'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery } from 'react-query'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { useTranslation } from 'react-i18next'
import { outletService } from 'src/services/outlet/outlet'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import {
  ShiftData,
  ShiftSchema,
  ShiftType
} from 'src/types/apps/vendor/settings/point-of-sales/shift'
import { shiftService } from 'src/services/vendor/settings/point-of-sales/shift'
import Select, { SelectOption } from 'src/components/form/select/Select'
import { zeroPad } from 'src/utils/numberUtils'
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

const ShiftComponent = () => {
  const { checkPermission } = useAuth()
  const { t } = useTranslation()

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue
  } = useForm<ShiftData>({
    mode: 'all',
    resolver: yupResolver(ShiftSchema)
  })

  const [shiftData, setShiftData] = useState<ShiftType | undefined>(undefined)

  const [outletListData, setOutletListData] = useState<SelectOption[]>([])

  const [outletSelect, setOutletSelect] = useState<string | undefined>(undefined)

  const [isCashierOpen, setIsCashierOpen] = useState(false)

  const [autoCloseCashier, setAutoCloseCashier] = useState(false)
  const [hourClose, setHourClose] = useState('00')
  const [minuteClose, setMinuteClose] = useState('00')

  const [isInputSaldoAkhir, setIsInputSaldoAkhir] = useState(false)

  useEffect(() => {
    setValue('auto_close_cashier_time', `${parseInt(hourClose)}:${parseInt(minuteClose)}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hourClose, minuteClose])

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
          console.log(defaultOutlet[0].id.toString())

          setOutletSelect(defaultOutlet[0].id.toString())
        } else {
          console.log(datas[0].id.toString())

          setOutletSelect(datas[0].id.toString())
        }
      } else {
        toast.error('Tidak ada data outlet yang aktif')
      }
    }
  })

  useQuery(['shift-data', outletSelect], {
    queryFn: () => shiftService.getOne(outletSelect ?? '0'),
    enabled: outletSelect !== undefined,
    onSuccess: data => {
      setShiftData(data.data.data)

      setValue('id', data.data.data.id)
      setValue('vendor_id', data.data.data.vendor_id)
      setValue('is_cashier_open', data.data.data.is_cashier_open)
      setValue('cashier_cash_nominal', data.data.data.cashier_cash_nominal)
      setValue('is_auto_close_cashier', data.data.data.is_auto_close_cashier)
      setValue('auto_close_cashier_time', data.data.data.auto_close_cashier_time)
      setValue('is_input_saldo_akhir', data.data.data.is_input_saldo_akhir)

      setIsCashierOpen(data.data.data.is_cashier_open)
      setAutoCloseCashier(data.data.data.is_auto_close_cashier)
      setIsInputSaldoAkhir(data.data.data.is_input_saldo_akhir)

      const time = data.data.data.auto_close_cashier_time.split(':')
      setHourClose(zeroPad(parseInt(time[0]), 2))
      setMinuteClose(zeroPad(parseInt(time[1]), 2))
    }
  })

  const { mutate: updateShift } = useMutation(shiftService.update, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
    }
  })

  const onSubmit = (data: ShiftData) => {
    if (outletSelect != undefined) updateShift({ id: parseInt(outletSelect), data })
    else toast.error('Outlet belum dipilih')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {checkPermission('shift.read') && (
        <>
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

          {shiftData && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                padding: 4,
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
                  <InputLabel>{t('Open Cashier')}</InputLabel>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      columnGap: 2
                    }}
                  >
                    <MuiSwitch
                      checked={isCashierOpen}
                      onChange={e => {
                        setIsCashierOpen(e.target.checked)
                        setValue('is_cashier_open', e.target.checked)
                      }}
                    />
                    {isCashierOpen && (
                      <Controller
                        control={control}
                        name='cashier_cash_nominal'
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextFieldNumber
                            {...field}
                            error={Boolean(errors.cashier_cash_nominal)}
                            {...(errors.cashier_cash_nominal && {
                              helperText: errors.cashier_cash_nominal.message
                            })}
                            sx={{
                              width: 120,
                              ml: 2
                            }}
                            size='small'
                          />
                        )}
                      />
                    )}
                  </Box>
                </MuiListItem>
                <MuiListItem>
                  <InputLabel>{t('Close Cashier Automatically')}</InputLabel>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      columnGap: 2
                    }}
                  >
                    <MuiSwitch
                      checked={autoCloseCashier}
                      onChange={e => {
                        setAutoCloseCashier(e.target.checked)
                        setValue('is_auto_close_cashier', e.target.checked)
                      }}
                    />
                    {autoCloseCashier && (
                      <Box display={'flex'} gap={2} marginLeft={2}>
                        <SelectCustom
                          value={hourClose}
                          fullWidth
                          label={t('Hour') ?? 'Hour'}
                          isFloating
                          // 00 - 23
                          options={[...Array(24).keys()].map((item: number) => zeroPad(item, 2))}
                          onSelect={value => {
                            setHourClose(value)
                          }}
                        />
                        <SelectCustom
                          value={minuteClose}
                          fullWidth
                          label={t('Minute') ?? 'Minute'}
                          isFloating
                          options={[...Array(60).keys()].map((item: number) => zeroPad(item, 2))}
                          onSelect={value => {
                            setMinuteClose(value)
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </MuiListItem>
                <MuiListItem>
                  <InputLabel>{t('Input Last Balance')}</InputLabel>
                  <MuiSwitch
                    checked={isInputSaldoAkhir}
                    onChange={e => {
                      setIsInputSaldoAkhir(e.target.checked)
                      setValue('is_input_saldo_akhir', e.target.checked)
                    }}
                  />
                </MuiListItem>
              </List>

              {checkPermission('shift.update') && (
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
                  <Box>
                    <Button type='submit' variant='contained'>
                      {t('Save')}
                    </Button>
                  </Box>
                </List>
              )}
            </Box>
          )}
        </>
      )}
    </form>
  )
}
export default ShiftComponent
