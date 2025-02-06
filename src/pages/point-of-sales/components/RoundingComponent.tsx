import { List, ListItem, InputLabel, Switch, Button, Typography, Grid } from '@mui/material'
import { Box } from '@mui/system'
import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import { Controller, useForm } from 'react-hook-form'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { useTranslation } from 'react-i18next'
import { outletService } from 'src/services/outlet/outlet'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import Select, { SelectOption } from 'src/components/form/select/Select'
import RadioButtonCustom from 'src/components/form/RadioButtonCustom'
import {
  RoundingData,
  RoundingSchema
} from 'src/types/apps/vendor/settings/point-of-sales/rounding'
import { roundingService } from 'src/services/vendor/settings/point-of-sales/rounding'

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

const RoundingComponent = () => {
  const { t } = useTranslation()

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue
  } = useForm<RoundingData>({
    mode: 'all',
    resolver: yupResolver(RoundingSchema)
  })

  const [isNewRounding, setIsNewRounding] = useState<boolean>(false)
  const [roundingData, setRoundingData] = useState<RoundingData | undefined>(undefined)

  const [outletListData, setOutletListData] = useState<SelectOption[]>([])

  const [outletSelect, setOutletSelect] = useState<string | undefined>(undefined)

  const [isRoundingCashActive, setIsRoundingCashActive] = useState<boolean>(false)
  const [roundingCashType, setRoundingCashType] = useState<'FLOOR' | 'CEIL' | 'AUTOMATIC'>('CEIL')

  const [isRoundingNonCashActive, setIsRoundingNonCashActive] = useState<boolean>(false)
  const [roundingNonCashType, setRoundingNonCashType] = useState<'FLOOR' | 'CEIL' | 'AUTOMATIC'>(
    'CEIL'
  )

  const queryClient = useQueryClient()

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

  useQuery(['rounding-data', outletSelect], {
    queryFn: () => roundingService.getOne(outletSelect ?? '0'),
    enabled: outletSelect !== undefined,
    onSuccess: data => {
      if (data.data.data.length === 0) {
        setIsNewRounding(true)

        setValue('outlet_id', Number(outletSelect))

        setValue('is_rounding_cash_enable', false)
        setValue('cash_rounding_type', 'CEIL')
        setValue('cash_amount_divider', 0)
        setValue('cash_amount_breakpoint', 0)

        setValue('is_rounding_non_cash_enable', false)
        setValue('non_cash_amount_divider', 0)
        setValue('non_cash_amount_breakpoint', 0)
        setValue('non_cash_rounding_type', 'CEIL')

        setIsRoundingCashActive(false)
        setRoundingCashType('CEIL')

        setIsRoundingNonCashActive(false)
        setRoundingNonCashType('CEIL')
      } else {
        setIsNewRounding(false)
        const oldData = data.data.data[0]
        setRoundingData(oldData)

        setValue('outlet_id', oldData.outlet_id)

        setValue('is_rounding_cash_enable', oldData.is_rounding_cash_enable)
        setValue('cash_rounding_type', oldData.cash_rounding_type)
        setValue('cash_amount_divider', oldData.cash_amount_divider)
        setValue('cash_amount_breakpoint', oldData.cash_amount_breakpoint)

        setValue('is_rounding_non_cash_enable', oldData.is_rounding_non_cash_enable)
        setValue('non_cash_amount_divider', oldData.non_cash_amount_divider)
        setValue('non_cash_amount_breakpoint', oldData.non_cash_amount_breakpoint)
        setValue('non_cash_rounding_type', oldData.non_cash_rounding_type)

        setIsRoundingCashActive(oldData.is_rounding_cash_enable)
        setRoundingCashType(oldData.cash_rounding_type)

        setIsRoundingNonCashActive(oldData.is_rounding_non_cash_enable)
        setRoundingNonCashType(oldData.non_cash_rounding_type)
      }
    }
  })

  const { mutate: createRounding } = useMutation(roundingService.create, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      queryClient.invalidateQueries(['rounding-data', outletSelect])
    }
  })

  const { mutate: updateRounding } = useMutation(roundingService.update, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      queryClient.invalidateQueries(['rounding-data', outletSelect])
    }
  })

  const onSubmit = (data: RoundingData) => {
    if (isNewRounding) createRounding(data)
    else if (roundingData) updateRounding({ id: roundingData.id, data: data })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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

        <Grid container spacing={2} my={2} px={4}>
          <Grid item xs={12} lg={6}>
            <Typography fontWeight={'bold'} variant='h5' mb={1}>
              {t('Rounding') + ' - ' + t('Cash')}
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
                  <InputLabel>{t('Enable Rounding')}</InputLabel>
                  <MuiSwitch
                    checked={isRoundingCashActive}
                    onChange={e => {
                      setIsRoundingCashActive(e.target.checked)
                      setValue('is_rounding_cash_enable', e.target.checked)
                    }}
                  />
                </MuiListItem>
                {isRoundingCashActive && (
                  <>
                    <MuiListItem>
                      <InputLabel>{t('Amount Divider')}</InputLabel>
                      <Controller
                        control={control}
                        name='cash_amount_divider'
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextFieldNumber
                            isFloat
                            {...field}
                            error={Boolean(errors.cash_amount_divider)}
                            {...(errors.cash_amount_divider && {
                              helperText: errors.cash_amount_divider.message
                            })}
                            sx={{
                              width: 200,
                              ml: 2
                            }}
                            size='small'
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Rounding Mode')}</InputLabel>
                      <RadioButtonCustom
                        sx={{
                          ml: 3
                        }}
                        options={[
                          { value: 'FLOOR', label: t('Floor') },
                          { value: 'AUTOMATIC', label: t('Automatic') },
                          { value: 'CEIL', label: t('Ceil') }
                        ]}
                        value={roundingCashType}
                        onChange={value => {
                          setRoundingCashType(value.value as 'FLOOR' | 'AUTOMATIC' | 'CEIL')
                          setValue(
                            'cash_rounding_type',
                            value.value as 'FLOOR' | 'AUTOMATIC' | 'CEIL'
                          )
                        }}
                      />
                    </MuiListItem>
                    {roundingCashType == 'AUTOMATIC' && (
                      <MuiListItem>
                        <InputLabel>{t('Amount Breakpoint')}</InputLabel>

                        <Controller
                          control={control}
                          name='cash_amount_breakpoint'
                          rules={{ required: true }}
                          render={({ field }) => (
                            <TextFieldNumber
                              isFloat
                              {...field}
                              error={Boolean(errors.cash_amount_breakpoint)}
                              {...(errors.cash_amount_breakpoint && {
                                helperText: errors.cash_amount_breakpoint.message
                              })}
                              sx={{
                                width: 200,
                                ml: 2
                              }}
                              size='small'
                            />
                          )}
                        />
                      </MuiListItem>
                    )}
                  </>
                )}
              </List>
            </Box>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Typography fontWeight={'bold'} variant='h5' mb={1}>
              {t('Rounding') + ' - ' + t('Non Cash')}
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
                  <InputLabel>{t('Enable Rounding')}</InputLabel>
                  <MuiSwitch
                    checked={isRoundingNonCashActive}
                    onChange={e => {
                      setIsRoundingNonCashActive(e.target.checked)
                      setValue('is_rounding_non_cash_enable', e.target.checked)
                    }}
                  />
                </MuiListItem>
                {isRoundingNonCashActive && (
                  <>
                    <MuiListItem>
                      <InputLabel>{t('Amount Divider')}</InputLabel>
                      <Controller
                        control={control}
                        name='non_cash_amount_divider'
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextFieldNumber
                            isFloat
                            {...field}
                            error={Boolean(errors.non_cash_amount_divider)}
                            {...(errors.non_cash_amount_divider && {
                              helperText: errors.non_cash_amount_divider.message
                            })}
                            sx={{
                              width: 200,
                              ml: 2
                            }}
                            size='small'
                          />
                        )}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Rounding Mode')}</InputLabel>
                      <RadioButtonCustom
                        sx={{
                          ml: 3
                        }}
                        options={[
                          { value: 'FLOOR', label: t('Floor') },
                          { value: 'AUTOMATIC', label: t('Automatic') },
                          { value: 'CEIL', label: t('Ceil') }
                        ]}
                        value={roundingNonCashType}
                        onChange={value => {
                          setRoundingNonCashType(value.value as 'FLOOR' | 'AUTOMATIC' | 'CEIL')
                          setValue(
                            'non_cash_rounding_type',
                            value.value as 'FLOOR' | 'AUTOMATIC' | 'CEIL'
                          )
                        }}
                      />
                    </MuiListItem>
                  </>
                )}
                {roundingNonCashType == 'AUTOMATIC' && (
                  <MuiListItem>
                    <InputLabel>{t('Amount Breakpoint')}</InputLabel>

                    <Controller
                      control={control}
                      name='non_cash_amount_breakpoint'
                      rules={{ required: true }}
                      render={({ field }) => (
                        <TextFieldNumber
                          isFloat
                          {...field}
                          error={Boolean(errors.non_cash_amount_breakpoint)}
                          {...(errors.non_cash_amount_breakpoint && {
                            helperText: errors.non_cash_amount_breakpoint.message
                          })}
                          sx={{
                            width: 200,
                            ml: 2
                          }}
                          size='small'
                        />
                      )}
                    />
                  </MuiListItem>
                )}
              </List>
            </Box>
          </Grid>
        </Grid>

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
      </Box>
      {/* )} */}
    </form>
  )
}
export default RoundingComponent
