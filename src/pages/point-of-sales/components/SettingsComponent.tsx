import {
  List,
  ListItem,
  InputLabel,
  Switch,
  Button,
  Typography,
  Grid,
  TextField,
  InputAdornment
} from '@mui/material'
import { Box } from '@mui/system'
import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { useTranslation } from 'react-i18next'
import { outletService } from 'src/services/outlet/outlet'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import Select, { SelectOption } from 'src/components/form/select/Select'
import RadioButtonCustom from 'src/components/form/RadioButtonCustom'
import { posOrderAlertService } from 'src/services/point-of-sales/orderAlert'
import { OrderAlertData, OrderAlertType } from 'src/types/apps/point-of-sales/orderAlert'
import DurationSection from './DurationSection'

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

const SettingsComponent = () => {
  const { t } = useTranslation()

  const [outletListData, setOutletListData] = useState<SelectOption[]>([])

  const [outletSelect, setOutletSelect] = useState<string | undefined>(undefined)

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

  const [orderAlertDataOld, setOrderAlertDataOld] = useState<OrderAlertType[]>([])
  const [orderAlertData, setOrderAlertData] = useState<OrderAlertData[]>([])

  useQuery(['order-alert-settings', outletSelect], {
    queryFn: () =>
      posOrderAlertService.getList({
        outlet_id: outletSelect,
        limit: 2,
        page: 1
      }),
    enabled: outletSelect !== undefined,
    onSuccess: data => {
      const datas = (data.data.data ?? []).sort((a, b) => a.id - b.id)

      setOrderAlertDataOld(datas)

      if (datas.length == 2) {
        setOrderAlertData(datas)
      } else if (datas.length == 1) {
        setOrderAlertData([
          ...datas,
          {
            outlet_id: Number(outletSelect),
            description: 'description',
            is_active: false,
            minutes: 5,
            name: 'Order Alert #2',
            relative_to: 'CHECK OUT DATE',
            type: 'BEFORE'
          }
        ])
      } else {
        setOrderAlertData([
          {
            outlet_id: Number(outletSelect),
            description: 'description',
            is_active: false,
            minutes: 5,
            name: 'Order Alert #1',
            relative_to: 'CHECK IN DATE',
            type: 'BEFORE'
          },
          {
            outlet_id: Number(outletSelect),
            description: '',
            is_active: false,
            minutes: 5,
            name: 'Order Alert #2',
            relative_to: 'CHECK OUT DATE',
            type: 'BEFORE'
          }
        ])
      }
    }
  })

  const { mutate: create } = useMutation(posOrderAlertService.create, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      queryClient.invalidateQueries(['rounding-data', outletSelect])
    }
  })

  const { mutate: update } = useMutation(posOrderAlertService.update, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      queryClient.invalidateQueries(['rounding-data', outletSelect])
    }
  })

  const updateData = (name: string, value: any, index: number) => {
    const newData = [...orderAlertData] as any
    newData[index][name] = value

    setOrderAlertData(newData)
  }

  const onSubmit = (index: number) => {
    console.log('debug', orderAlertDataOld[index])

    if (orderAlertDataOld[index] == undefined) {
      create(orderAlertData[index])
    } else {
      update({ id: orderAlertDataOld[index].id, data: orderAlertData[index] })
    }
  }

  return (
    <Box m={2}>
      <Box p={4} pb={0}>
        <Typography fontWeight={'bold'} variant='h5' mb={1}>
          {t('Order Alert')}
        </Typography>
      </Box>
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
        {orderAlertData.length > 0 &&
          orderAlertData.map((data, index) => (
            <Grid item xs={12} lg={6} key={index}>
              <form
                onSubmit={e => {
                  e.preventDefault()

                  onSubmit(index)
                }}
              >
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
                      <InputLabel>{t('Alert Name')}</InputLabel>
                      <TextField
                        value={data.name}
                        size='small'
                        onChange={e => {
                          updateData('name', e.target.value, index)
                        }}
                      />
                    </MuiListItem>
                    <MuiListItem>
                      <InputLabel>{t('Enable Alert')}</InputLabel>
                      <MuiSwitch
                        checked={data.is_active}
                        onChange={e => {
                          updateData('is_active', e.target.checked, index)
                        }}
                      />
                    </MuiListItem>
                    {data.is_active && (
                      <>
                        <MuiListItem>
                          <InputLabel>{t('Relative to')}</InputLabel>
                          <RadioButtonCustom
                            sx={{
                              ml: 3
                            }}
                            options={[
                              { value: 'CHECK IN DATE', label: t('Check In') },
                              { value: 'CHECK OUT DATE', label: t('Check Out') }
                            ]}
                            value={data.relative_to}
                            onChange={value => {
                              updateData('relative_to', value.value, index)
                            }}
                          />
                        </MuiListItem>
                        <MuiListItem>
                          <InputLabel>{t('Alert Type')}</InputLabel>
                          <RadioButtonCustom
                            sx={{
                              ml: 3
                            }}
                            options={[
                              { value: 'BEFORE', label: t('Before') },
                              { value: 'AFTER', label: t('After') }
                            ]}
                            value={data.type}
                            onChange={value => {
                              updateData('type', value.value, index)
                            }}
                          />
                        </MuiListItem>
                        <MuiListItem>
                          <InputLabel></InputLabel>
                          <TextFieldNumber
                            isFloat
                            value={data.minutes}
                            sx={{
                              width: 200,
                              ml: 2
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position='end'>{t('Minutes')}</InputAdornment>
                              )
                            }}
                            size='small'
                            onChange={value => {
                              console.log('debug', value)

                              updateData('minutes', value, index)
                            }}
                          />
                        </MuiListItem>
                      </>
                    )}

                    <MuiListItem>
                      <InputLabel></InputLabel>
                      <div>
                        <Button
                          type='submit'
                          variant='contained'
                          sx={{
                            my: 2,
                            ml: 2
                          }}
                        >
                          {t('Save')}
                        </Button>
                      </div>
                    </MuiListItem>
                  </List>
                </Box>
              </form>
            </Grid>
          ))}
      </Grid>

      {outletSelect && (
        <Box p={4}>
          <Typography fontWeight={'bold'} variant='h5' mb={1}>
            {t('Duration')}
          </Typography>
          <DurationSection outletId={outletSelect} />
        </Box>
      )}
    </Box>
  )
}
export default SettingsComponent
