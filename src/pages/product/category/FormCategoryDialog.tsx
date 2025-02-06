// ** React Imports

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// ** Third Party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
// ** Types Imports
import { CategoryData, CategorySchema, CategoryType } from 'src/types/apps/categoryType'
import CustomTextField from 'src/@core/components/mui/text-field'
import { categoryService } from 'src/services/category'
import { ChangeEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import Dialog from 'src/views/components/dialogs/Dialog'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { Avatar, Typography } from '@mui/material'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { VendorSettingType } from 'src/types/apps/vendor/setting'
import { vendorSettingService } from 'src/services/vendor/setting'
import { useTranslation } from 'react-i18next'
import { useApp } from 'src/hooks/useApp'
import { Icon } from '@iconify/react'

interface DialogProps {
  open: boolean
  toggle: () => void
  selectCategory: CategoryType | null
  lastPosition?: number
}

const FormCategoryDialog = (props: DialogProps) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  // ** Props
  const queryClient = useQueryClient()
  const { open, toggle, selectCategory, lastPosition } = props

  const [vendorSetting, setVendorSetting] = useState<VendorSettingType>()
  useQuery('productSetting', vendorSettingService.getVendorSetting, {
    onSuccess: data => {
      setVendorSetting(data.data.data)
    }
  })

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

  const [categoriesData, setCategoriesData] = useState<CategoryType[]>([])

  useQuery('categories-list', {
    queryFn: () => categoryService.getListCategoriesDetail(),
    onSuccess: data => {
      const _categoriesData: CategoryType[] = []
      data.data.data.map(categories => {
        _categoriesData.push(categories.category)

        categories.children.map(categoriesChild => {
          const _data = JSON.parse(JSON.stringify(categoriesChild.category))
          _data.name = categories.category.name + ' / ' + categoriesChild.category.name
          _categoriesData.push(_data)
        })
      })

      setCategoriesData(_categoriesData)
    }
  })

  const defaultValue = {
    name: '',
    parent_id: 0,
    position: 0
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<CategoryData>({
    defaultValues: defaultValue,
    mode: 'all',
    resolver: yupResolver(CategorySchema)
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [outletIdsDefault, setOutletIdsDefault] = useState<number[] | undefined>()
  // const [outletDataIfNull, setOutletDataIfNull] = useState<number[]>([])
  // const [outletIds, setOutletIds] = useState<number[] | undefined>()
  // const {
  //   data: outletData,
  //   onLoaded: setOutletData,
  //   isLoading: isLoadingOutlet
  // } = useDataLoading<OutletType[]>([])

  // useQuery(['outlet-list'], {
  //   enabled: Boolean(open),
  //   queryFn: () => outletService.getListOutlet({ ...maxLimitPagination }),
  //   onSuccess: data => {
  //     const outlets = data.data.data

  //     if (outlets && outlets.length > 0) {
  //       if (outlets.length == 1) {
  //         setOutletIdsDefault([outlets[0].id])
  //         setOutletIds([outlets[0].id])
  //       } else {
  //         let defaultOutlet = outlets.find(item => item.is_default)
  //         if (!defaultOutlet) {
  //           defaultOutlet = outlets[0]
  //         }

  //         setValue('outlet_ids', [defaultOutlet.id], {
  //           shouldValidate: true,
  //           shouldDirty: true
  //         })

  //         setOutletDataIfNull(outlets.filter(item => item.status == 'Active').map(item => item.id))
  //       }
  //     }
  //     setOutletData(data.data.data ?? [])
  //   }
  // })

  const { mutate: updateImage } = useMutation(categoryService.updateImage, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories-list')
    }
  })

  const { mutate, isLoading } = useMutation(categoryService.postCategory, {
    onSuccess: (data: any) => {
      const resp = data.data.data
      const id = resp.id

      if (files) {
        updateImage({ id: id, file: files })
      }

      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('categories-list')
      queryClient.invalidateQueries('categories-list-active')

      resetForm()
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(
    categoryService.patchCategory,
    {
      onSuccess: (data: any) => {
        const resp = data.data.data
        const id = resp.id

        if (files) {
          updateImage({ id: id, file: files })
        }

        queryClient.invalidateQueries('categories-list')

        toast.success(t((data as unknown as ResponseType).data.message))
        toggle()
        resetForm()
      }
    }
  )

  const onSubmit = (data: CategoryData) => {
    if (selectCategory) {
      mutateEdit({ id: selectCategory.id, data: data })
    } else {
      mutate(data)
    }
  }

  const handleClose = () => {
    toggle()
  }

  const resetForm = () => {
    setImgSrc('')
    console.log('reset')

    setValue('name', '')
    setValue('parent_id', 0)
    // reset(defaultValue)
  }

  useEffect(() => {
    if (lastPosition) {
      setValue('position', lastPosition + 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastPosition])

  useEffect(() => {
    if (open) {
      if (selectCategory) {
        if (selectCategory.image != '') setImgSrc(getImageAwsUrl(selectCategory.image))
        else setImgSrc('')

        // if ((selectCategory?.outlet_ids ?? []).length == 0) {
        //   setValue('outlet_ids', outletDataIfNull)
        //   setOutletIds(outletDataIfNull)
        // } else {
        //   setOutletIds(
        //     (selectCategory.outlets ?? [])
        //       .filter(outlet => outlet.status == 'Active')
        //       .map(outlet => outlet.id)
        //   )

        //   setValue('outlet_ids', selectCategory.outlet_ids)
        // }
        setValue('name', selectCategory.name)
        setValue('parent_id', selectCategory.parent_id ?? 0)
        setValue('position', selectCategory.position ?? 0)
      } else {
        setImgSrc('')
        resetForm()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectCategory, open])

  // useEffect(() => {
  //   setValue('outlet_ids', outletIds ?? [], {
  //     shouldValidate: true,
  //     shouldDirty: true
  //   })
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [outletIds])

  return (
    <Dialog
      title={(selectCategory ? t('Edit') : t('Add')) + ' ' + t('Category')}
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
        <Box display={'flex'} flexDirection={'column'} rowGap={4}>
          {/* {isLoadingOutlet ||
            (outletData.length > 1 && (
              <SelectChip
                multiple
                value={outletIds}
                label={t('Outlet') ?? 'Outlet'}
                options={outletData}
                placeholder='Outlet'
                labelKey='name'
                optionKey={'id'}
                onSelect={item => {
                  setOutletIds(item ? pluck(item, 'id') : [])
                }}
                onSelectAll={() => {
                  setOutletIds(pluck(outletData, 'id'))
                }}
                {...errorInput(errors, 'outlet_ids')}
              />
            ))} */}
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field: { ...field } }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={t('Category Name') ?? 'Category Name'}
                placeholder='Shoes'
                {...errorInput(errors, 'name')}
              />
            )}
          />
          {/* <Controller
            name='parent_id'
            control={control}
            render={({ field }) => (
              <SelectCustom
                {...field}
                label={t('Parent Category') ?? 'Parent Category'}
                isFloating={false}
                {...errorInput(errors, 'parent_id')}
                options={categoriesData.filter(data => data.id != selectCategory?.id)}
                optionKey='id'
                labelKey='name'
                required={false}
                nullableText='None'
                onSelect={item => {
                  setValue('parent_id', item?.id ?? 0, { shouldValidate: true })
                }}
              />
            )}
          /> */}

          <Typography variant='body2' color='textSecondary' mb={-3.5}>
            {t('Position')}
          </Typography>

          <Controller
            name='position'
            control={control}
            render={({ field }) => (
              <TextFieldNumber
                isFloat
                {...field}
                fullWidth
                sx={{ mb: 4 }}
                // label={t('Order By')}
                placeholder='Untuk Urutan Kategori dalam POS dan Marketplace'
              />
            )}
          />

          {vendorSetting?.is_fix_tax_product_checkout_active && (
            <Controller
              name='fix_tax'
              control={control}
              render={({ field }) => (
                <TextFieldNumber
                  {...field}
                  isFloat
                  label={t('Fix Tax')}
                  size='small'
                  fullWidth
                  prefix='Rp '
                  InputProps={{
                    inputProps: {
                      min: 0
                    }
                  }}
                />
              )}
            />
          )}
        </Box>

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

export default FormCategoryDialog
