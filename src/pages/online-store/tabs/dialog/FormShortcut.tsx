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
import Dialog from 'src/views/components/dialogs/Dialog'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { FormLabel, Typography } from '@mui/material'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { InputTextArea } from 'src/components/form/InputTextArea'
import { shortcutService } from 'src/services/shortcut'
import { ShortcutData, ShortcutSchema, ShortcutType } from 'src/types/apps/shortcutType'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import { ImageUpload } from 'src/components/form/ImageUpload'
import { useTranslation } from 'react-i18next'
import { useApp } from 'src/hooks/useApp'

interface props {
  open: boolean
  toggle: () => void
  selectShorcut: ShortcutType | null
}

const FormShortcut = (props: props) => {
  const { errorInput, translateFormYupMsg } = useApp()
  const { t } = useTranslation()
  // ** Props
  const queryClient = useQueryClient()
  const { open, toggle, selectShorcut: selectShortcut } = props

  const [imgSrc1, setImgSrc1] = useState<string | undefined>(undefined)
  const [files1, setFiles1] = useState<File | null>(null)

  const defaultValue = {
    name: '',
    slug: '',
    description: '',
    url: '',
    status: true,
    image: ''
  }

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: defaultValue,
    mode: 'all',
    resolver: yupResolver(ShortcutSchema)
  })

  const { mutate, isLoading } = useMutation(shortcutService.post, {
    onSuccess: (data: any) => {
      // const resp = data.data.data
      // const id = resp.id

      // if (files) {
      //   updateImage({ id: id, file: files })
      // }

      toast.success(t((data as unknown as ResponseType).data.message))
      // toggle()
      queryClient.invalidateQueries('shortcut-list')

      reset(defaultValue)
      setImgSrc1(undefined)
      setFiles1(null)
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(shortcutService.patch, {
    onSuccess: (data: any) => {
      // const resp = data.data.data
      // const id = resp.id

      // if (files) {
      //   updateImage({ id: id, file: files })
      // }

      queryClient.invalidateQueries('shortcut-list')

      toast.success(t((data as unknown as ResponseType).data.message))
      toggle()
      reset(defaultValue)
    }
  })

  const onSubmit = (data: ShortcutData) => {
    if (selectShortcut && selectShortcut.id) {
      mutateEdit({ id: selectShortcut.id, data: data })
    } else {
      if (files1) {
        mutate({ data: data, file: files1 })
      }
    }
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  useEffect(() => {
    if (open) {
      reset()
      setFiles1(null)
      setImgSrc1(undefined)

      if (selectShortcut) {
        // if (selectBanner.image != '') setImgSrc(getImageAwsUrl(selectBanner.image))
        // else setImgSrc('')

        setValue('name', selectShortcut.name)
        setValue('slug', selectShortcut.slug)
        setValue('description', selectShortcut.description)
        setValue('url', selectShortcut.url)
        setValue('status', selectShortcut.status)
        setValue('image', selectShortcut.image)

        setImgSrc1(getImageAwsUrl(selectShortcut.image))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectShortcut, setValue, open])

  useEffect(() => {
    if (files1) setValue('image', 'done')
    else setValue('image', '')
  }, [files1, setValue])

  return (
    <Dialog
      title={(selectShortcut ? t('Edit') : t('Add')) + ' Shortcut'}
      open={open}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
          <ImageUpload
            label='32x32'
            size={{
              width: 64,
              height: 64
            }}
            onChange={setFiles1}
            imagePreview={imgSrc1}
          />
          <Typography color={'error'} variant='body2'>
            {errors.image && errors.image.message}
          </Typography>
        </Box>
        <Controller
          name='name'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label={t('Banner Name')}
              onChange={e => {
                setValue('slug', e.target.value.replace(/\W+/g, '-'))
                field.onChange(e)
              }}
              placeholder=''
              {...errorInput(errors, 'name')}
            />
          )}
        />
        <Controller
          name='description'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <>
              <FormLabel sx={{ mb: 1 }}>{t('Description')}</FormLabel>
              <InputTextArea
                {...field}
                minRows={3}
                sx={theme =>
                  Boolean(errors.description)
                    ? {
                        borderColor: theme.palette.error.main
                      }
                    : {}
                }
              />
              <Typography color={'error'} variant='body2'>
                {errors.description && translateFormYupMsg(errors.description.message)}
              </Typography>
            </>
          )}
        />
        <Controller
          name='url'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label='Url'
              placeholder=''
              {...errorInput(errors, 'url')}
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

export default FormShortcut
