import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  Paper,
  Radio,
  RadioGroup,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from 'react-query'
import { CardBank } from 'src/components/CardBank'
import FilterOutlet from 'src/components/filter/FilterOutlet'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { outletSubscriptionService } from 'src/services/outlet/subscription'
import { subscriptionService } from 'src/services/subscription'
import { bankOwnerService } from 'src/services/subscription/owner-bank'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { OutletData } from 'src/types/apps/outlet/subscription'
import { SubscriptionType } from 'src/types/apps/subscription'
import { OwnerBankType } from 'src/types/apps/subscription/owner-bank'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { formatPriceIDR } from 'src/utils/numberUtils'

const MuiListItem = styled(ListItem)(() => ({
  padding: 0,
  alignItems: 'center'
}))

const AddSubscription = () => {
  const { t } = useTranslation()
  const router = useRouter()

  const [subscriptionTerm, setSubscriptionTerm] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')
  const [subscriptions, setSubscriptions] = useState<SubscriptionType[]>([])

  const [subscriptionId, setSubscriptionId] = useState<number | undefined>(undefined)

  const [outlets, setOutlets] = useState<OutletType[]>([])
  const [outletIds, setOutletIds] = useState<number[]>([])

  const [outletData, setOutletData] = useState<OutletData[]>([])

  const [vendorBanks, setVendorBanks] = useState<OwnerBankType[]>([])
  const [bankId, setBankId] = useState<number | undefined>(undefined)

  useQuery(['subscription-list'], {
    queryFn: () => subscriptionService.getList(maxLimitPagination),
    onSuccess: ({ data }) => {
      setSubscriptions(data?.data ?? [])
    }
  })

  useQuery(['bank-owner-list'], {
    queryFn: () => bankOwnerService.getList(maxLimitPagination),
    onSuccess: ({ data }) => {
      setVendorBanks(data?.data ?? [])
    }
  })

  const { mutate: addSubscriptionMutation } = useMutation({
    mutationFn: outletSubscriptionService.add,
    onSuccess: () => {
      toast.success(t('Successfully added'))

      router.push('/account-settings/subscription')
    }
  })

  const addSubscription = () => {
    if (!subscriptionId) {
      toast.error(t('Please select subscription'))

      return
    }

    if (!bankId) {
      toast.error(t('Please select bank'))

      return
    }

    if (outletData.length == 0) {
      toast.error(t('Please select outlet'))

      return
    }

    addSubscriptionMutation({
      subscription_id: subscriptionId,
      outlet: outletData,
      owner_bank_id: bankId,
      term: subscriptionTerm,
      payment_method: 'MANUAL BANK TRANSFER'
    })
  }

  return (
    <Card>
      <CardContent>
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
          <MuiListItem>
            <InputLabel sx={{ mb: 'auto', mt: 12 }}>
              {t('Select') + ' ' + t('Subscription')}
            </InputLabel>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2 }}>
                <RadioGroup
                  row
                  value={subscriptionTerm}
                  onChange={e => setSubscriptionTerm(e.target.value as 'MONTHLY' | 'YEARLY')}
                >
                  <FormControlLabel value='MONTHLY' control={<Radio />} label={t('MONTHLY')} />
                  <FormControlLabel value='YEARLY' control={<Radio />} label={t('YEARLY')} />
                </RadioGroup>
              </Box>
              <RadioGroup
                row
                value={subscriptionId}
                onChange={e => setSubscriptionId(Number(e.target.value))}
              >
                <Grid container spacing={2}>
                  {subscriptions.map(subscription => (
                    <Grid item key={subscription.id} xs={4}>
                      <Card
                        sx={{
                          border: theme => `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <CardContent
                          sx={{
                            p: 4,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                          onClick={() => {
                            setSubscriptionId(subscription.id)
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography fontWeight={'bold'}>{subscription.name}</Typography>
                              <Typography fontWeight={'bold'}>
                                {subscriptionTerm == 'YEARLY' && (
                                  <Typography
                                    sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                                  >
                                    {formatPriceIDR(subscription.price_per_month)}
                                  </Typography>
                                )}
                                {formatPriceIDR(
                                  subscriptionTerm == 'MONTHLY'
                                    ? subscription.price_per_month
                                    : subscription.price_per_year
                                )}
                              </Typography>
                            </Box>
                            <Box>
                              <FormControlLabel
                                control={<Radio />}
                                checked={subscriptionId === subscription.id}
                                value={subscription.id}
                                label
                                sx={{
                                  mr: -4
                                }}
                              />
                            </Box>
                          </Box>
                          <Divider sx={{ my: 2 }} />
                          <Box>
                            <Typography>{subscription.description}</Typography>
                            <Typography>
                              {subscription.maximum_outlet == 0
                                ? 'Unlimited'
                                : subscription.maximum_outlet}{' '}
                              Outlet
                            </Typography>
                            <Typography>
                              {subscription.maximum_device == 0
                                ? 'Unlimited'
                                : subscription.maximum_device}{' '}
                              Device
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            </Box>
          </MuiListItem>
          <MuiListItem sx={{ mt: 2 }}>
            <InputLabel sx={{ mb: 'auto' }}>{t('Select') + ' ' + t('Outlet')}</InputLabel>
            <Box>
              <FilterOutlet
                showDisable
                showIfOne
                value={outletIds}
                onChange={value => {
                  setOutletIds(value ?? []),
                    setOutletData(
                      value?.map(id => ({
                        outlet_id: id,
                        duration: 1
                      })) ?? []
                    )
                }}
                label=''
                width={'100%'}
                setOutlets={setOutlets}
              />
              {subscriptionId && outletData.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 4 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell width={'300'}>{t('Outlet')}</TableCell>
                        <TableCell>{t('Duration')}</TableCell>
                        <TableCell width={'auto'} align='right'>
                          {t('Price')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {outletData.map(outlet => (
                        <TableRow key={outlet.outlet_id}>
                          <TableCell>{outlets.find(o => o.id == outlet.outlet_id)?.name}</TableCell>
                          <TableCell width={180}>
                            <TextFieldNumber
                              value={outlet.duration}
                              onChange={e => {
                                setOutletData(
                                  outletData.map(o => {
                                    if (o.outlet_id == outlet.outlet_id) {
                                      return {
                                        ...o,
                                        duration: Number(e) < 1 ? 1 : Number(e)
                                      }
                                    }

                                    return o
                                  })
                                )
                              }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position='end'>
                                    {subscriptionTerm == 'MONTHLY' ? t('Month') : t('Year')}
                                  </InputAdornment>
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell align='right'>
                            {formatPriceIDR(
                              outlet.duration *
                                (subscriptionTerm == 'YEARLY'
                                  ? (subscriptions.find(s => s.id == subscriptionId)
                                      ?.price_per_year ?? 0) * 12
                                  : subscriptions.find(s => s.id == subscriptionId)
                                      ?.price_per_month ?? 0)
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={2} sx={{ textAlign: 'right' }}>
                          <Typography
                            sx={{
                              fontWeight: 'bold'
                            }}
                          >
                            {t('Total')}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography
                            sx={{
                              fontWeight: 'bold'
                            }}
                          >
                            {formatPriceIDR(
                              outletData.map(o => o.duration).reduce((a, b) => a + b, 0) *
                                (subscriptionTerm == 'YEARLY'
                                  ? (subscriptions.find(s => s.id == subscriptionId)
                                      ?.price_per_year ?? 0) * 12
                                  : subscriptions.find(s => s.id == subscriptionId)
                                      ?.price_per_month ?? 0)
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </MuiListItem>
          <MuiListItem sx={{ mt: 4 }}>
            <InputLabel sx={{ mb: 'auto' }}>{t('Select') + ' ' + t('Payment')}</InputLabel>
            <Box>
              {vendorBanks.length == 0 && (
                <Box
                  sx={{
                    border: theme => '1px solid ' + theme.palette.divider,
                    p: 2,
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Typography>{t('Owner no bank account.')}</Typography>
                </Box>
              )}
              <Box>
                <Grid container sx={{ ml: 2 }}>
                  {vendorBanks.map((card, index) => (
                    <Grid item xs={4} key={index} sx={{ px: 4, py: 2 }}>
                      <CardBank
                        card={card}
                        checked={bankId == card.id}
                        onChange={value => {
                          setBankId(value)
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </MuiListItem>
          <MuiListItem sx={{ mt: 4 }}>
            <InputLabel sx={{ mb: 'auto' }}></InputLabel>
            <Button
              variant='contained'
              sx={{ width: '100%' }}
              onClick={() => {
                addSubscription()
              }}
              disabled={outletIds.length == 0 || !bankId || !subscriptionId}
            >
              {t('Add Subscription')}
            </Button>
          </MuiListItem>
        </List>
      </CardContent>
    </Card>
  )
}

export default AddSubscription
