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
import { productService } from 'src/services/product'
import {
  // ChangeEvent,
  useEffect,
  useState
} from 'react'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { ProductType } from 'src/types/apps/productType'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { FormLabel, Grid, Typography } from '@mui/material'
import { BannerData, BannerDetailType, BannerSchema } from 'src/types/apps/bannerType'
import { bannerService } from 'src/services/banner'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { InputTextArea } from 'src/components/form/InputTextArea'
import { ImageUpload } from 'src/components/form/ImageUpload'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import { useTranslation } from 'react-i18next'
import { useApp } from 'src/hooks/useApp'

interface props {
  open: boolean
  toggle: () => void
  selectBanner: BannerDetailType | null
  setSelectBanner: (data: BannerDetailType | null) => void
}

const FormBanner = (props: props) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()

  // ** Props
  const queryClient = useQueryClient()
  const { open, toggle, selectBanner } = props

  const [files1, setFiles1] = useState<File | null>(null)
  const [files2, setFiles2] = useState<File | null>(null)

  const [product, setProduct] = useState<number | null>(null)
  const [searchProduct, setsearchProduct] = useState<PageOptionRequestType>({
    name: '',
    ...defaultPagination
  })

  const [productData, setProductData] = useState<ProductType[]>([])

  useQuery(['product-list', searchProduct], {
    queryFn: () => productService.getListProduct(searchProduct),
    onSuccess: data => {
      setProductData(data.data.data ?? [])

      if (data.data.data.length === 1) {
        setValue('url', data.data.data[0].id as unknown as string, {
          shouldValidate: true,
          shouldDirty: true
        })
      }
    }
  })

  const defaultValue = {
    name: '',
    description: '',
    url: '',
    status: true
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
    resolver: yupResolver(BannerSchema)
  })

  const { mutate: mutateUploadImage } = useMutation(bannerService.uploadImage, {
    onSuccess: (data: any) => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('banner-list')

      reset(defaultValue)
    }
  })

  const { mutate: mutateUpdateImage } = useMutation(bannerService.updateImage, {
    onSuccess: (data: any) => {
      queryClient.invalidateQueries('banner-list')

      toast.success(t((data as unknown as ResponseType).data.message))
      reset(defaultValue)
    }
  })

  const { mutate, isLoading } = useMutation(bannerService.post, {
    onSuccess: (data: any) => {
      const resp = data.data.data
      const id = parseInt(resp.id)

      if (files1) {
        mutateUploadImage({
          data: {
            banner_id: id,
            device_type: 'phone',
            status: true
          },
          image: files1
        })
      }

      if (files2) {
        mutateUploadImage({
          data: {
            banner_id: id,
            device_type: 'desktop',
            status: true
          },
          image: files2
        })
      }

      toast.success(t((data as unknown as ResponseType).data.message))
      // toggle()
      queryClient.invalidateQueries('banner-list')

      reset(defaultValue)
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(bannerService.patch, {
    onSuccess: (data: any) => {
      const resp = data.data.data
      const id = parseInt(resp.id)

      if (
        files1 &&
        selectBanner &&
        selectBanner?.banner_images &&
        selectBanner.banner_images.length > 0
      ) {
        mutateUpdateImage({
          id: selectBanner.banner_images[0].id,
          data: {
            banner_id: id,
            device_type: 'desktop',
            status: true
          },
          image: files1
        })
      } else if (files1) {
        mutateUploadImage({
          data: {
            banner_id: id,
            device_type: 'phone',
            status: true
          },
          image: files1
        })
      }

      if (
        files2 &&
        selectBanner &&
        selectBanner?.banner_images &&
        selectBanner.banner_images.length > 1
      ) {
        mutateUpdateImage({
          id: selectBanner.banner_images[1].id,
          data: {
            banner_id: id,
            device_type: 'desktop',
            status: true
          },
          image: files2
        })
      } else if (files2) {
        mutateUploadImage({
          data: {
            banner_id: id,
            device_type: 'phone',
            status: true
          },
          image: files2
        })
      }

      queryClient.invalidateQueries('banner-list')

      toast.success(t((data as unknown as ResponseType).data.message))
      toggle()
      reset(defaultValue)
    }
  })

  const onSubmit = (data: BannerData) => {
    if (selectBanner && selectBanner.banner_master.id) {
      mutateEdit({ id: selectBanner.banner_master.id, data: data })
    } else {
      mutate(data)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
    props.setSelectBanner(null)
  }

  useEffect(() => {
    reset(defaultValue)

    if (selectBanner) {
      // if (selectBanner.image != '') setImgSrc(getImageAwsUrl(selectBanner.image))
      // else setImgSrc('')

      setValue('name', selectBanner.banner_master.name)
      setValue('description', selectBanner.banner_master.description)
      setValue('url', selectBanner.banner_master.url)

      setProduct(Number(selectBanner.banner_master.url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectBanner])

  return (
    <Dialog
      title={(selectBanner ? t('Edit') : t('Add')) + ' Banner'}
      open={open}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormLabel sx={{ mb: 1 }}>{t('Banner Mobile')} (480 x 320)</FormLabel>
            <ImageUpload
              imagePreview={
                selectBanner && selectBanner.banner_images && selectBanner.banner_images.length > 0
                  ? getImageAwsUrl(selectBanner.banner_images[0].image)
                  : undefined
              }
              onChange={setFiles1}
              onDelete={() => setFiles1(null)}
              label='480 x 320'
              size={{
                width: 144,
                height: 96
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormLabel sx={{ mb: 1 }}>{t('Banner Desktop')} (1024 x 768)</FormLabel>
            <ImageUpload
              imagePreview={
                selectBanner && selectBanner.banner_images && selectBanner.banner_images.length > 1
                  ? getImageAwsUrl(selectBanner.banner_images[1].image)
                  : undefined
              }
              onChange={setFiles2}
              onDelete={() => setFiles2(null)}
              label='1024 x 768'
              size={{
                width: 180,
                height: 135
              }}
            />
          </Grid>
        </Grid>
        <Controller
          name='name'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label={t('Banner Name') ?? 'Banner Name'}
              {...errorInput(errors, 'name')}
            />
          )}
        />
        <Controller
          name='url'
          control={control}
          rules={{ required: true }}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          render={({ field: { onChange, value, ...field } }) => (
            <SelectCustom
              serverSide
              {...field}
              options={productData ?? []}
              optionKey='id'
              labelKey='name'
              label={t('Banner Link') ?? 'Banner Link'}
              onShowButton={() => {
                window.open('/product', '_blank')
              }}
              onInputChange={(_, newInputValue) => {
                setsearchProduct(old => ({ ...old, name: newInputValue ?? '' }))
              }}
              onSelect={value => {
                if (value) {
                  setValue('url', value.id, {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                  setProduct(value.id)
                } else {
                  setValue('url', '', {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                  setProduct(null)
                }
              }}
              value={product}
              {...errorInput(errors, 'url')}
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
                {errors.description && errors.description.message}
              </Typography>
            </>
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

export default FormBanner
