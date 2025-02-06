import { yupResolver } from '@hookform/resolvers/yup'
import { Avatar, Box, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import CustomTextField from 'src/@core/components/mui/text-field'
import { bankService } from 'src/services/bank'
import { bankVendorService } from 'src/services/vendor/bank-vendor'
import { BankType } from 'src/types/apps/bankType'
import {
  BankVendorData,
  BankVendorSchema,
  BankVendorType
} from 'src/types/apps/vendor/BankVendorType'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { ResponseType } from 'src/types/response/response'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import Dialog from 'src/views/components/dialogs/Dialog'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { useTranslation } from 'react-i18next'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { outletService } from 'src/services/outlet/outlet'
import { useApp } from 'src/hooks/useApp'
import { Icon } from '@iconify/react'

interface DialogType {
  open: boolean
  toggle: () => void
  selectBankVendor: BankVendorType | null
  closeAfterAdd?: boolean
}
const FormBankDialog = (props: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [bankList, setBankList] = useState<BankType[]>([])
  const [bank, setBank] = useState<number | null>(null)

  const [outletList, setOutletList] = useState<OutletType[]>([])
  const [outlet, setOutlet] = useState<number | null>(null)

  useQuery(['bank-list'], {
    queryFn: () => bankService.getList(maxLimitPagination),
    onSuccess: data => {
      setBankList(data.data.data ?? [])
    }
  })

  useQuery(['outlet-list'], {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      setOutletList(data.data.data ?? [])

      if (data.data.data.length === 1) {
        setOutlet(data.data.data[0].id)
      }
    }
  })

  const { open, toggle, selectBankVendor } = props

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<BankVendorData>({
    mode: 'all',
    resolver: yupResolver(BankVendorSchema)
  })

  const { mutate, isLoading } = useMutation(bankVendorService.post, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('bank-vendor-list')
      resetForm()

      if (props.closeAfterAdd) {
        toggle()
      }
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(bankVendorService.patch, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('bank-vendor-list')
      toggle()
      resetForm()
    }
  })

  const onSubmit = (data: BankVendorData) => {
    if (selectBankVendor) {
      mutateEdit({ id: selectBankVendor.id, data: data })
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

  const resetForm = () => {
    if (outletList.length === 1) setOutlet(outletList[0].id)
    else setOutlet(null)
    setBank(null)

    setValue('account_name', '')
    setValue('account_number', '')
    setValue('bank_name', '')
    setValue('bank_image', '')
    setValue('is_active', 'Active')

    setImgSrc('')
  }

  useEffect(() => {
    if (selectBankVendor) {
      setBank(null)
      setOutlet(selectBankVendor.outlet_id)

      setValue('outlet_id', selectBankVendor.outlet_id)

      setValue('account_name', selectBankVendor.account_name)
      setValue('account_number', selectBankVendor.account_number)
      setValue('bank_name', selectBankVendor.bank_name)
      setValue('bank_image', selectBankVendor.bank_image)
      setValue('is_active', selectBankVendor.is_active)

      setImgSrc(getImageAwsUrl(selectBankVendor.bank_image))
    } else {
      resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectBankVendor, open])

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
      title={(selectBankVendor ? t('Edit') : t('Add')) + ' ' + t('Bank')}
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
          <SelectCustom
            options={outletList}
            labelKey='name'
            optionKey={'id'}
            fullWidth
            sx={{ mb: 4 }}
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
        )}

        <Box sx={{ mb: 4 }}>
          <SelectCustom
            options={bankList}
            labelKey='name'
            optionKey={'id'}
            fullWidth
            label='Bank'
            value={bank}
            onSelect={data => {
              if (data) {
                setImgSrc(getImageAwsUrl(data.image))
                setBank(data.id)
                setValue('bank_image', data.image, {
                  shouldValidate: true,
                  shouldDirty: true
                })
              } else {
                setBank(null)
              }
            }}
          />
        </Box>

        <Controller
          name='bank_name'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label={t('Bank Name')}
              placeholder='BCA'
              {...errorInput(errors, 'bank_name')}
            />
          )}
        />

        <Controller
          name='account_number'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label={t('Account Number')}
              placeholder='87834xxxx'
              {...errorInput(errors, 'account_number')}
            />
          )}
        />

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
              placeholder='John Doe'
              {...errorInput(errors, 'account_name')}
            />
          )}
        />

        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={isLoading || isLoadingEdit}
            type='submit'
            variant='contained'
            sx={{ ml: 3 }}
          >
            Submit
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default FormBankDialog
