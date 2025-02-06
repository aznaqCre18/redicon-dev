import { yupResolver } from '@hookform/resolvers/yup'
import { Avatar, Box, Button, Grid, InputLabel } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import CustomTextField from 'src/@core/components/mui/text-field'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { ResponseType } from 'src/types/response/response'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import Dialog from 'src/views/components/dialogs/Dialog'
import SelectCustom from 'src/components/form/select/SelectCustom'
import {
  PaymentMethodNonCashData,
  PaymentMethodNonCashSchema,
  PaymentMethodNonCashType
} from 'src/types/apps/vendor/PaymentMethodNonCash'
import { BankType } from 'src/types/apps/bankType'
import { bankService } from 'src/services/bank'
import { paymentMethodNonCashService } from 'src/services/vendor/paymentMethodNonCash'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { outletService } from 'src/services/outlet/outlet'
import InputDiscountOrNominal from 'src/pages/product/data/add/components/InputDiscountOrNominal'
import { useTranslation } from 'react-i18next'
import { ewalletService } from 'src/services/ewallet'
import { useApp } from 'src/hooks/useApp'
import { Icon } from '@iconify/react'

interface DialogType {
  open: boolean
  toggle: () => void
  selectNonCash: PaymentMethodNonCashType | null
}

const paymentTypeList = [
  {
    value: 'EDC',
    label: 'EDC'
  },
  {
    value: 'EWALLET',
    label: 'E-Wallet'
  }
]

const FormNonCashDialog = (props: DialogType) => {
  const { open, toggle, selectNonCash } = props
  const { errorInput } = useApp()
  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const [outletList, setOutletList] = useState<OutletType[]>([])
  const [bankList, setBankList] = useState<BankType[]>([])
  const [walletList, setWalletList] = useState<BankType[]>([])
  const [outlet, setOutlet] = useState<number | null>(null)
  const [bank, setBank] = useState<number | null>(null)
  const [wallet, setWallet] = useState<number | null>(null)
  const [type, setType] = useState<'EDC' | 'EWALLET'>('EDC')
  const [mdrType, setMdrType] = useState<1 | 2>(1)
  const [mdrValue, setMdrValue] = useState<number>(0)

  useQuery(['outlet-list'], {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      setOutletList(data.data.data ?? [])

      if (data.data.data.length === 1) {
        setOutlet(data.data.data[0].id)
      }
    }
  })

  useQuery(['bank-list', selectNonCash], {
    queryFn: () => bankService.getList(maxLimitPagination),
    onSuccess: data => {
      setBankList(data.data.data ?? [])

      if (type == 'EDC' && selectNonCash) {
        const bank = data.data.data.find(
          (bank: BankType) => bank.name === selectNonCash.payment_name
        )
        if (bank) {
          setBank(bank.id)
        }
      }
    }
  })

  useQuery(['wallet-list', selectNonCash], {
    queryFn: () => ewalletService.getList(maxLimitPagination),
    onSuccess: data => {
      setWalletList(data.data.data ?? [])

      if (type == 'EWALLET' && selectNonCash) {
        const wallet = data.data.data.find(
          (wallet: BankType) => wallet.name === selectNonCash.payment_name
        )
        if (wallet) {
          setWallet(wallet.id)
        }
      }
    }
  })

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<PaymentMethodNonCashData>({
    mode: 'all',
    defaultValues: {
      status: true
    },
    resolver: yupResolver(PaymentMethodNonCashSchema)
  })

  const { mutate, isLoading } = useMutation(paymentMethodNonCashService.post, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('payment-method-non-cash-list')

      resetForm()
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(
    paymentMethodNonCashService.patch,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        queryClient.invalidateQueries('payment-method-non-cash-list')

        toggle()
        resetForm()
      }
    }
  )

  const onSubmit = (data: PaymentMethodNonCashData) => {
    if (selectNonCash) {
      mutateEdit({ id: selectNonCash.id, data: data })
    } else {
      mutate(data)
    }
  }

  const handleClose = () => {
    toggle()
    resetForm()
  }

  // Image
  const [imgSrc, setImgSrc] = useState('')

  useEffect(() => {
    if (outlet)
      setValue('outlet_id', outlet, {
        shouldValidate: true,
        shouldDirty: true
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outlet])

  const resetForm = () => {
    if (outletList.length === 1) setOutlet(outletList[0].id)
    else setOutlet(null)

    setBank(null)
    setWallet(null)

    setImgSrc('')
    setType('EDC')
    setMdrType(1)
    setMdrValue(0)

    setValue('payment_type', 'EDC')
    setValue('payment_name', '')
    setValue('payment_image', '')
    setValue('account_name', '')
    setValue('account_number', '0')
    setValue('mdr_type', 1)
    setValue('mdr_value', 0)
    setValue('status', true)
  }

  useEffect(() => {
    if (selectNonCash && open) {
      setBank(null)
      setWallet(null)

      setImgSrc(getImageAwsUrl(selectNonCash.payment_image))
      setOutlet(selectNonCash.outlet_id)
      setType(selectNonCash.payment_type)
      setMdrType(selectNonCash.mdr_type)
      setMdrValue(selectNonCash.mdr_value)

      setValue('payment_type', selectNonCash.payment_type)
      setValue('payment_name', selectNonCash.payment_name)
      setValue('payment_image', selectNonCash.payment_image)
      setValue('account_name', selectNonCash.account_name)
      setValue('account_number', selectNonCash.account_number)
      setValue('mdr_type', selectNonCash.mdr_type)
      setValue('mdr_value', selectNonCash.mdr_value)
      setValue('status', selectNonCash.status)
    } else {
      resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectNonCash, open])

  useEffect(() => {
    if (outlet)
      setValue('outlet_id', outlet, {
        shouldValidate: true,
        shouldDirty: true
      })
    else
      setValue('outlet_id', 0, {
        shouldValidate: true,
        shouldDirty: true
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outlet])

  return (
    <Dialog
      title={(selectNonCash ? t('Edit') : t('Add')) + ' ' + t('Non Cash')}
      open={open}
      onClose={handleClose}
    >
      <Box display='flex' justifyContent={'center'} marginBottom={4}>
        <Avatar
          alt='Profile Pic'
          variant='square'
          src={imgSrc}
          sx={{
            backgroundColor: 'unset',
            width: '100%',
            objectFit: 'cover',
            '& img': {
              width: 'unset'
            }
          }}
        >
          <Box alignItems={'center'} display={'flex'} flexDirection={'column'}>
            <Icon icon='bi:image' width={24} height={24} />
          </Box>
        </Avatar>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        {outletList.length > 1 && (
          <Box sx={{ mb: 4 }}>
            <SelectCustom
              options={outletList}
              labelKey='name'
              optionKey={'id'}
              fullWidth
              label='Outlet'
              value={outlet}
              onSelect={data => {
                if (data) {
                  setOutlet(data.id)
                } else {
                  setOutlet(null)
                }
              }}
            />
          </Box>
        )}

        <Box sx={{ mb: 4 }}>
          <SelectCustom
            options={paymentTypeList}
            labelKey='label'
            optionKey={'value'}
            fullWidth
            label={t('Payment Type') ?? 'Payment Type'}
            value={type}
            onSelect={data => {
              if (data) {
                setType(data.value as 'EDC' | 'EWALLET')
                setBank(null)
                setWallet(null)
                setValue('payment_type', data.value as 'EDC' | 'EWALLET', {
                  shouldValidate: true,
                  shouldDirty: true
                })
              } else {
                setType('EDC')
                setBank(null)
                setWallet(null)
                setValue('payment_type', 'EDC', {
                  shouldValidate: true,
                  shouldDirty: true
                })
              }
            }}
          />
        </Box>

        {type === 'EDC' ? (
          <Box sx={{ mb: 4 }}>
            <SelectCustom
              options={bankList}
              labelKey='name'
              optionKey={'id'}
              fullWidth
              label={t('Name ') + ' Bank'}
              value={bank}
              onSelect={data => {
                if (data) {
                  setImgSrc(getImageAwsUrl(data.image))
                  setBank(data.id)
                  setValue('payment_image', data.image, {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                  setValue('payment_name', data.name, {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                } else {
                  setBank(null)
                }
              }}
            />
          </Box>
        ) : (
          <Box sx={{ mb: 4 }}>
            <SelectCustom
              options={walletList}
              labelKey='name'
              optionKey={'id'}
              fullWidth
              label={t('Name') + ' E-Wallet'}
              value={wallet}
              onSelect={data => {
                if (data) {
                  setImgSrc(getImageAwsUrl(data.image))
                  setWallet(data.id)
                  setValue('payment_image', data.image, {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                  setValue('payment_name', data.name, {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                } else {
                  setWallet(null)
                }
              }}
              {...errorInput(errors, 'payment_name')}
            />
          </Box>
        )}

        <Controller
          name='account_name'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label={t('Account Name')}
              placeholder='BCA'
              {...errorInput(errors, 'account_name')}
            />
          )}
        />

        <Grid container spacing={8} mb={4}>
          <Grid item xs={6}>
            <InputLabel
              sx={{
                fontSize: theme => theme.typography.body2.fontSize
              }}
            >
              {t('MDR Fee')}
            </InputLabel>
            <InputDiscountOrNominal
              value={mdrValue}
              discountType={mdrType === 1 ? 'percentage' : 'nominal'}
              onChange={value => {
                setMdrValue(value as number)

                setValue('mdr_value', value as number, {
                  shouldValidate: true,
                  shouldDirty: true
                })
              }}
              onChangeDiscountType={value => {
                setMdrType(value === 'percentage' ? 1 : 2)

                setValue('mdr_type', value === 'percentage' ? 1 : 2, {
                  shouldValidate: true,
                  shouldDirty: true
                })
              }}
            />
          </Grid>
        </Grid>

        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            {t('Cancel')}
          </Button>
          <Button
            disabled={isLoading || isLoadingEdit}
            type='submit'
            variant='contained'
            sx={{ ml: 3 }}
          >
            {t('Submit')}
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default FormNonCashDialog
