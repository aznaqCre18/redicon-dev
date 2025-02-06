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
import { BrandSchema, BrandType } from 'src/types/apps/brandType'
import { useMutation, useQueryClient } from 'react-query'
import { brandService } from 'src/services/brand'
import { ChangeEvent, useEffect, useState } from 'react'
import Dialog from 'src/views/components/dialogs/Dialog'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { Avatar, Typography } from '@mui/material'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import { useTranslation } from 'react-i18next'
import { useApp } from 'src/hooks/useApp'
import { Icon } from '@iconify/react'

interface DialogType {
  open: boolean
  toggle: () => void
  selectBrand: BrandType | null
}

const FormBrandDialog = (props: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  // ** Props
  const queryClient = useQueryClient()
  const { open, toggle, selectBrand } = props

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
  } = useForm<BrandType>({
    mode: 'all',
    resolver: yupResolver(BrandSchema)
  })

  const { mutate: updateImage } = useMutation(brandService.updateImage, {
    onSuccess: () => {
      queryClient.invalidateQueries('brands-list')
    }
  })

  const { mutate, isLoading } = useMutation(brandService.postBrand, {
    onSuccess: (data: any) => {
      const resp = data.data.data
      const id = resp.id

      if (files) {
        updateImage({ id: id, file: files })
      }

      queryClient.invalidateQueries('brands-list')

      toast.success(t((data as unknown as ResponseType).data.message))
      reset()
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(brandService.patchBrand, {
    onSuccess: (data: any) => {
      const resp = data.data.data
      const id = resp.id

      if (files) {
        updateImage({ id: id, file: files })
      }

      queryClient.invalidateQueries('brands-list')

      toast.success(t((data as unknown as ResponseType).data.message))
      reset()
      toggle()
    }
  })

  const onSubmit = (data: BrandType) => {
    if (data.id) {
      mutateEdit(data)
    } else {
      mutate(data)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  useEffect(() => {
    if (selectBrand) {
      if (selectBrand.image != '') setImgSrc(getImageAwsUrl(selectBrand.image))
      else setImgSrc('')

      setValue('id', selectBrand.id)
      setValue('name', selectBrand.name)
      setValue('code', selectBrand.code)
    } else {
      setValue('id', null)
      setValue('name', '')
      setValue('code', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectBrand, open])

  return (
    <Dialog
      title={(selectBrand ? t('Edit') : t('Add')) + ' ' + t('Brand')}
      open={open}
      onClose={handleClose}
    >
      <Box display='flex' justifyContent={'center'} marginBottom={4}>
        <Button component='label'>
          <Avatar
            src={imgSrc}
            sx={{ width: '72px', height: '72px' }}
            alt='Profile Pic'
            variant='square'
          >
            <Box alignItems={'center'} display={'flex'} flexDirection={'column'}>
              <Icon icon='bi:image' width={24} height={24} />
              <Typography variant='caption'>Upload</Typography>
            </Box>
          </Avatar>
          <input
            hidden
            type='file'
            value={inputFileValue}
            accept='image/png, image/jpeg'
            onChange={handleInputImageChange}
            id='account-settings-upload-image'
          />
        </Button>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name='name'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label={t('Brand Name')}
              placeholder='Adidas'
              {...errorInput(errors, 'name')}
            />
          )}
        />

        <Controller
          name='code'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label={t('Code')}
              placeholder='ADS'
              {...errorInput(errors, 'code')}
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
