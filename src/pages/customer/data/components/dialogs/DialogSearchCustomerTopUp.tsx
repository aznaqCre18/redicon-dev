import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button } from '@mui/material'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from 'react-query'
import CustomTextField from 'src/components/form/CustomTextField'
import { useDisclosure } from 'src/hooks/useDisclosure'
import { customerService } from 'src/services/customer'
import { CustomerType } from 'src/types/apps/customerType'
import { errorInput } from 'src/utils/formUtils'
import { formatPhone } from 'src/utils/numberUtils'
import Dialog from 'src/views/components/dialogs/Dialog'
import * as yup from 'yup'
import DialogCustomerTopUp from './DialogCustomerTopUp'
import DialogCustomerCheckBalance from './DialogCustomerCheckBalance'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { SelectOption } from 'src/components/form/select/Select'

type DialogSearchTopUpProps = {
  open: boolean
  onClose: () => void
  nextStep: 'top-up' | 'check-balance'
}

// yup for code, name, phone, email

const yupSchema = {
  code: yup.string().nullable(),
  customer_id: yup.number().nullable(),
  phone: yup.string().nullable(),
  email: yup.string().email().nullable()
}

type ValuesType = {
  code: string | null
  customer_id: number | null
  phone: string | null
  email: string | null
}

const defaultValues: ValuesType = {
  code: '',
  customer_id: null,
  phone: '',
  email: ''
}

const DialogSearchCustomerTopUp = (props: DialogSearchTopUpProps) => {
  const { t } = useTranslation()

  const [customers, setCustomers] = React.useState<SelectOption[]>([])
  const [customerId, setCustomerId] = React.useState<number | null>(null)

  useQuery('customers-top-up', {
    enabled: props.open && customers.length === 0,
    queryFn: () =>
      customerService.getListCustomerActive({
        page: 1,
        limit: 999
      }),
    onSuccess: data => {
      setCustomers(
        data.data.data.map((customer: CustomerType) => ({
          label: customer.name,
          value: customer.id
        }))
      )
    }
  })

  const [customer, setCustomer] = React.useState<CustomerType | undefined>(undefined)

  // form
  const form = useForm({
    mode: 'all',
    resolver: yupResolver(yup.object().shape(yupSchema)),
    defaultValues
  })

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = form

  const onSubmit = (data: any) => {
    if (data.code || data.customer_id || data.phone || data.email) {
      searchCustomerMutation.mutate({
        ...data,
        customer_id: undefined,
        id: data.customer_id,
        page: 1,
        limit: 1
      })
    } else {
      toast.error(t('Please enter at least one field'))
    }
  }

  // dialog
  const {
    isOpen: openDialogCustomerTopUp,
    onOpen: onOpenDialogCustomerTopUp,
    onClose: onCloseDialogCustomerTopUp
  } = useDisclosure()

  const {
    isOpen: openDialogCustomerCheckBalance,
    onOpen: onOpenDialogCustomerCheckBalance,
    onClose: onCloseDialogCustomerCheckBalance
  } = useDisclosure()

  const handleOpenCustomerTopUp = (customer: CustomerType) => {
    setCustomer(customer)
    onOpenDialogCustomerTopUp()
    props.onClose()

    form.reset(defaultValues)
    setCustomerId(null)
  }

  const handleOpenCustomerCheckBalance = (customer: CustomerType) => {
    setCustomer(customer)
    onOpenDialogCustomerCheckBalance()
    props.onClose()
    form.reset(defaultValues)
    setCustomerId(null)
  }

  const searchCustomerMutation = useMutation(customerService.getListCustomer, {
    onSuccess: (data, request: any) => {
      if (data.data.data.length > 0) {
        const customer = data.data.data[0]
        // check is valid data
        if (request.code || request.name || request.phone || request.email) {
          if (request.code && customer.code !== request.code) {
            toast.error(t('Customer not found'))

            return
          }

          if (request.name && customer.name !== request.name) {
            toast.error(t('Customer not found'))

            return
          }

          if (request.phone && customer.phone !== request.phone) {
            toast.error(t('Customer not found'))

            return
          }

          if (request.email && customer.email !== request.email) {
            toast.error(t('Customer not found'))

            return
          }
        }

        switch (props.nextStep) {
          case 'top-up':
            handleOpenCustomerTopUp(customer)
            break
          case 'check-balance':
            handleOpenCustomerCheckBalance(customer)
            break
        }
      } else {
        toast.error(t('Customer not found'))
      }
    }
  })

  useEffect(() => {
    if (customerId) {
      form.setValue('customer_id', customerId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  return (
    <>
      <Dialog
        title={
          t('Search') +
          ' ' +
          t('Customer') +
          ' ' +
          t('for') +
          ' ' +
          (props.nextStep === 'top-up' ? t('Top Up') : t('Check Balance'))
        }
        open={props.open}
        onClose={props.onClose}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display={'flex'} gap={2} flexDirection={'column'}>
            <Controller
              name='code'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={t('Code') ?? 'Code'}
                  placeholder=''
                  {...errorInput(errors, 'code')}
                />
              )}
            />

            {/* <Controller
              name='name'
              control={control}
              
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={t('Name') ?? 'Name'}
                  placeholder=''
                  {...errorInput(errors, 'name')}
                />
              )}
            /> */}

            <SelectCustom
              value={customerId}
              options={customers}
              labelKey={'label'}
              optionKey={'value'}
              label={t('Name') ?? 'Name'}
              onSelect={value => {
                setCustomerId(value.value)
              }}
            />

            <Controller
              name='phone'
              control={control}
              render={({ field: { onChange, ...field } }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={t('Phone') ?? 'Phone'}
                  placeholder=''
                  {...errorInput(errors, 'phone')}
                  onChange={e => {
                    const value = formatPhone(e.target.value)

                    onChange(value)
                  }}
                />
              )}
            />

            <Controller
              name='email'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={t('Email') ?? 'Email'}
                  placeholder=''
                  {...errorInput(errors, 'email')}
                />
              )}
            />
          </Box>

          <Box mt={2} display={'flex'} justifyContent={'flex-end'} gap={2}>
            <Button onClick={props.onClose} variant='text'>
              {t('Cancel')}
            </Button>
            <Button type='submit' variant='contained' color='primary'>
              {t('Search')}
            </Button>
          </Box>
        </form>
      </Dialog>
      {customer && (
        <>
          <DialogCustomerTopUp
            open={openDialogCustomerTopUp}
            onClose={onCloseDialogCustomerTopUp}
            customer={customer}
          />
          <DialogCustomerCheckBalance
            open={openDialogCustomerCheckBalance}
            onClose={onCloseDialogCustomerCheckBalance}
            customer={customer}
          />
        </>
      )}
    </>
  )
}

export default DialogSearchCustomerTopUp
