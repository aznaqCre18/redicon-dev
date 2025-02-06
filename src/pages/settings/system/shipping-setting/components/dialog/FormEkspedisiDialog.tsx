import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useApp } from 'src/hooks/useApp'
import { expeditionService } from 'src/services/vendor/expedition'
import { ExpeditionData, ExpeditionSchema, ExpeditionType } from 'src/types/apps/vendor/expedition'
import { defaultPagination } from 'src/types/pagination/pagination'
import { ResponseType } from 'src/types/response/response'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import Dialog from 'src/views/components/dialogs/Dialog'

interface DialogType {
  open: boolean
  toggle: () => void
  selectData: ExpeditionType | null
}
const FormEkspedisiDialog = (props: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [, setBankList] = useState<ExpeditionType[]>([])

  useQuery(['expedition-list'], {
    queryFn: () => expeditionService.getList(defaultPagination),
    onSuccess: data => {
      setBankList(data.data.data ?? [])
    }
  })

  const { open, toggle, selectData: selectBankVendor } = props

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ExpeditionData>({
    mode: 'onChange',
    resolver: yupResolver(ExpeditionSchema)
  })

  // const { mutate, isLoading } = useMutation(expeditionService.post, {
  //   onSuccess: data => {
  //     toast.success(t((data as unknown as ResponseType).data.message))
  //     queryClient.invalidateQueries('expedition-list')
  //   }
  // })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(expeditionService.patch, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('expedition-list')
    }
  })

  const onSubmit = (data: ExpeditionData) => {
    if (selectBankVendor) {
      mutateEdit({ id: selectBankVendor.id, data: data })
    } else {
      // mutate(data)
    }

    toggle()
    reset()
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  // Image
  const [imgSrc, setImgSrc] = useState('')

  useEffect(() => {
    if (selectBankVendor) {
      setValue('name', selectBankVendor.name)
      setImgSrc(getImageAwsUrl(selectBankVendor.image))
    } else {
      setValue('name', '')
      setImgSrc('')
    }
  }, [selectBankVendor, setValue])

  return (
    <Dialog
      title={t(selectBankVendor ? t('Edit') : t('Add')) + ' ' + t('Expedition')}
      open={open}
      onClose={handleClose}
    >
      <Box display='flex' justifyContent={'center'} marginBottom={4}>
        <Button component='label'>
          <img src={imgSrc} style={{ width: '100px', objectFit: 'cover' }} alt='Expedition Logo' />
        </Button>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name='name'
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <CustomTextField
              fullWidth
              value={value}
              sx={{ mb: 4 }}
              label={t('Name')}
              onChange={onChange}
              placeholder={t('Expedition Name') ?? 'Expedition Name'}
              {...errorInput(errors, 'name')}
            />
          )}
        />
        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            {t('Cancel')}
          </Button>
          <Button disabled={isLoadingEdit} type='submit' variant='contained' sx={{ ml: 3 }}>
            {t('Save')}
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default FormEkspedisiDialog
