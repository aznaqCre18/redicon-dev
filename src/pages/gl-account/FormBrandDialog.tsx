// ** React Imports

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
// ** Third Party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
// ** Icon Imports
// ** Types Imports
import { BrandType } from 'src/types/apps/brandType'
import { useMutation, useQueryClient } from 'react-query'
import { ChangeEvent, useEffect, useState } from 'react'
import Dialog from 'src/views/components/dialogs/Dialog'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { Avatar, Typography } from '@mui/material'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import { useTranslation } from 'react-i18next'
import { useApp } from 'src/hooks/useApp'
import { Icon } from '@iconify/react'
import { DepartmentSchema, DepartmentType } from 'src/types/apps/departmentType'
import {
  GlAccountSchema,
  GlAccountType,
  IGlAccount,
  IGLAccountPatch
} from 'src/types/apps/glAccountType'
import { glAccountService } from 'src/services/glAccount'

interface DialogType {
  open: boolean
  toggle: () => void
  selectGLAccount: IGlAccount | null
}

const FormBrandDialog = (props: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  // ** Props
  const queryClient = useQueryClient()
  const { open, toggle, selectGLAccount } = props

  // uploads
  const [imgSrc, setImgSrc] = useState('')
  const [files, setFiles] = useState<File | null>(null)
  const [inputFileValue, setInputFileValue] = useState('')

  const handleInputImageChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      setFiles(files[0])

      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(files[0])
      if (reader.result !== null) {
        setInputFileValue(reader.result as string)
      }
    }
  }

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<GlAccountType>({
    mode: 'all',
    resolver: yupResolver(GlAccountSchema)
  })

  const { mutate, isLoading } = useMutation(glAccountService.postGLAccount, {
    onSuccess: (data: any) => {
      queryClient.invalidateQueries('gl-accounts-list')

      toast.success(t((data as unknown as ResponseType).data.message))
      reset()
      toggle()
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(
    glAccountService.patchGLAccount,
    {
      onSuccess: (data: any) => {
        queryClient.invalidateQueries('gl-accounts-list')

        toast.success(t((data as unknown as ResponseType).data.message))
        reset()
        toggle()
      }
    }
  )

  const onSubmit = (data: IGLAccountPatch) => {
    const reformatData = { ...data }
    delete reformatData.id

    if (data.id) {
      mutateEdit({ id: data?.id, request: reformatData })
    } else {
      mutate(reformatData)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  useEffect(() => {
    if (selectGLAccount) {
      // if (selectGLAccount.image != '') setImgSrc(getImageAwsUrl(selectGLAccount.image))
      // else setImgSrc('')

      setValue('id', selectGLAccount.id)
      setValue('name', selectGLAccount.name)
    } else {
      setValue('id', null)
      setValue('name', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectGLAccount, open])

  return (
    <Dialog
      title={(selectGLAccount ? t('Edit') : t('Add')) + ' ' + t('GL Account')}
      open={open}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit(data => onSubmit(data))}>
        <Controller
          name='name'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label={t('GL Account Name')}
              placeholder='Adidas'
              {...errorInput(errors, 'name')}
            />
          )}
        />

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

export default FormBrandDialog
