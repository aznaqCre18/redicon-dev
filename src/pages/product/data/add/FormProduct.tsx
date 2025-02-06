/* eslint-disable jsx-a11y/alt-text */
import {
  Card,
  Grid,
  Typography,
  styled,
  TextField,
  Button,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Avatar,
  InputAdornment,
  useTheme,
  Table,
  IconButton,
  GridProps,
  Switch
} from '@mui/material'

import { useRouter } from 'next/navigation'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { brandService } from 'src/services/brand'
import { categoryService } from 'src/services/category'
import { productService } from 'src/services/product'
import {
  ProductSchemaType,
  ProductSchema,
  ProductType,
  variantValueType,
  VariantSchemaType,
  VariantWithoutMembershipType,
  ProductDataWithoutMembership,
  ProductDetailWithoutMembershipType
} from 'src/types/apps/productType'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { unitService } from 'src/services/unit'
import { CategoriesDetailType } from 'src/types/apps/categoryType'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { toast } from 'react-hot-toast'
import { ResponseTypeWithData } from 'src/types/response/response'
import SelectChip from 'src/components/form/select/SelectChip'
import { ProductOutletType } from 'src/types/apps/productOutletType'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { Icon } from '@iconify/react'
import { attributeService } from 'src/services/attribute'
import { AttributeType } from 'src/types/apps/attributeType'
import { getImageAwsUrl, parseImageAws } from 'src/utils/imageUtils'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import TextFieldNumberOnBlur from 'src/components/form/TextFieldNumberOnBlur'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useDisclosure } from 'src/hooks/useDisclosure'
import Dialog from 'src/views/components/dialogs/Dialog'
import { useConfirmLeave } from 'src/hooks/useConfirmLeave'
import Link from 'next/link'
import useAppBarButton from 'src/hooks/useAppBarButton'
import { ReactSortable } from 'react-sortablejs'
import { parseISO } from 'date-fns'
import { BrandType } from 'src/types/apps/brandType'
import { UnitType } from 'src/types/apps/unitType'
import { formatNumber } from 'src/utils/numberUtils'
import dynamic from 'next/dynamic'
import { EditorProps } from 'react-draft-wysiwyg'
import { EditorState } from 'draft-js'
import { convertFromHTML, convertToHTML } from 'draft-convert'
// import draftToHtml from 'draftjs-to-html'
import { promise } from 'src/utils/promise'
import DialogLayoutProduct, { LayoutProduct } from '../components/dialogs/DialogLayoutProduct'
import DialogSizes from '../components/DialogSizes'
import FormCategoryDialog from '../../category/FormCategoryDialog'
import FormBrandDialog from '../../brand/FormBrandDialog'
import FormUnitDialog from '../../unit/FormUnitDialog'
import { VendorSettingType } from 'src/types/apps/vendor/setting'
import { devMode } from 'src/configs/dev'
import imageCompression from 'browser-image-compression'
import { useTranslation } from 'react-i18next'
import DialogLogPrice from './components/DialogLogPrice'
import { autoIncrementString } from 'src/utils/stringUtils'
import { getTypeVideoOrImageFromFileName } from 'src/utils/fileUtils'
import { useApp } from 'src/hooks/useApp'
import { useDataLoading } from 'src/hooks/useDataLoading'
import { useAuth } from 'src/hooks/useAuth'
import { vendorSettingService } from 'src/services/vendor/setting'
// import { FFmpeg } from '@ffmpeg/ffmpeg'
// import { fetchFile } from '@ffmpeg/util'

// install @types/draft-js @types/react-draft-wysiwyg and @types/draft-js @types/react-draft-wysiwyg for types

// settings
const defaultMinVideoDuration = 0
const defaultMaxVideoDuration = devMode ? 60 : 60

async function getDuration(file: File): Promise<number> {
  const url = URL.createObjectURL(file)

  return new Promise(resolve => {
    const audio = document.createElement('audio')
    audio.muted = true
    const source = document.createElement('source')
    source.src = url //--> blob URL
    audio.preload = 'metadata'
    audio.appendChild(source)
    audio.onloadedmetadata = function () {
      resolve(audio.duration)
    }
  })
}

const Editor = dynamic<EditorProps>(() => import('react-draft-wysiwyg').then(mod => mod.Editor), {
  ssr: false
})

const pluck = (arr: any[], key: string) => arr.map(i => i[key])

const GridLabel = ({
  alignItems = 'center',
  ...props
}: {
  children: React.ReactNode
  alignItems?: 'center' | 'start' | 'flex-end'
} & Omit<GridProps, ''>) => (
  <Grid
    {...props}
    sx={{
      display: 'flex',
      alignItems: alignItems,
      textAlign: 'right',
      justifyContent: 'end',
      paddingRight: '10px',
      ...(alignItems == 'start' && { marginTop: '10px' })
    }}
  />
)

const CardWrapper = styled(Card)(() => ({
  padding: '20px',
  '&:not(:first-of-type)': { marginTop: '12px' }
}))
const defaultVariantSizes = [
  {
    name: '32',
    isActive: false
  }
]

const MultipleWrapper = styled(Grid)(() => ({
  paddingLeft: '0.5rem',
  width: '100%'
}))

const VariantWrapper = styled('div')(({ theme }) => ({
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  padding: 12,
  display: 'flex'
}))

// const CheckboxWrapper = styled('div')(() => ({
//   display: 'inline-flex',
//   alignItems: 'center',
//   marginRight: '20px'
// }))

type VariantsType = {
  name: string
  options: string[]
}

// type ApplyMembershipType = { [key: string]: string | undefined }

// type MasterPriceType = { [key: string]: number | undefined }
// type MasterPriceDiscountType = { [key: string]: 'percentage' | 'nominal' }

type dialogCreateType = 'outlet' | 'category' | 'brand' | 'unit' | null

type ImageProductType = {
  id: number
  uploaded: boolean
  data: string
  aws?: string
  files?: File
}

const FormProduct = ({
  data: productData,
  isDuplicate
}: {
  data?: ProductDetailWithoutMembershipType | undefined
  isDuplicate?: boolean
}) => {
  const { checkPermission } = useAuth()

  const theme = useTheme()
  const { t } = useTranslation()
  const { errorInput, translateFormYupMsg } = useApp()

  const [isSubmitAndAdd, setIsSubmitAndAdd] = useState<boolean>(false)

  const [isCanDirty, setIsCanDirty] = useState<boolean>(false)
  const [isDirty2, setDirty2] = useState<boolean>(false)

  const variantsData: VariantsType[] = [
    { name: t('Color'), options: ['Black', 'White', 'Pink', 'Yellow'] },
    { name: t('Size'), options: ['39', '40', '41', '42'] }
  ]

  // useAppBarButton
  const { setButtonLeft, setButtonRight } = useAppBarButton()

  const [vendorSetting, setVendorSetting] = useState<VendorSettingType | undefined>(undefined)

  // const [productExtra, setProductExtra] = useState<ProductExtraType | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const compressVideo = async (
    file: File,
    maxSize?: number
  ): Promise<{ success: boolean; msg: string; file: File }> => {
    // error if file size is too big
    if (maxSize && file.size > maxSize) {
      return {
        success: false,
        msg: 'Ukuran File Video Maksimal ' + formatNumber(maxSize / 1024 / 1024) + 'MB',
        file
      }
    }

    return { success: true, msg: 'success', file }

    // const ffmpeg = new FFmpeg()

    // ffmpeg.on('log', ({ message }) => {
    //   console.log(message)
    // })

    // await ffmpeg.load()

    // console.log('load ffmpeg')

    // await ffmpeg.writeFile(file.name, await fetchFile(file))
    // await ffmpeg
    //   .exec([
    //     '-i',
    //     file.name,
    //     '-vcodec',
    //     'libx264',
    //     '-crf',
    //     '5',
    //     '-preset',
    //     'faster',
    //     'output.mp4'
    //   ])
    //   .then()

    // const data = await ffmpeg.readFile('output.mp4')

    // const blob = new Blob([data.buffer], { type: 'video/mp4' })
    // const compressedFile = new File([blob], file.name, { type: 'video/mp4' })

    // console.log(compressedFile.size)

    // return compressedFile
  }

  useQuery('productSetting', vendorSettingService.getVendorSetting, {
    onSuccess: data => {
      setVendorSetting(data.data.data)
    },
    cacheTime: 0
  })

  // useEffect(() => {
  //   setButtonLeft(
  //     <>
  //       <Button
  //         variant='text'
  //         size='small'
  //         startIcon={<Icon icon='mingcute:layout-6-fill' />}
  //         onClick={openLayoutProduct}
  //       >
  //         {t('Layout Product')}
  //       </Button>
  //     </>
  //   )

  //   return () => {
  //     setButtonLeft(undefined)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [setButtonLeft])

  const [statusProduct, setStatusProduct] = useState<'live' | 'draft' | 'archived'>('live')

  // for Purchase
  const [purchasePrice, setPurchasePirce] = useState<number | undefined | null>()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [purchaseDiscount, setPurchaseDiscount] = useState<number | undefined | null>()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [purchaseDiscountType, setPurchaseDiscountType] = useState<'percentage' | 'nominal'>(
    'percentage'
  )

  const [sellingPrice, setSellingPrice] = useState<number | undefined | null>()

  // for master price
  // const [masterPrice, setMasterPrice] = useState<MasterPriceType>({})
  // const [masterPriceDisplay, setMasterPriceDisplay] = useState<MasterPriceType>({})
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // // const [masterProfitPercentage, setMasterProfitPercentage] = useState<MasterPriceType>({})
  // const [masterPriceDiscount, setMasterPriceDiscount] = useState<MasterPriceType>({})
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [masterPriceDiscountType, setMasterPriceDiscountType] = useState<MasterPriceDiscountType>(
  //   {}
  // )

  // for product type
  const [productType, setProductType] = useState<'STOCK' | 'NONSTOCK'>('STOCK')

  // const refreshProfitPercentage = (index: number) => {
  //   const masterPriceIndex = masterPrice[index + 1] ?? 0
  //   const masterPriceDiscountIndex = masterPriceDiscount[index + 1] ?? 0

  //   const newData =
  //     masterPrice[index + 1] != undefined
  //       ? purchasePrice
  //         ? (((masterPriceDiscount[index + 1] != undefined &&
  //           masterPriceDiscountType[index + 1] == 'percentage'
  //             ? masterPriceIndex - (masterPriceIndex * masterPriceDiscountIndex) / 100
  //             : masterPriceIndex - masterPriceDiscountIndex) -
  //             (purchaseDiscount
  //               ? purchaseDiscountType == 'nominal'
  //                 ? purchasePrice - purchaseDiscount
  //                 : purchasePrice - (purchasePrice * purchaseDiscount) / 100
  //               : purchasePrice)) /
  //             (purchaseDiscount
  //               ? purchaseDiscountType == 'nominal'
  //                 ? purchasePrice - purchaseDiscount
  //                 : purchasePrice - (purchasePrice * purchaseDiscount) / 100
  //               : purchasePrice)) *
  //           100
  //         : 100
  //       : undefined

  //   setMasterProfitPercentage(old => {
  //     const newMasterProfitPercentage = { ...old }
  //     newMasterProfitPercentage[index + 1] = newData

  //     return newMasterProfitPercentage
  //   })
  // }

  // const refreshAllProfitPercentage = () => {
  //   Object.keys(masterPrice).forEach((_, index) => {
  //     refreshProfitPercentage(index)
  //   })
  // }

  // useEffect(() => {
  //   refreshAllProfitPercentage()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [purchasePrice, purchaseDiscount, purchaseDiscountType, masterPrice, masterPriceDiscount])

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    resetField,
    formState: { errors, isDirty },
    reset
  } = useForm<ProductSchemaType>({
    mode: 'all',
    defaultValues: {
      product_extra_id: 0,
      product_type: 'STOCK',
      // wholesale_price: [],
      minimum_order: 1,
      weight: 1,
      status: 'live',
      is_best_seller: false,
      is_show_on_pos: true,
      commission_type: 'nominal'
    },
    resolver: yupResolver(ProductSchema)
  })

  // purchase discount
  useEffect(() => {
    if (purchaseDiscount == 0 || purchaseDiscount == null || purchaseDiscount == undefined) {
      setValue('purchase_discount', null, {
        shouldDirty: isCanDirty
      })

      setValue('purchase_discount_type', null, {
        shouldDirty: isCanDirty
      })
    } else {
      setValue('purchase_discount', purchaseDiscount ? purchaseDiscount : null, {
        shouldDirty: isCanDirty
      })
      setValue('purchase_discount_type', purchaseDiscountType, {
        shouldDirty: isCanDirty
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseDiscount, purchaseDiscountType])

  // product type
  useEffect(() => {
    setValue('product_type', productType, {
      shouldDirty: isCanDirty
    })

    if (productType == 'NONSTOCK' && (getValues().stock <= 0 || getValues().stock == undefined)) {
      setValue('stock', 1, { shouldDirty: isCanDirty })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType])

  const [showOnPOS, setShowOnPOS] = useState<boolean>(true)

  useEffect(() => {
    setValue('is_show_on_pos', showOnPOS, {
      shouldDirty: isCanDirty
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOnPOS])

  const [isBestSellerDefault, setIsBestSellerDefault] = useState<boolean>(false)
  const [isBestSeller, setIsBestSeller] = useState<boolean>(false)

  useEffect(() => {
    setValue('is_best_seller', isBestSeller, {
      shouldDirty: isCanDirty
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBestSeller])

  const [isNewestDefault, setIsNewestDefault] = useState<boolean>(false)
  const [isNewest, setIsNewest] = useState<boolean>(false)

  useEffect(() => {
    setValue('is_newest', isNewest, {
      shouldDirty: isCanDirty
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewest])

  const [isPromo, setIsPromo] = useState<boolean>(false)

  useEffect(() => {
    setValue('is_promo', isPromo, {
      shouldDirty: isCanDirty
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPromo])

  // DIALOG
  const [layoutProduct, setLayoutProduct] = useState<LayoutProduct>({
    media: true,
    shipping: true,
    other: true
  })
  const {
    isOpen: isOpenLayoutProduct,
    onOpen: openLayoutProduct,
    onClose: closeLayoutProduct
  } = useDisclosure(false)

  const [levelSellingDialog, setLevelSellingDialog] = useState<number | undefined>(undefined)
  const onCloseDialogLogPrice = () => {
    setLevelSellingDialog(undefined)
  }

  const {
    isOpen: isOpenPreviewVideo,
    onOpen: openPreviewVideo,
    onClose: closePreviewVideo
  } = useDisclosure()

  const [previewImage, setPreviewImage] = useState<ImageProductType | undefined>(undefined)

  // for variant photo
  const [variantPhoto, setVariantPhoto] = useState<boolean>(false)

  // useEffect(() => {
  //   if (masterPrice) {
  //     const newMasterPriceDisplay: MasterPriceType = {}
  //     Object.keys(masterPrice).forEach(key => {
  //       newMasterPriceDisplay[parseInt(key)] =
  //         masterPrice[parseInt(key)] ?? newMasterPriceDisplay[parseInt(key) - 1]
  //     })

  //     setMasterPriceDisplay(newMasterPriceDisplay)
  //   }
  // }, [masterPrice])

  // for master sku
  const [masterSku, setMasterSku] = useState<string>('')

  const [startDateDiscount, setStartDateDiscount] = useState<DateType | null>(null)
  const [endDateDiscount, setEndDateDiscount] = useState<DateType | null>(null)

  // for wholesale
  const [enableWholesale, setEnableWholesale] = useState<boolean>(false)
  const [wholesalePiceLength, setWholesalePiceLength] = useState<number>(1)

  const router = useRouter()
  const queryClient = useQueryClient()

  // Data For Product
  const [enableDescriptionRTE, setEnableDescriptionRTE] = useState<boolean>(false)
  const [descriptionRTE, setDescriptionRTE] = useState<EditorState | undefined>(undefined)

  // const { data: membsershipData } = useQuery('membership-list-products', {
  //   queryFn: () =>
  //     membershipService.getList({
  //       limit: 50,
  //       page: 1,
  //       sort: 'asc',
  //       order: 'level',
  //       is_active: 'true'
  //     }),
  //   onSuccess: data => {
  //     if (!productData && data) {
  //       if (data.data.data.length > 0) {
  //         const masterPrice: MasterPriceType = {}

  //         Object.keys([...Array(data.data.data.length)]).forEach((_, index) => {
  //           masterPrice[index + 1] = undefined
  //         })

  //         setMasterPrice(masterPrice)
  //       }
  //     }
  //   },
  //   cacheTime: 0
  // })

  // Utils like check
  const [productNameAvailable, setProductNameAvailable] = useState(true)
  const { mutate: checkProductName, isLoading: isLoadingCheckProductName } = useMutation(
    productService.checkProductNameAvailable,
    {
      onSuccess: data => {
        setProductNameAvailable(data.data.data.is_available)
      }
    }
  )

  const [skuAvailable, setSkuAvailable] = useState(true)
  const { mutate: checkSku, isLoading: isLoadingCheckSku } = useMutation(
    productService.checkProductSkuAvailable,
    {
      onSuccess: data => {
        setSkuAvailable(data.data.data.is_available)
      }
    }
  )

  // const [type, setType] = useState<'single' | 'multiple'>('single')
  const [variants, setVariants] = useState<VariantsType[]>([])
  const [variantSizes, setVarianSizes] = useState<variantValueType[]>(defaultVariantSizes)
  const [imageVariantsStr, setImageVariantsStr] = useState<{ [key: string]: string }>({})
  const [deleteImageVariantIds, setDeleteImageVariantIds] = useState<number[]>([])
  const [imageVariants, setImageVariants] = useState<{ [key: string]: File }>({})

  // const { mutate: updateVariantImage } = useMutation(productService.updateVariantImage, {
  //   onError: (err: errorType) => {
  //     console.log(err)
  //     if (err.response && err.response.data && err.response.data.message) {
  //       alert(err.response?.data?.message)
  //     }
  //   }
  // })

  // Apply All
  const [applyStock, setApplyStock] = useState<number | undefined>(undefined)
  const [applyMaxOrder, setApplyMaxOrder] = useState<number | undefined>(undefined)
  const [applySku, setApplySku] = useState<string>('')
  // const [applyMembership, setApplyMembership] = useState<ApplyMembershipType>({})
  const [applySellingPrice, setApplySellingPrice] = useState<number | undefined>(undefined)

  // apply all hover
  const [hoverStock, setHoverStock] = useState(false)
  const [hoverMaxOrder, setHoverMaxOrder] = useState(false)
  const [hoverSku, setHoverSku] = useState(false)
  // const [hoverMembership, setHoverMembership] = useState<number | null>(null)
  const [hoverSellingPrice, setHoverSellingPrice] = useState(false)

  const [idVariants, setIdVariants] = useState<{ [key: string]: number }>({})
  const [stockVariants, setStockVariants] = useState<{ [key: string]: number }>({})
  const [maxOrderVariants, setMaxOrderVariants] = useState<{ [key: string]: number | null }>({})
  const [skuVariants, setSkuVariants] = useState<{ [key: string]: string }>({})
  const [sellingPriceVariants, setSellingPriceVariants] = useState<{ [key: string]: number }>({})
  // const [membershipVariants, setMembershipVariants] = useState<{
  //   [key: string]: { [key: string]: string }
  // }>({})

  // useEffect(() => {
  //   console.log(membershipVariants)
  // }, [membershipVariants])

  const handleApplyAll = () => {
    if (applyStock != undefined) {
      const newStockVariants: { [key: string]: number | undefined } = {}
      Object.keys(stockVariants).forEach(key => {
        newStockVariants[key] = applyStock
      })
      setStockVariants(newStockVariants as any)

      getValues().variants?.map((_item, index) => {
        setValue(`variants.${index}.stock`, applyStock, { shouldDirty: isCanDirty })
      })
    }

    if (applyMaxOrder != undefined) {
      let _applyMaxOrder: number | null = applyMaxOrder
      if (applyMaxOrder == 0) _applyMaxOrder = null

      const newMaxOrderVariants: { [key: string]: number | null } = {}
      Object.keys(maxOrderVariants).forEach(key => {
        newMaxOrderVariants[key] = _applyMaxOrder
      })

      setMaxOrderVariants(newMaxOrderVariants as any)

      getValues().variants?.map((_item, index) => {
        setValue(`variants.${index}.maximum_order`, _applyMaxOrder, { shouldDirty: isCanDirty })
      })
    }

    if (applySku != '') {
      const newSkuVariants: { [key: string]: string } = {}
      Object.keys(skuVariants).forEach(key => {
        newSkuVariants[key] = applySku
      })
      setSkuVariants(newSkuVariants)

      getValues().variants?.map((_item, index) => {
        setValue(`variants.${index}.sku`, applySku, { shouldDirty: isCanDirty })
      })
    }

    // const newMembershipVariants: { [key: string]: { [key: string]: string | undefined } } =
    //   JSON.parse(JSON.stringify(membershipVariants))
    // Object.keys(applyMembership).forEach((key, index) => {
    //   if (applyMembership[key] != '' && applyMembership[key] != undefined) {
    //     Object.keys(membershipVariants[key]).forEach(keyMember => {
    //       newMembershipVariants[key][keyMember] = applyMembership[key]
    //     })
    //     setMembershipVariants(newMembershipVariants as any)

    if (applySellingPrice != undefined) {
      const newSellingPriceVariants: { [key: string]: number | undefined } = {}
      Object.keys(sellingPriceVariants).forEach(key => {
        newSellingPriceVariants[key] = applySellingPrice
      })
      setSellingPriceVariants(newSellingPriceVariants as any)

      getValues().variants?.map((_item, index) => {
        setValue(`variants.${index}.price`, applySellingPrice, { shouldDirty: isCanDirty })
      })
    }

    // const newMembershipVariants: { [key: string]: { [key: string]: string | undefined } } =
    //   JSON.parse(JSON.stringify(membershipVariants))
    // Object.keys(applyMembership).forEach((key, index) => {
    //   if (applyMembership[key] != '' && applyMembership[key] != undefined) {
    //     Object.keys(membershipVariants[key]).forEach(keyMember => {
    //       newMembershipVariants[key][keyMember] = applyMembership[key]
    //     })
    //     setMembershipVariants(newMembershipVariants as any)

    //     getValues().variants?.map((_item, indexVarian) => {
    //       setValue(
    //         `variants.${indexVarian}.price.${index}`,
    //         parseInt(applyMembership[key] as any),
    //         { shouldDirty: isCanDirty }
    //       )
    //     })
    //   }
    // })
  }

  const handleChangeVariant = (value: string[], index: number) => {
    const variantName = variants[index].name
    const variantValues = getValues().variants
    if (variantValues) {
      if (value.length < Object.keys(variantValues).length) {
        // is delete variant option

        variantValues.forEach((variant, indexVariant) => {
          const attribute = (variant.attributes ?? []).find(attr => attr.name == variantName)
          if (attribute) {
            if (!value.includes(attribute.value)) {
              setValue(
                `variants`,
                variantValues.filter((_, index) => index != indexVariant),
                { shouldDirty: isCanDirty }
              )
            }
          }
        })
      }
    }

    const newStockVariants: { [key: string]: number } = {}
    const oldStockVariants = JSON.parse(JSON.stringify(stockVariants))
    const newMaxOrderVariants: { [key: string]: number | null } = {}
    const oldMaxOrderVariants = JSON.parse(JSON.stringify(newMaxOrderVariants))
    const newSkuVariants: { [key: string]: string } = {}
    const oldSkuVariants = JSON.parse(JSON.stringify(skuVariants))
    const newSellingPriceVariants: { [key: string]: number } = {}
    const oldSellingPriceVariants = JSON.parse(JSON.stringify(sellingPriceVariants))
    // const newMembershipVariants: { [key: string]: { [key: string]: string } } = {}
    // const oldMembershipVariants: { [key: string]: { [key: string]: string } } = JSON.parse(
    //   JSON.stringify(membershipVariants)
    // )

    if (variants.length == 1) {
      value.map((variant1, index) => {
        const oldName = variants[0].options[index] ?? variant1
        newStockVariants[`${variant1}`] = oldStockVariants[`${oldName}`] ?? 0
        newMaxOrderVariants[`${variant1}`] = oldMaxOrderVariants[`${oldName}`]
        newSkuVariants[`${variant1}`] = oldSkuVariants[`${oldName}`] ?? ''
        newSellingPriceVariants[`${variant1}`] = oldSellingPriceVariants[`${oldName}`] ?? ''
      })

      // membsershipData?.data.data
      //   .filter(item => item.id != 1)
      //   .forEach((_membership, index) => {
      //     newMembershipVariants[index.toString()] = {}
      //     value.map((variant1, index2) => {
      //       const oldName = variants[0].options[index2] ?? variant1

      //       newMembershipVariants[index.toString()][`${variant1}`] =
      //         oldMembershipVariants[index.toString()]?.[`${oldName}`] ?? ''
      //     })
      //   })
    } else {
      const _variant1 = index == 0 ? value : variants[0].options
      const _variant2 = index == 1 ? value : variants[1].options

      _variant1.map((variant1, index) => {
        _variant2.map((variant2, index2) => {
          const oldName1 = variants[0].options[index] ?? variant1
          const oldName2 = variants[1].options[index2] ?? variant2

          newStockVariants[`${variant1}_${variant2}`] =
            oldStockVariants[`${oldName1}_${oldName2}`] ?? 0

          newMaxOrderVariants[`${variant1}_${variant2}`] =
            oldMaxOrderVariants[`${oldName1}_${oldName2}`]

          newSkuVariants[`${variant1}_${variant2}`] =
            oldSkuVariants[`${oldName1}_${oldName2}`] ?? ''

          newSellingPriceVariants[`${variant1}_${variant2}`] =
            oldSellingPriceVariants[`${oldName1}_${oldName2}`] ?? ''
        })
      })

      // membsershipData?.data.data
      //   .filter(item => item.id != 1)
      //   .forEach((_membership, index) => {
      //     newMembershipVariants[index.toString()] = {}
      //     _variant1.map((variant1, index2) => {
      //       _variant2.map((variant2, index3) => {
      //         const oldName1 = variants[0].options[index2] ?? variant1
      //         const oldName2 = variants[1].options[index3] ?? variant2

      //         newMembershipVariants[index.toString()][`${variant1}_${variant2}`] =
      //           oldMembershipVariants[index.toString()]?.[`${oldName1}_${oldName2}`] ?? ''
      //       })
      //     })
      //   })
    }

    setStockVariants(newStockVariants)
    setMaxOrderVariants(newMaxOrderVariants)
    setSkuVariants(newSkuVariants)
    setSellingPriceVariants(newSellingPriceVariants)
    // setMembershipVariants(newMembershipVariants)
  }

  const handleAddVariant = () => {
    setValue('variants', null)
    const newStockVariants: { [key: string]: number } = {}
    const newMaxOrderVariants: { [key: string]: number | null } = {}
    const newSkuVariants: { [key: string]: string } = {}
    const newSellingPriceVariants: { [key: string]: number } = {}
    // const newMembershipVariants: { [key: string]: { [key: string]: string } } = {}

    if (variants.length == 0) {
      if (!getValues().discount) {
        setValue(`discount`, 0)
      }

      if (getValues().stock == undefined) {
        setValue(`stock`, 1)
      }
    }

    setVariants([
      ...variants,
      {
        name: variantsData.filter(item => !pluck(variants, 'name').includes(item.name))[0].name,
        options: []
      }
    ])

    setStockVariants(newStockVariants)
    setMaxOrderVariants(newMaxOrderVariants)
    setSkuVariants(newSkuVariants)
    setSellingPriceVariants(newSellingPriceVariants)
    // setMembershipVariants(newMembershipVariants)
  }

  // ** Dialog
  const [addDialogSizesOpen, setDialogSizesOpen] = useState<boolean>(false)
  const [openDialogProductExtra, setOpenDialogProductExtra] = useState<boolean>(false)
  const [createDialogOpen, setCreateDialogOpen] = useState<dialogCreateType>(null)

  // IMAGE PRODUCT UPLOAD
  const [deleteImage, setDeleteImage] = useState<string[]>([])

  const [imagePreviews, setImagePreviews] = useState<ImageProductType[]>([])

  const [inputVideo, setInputVideo] = useState<File | undefined>(undefined)

  const handleDeleteImageProduct = (confirmDeleteMedia: ImageProductType) => {
    setDeleteImage(old => (confirmDeleteMedia.aws ? [...old, confirmDeleteMedia.aws] : old))
    setImagePreviews(old => old.filter(item => item.data != confirmDeleteMedia.data))
  }

  const [isVideoAws, setIsVideoAws] = useState(false)
  const [videoSrc, setVideoSrc] = useState('')
  const {
    data: categoriesData,
    isLoading: isLoadingCategory,
    onLoaded: setCategoriesData
  } = useDataLoading<CategoriesDetailType[]>([])

  const [subCategoryLv1Data, setsubCategoryLv1Data] = useState<CategoriesDetailType[]>([])
  const [subCategoryLv2Data, setsubCategoryLv2Data] = useState<CategoriesDetailType[]>([])

  const [brandData, setBrandData] = useState<BrandType[]>([])
  const [unitData, setUnitData] = useState<UnitType[]>([])
  // const [supplierData, setSupplierData] = useState<SupplierType[]>([])

  // const [productExtraData, setProductExtraData] = useState<ProductExtraType[]>([])

  // useQuery(['product-extra-list-all'], {
  //   queryFn: () => productExtraService.getList(maxLimitPagination),
  //   onSuccess: data => {
  //     setProductExtraData(data?.data.data ?? [])
  //   }
  // })

  // Attribute
  const [colorAttribute, setColorAttribute] = useState<AttributeType[]>([])
  const [sizeAttribute, setSizeAttribute] = useState<AttributeType[]>([])

  useQuery('color-attribute-list', {
    queryFn: () =>
      attributeService.getListAttribute({
        limit: 100,
        name: 'Color',
        page: 1,
        order: 'id',
        sort: 'asc'
      }),
    onSuccess: response => {
      if (response?.data.data && response.data.data.length > 1) {
        const data = response.data.data
        setColorAttribute(
          data.map(item => {
            return {
              ...item,
              name: t(item.value)
            }
          })
        )
      }
    },
    cacheTime: 0
  })

  useQuery('size-attribute-list', {
    queryFn: () =>
      attributeService.getListAttribute({
        limit: 100,
        name: 'Size',
        page: 1,
        order: 'id',
        sort: 'asc'
      }),
    onSuccess: response => {
      if (response?.data.data && response.data.data.length > 1) {
        const data = response.data.data
        setSizeAttribute(
          data.map(item => {
            return {
              ...item,
              name: t(item.value)
            }
          })
        )
      }
    },
    cacheTime: 0
  })

  // const [outletData, setOutletData] = useState<OutletType[]>([])
  // const { isLoading: isLoadingOutlet } = useQuery('outlet-list', {
  //   queryFn: () => outletService.getListOutlet(maxLimitPagination),
  //   onSuccess: data => {
  //     setOutletData(data.data.data ?? [])

  //     if (!productData && data?.data.data && data.data.data.length == 1)
  //       setValue('outlet_ids', [data.data.data[0].id!])
  //   },
  //   cacheTime: 0
  // })

  useQuery('categories-list-active', {
    queryFn: () => categoryService.getListCategoriesDetailActive(maxLimitPagination),
    onSuccess: data => {
      if (!productData && data?.data.data && data.data.data.length == 1) {
        setValue('category1_id', data.data.data[0].category.id)
      }

      setCategoriesData(data.data.data ?? [])
    },
    cacheTime: 0
  })

  const [isLoadingBrand, setIsLoadingBrand] = useState(true)
  useQuery(['brands-list'], {
    queryFn: () => brandService.getListBrandActive(maxLimitPagination),
    onSuccess: data => {
      setIsLoadingBrand(false)

      if (!productData && data?.data.data && data.data.data.length == 1)
        setValue('brand_id', data.data.data[0].id!)

      setBrandData(data.data.data ?? [])
    },
    cacheTime: 0
  })

  // const [isLoadingSupplier, setIsLoadingSupplier] = useState(true)
  // useQuery(['supplier-list'], {
  //   queryFn: () => supplierService.getListActive(maxLimitPagination),
  //   onSuccess: data => {
  //     setIsLoadingSupplier(false)

  //     setSupplierData(data.data.data ?? [])
  //   },
  //   cacheTime: 0
  // })

  useEffect(() => {
    if (productData && brandData.length > 0) {
      // check if brand_id is exist
      if (brandData.find(item => item.id == productData.product.brand_id)) {
        setValue('brand_id', productData.product.brand_id)
      } else if (brandData.length > 0) {
        const brandId = brandData[0].id as number

        setValue('brand_id', brandId)
      }
    }

    if (productData) setValue('notification', false)
    else {
      setIsNewest(true)
      setValue('notification', false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData, brandData])

  // useEffect(() => {
  //   if (productData && outletData.length > 0) {
  //     // check if brand_id is exist
  //     if (productData.outlets == null) {
  //       if (outletData.length === 1) {
  //         setValue('outlet_ids', [outletData[0].id!])
  //       } else {
  //         const defaultOutlet = outletData.find(item => item.is_default)

  //         if (defaultOutlet) {
  //           setValue('outlet_ids', [defaultOutlet.id!])
  //         } else {
  //           setValue('outlet_ids', [outletData[0].id!])
  //         }
  //       }
  //     }
  //   }

  //   if (productData) setValue('notification', false)
  //   else {
  //     setIsNewest(true)
  //     setValue('notification', false)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [productData, outletData])

  // useEffect(() => {
  //   if (productData && supplierData.length > 0) {
  //     setValue('supplier_id', productData.product.supplier_id)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [productData, supplierData])

  const [isLoadingUnit, setIsLoadingUnit] = useState(true)
  useQuery(['units-list'], {
    queryFn: () => unitService.getListUnitActive(maxLimitPagination),
    onSuccess: data => {
      if (data?.data.data && data.data.data.length == 1) setValue('unit_id', data.data.data[0].id!)

      setUnitData(data.data.data ?? [])
      setIsLoadingUnit(false)
    },
    cacheTime: 0
  })

  useEffect(() => {
    if (productData && unitData.length > 0) {
      // check if unit_id is exist
      if (unitData.find(item => item.id == productData.product.unit_id)) {
        setValue('unit_id', productData.product.unit_id)
      } else if (unitData.length > 0) {
        const unitId = unitData[0].id as number

        setValue('unit_id', unitId)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData, unitData])

  const { setShouldConfirmLeave } = useConfirmLeave(false)

  const handleInputImageVariantChange = (index: number, file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      const file = files[0]
      if (vendorSetting && file.size > vendorSetting.max_size_per_image) {
        alert('max file is 2MB')

        return
      }

      imageVariants[index] = file
      setImageVariants(imageVariants)

      reader.onload = () => {
        const oldImageVariantsStr = JSON.parse(JSON.stringify(imageVariantsStr))
        oldImageVariantsStr[index] = reader.result as string
        setImageVariantsStr(oldImageVariantsStr)
      }
      reader.readAsDataURL(files[0])
    }
  }

  const setConfirmDeletePhotoVariant = (index: number) => {
    if (imageVariantsStr[index]) {
      const oldImageVariantsStr = JSON.parse(JSON.stringify(imageVariantsStr))
      delete oldImageVariantsStr[index]

      setImageVariantsStr(oldImageVariantsStr)
    } else {
      const imageVariantId =
        productData && productData.variants && productData.variants[index]?.image
          ? productData.variants[index]?.id
          : undefined

      if (
        imageVariantId &&
        deleteImageVariantIds.find(item => item == imageVariantId) == undefined
      ) {
        setDeleteImageVariantIds(old => [...old, imageVariantId])
      }
    }
  }

  const RenderImageVariantUpload = ({
    index,
    disabled,
    size,
    label
  }: {
    index: number
    disabled?: boolean
    size?: number
    label?: string
  }) => {
    const variantData =
      productData &&
      productData.variants &&
      productData.variants[index] &&
      productData.variants[index].id
        ? productData.variants[index]
        : undefined

    const imageData =
      imageVariantsStr[index] ??
      (variantData
        ? deleteImageVariantIds.find(id => id == variantData.id) == undefined
          ? getImageAwsUrl(variantData.image)
          : undefined
        : undefined)

    return (
      <Box
        display={'flex'}
        justifyContent={'center'}
        position={'relative'}
        sx={{
          '&:hover .hover-button': {
            display: 'flex'
          }
        }}
      >
        {imageData && (
          <Box
            className='hover-button'
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              zIndex: 8,
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              rowGap: '2px'
            }}
          >
            <IconButton
              onClick={() => {
                if (imageData) setConfirmDeletePhotoVariant(index)
              }}
              size='small'
              color='success'
              sx={{
                color: theme.palette.common.black,
                background: theme.palette.grey[100],
                borderRadius: 0.4,
                '&:hover': {
                  background: theme.palette.grey[400],
                  color: theme.palette.common.black
                }
              }}
            >
              <Icon icon='bi:trash' width={16} height={16} />
            </IconButton>
          </Box>
        )}
        <Button
          disabled={disabled}
          component='label'
          sx={{
            p: 1
          }}
        >
          <Avatar
            variant='square'
            src={imageData}
            sx={theme => ({
              display: 'flex',
              flexDirection: 'column',
              rowGap: '8px',
              background: theme.palette.background.paper,
              width: size ?? '55px',
              height: size ?? '55px',
              border: `1px dashed ${theme.palette.divider}`
            })}
            alt={label ?? 'Upload Photo'}
          >
            <Icon icon='bi:image' width={24} height={24} />
            {label && <Typography variant='caption'>{label}</Typography>}
          </Avatar>
          <input
            hidden
            type='file'
            accept='image/*'
            onChange={e => handleInputImageVariantChange(index, e)}
            id={`upload-image-variant-${index}`}
          />
        </Button>
      </Box>
    )
  }

  // const [draggableProductPhoto, setDraggableProductPhoto] = useState(false)

  const RenderImageUpload = ({
    index,
    image,
    size,
    label,
    badge
  }: {
    index?: number
    image?: ImageProductType
    size?: number
    label?: string
    badge?: string | string[]
  }) => {
    return (
      <Box display={'flex'} justifyContent={'center'} position={'relative'}>
        <Button
          component='label'
          sx={{
            p: 1
          }}
        >
          {badge && (
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                rowGap: '2px'
              }}
            >
              {Array.isArray(badge) ? (
                badge.map((label, index) => (
                  <Typography
                    key={index}
                    sx={{
                      padding: '2px 4px',
                      background: theme.palette.success.main,
                      borderRadius: 0.4
                    }}
                    variant='caption'
                    color={'white'}
                    fontSize={8}
                    fontWeight={'bold'}
                  >
                    {label}
                  </Typography>
                ))
              ) : (
                <Typography
                  sx={{
                    padding: '2px 4px',
                    background: theme.palette.success.main,
                    borderRadius: 0.4
                  }}
                  variant='caption'
                  color={'white'}
                  fontSize={8}
                  fontWeight={'bold'}
                >
                  {badge}
                </Typography>
              )}
            </Box>
          )}
          <Avatar
            variant='square'
            src={image?.data}
            sx={theme => ({
              width: size ?? 100,
              height: size ?? 100,
              display: 'flex',
              flexDirection: 'column',
              rowGap: '8px',
              background: theme.palette.background.paper,
              border: `1px dashed ${theme.palette.divider}`
            })}
            alt={label ?? 'Upload Photo'}
          >
            <Icon icon='bi:image' width={24} height={24} />
            {label && <Typography variant='caption'>{label}</Typography>}
          </Avatar>
          <input
            hidden
            multiple
            type='file'
            accept='image/*'
            onChange={e => handleInputImageChange(e, image ? index : undefined, image ?? undefined)}
          />
        </Button>
      </Box>
    )
  }

  const handleInputImageChange = (file: ChangeEvent, index?: number, media?: ImageProductType) => {
    const { files } = file.target as HTMLInputElement

    if (files && files.length > 0) {
      setDirty2(true)

      promise(async () => {
        const lengthFiles = files.length

        // for with index
        for (let indexUpload = 0; indexUpload < lengthFiles; indexUpload++) {
          const reader = await new FileReader()
          const file = files[indexUpload]
          const fileSizeInMB = file.size / 1024 / 1024
          const maxFileSizeInMB = vendorSetting
            ? vendorSetting?.max_size_per_image / 1024 / 1024
            : 0.7

          const options = {
            maxSizeMB: fileSizeInMB > maxFileSizeInMB ? maxFileSizeInMB : undefined,
            maxWidthOrHeight: file.size > 256 ? 1024 : undefined,
            useWebWorker: true,
            fileType: 'image/jpeg'
          }

          if (fileSizeInMB > 10) {
            toast.error('File with name `' + file.name + '` can`t to upload, max file size is 10MB')

            continue
          }

          try {
            await imageCompression(file, options).then(compressedFile => {
              const newFile = new File([compressedFile], 'upload.jpg', {
                type: 'image/jpeg'
              })

              reader.onload = () => {
                if (index != undefined) {
                  if (media?.aws) {
                    setDeleteImage(old => (media.aws ? [...old, media.aws] : old))
                  }

                  setImagePreviews(old => {
                    const newImagePreviews = [...old]
                    newImagePreviews[index] = {
                      id: newImagePreviews[index].id,
                      uploaded: false,
                      data: reader.result as string,
                      files: newFile
                    }

                    return newImagePreviews
                  })
                } else {
                  setImagePreviews(old => [
                    ...old,
                    ...(vendorSetting && old.length < vendorSetting.max_upload_image_per_product
                      ? [
                          {
                            id: old.length + 1,
                            uploaded: false,
                            data: reader.result as string,
                            files: newFile
                          }
                        ]
                      : [])
                  ])
                }
              }
              reader.readAsDataURL(newFile)
            })
          } catch (error) {
            console.log(error)
          }

          // if (file.size > defaultMaxImageSize) {
          //   alert('max file is 2MB')

          //   return
          // }

          // reader.onload = () => {
          //   if (index != undefined) {
          //     setImagePreviews(old => {
          //       const newImagePreviews = [...old]
          //       newImagePreviews[index] = {
          //         id: indexUpload + 1,
          //         uploaded: false,
          //         data: reader.result as string,
          //         files: files[indexUpload]
          //       }

          //       return newImagePreviews
          //     })
          //   } else {
          //     setImagePreviews(old => [
          //       ...old,
          //       ...(old.length < maxImageProduct
          //         ? [
          //             {
          //               id: old.length + 1,
          //               uploaded: false,
          //               data: reader.result as string,
          //               files: files[indexUpload]
          //             }
          //           ]
          //         : [])
          //     ])
          //   }
          // }
          // reader.readAsDataURL(files[indexUpload])
        }

        // Object.keys(files).forEach((_, indexUpload) => {

        // })
      })
    }
  }

  const handleInputVideoChange = (file: ChangeEvent) => {
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      // const media = URL.createObjectURL(files[0])
      const file = files[0]

      getDuration(file).then(duration => {
        if (duration < defaultMinVideoDuration) {
          toast.error(`Min video duration is ${defaultMinVideoDuration} seconds`)

          return
        }
        if (duration > defaultMaxVideoDuration) {
          toast.error(`Max video duration is ${defaultMaxVideoDuration} seconds`)

          return
        }

        setDirty2(true)
        compressVideo(file, vendorSetting ? vendorSetting.max_size_per_video : undefined)
          .then(({ success, file, msg }) => {
            if (success) {
              setInputVideo(file)

              if (isVideoAws) {
                setIsVideoAws(false)
                setDeleteImage(old => (videoSrc ? [...old, parseImageAws(videoSrc)] : old))
              }

              const compressMedia = URL.createObjectURL(file)
              setVideoSrc(compressMedia)
            } else {
              toast.error(msg)
            }
          })
          .catch(err => {
            toast.error(err)
          })

        // // Max 5MB
        // if (vendorSetting && file.size > vendorSetting.max_size_per_video) {
        //   const maxSizeMB = vendorSetting.max_size_per_video / 1024 / 1024
        //   toast.error(`Max video file size is ${maxSizeMB}MB`)

        //   return
        // }

        // setInputVideo(file)
        // if (isVideoAws) {
        //   setIsVideoAws(false)
        //   setDeleteImage(old => (videoSrc ? [...old, videoSrc] : old))
        // }
        // setVideoSrc(media as string)
      })
    }
  }

  const onCloseDialogSizes = () => {
    setDialogSizesOpen(false)
  }

  const { mutate: createVarianProduct } = useMutation(productService.postProductVariant, {
    onSuccess: () => {
      queryClient.invalidateQueries('product-list')
    }
  })

  const { mutate: updateVarianProduct } = useMutation(productService.patchProductVariant, {
    onSuccess: () => {
      queryClient.invalidateQueries('product-list')
    }
  })

  const { mutate: deleteBatchVariant } = useMutation(productService.deleteBatchVariant, {
    onSuccess: () => {
      queryClient.invalidateQueries('product-list')
    }
  })

  // const { mutate: updateVarianType } = useMutation(productService.patchProductVariant, {
  //   onSuccess: data => {
  //     const response = data as unknown as ResponseTypeWithData<ProductVariantType>
  //     const productOutlet: ProductOutletType = {
  //       product_variant_id: response.data.data.id,
  //       outlet_ids: getValues().outlet_ids
  //     }
  //     createProductOutlet(productOutlet)

  //     // toast.success(response.data.message)
  //   },
  //   onError: (err: errorType) => {
  //     console.log(err)
  //     if (err.response && err.response.data && err.response.data.message) {
  //       alert(err.response?.data?.message)
  //     }
  //   }
  // })

  // const { mutate: mapProductOutlet } = useMutation(productService.postProductOutlet, {
  //   onSuccess: () => {
  //     queryClient.invalidateQueries('product-list')
  //   }
  // })

  const { mutate: deleteProductMedia } = useMutation(productService.deleteProductMedia, {
    onSuccess: async () => {
      queryClient.invalidateQueries('product-list')

      if (productData) {
        const files = imagePreviews.filter(item => item.files != undefined)
        const video = isVideoAws ? [parseImageAws(videoSrc)] : []

        if (files.length > 0) {
          const responseUpload = await files.map(async file => {
            return await productService.addProductMediaWithIndex({
              id: productData.product.id,
              file: file.files as File,
              index: file.id
            })
          })

          // promise all
          const responseUploadAll = await Promise.all(responseUpload)
          const idsUpload = responseUploadAll.map(item => item.index)

          const newImagePreviews = imagePreviews.map(item => {
            const hasUpload = idsUpload.includes(item.id)

            if (hasUpload) {
              const indexUpload = idsUpload.findIndex(id => id == item.id)
              const medias = responseUploadAll[indexUpload].media
              const last = medias && medias[medias.length - 1]
              if (medias && last) {
                return {
                  ...item,
                  uploaded: true,
                  aws: last
                }
              } else {
                return item
              }
            } else {
              return item
            }
          })

          if (newImagePreviews.length > 0)
            updateProductMediaSequence({
              id: productData?.product.id ?? 0,
              medias: [...newImagePreviews.map(item => item.aws ?? ''), ...video]
            })

          // patchProductMedia({
          //   id: productData.product.id,
          //   file: files.map(item => item.files as File)
          // })
        }

        if (inputVideo) {
          updateProductMediaVideo({
            id: productData.product.id,
            file: [inputVideo as File]
          })
        }

        // const productOutlet: ProductOutletType = {
        //   product_id: productData.product.id,
        //   outlet_ids: getValues().outlet_ids
        // }

        // mapProductOutlet(productOutlet)
      }
    }
  })

  const { mutate: deleteImageVariant } = useMutation(productService.deleteImageVariant, {
    onSuccess: () => {
      queryClient.invalidateQueries('product-list')
    }
  })

  // const { mutate: patchProductMedia } = useMutation(productService.addProductMedia, {
  //   onSuccess: res => {
  //     const indexs = imagePreviews
  //       .filter(item => item.files != undefined)
  //       .map(item => item.id - 1)

  //     const data = res.data.data

  //     const media = data.media

  //     // get last media to last - indexs.length
  //     if (media) {
  //       const lastMedia = media.slice(media.length - indexs.length)

  //       let index1 = 0
  //       const newImagePreviews = imagePreviews.map(item => {
  //         if (item.files != undefined) {
  //           return {
  //             ...item,
  //             uploaded: true,
  //             aws: lastMedia[index1++]
  //           }
  //         } else {
  //           return item
  //         }
  //       })

  //       updateProductMediaSequence({
  //         id: productData?.product.id ?? 0,
  //         medias: newImagePreviews.map(item => item.aws ?? '')
  //       })
  //     }

  //     queryClient.invalidateQueries('product-list')
  //   }
  // })

  const { mutate: updateProductMediaSequence } = useMutation(
    productService.updateProductMediaSequence,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('product-list')
      }
    }
  )

  const { mutate: updateProductMediaVideo } = useMutation(productService.updateProductMediaVideo, {
    onSuccess: () => {
      queryClient.invalidateQueries('product-list')
    }
  })

  const { mutate: createProduct, isLoading } = useMutation(productService.postProduct, {
    onSuccess: async data => {
      const response = data as unknown as ResponseTypeWithData<ProductType>
      // const productOutlet: ProductOutletType = {
      //   product_id: response.data.data.id,
      //   outlet_ids: getValues().outlet_ids
      // }

      const files = imagePreviews.filter(item => item.files != undefined)
      if (files.length > 0) {
        const responseUpload = await files.map(async file => {
          return await productService.addProductMediaWithIndex({
            id: response.data.data.id,
            file: file.files as File,
            index: file.id
          })
        })

        // promise all
        const responseUploadAll = await Promise.all(responseUpload)
        const idsUpload = responseUploadAll.map(item => item.index)

        const newImagePreviews = imagePreviews.map(item => {
          const hasUpload = idsUpload.includes(item.id)

          if (hasUpload) {
            const indexUpload = idsUpload.findIndex(id => id == item.id)
            const medias = responseUploadAll[indexUpload].media
            const last = medias && medias[medias.length - 1]

            if (medias && last) {
              return {
                ...item,
                uploaded: true,
                aws: last
              }
            } else {
              return item
            }
          } else {
            return item
          }
        })

        if (newImagePreviews.length > 0)
          updateProductMediaSequence({
            id: response.data.data.id,
            medias: newImagePreviews.map(item => item.aws ?? '')
          })

        // patchProductMedia({
        //   id: productData.product.id,
        //   file: files.map(item => item.files as File)
        // })
      }

      if (inputVideo) {
        updateProductMediaVideo({
          id: response.data.data.id,
          file: [inputVideo as File]
        })
      }

      if (getValues().variants) {
        const variants: VariantWithoutMembershipType[] =
          getValues().variants?.map((item: VariantSchemaType) => {
            // let _price: PriceMembershipType = {}
            // item.price.forEach((price, index) => {
            //   const __price = price ? Number(price) : masterPrice[index + 1] ?? 1

            //   _price = { ..._price, ...{ [(index + 1).toString()]: __price } }
            // })

            return {
              ...item,
              maximum_order: item.maximum_order ?? 0,
              product_id: response.data.data.id
              // price: _price
            }
          }) ?? []

        variants.forEach((variant, index) => {
          createVarianProduct({
            request: variant,
            image: imageVariants[index]
          })
        })
      }

      // if (productOutlet.outlet_ids.length > 0) mapProductOutlet(productOutlet)

      queryClient.invalidateQueries('product-list')
      toast.success(t(response.data.message))

      if (!isSubmitAndAdd) router.push('/product/data')
      else {
        const sku = getValues().sku as string
        const newSku = autoIncrementString(sku)

        setValue('sku', newSku)
        setMasterSku(newSku)

        setValue('name', '')
      }

      // const productVariants = getValues().variants
      // productVariants.forEach(variant => {
      //   const productVariant: ProductVariantData = {
      //     product_id: response.data.data.id,
      //     base_price: parseFloat(variant.base_price.toString()),
      //     images: ['img1.jpg'],
      //     membership_price: {
      //       '1': 10.99,
      //       '2': 11.99
      //     },
      //     sku: response.data.data.sku,
      //     stock: variant.stock
      //   }
      //   createVarianProduct(productVariant)
      // })
    }
  })

  const { mutate: updateProduct } = useMutation(productService.patchProduct, {
    onSuccess: async data => {
      const response = data as unknown as ResponseTypeWithData<ProductType>

      // const productOutlet: ProductOutletType = {
      //   product_id: response.data.data.id,
      //   outlet_ids: getValues().outlet_ids
      // }

      if (deleteImage.length > 0) {
        deleteProductMedia({ id: productData?.product.id ?? 0, medias: deleteImage })
      } else {
        if (productData) {
          const files = imagePreviews.filter(item => item.files != undefined)

          const video = isVideoAws ? [parseImageAws(videoSrc)] : []

          if (files.length > 0) {
            const responseUpload = await files.map(async file => {
              return await productService.addProductMediaWithIndex({
                id: productData.product.id,
                file: file.files as File,
                index: file.id
              })
            })

            // promise all
            const responseUploadAll = await Promise.all(responseUpload)
            const idsUpload = responseUploadAll.map(item => item.index)

            const newImagePreviews = imagePreviews.map(item => {
              const hasUpload = idsUpload.includes(item.id)

              if (hasUpload) {
                const indexUpload = idsUpload.findIndex(id => id == item.id)
                const medias = responseUploadAll[indexUpload].media
                const last = medias && medias[medias.length - 1]

                if (medias && last) {
                  return {
                    ...item,
                    uploaded: true,
                    aws: last
                  }
                } else {
                  return item
                }
              } else {
                return item
              }
            })

            if (newImagePreviews.length > 0)
              updateProductMediaSequence({
                id: productData?.product.id ?? 0,
                medias: [...newImagePreviews.map(item => item.aws ?? ''), ...video]
              })

            // patchProductMedia({
            //   id: productData.product.id,
            //   file: files.map(item => item.files as File)
            // })
          } else {
            if (imagePreviews.length > 0) {
              updateProductMediaSequence({
                id: productData.product.id,
                medias: [...imagePreviews.map(item => item.aws ?? ''), ...video]
              })
            }
          }

          if (inputVideo) {
            updateProductMediaVideo({
              id: productData.product.id,
              file: [inputVideo as File]
            })
          }

          // const productOutlet: ProductOutletType = {
          //   product_id: productData.product.id,
          //   outlet_ids: getValues().outlet_ids
          // }

          // mapProductOutlet(productOutlet)
        }
      }

      if (deleteImageVariantIds.length > 0) {
        deleteImageVariantIds.forEach(id => {
          deleteImageVariant(id)
        })
      }

      const oldIdVariants: number[] = []

      Object.keys(idVariants).forEach(key => {
        oldIdVariants.push(idVariants[key])
      })

      if (getValues().variants) {
        const variants: VariantWithoutMembershipType[] =
          getValues().variants?.map((item: VariantSchemaType) => {
            // let _price: PriceMembershipType = {}
            // item.price.forEach((price, index) => {
            //   const __price = price ? Number(price) : masterPrice[index + 1] ?? 1

            //   _price = {
            //     ..._price,
            //     ...{
            //       [(index + 1).toString()]: __price
            //     }
            //   }
            // })

            return {
              ...item,
              maximum_order: item.maximum_order ?? 0,
              product_id: response.data.data.id
              // price: _price
            }
          }) ?? []

        // check delete variant
        const deleteIdVariants: number[] = []
        const newIdVariants: number[] = []

        variants.forEach((variant, index) => {
          if (variant.id) newIdVariants.push(parseInt(variant.id.toString()))

          if (variant.id) {
            const updatedStock =
              productData?.variants?.find(item => item.id == variant.id)?.stock != variant.stock

            updateVarianProduct({
              id: variant.id,
              request: { ...variant, stock: updatedStock ? variant.stock : undefined },
              image: imageVariants[index]
            })
          } else
            createVarianProduct({
              request: variant,
              image: imageVariants[index]
            })
        })

        oldIdVariants.forEach(id => {
          if (!newIdVariants.includes(id)) deleteIdVariants.push(id)
        })

        if (deleteIdVariants.length > 0) {
          deleteBatchVariant(deleteIdVariants)
        }
      } else if (oldIdVariants.length > 0) {
        deleteBatchVariant(oldIdVariants)
      }

      queryClient.invalidateQueries('product-list')
      toast.success(t(response.data.message))

      if (!isSubmitAndAdd) router.push('/product/data')
    }
  })

  // useEffect(() => {
  //   console.log('debugx change masterPriceDiscount', masterPriceDiscount)

  //   setValue('price_discount', masterPriceDiscount, {
  //     shouldDirty: isCanDirty
  //   })
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [masterPriceDiscount])

  // useEffect(() => {
  //   console.log('debugx change masterPriceDiscountType', masterPriceDiscountType)

  //   setValue('price_discount_type', masterPriceDiscountType, {
  //     shouldDirty: isCanDirty
  //   })
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [masterPriceDiscountType])

  // console.log('debugx value', getValues())

  const _onSubmit = (data: ProductSchemaType) => {
    // if ((getValues().price ?? []).length == 0) {
    //   setPriceError(`${t('Selling Price')} ${t('is a required field')}`)

    //   return
    // } else if (getValues().price[0] == undefined) {
    //   setPriceError(`${t('Selling Price')} ${t('is a required field')}`)

    //   return
    // }

    if (!productNameAvailable) {
      toast.error('Product name already exist')

      return
    }

    if (!skuAvailable) {
      toast.error('Product sku already exist')

      return
    }

    setShouldConfirmLeave(false)

    // let _price: PriceMembershipType = {}
    // data.price.forEach((price, index) => {
    //   const __price = price ? Number(price) : index == 0 ? 1 : Number(data.price[index - 1])

    //   _price = {
    //     ..._price,
    //     ...{
    //       [(index + 1).toString()]: __price
    //     }
    //   }
    // })

    // const discountMembership: DiscountMembershipsType = {}

    // Object.keys(data.price_discount_type).forEach(index => {
    //   // if (!data.price_discount || !data.price_discount_type[index]) return

    //   const type = data.price_discount_type[index]
    //   if (type != null && data.price_discount && data.price_discount[index] != undefined) {
    //     discountMembership[index] = {
    //       discount_type: type,
    //       discount: data.price_discount[index] as number
    //     }
    //   }
    // })

    // let wholesale_price: WholesaleTypeRequest[] = []
    // if (data.wholesale_price) {
    //   data.wholesale_price
    //     .filter(item => item.min_qty != undefined)
    //     .forEach(wholesale => {
    //       let _wholesale_price: PriceMembershipType = {}

    //       ;(wholesale.price as any as string[]).forEach((price, index2) => {
    //         const __price = price ? Number(price) : index2 == 0 ? 1 : Number(data.price[index2 - 1])

    //         _wholesale_price = {
    //           ..._wholesale_price,
    //           ...{
    //             [(index2 + 1).toString()]: __price
    //           }
    //         }
    //       })

    //       wholesale_price = [
    //         ...wholesale_price,
    //         {
    //           min_qty: wholesale.min_qty,
    //           price: _wholesale_price
    //         }
    //       ]
    //     })
    // }

    let changedStock: number | undefined = data.stock ?? 1
    if (productData && !isDuplicate) {
      if (data.stock != productData.product.stock) {
        changedStock = data.stock
      } else {
        changedStock = undefined
      }
    }

    const _productData: ProductDataWithoutMembership = {
      product_extra_id: data.product_extra_id ?? 0,
      name: data.name,
      category_id: data.category3_id ?? data.category2_id ?? data.category1_id,
      brand_id: data.brand_id,
      unit_id: data.unit_id,
      // supplier_id: data.supplier_id,
      detail: data.detail,
      price: data.selling_price,
      // discount_membership: discountMembership,
      discount: data.discount ?? 0,
      discount_type: data.discount_type,
      discount_start_date: data.discount_start_date,
      discount_end_date: data.discount_end_date,
      fix_tax: data.fix_tax,
      product_type: data.product_type,
      stock: changedStock,
      purchase_price: data.purchase_price,
      selling_price: data.selling_price,
      purchase_discount: data.purchase_discount,
      purchase_discount_type: data.purchase_discount_type,
      sku: data.sku,
      minimum_order: data.minimum_order,
      maximum_order: data.maximum_order,
      // wholesale_price: wholesale_price,
      weight: data.weight,
      // dimention: {
      //   length: data?.dimention?.length ?? 1,
      //   width: data?.dimention?.width ?? 1,
      //   height: data?.dimention?.height ?? 1
      // },
      status: data.status,
      rack_position: data.rack_position,
      position: data.position,
      notification: data.notification,
      is_best_seller: productData
        ? isBestSellerDefault == data.is_best_seller
          ? undefined
          : data.is_best_seller
        : data.is_best_seller,
      // is_newest: productData
      //   ? isNewestDefault == data.is_newest
      //     ? undefined
      //     : data.is_newest
      //   : undefined
      is_newest: data.is_newest,
      is_promo: data.is_promo,
      is_show_on_pos: data.is_show_on_pos,

      // commission
      commission_value: data.commission_value,
      commission_type: data.commission_type,

      url_youtube: data.url_youtube
    }

    if ((productData == undefined || isDuplicate) && _productData.discount == 0) {
      delete _productData['discount']
      delete _productData['discount_type']
      delete _productData['discount_start_date']
      delete _productData['discount_end_date']
    }

    if (!_productData.detail || _productData.detail == '') {
      _productData['detail'] = '<p></p>'
    }

    if (productData && !isDuplicate) {
      // data.variants.map(varian => (varian.base_price = parseFloat(varian.base_price.toString())))
      updateProduct({ id: productData.product.id, request: _productData })
    } else {
      createProduct(_productData)
    }
  }

  const onSubmit = (data: ProductSchemaType) => {
    _onSubmit(data)
  }

  const onSubmitAndAdd = (data: ProductSchemaType) => {
    _onSubmit(data)
  }

  const submitOnDraft = () => {
    // if ((getValues().price ?? []).length == 0) {
    //   setPriceError(`${t('Selling Price')} ${t('is a required field')}`)
    // } else if (getValues().price[0] == undefined) {
    //   setPriceError(`${t('Selling Price')} ${t('is a required field')}`)
    // }

    if (!productNameAvailable) {
      toast.error('Product name already exist')

      return
    }

    if (!skuAvailable) {
      toast.error('Product sku already exist')

      return
    }

    setValue('status', 'draft')

    handleSubmit(onSubmit)()
  }

  useEffect(() => {
    console.log('validaiton error', errors)
  }, [errors])

  const [priceError, setPriceError] = useState<string | undefined>()

  const _handlePublish = () => {
    // if ((getValues().price ?? []).length == 0) {
    //   setPriceError(`${t('Selling Price')} ${t('is a required field')}`)
    // } else if (getValues().price[0] == undefined) {
    //   setPriceError(`${t('Selling Price')} ${t('is a required field')}`)
    // }

    if (!productNameAvailable) {
      toast.error('Product name already exist')

      return
    }

    if (!skuAvailable) {
      toast.error('Product sku already exist')

      return
    }
  }

  const handlePublish = () => {
    setIsSubmitAndAdd(false)
    _handlePublish()

    handleSubmit(onSubmit)()
  }

  const handlePublishAndAdd = () => {
    setIsSubmitAndAdd(true)
    _handlePublish()

    handleSubmit(onSubmitAndAdd)()
  }

  const submitOnPublish = () => {
    if ((getValues().price ?? []).length == 0) {
      setPriceError(`${t('Selling Price')} ${t('is a required field')}`)
    } else if (getValues().price[0] == 0) {
      setPriceError(`${t('Selling Price')} ${t('is a required field')}`)
    }

    if (!productNameAvailable) {
      toast.error('Product name already exist')

      return
    }

    if (!skuAvailable) {
      toast.error('Product sku already exist')

      return
    }

    setValue('status', 'live')

    handleSubmit(onSubmit)()
  }

  const handleChangeCategory = (value: number) => {
    const subCategoryData =
      categoriesData.find(categories => categories.category.id == value)?.children ?? []

    resetField('category2_id', {
      defaultValue: undefined
    })
    setsubCategoryLv1Data(subCategoryData)
  }

  const handleChangeCategory2 = (value: number) => {
    const subCategoryData =
      subCategoryLv1Data.find(categories => categories.category.id == value)?.children ?? []

    resetField('category3_id', {
      defaultValue: undefined
    })

    setsubCategoryLv2Data(subCategoryData)
  }

  const handleCloseCreateDialog = () => {
    // refetchOutlet()
    // refetchCategory()
    // refetchBrand()
    // refetchUnit()
    setCreateDialogOpen(null)
  }

  useEffect(() => {
    if (isDirty || isDirty2) {
      setShouldConfirmLeave(true)
    }

    return () => {
      setShouldConfirmLeave(false)
    }
  }, [isDirty, isDirty2, setShouldConfirmLeave])

  const htmlToDraftBlocks = (html: string) => {
    // support br or p tag empty
    const blocksFromHtml = convertFromHTML(html)

    // const { contentBlocks, entityMap } = blocksFromHtml
    // const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap)
    const editorState = EditorState.createWithContent(blocksFromHtml)

    return editorState
  }

  useEffect(() => {
    if (productData) {
      // setValue('product_extra_id', productData.product.product_extra_id ?? 0)
      // setProductExtra(productData.extra)

      setValue('name', productData.product.name)
      setValue('purchase_price', productData.product.purchase_price)
      setPurchaseDiscount(productData.product.purchase_discount)
      setPurchaseDiscountType(productData.product.purchase_discount_type ?? 'nominal')

      setValue('purchase_discount_type', productData.product.purchase_discount_type)
      setPurchasePirce(productData.product.purchase_price)
      setValue('selling_price', productData.product.price)
      setSellingPrice(productData.product.price)

      if (!isDuplicate) {
        setValue('sku', productData.product.sku)

        setMasterSku(productData.product.sku)
      }

      setValue('detail', productData.product.detail)
      setDescriptionRTE(htmlToDraftBlocks(productData.product.detail))
      setValue('minimum_order', productData.product.minimum_order)
      if (productData.product.maximum_order > 0)
        setValue('maximum_order', productData.product.maximum_order)

      // setValue('main_category_id', productData.product.main_category_id)
      // setValue('sub_category_level1_id', productData.product.sub_category_level1_id)
      // setValue('sub_category_level2_id', productData.product.sub_category_level2_id)
      // setValue('brand_id', productData.product.brand_id)
      // setValue('unit_id', productData.product.unit_id)

      if (productData.product.discount) setValue('discount', productData.product.discount)
      if (productData.product.discount_type)
        setValue('discount_type', productData.product.discount_type)

      if (productData.product.discount_start_date)
        setStartDateDiscount(parseISO(productData.product.discount_start_date))

      if (productData.product.discount_end_date)
        setEndDateDiscount(parseISO(productData.product.discount_end_date))

      // if (productData.product.discount_type) {
      //   refreshDiscount(
      //     productData.product.price[1],
      //     productData.product.discount_type == 'nominal' ? productData.product.discount : null,
      //     productData.product.discount_type == 'percentage' ? productData.product.discount : null,
      //     productData.product.discount_type
      //   )

      //   if (productData.product.discount_type == 'percentage')
      //     setValue('discount_percentage', productData.product.discount)
      //   else setValue('discount', productData.product.discount)

      //   setValue('discount_start_date', productData.product.discount_start_date)
      //   setValue('discount_end_date', productData.product.discount_end_date)

      //   if (productData.product.discount_start_date)
      //     setStartDateDiscount(parseISO(productData.product.discount_start_date))

      //   if (productData.product.discount_end_date)
      //     setEndDateDiscount(parseISO(productData.product.discount_end_date))
      // }

      setValue('fix_tax', productData.product.fix_tax)

      setValue('stock', productData.product.stock)

      setProductType(productData.product.product_type ?? 'STOCK')

      // const wholesalePrice: WholesaleType[] = []

      // if (productData.product.wholesale_price) {
      //   productData.product.wholesale_price.forEach(wholesale => {
      //     const price: number[] = []

      //     Object.keys(wholesale.price).forEach((_, index) => {
      //       price.push(wholesale.price[index + 1])
      //     })

      //     wholesalePrice.push({
      //       min_qty: wholesale.min_qty,
      //       price: price
      //     })
      //   })
      // }

      // setValue('wholesale_price', wholesalePrice)
      // setEnableWholesale((productData.product.wholesale_price ?? []).length > 0)
      // setWholesalePiceLength((productData.product.wholesale_price ?? []).length + 1)

      setValue('status', productData.product.status)
      setStatusProduct(productData.product.status)

      setValue('weight', productData.product.weight)
      // setValue('dimention', productData.product.dimention)
      setValue('rack_position', productData.product.rack_position)
      setValue('position', productData.product.position)

      setValue('url_youtube', productData.product.url_youtube || null)

      // commission
      setValue('commission_value', productData.product.commission_value ?? null)
      setValue('commission_type', productData.product.commission_type ?? 'nominal')

      // const price: number[] = []
      // const masterPrice: MasterPriceType = {}
      // Object.keys(productData.product.price).forEach((_, index) => {
      //   price.push(productData.product.price[index + 1])
      //   masterPrice[index + 1] = productData.product.price[index + 1]
      // })

      // setMasterPrice(masterPrice)

      // setValue('price', price)

      if (productData?.product?.labels?.includes('Terlaris')) {
        setIsBestSeller(true)
        setIsBestSellerDefault(true)
      }

      if (productData?.product?.labels?.includes('Terbaru')) {
        setIsNewest(true)
        setIsNewestDefault(true)
      }

      if (productData?.product.is_promo) {
        setIsPromo(true)
      }

      if (productData?.product) {
        setShowOnPOS(productData?.product.is_show_on_pos)
      }

      // if (productData.product.discount_membership) {
      //   const discountMembership: MasterPriceType = {}
      //   const discountMembershipType: MasterPriceDiscountType = {}

      //   Object.keys(productData.product.discount_membership).forEach(index => {
      //     if (
      //       productData.product.discount_membership &&
      //       productData.product.discount_membership[index]
      //     ) {
      //       discountMembership[index] = productData.product.discount_membership[index].discount
      //       discountMembershipType[index] =
      //         productData.product.discount_membership[index].discount_type
      //     }
      //   })

      //   setMasterPriceDiscount(discountMembership)
      //   setMasterPriceDiscountType(discountMembershipType)
      // }

      if (productData.variants && productData.variants.length > 0) {
        const variants: VariantsType[] = productData.variants[0].attributes.map(item => ({
          name: item.name,
          options: []
        }))

        const newIdVariants: { [key: string]: number } = {}

        const newStockVariants: { [key: string]: number } = {}

        const newMaxOrderVariants: { [key: string]: number | null } = {}

        const newSkuVariants: { [key: string]: string } = {}

        // const newMembershipVariants: { [key: string]: { [key: string]: string } } = {}
        const newSellingPriceVariants: { [key: string]: number } = {}

        productData.variants.forEach(item => {
          if (!variantPhoto && item.image) {
            setVariantPhoto(true)
          }

          const nameKey =
            item.attributes.length == 2
              ? `${item.attributes[0].value}_${item.attributes[1].value}`
              : item.attributes[0].value
          item.attributes.forEach(attr => {
            const variant = variants.filter(variant => variant.name == attr.name)[0]
            if (!variant?.options.includes(attr.value)) variant?.options.push(attr.value)
          })

          // Object.keys(item.price).forEach((member, index) => {
          //   if (!newMembershipVariants[index.toString()])
          //     newMembershipVariants[index.toString()] = {}

          //   newMembershipVariants[index.toString()][nameKey] = item.price[member].toString()
          // })
          newIdVariants[nameKey] = item.id
          newStockVariants[nameKey] = item.stock
          newMaxOrderVariants[nameKey] = item.maximum_order == 0 ? null : item.maximum_order
          newSkuVariants[nameKey] = item.sku
          newSellingPriceVariants[nameKey] = item.price
        })

        setIdVariants(newIdVariants)
        setStockVariants(newStockVariants)
        setMaxOrderVariants(newMaxOrderVariants)

        // setMembershipVariants(newMembershipVariants)
        setSellingPriceVariants(newSellingPriceVariants)
        setSkuVariants(newSkuVariants)

        setVariants(variants)
      }

      if (productData.product.media) {
        // get type from string
        const mediaImages = productData.product.media.filter(
          item => getTypeVideoOrImageFromFileName(item) == 'image'
        )
        const mediaVideo = productData.product.media.filter(
          item => getTypeVideoOrImageFromFileName(item) == 'video'
        )

        setImagePreviews(
          mediaImages.map((item, index) => ({
            id: index + 1,
            uploaded: true,
            data: getImageAwsUrl(item),
            aws: item
          }))
        )

        if (mediaVideo.length > 0) {
          setIsVideoAws(true)
          setVideoSrc(getImageAwsUrl(mediaVideo[0]))

          // console.log('mediaVideo', mediaVideo)
        }
      } else setImagePreviews([])

      // if (productData.product.variants && productData.product.variants.length > 0) {
      //   setValue(
      //     'outlet_ids',
      //     productData.product.variants.length > 0 ? pluck(productData.product.variants[0].outlets ?? [], 'id') : []
      //   )

      //   setValue('variants', productData.product.variants)
      // }
      promise(() => {
        setIsCanDirty(true)
      }, 1000)
    } else {
      setStatusProduct('live')
      reset()

      promise(() => {
        setIsCanDirty(true)
      }, 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps

    promise(() => {
      // refreshAllProfitPercentage()
    }, 10000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDuplicate, productData])

  // useEffect(() => {
  //   if (!productData) {
  //     if (checkModuleVendor('product-default-non-stock')) {
  //       setProductType('NONSTOCK')
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [productData, vendorProfileModule])

  const variantNames = variants.map(variant => variant.name)

  const deleteVariant = (index: number) => {
    setValue('variants', null)

    setVariants(old => old.filter((_item, _index) => _index != index))

    if (variants.length - 1 == 1) {
      const variantsData = variants.filter((_item, _index) => _index != index)
      const newStockVariants: { [key: string]: number } = {}

      variantsData[0].options.map(variant1 => {
        newStockVariants[`${variant1}`] = 0
      })
      setStockVariants(newStockVariants)

      const newSkuVariants: { [key: string]: string } = {}

      variantsData[0].options.map(variant1 => {
        newSkuVariants[`${variant1}`] = ''
      })
      setSkuVariants(newSkuVariants)

      // const newMembershipVariants: { [key: string]: { [key: string]: string } } = {}

      // membsershipData?.data.data
      //   .filter(item => item.id != 1)
      //   .forEach((_membership, index) => {
      //     newMembershipVariants[index.toString()] = {}
      //     variantsData[0].options.map(variant1 => {
      //       newMembershipVariants[index.toString()][`${variant1}`] = ''
      //     })
      //   })
      const newSellingPriceVariants: { [key: string]: number } = {}

      variantsData[0].options.map(variant1 => {
        newSellingPriceVariants[`${variant1}`] = 0
      })
      setSellingPriceVariants(newSellingPriceVariants)

      // setMembershipVariants(newMembershipVariants)
    } else {
      setStockVariants({})
      setMaxOrderVariants({})
      setSkuVariants({})
      // setMembershipVariants({})
      setSellingPriceVariants({})
    }
  }

  // useEffect(() => {
  //   if (membershipVariants) {
  //     Object.keys(membershipVariants).forEach((keyMember, indexMember) => {
  //       Object.keys(membershipVariants[keyMember]).forEach((keyVariant, indexVariant) => {
  //         setValue(
  //           `variants.${indexVariant}.price.${indexMember}`,
  //           parseInt(membershipVariants[keyMember][keyVariant]),
  //           { shouldDirty: isCanDirty }
  //         )
  //       })
  //     })
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [membershipVariants])

  useEffect(() => {
    if (sellingPriceVariants) {
      Object.keys(sellingPriceVariants).forEach((key, index) => {
        setValue(`variants.${index}.price`, sellingPriceVariants[key], {
          shouldValidate: true,
          shouldDirty: isCanDirty
        })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellingPriceVariants])

  useEffect(() => {
    if (stockVariants) {
      Object.keys(stockVariants).forEach((key, index) => {
        setValue(`variants.${index}.stock`, stockVariants[key], {
          shouldValidate: true,
          shouldDirty: isCanDirty
        })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockVariants])

  useEffect(() => {
    if (maxOrderVariants) {
      Object.keys(maxOrderVariants).forEach((key, index) => {
        setValue(`variants.${index}.maximum_order`, maxOrderVariants[key], {
          shouldValidate: true,
          shouldDirty: isCanDirty
        })
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxOrderVariants])

  useEffect(() => {
    if (skuVariants) {
      Object.keys(stockVariants).forEach((key, index) => {
        setValue(`variants.${index}.sku`, skuVariants[key], { shouldDirty: isCanDirty })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skuVariants])

  // // update value form outlet
  // useEffect(() => {
  //   if (productData?.outlets && outletData) {
  //     const select = outletData.filter(
  //       item => productData.outlets.filter(_item => item.id == _item.outlet.id).length > 0
  //     )

  //     setValue('outlet_ids', pluck(select ?? [], 'id'))
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [productData, outletData])

  // update value form category
  useEffect(() => {
    if (categoriesData.length > 0 && productData && productData.product.category_id) {
      categoriesData.forEach(item => {
        if (item.category.id == productData.product.category_id)
          setValue('category1_id', item.category.id)
        else {
          item.children.forEach(child => {
            if (child.category.id == productData.product.category_id) {
              setsubCategoryLv1Data(item.children)
              setValue('category1_id', item.category.id)
              setValue('category2_id', child.category.id)
            } else {
              child.children.forEach(child2 => {
                if (child2.category.id == productData.product.category_id) {
                  setsubCategoryLv1Data(item.children)
                  setsubCategoryLv2Data(child.children)
                  setValue('category1_id', item.category.id)
                  setValue('category2_id', child.category.id)
                  setValue('category3_id', child2.category.id)
                }
              })
            }
          })
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesData, productData])

  const [anchorElInfoGrosir, setAnchorElInfoGrosir] = React.useState<HTMLButtonElement | null>(null)

  const handleCloseInfoGrosir = () => {
    setAnchorElInfoGrosir(null)
  }

  useEffect(() => {
    setButtonRight(
      <>
        <Link href='/product/data'>
          <Button
            size='small'
            variant='outlined'
            disabled={isLoading}
            startIcon={<Icon icon={'mdi:arrow-left'} />}
          >
            {t('Cancel')}
          </Button>
        </Link>
        {
          <>
            {statusProduct != 'draft' && (
              <Button
                size='small'
                onClick={submitOnDraft}
                color='info'
                variant='contained'
                disabled={isLoading}
                startIcon={<Icon icon={'lets-icons:box-alt-fill'} />}
              >
                {t('Draft')}
              </Button>
            )}
            {statusProduct != 'live' && (
              <Button
                size='small'
                onClick={submitOnPublish}
                color='success'
                variant='contained'
                disabled={isLoading}
                startIcon={<Icon icon={'ic:baseline-local-grocery-store'} />}
              >
                {t('Live2')}
              </Button>
            )}
          </>
        }

        {(!productData || isDuplicate) && (
          <Button
            size='small'
            onClick={handlePublishAndAdd}
            variant='contained'
            color='error'
            disabled={
              isLoading || (isDuplicate ? false : productData ? !isDirty && !isDirty2 : false)
            }
            startIcon={<Icon icon={'bi:plus'} />}
          >
            {productData ? t('Submit & Add') : t('Publish & Add')}
          </Button>
        )}

        <Button
          size='small'
          onClick={handlePublish}
          variant='contained'
          disabled={
            isLoading || (isDuplicate ? false : productData ? !isDirty && !isDirty2 : false)
          }
          startIcon={<Icon icon={productData ? 'bxs:save' : 'ic:baseline-local-grocery-store'} />}
        >
          {productData ? t('Submit') : t('Publish')}
        </Button>
      </>
    )

    return () => {
      setButtonRight(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    statusProduct,
    setButtonRight,
    isLoading,
    skuAvailable,
    productNameAvailable,
    isDirty,
    isDirty2
  ])

  return isLoadingCategory || isLoadingBrand || isLoadingUnit || vendorSetting == undefined ? (
    <CircularProgress />
  ) : (
    <div>
      <div>
        <form>
          {/* HAPUS */}
          {true ? (
            layoutProduct.media && (
              <CardWrapper>
                {/* <Typography variant='h5' fontWeight={'bold'} mb={4}>
                  Media
                </Typography> */}
                <Grid container sx={{ mb: 2 }} spacing={2} columns={17}>
                  {checkPermission('product.create_product_show_image') && (
                    <>
                      <GridLabel
                        item
                        xs={12}
                        sm={2}
                        display={'flex'}
                        flexDirection={'column'}
                        alignItems={'flex-end'}
                        textAlign={'end'}
                        alignSelf={'start'}
                      >
                        <Typography variant='body1'>{t('Product Image')}</Typography>
                        <Typography variant='body2' color={'textSecondary'}>
                          <span
                            style={{
                              color: 'red'
                            }}
                          >
                            *
                          </span>
                          {t('Photo')} 1:1
                        </Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <Box
                          width={'100%'}
                          display={'flex'}
                          border={1}
                          borderRadius={1}
                          borderColor={'divider'}
                          p={1}
                        >
                          <ReactSortable
                            // disabled={!draggableProductPhoto}
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap'
                            }}
                            list={imagePreviews}
                            setList={a => {
                              if (isCanDirty) setDirty2(true)
                              setImagePreviews(a.map((item, index) => ({ ...item, id: index + 1 })))
                            }}
                          >
                            {imagePreviews.map((image, index) => (
                              <div
                                key={index}
                                // onDragStart={() => setDraggableProductPhoto(true)}
                                // onDragOver={() => setDraggableProductPhoto(false)}
                              >
                                <Box
                                  display={'flex'}
                                  justifyContent={'center'}
                                  position={'relative'}
                                  sx={{
                                    '&:hover .hover-button': {
                                      display: 'flex'
                                    }
                                  }}
                                >
                                  {image && (
                                    <Box
                                      className='hover-button'
                                      sx={{
                                        position: 'absolute',
                                        bottom: 10,
                                        right: 10,
                                        zIndex: 8,
                                        display: 'none',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'row',
                                        columnGap: '2px'
                                      }}
                                    >
                                      <IconButton
                                        onClick={() => {
                                          if (image) setPreviewImage(image)
                                        }}
                                        size='small'
                                        color='success'
                                        sx={{
                                          color: theme.palette.common.black,
                                          background: theme.palette.grey[100],
                                          borderRadius: 0.4,
                                          '&:hover': {
                                            background: theme.palette.grey[400],
                                            color: theme.palette.common.black
                                          }
                                        }}
                                      >
                                        <Icon icon='bi:eye' width={16} height={16} />
                                      </IconButton>

                                      <IconButton
                                        component='label'
                                        size='small'
                                        color='success'
                                        sx={{
                                          color: theme.palette.common.black,
                                          background: theme.palette.grey[100],
                                          borderRadius: 0.4,
                                          '&:hover': {
                                            background: theme.palette.grey[400],
                                            color: theme.palette.common.black
                                          }
                                        }}
                                      >
                                        <Icon icon='bi:pencil' width={16} height={16} />
                                        <input
                                          hidden
                                          type='file'
                                          accept='image/*'
                                          onChange={e =>
                                            handleInputImageChange(
                                              e,
                                              image ? index : undefined,
                                              image ?? undefined
                                            )
                                          }
                                        />
                                      </IconButton>
                                      <IconButton
                                        onClick={() => {
                                          if (image) handleDeleteImageProduct(image)
                                        }}
                                        size='small'
                                        color='success'
                                        sx={{
                                          color: theme.palette.common.black,
                                          background: theme.palette.grey[100],
                                          borderRadius: 0.4,
                                          '&:hover': {
                                            background: theme.palette.grey[400],
                                            color: theme.palette.common.black
                                          }
                                        }}
                                      >
                                        <Icon icon='bi:trash' width={16} height={16} />
                                      </IconButton>
                                    </Box>
                                  )}
                                  <RenderImageUpload
                                    index={index}
                                    image={image}
                                    badge={
                                      index == 0 ? t('Primary Image') ?? 'Priamry Image' : undefined
                                    }
                                  />
                                </Box>
                              </div>
                            ))}
                            <div>
                              {vendorSetting &&
                                imagePreviews.length <
                                  vendorSetting.max_upload_image_per_product && (
                                  <Box
                                    display={'flex'}
                                    justifyContent={'center'}
                                    position={'relative'}
                                  >
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        top: 0,
                                        left: 0,
                                        zIndex: 8,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'row',
                                        columnGap: '2px'
                                      }}
                                    >
                                      <Button
                                        component='label'
                                        size='small'
                                        color='success'
                                        sx={{
                                          width: '100%',
                                          height: '100%'
                                        }}
                                      >
                                        <input
                                          hidden
                                          multiple
                                          type='file'
                                          accept='image/*'
                                          onChange={e => handleInputImageChange(e)}
                                        />
                                      </Button>
                                    </Box>
                                    <RenderImageUpload
                                      label={`${t('Photo')} ${imagePreviews.length + 1}`}
                                    />
                                  </Box>
                                )}
                            </div>
                          </ReactSortable>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {/* HAPUS */}
                  {/* {checkModuleVendor('product-video') && (
                    <>
                      <GridLabel item xs={12} sm={2} textAlign={'end'} alignItems={'start'}>
                        <Typography variant='body1'>{t('Product Video')}</Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <Box display={'flex'} columnGap={1}>
                          <Box
                            display={'flex'}
                            justifyContent={'center'}
                            position={'relative'}
                            sx={{
                              '&:hover .hover-button': {
                                display: 'flex'
                              }
                            }}
                          >
                            <Box
                              className='hover-button'
                              sx={{
                                position: 'absolute',
                                bottom: 10,
                                right: 10,
                                zIndex: 8,
                                display: 'none',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                columnGap: '2px'
                              }}
                            >
                              <IconButton
                                onClick={openPreviewVideo}
                                size='small'
                                color='success'
                                sx={{
                                  color: theme.palette.common.black,
                                  background: theme.palette.grey[100],
                                  borderRadius: 0.4,
                                  '&:hover': {
                                    background: theme.palette.grey[400],
                                    color: theme.palette.common.black
                                  }
                                }}
                              >
                                <Icon icon='bi:eye' width={16} height={16} />
                              </IconButton>
                              <IconButton
                                onClick={() => {
                                  if (videoSrc) {
                                    setInputVideo(undefined)
                                    setVideoSrc('')
                                    // fix onchange upload same file not preview
                                    const dom = document.getElementById('video-upload')
                                    if (dom) {
                                      dom.setAttribute('type', 'text')
                                      dom.setAttribute('type', 'file')
                                    }

                                    if (isVideoAws) {
                                      setVideoSrc('')
                                      setDirty2(true)
                                      setDeleteImage(old =>
                                        videoSrc ? [...old, parseImageAws(videoSrc)] : old
                                      )
                                    }
                                  }
                                }}
                                size='small'
                                color='success'
                                sx={{
                                  color: theme.palette.common.black,
                                  background: theme.palette.grey[100],
                                  borderRadius: 0.4,
                                  '&:hover': {
                                    background: theme.palette.grey[400],
                                    color: theme.palette.common.black
                                  }
                                }}
                              >
                                <Icon icon='bi:trash' width={16} height={16} />
                              </IconButton>
                            </Box>
                            <Button
                              component='label'
                              sx={{
                                p: 1
                              }}
                            >
                              <Avatar
                                variant='square'
                                sx={theme => ({
                                  display: 'flex',
                                  flexDirection: 'column',
                                  rowGap: '8px',
                                  background: theme.palette.background.paper,
                                  width: 120,
                                  height: 120,
                                  border: `1px dashed ${theme.palette.divider}`
                                })}
                                alt={'Add Video'}
                              >
                                <video
                                  src={videoSrc}
                                  poster={videoSrc ? '' : '/images/misc/upload-light.png'}
                                  width={120}
                                  height={120}
                                  style={{
                                    display: videoSrc ? 'block' : 'none'
                                  }}
                                />
                                <Icon
                                  icon='octicon:video-24'
                                  width={24}
                                  height={24}
                                  style={{
                                    display: videoSrc ? 'none' : 'block'
                                  }}
                                />
                                <Typography
                                  variant='caption'
                                  sx={{
                                    display: videoSrc ? 'none' : 'block'
                                  }}
                                >
                                  {t('Add Video')}
                                </Typography>
                              </Avatar>
                              <input
                                hidden
                                id='video-upload'
                                type='file'
                                accept='video/*'
                                onChange={handleInputVideoChange}
                              />
                            </Button>
                          </Box>
                          <Box>
                            <ul
                              style={{
                                margin: 0,
                                padding: 14,
                                paddingTop: 2
                              }}
                            >
                              <li>
                                {t('video-term-1').replace(
                                  '%s',
                                  (vendorSetting.max_size_per_video / 1024 / 1024).toString() +
                                    'MB' ?? ''
                                )}
                              </li>
                              <li>
                                {t('video-term-2').replace(
                                  '%s',
                                  defaultMaxVideoDuration.toString() ?? '60'
                                )}
                              </li>
                              <li>{t('video-term-3')}</li>
                            </ul>
                          </Box>
                        </Box>
                      </Grid>
                    </>
                  )}
                  {checkModuleVendor('product-video-url') && (
                    <>
                      <GridLabel
                        item
                        xs={12}
                        sm={2}
                        display={'flex'}
                        flexDirection={'column'}
                        alignItems={'flex-end'}
                        textAlign={'end'}
                        alignSelf={'start'}
                      >
                        <Typography variant='body1'>{t('Product Video URL')}</Typography>
                        <Typography variant='body2' color={'textSecondary'}>
                          {t('Video URL Youtube')}
                        </Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name='url_youtube'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              size='small'
                              {...errorInput(errors, 'url_youtube')}
                              error={Boolean(errors.url_youtube)}
                            />
                          )}
                        />
                      </Grid>
                    </>
                  )} */}
                </Grid>
                {/* section basic information */}
                <Grid container sx={{ mb: 2 }} spacing={2} columns={17}>
                  {/* {outletData.length > 1 &&
                    (checkPermission('product.create_product_show_outlet') || !productData) && (
                      <>
                        <GridLabel item xs={12} sm={2}>
                          <Typography variant='body1'>{t('Outlet')}</Typography>
                        </GridLabel>
                        <Grid item xs={12} sm={15}>
                          <Controller
                            name='outlet_ids'
                            control={control}
                            rules={{ required: true }}
                            render={({ field: { value } }) => (
                              <SelectChip
                                // {...field}
                                multiple
                                {...errorInput(errors, 'outlet_ids')}
                                options={outletData ?? []}
                                labelKey='name'
                                placeholder='Outlet'
                                onSelect={item => {
                                  setValue('outlet_ids', pluck(item ?? [], 'id'), {
                                    shouldValidate: true,
                                    shouldDirty: isCanDirty
                                  })
                                }}
                                value={value}
                                onSelectAll={() => {
                                  setValue('outlet_ids', pluck(outletData ?? [], 'id'), {
                                    shouldValidate: true,
                                    shouldDirty: isCanDirty
                                  })
                                }}
                                onAddButton={() => {
                                  setCreateDialogOpen('outlet')
                                }}
                                onShowButton={() => {
                                  window.open('/point-of-sales#Outlet', '_blank')
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </>
                    )} */}
                  <GridLabel item xs={12} sm={2}>
                    <Typography variant='body1'>Material ID</Typography>
                  </GridLabel>
                  <Controller
                    name='sku'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Grid item xs={12} sm={15}>
                        <Grid container columns={10} spacing={2}>
                          <Grid item xs={2}>
                            <TextField
                              {...field}
                              onChange={e => {
                                field.onChange(e.target.value)

                                promise(() => {
                                  setMasterSku(e.target.value)
                                })

                                if (e.target.value != '') {
                                  promise(() => {
                                    checkSku({
                                      product_id: productData?.product.id,
                                      sku: e.target.value
                                    })
                                  })
                                } else {
                                  setSkuAvailable(true)
                                }
                              }}
                              size='small'
                              fullWidth
                              {...errorInput(errors, 'sku', !skuAvailable)}
                              {...(!skuAvailable && {
                                helperText: `${t('MSKU')} ${t('already exists')}`
                              })}
                              InputProps={{
                                endAdornment: isLoadingCheckSku ? (
                                  <InputAdornment position='end'>
                                    <Icon icon={'eos-icons:loading'} fontSize={18} />
                                  </InputAdornment>
                                ) : skuAvailable ? (
                                  getValues().sku ? (
                                    <InputAdornment position='end'>
                                      <Icon icon={'bi:check'} fontSize={18} color='green' />
                                    </InputAdornment>
                                  ) : (
                                    <></>
                                  )
                                ) : (
                                  <InputAdornment position='end'>
                                    <IconButton onClick={() => setValue('sku', '')} edge='end'>
                                      <Icon icon={'bi:x'} fontSize={18} color='red' />
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    )}
                  />

                  <GridLabel item xs={12} sm={2}>
                    {t('Product Name')}
                  </GridLabel>
                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, ...field } }) => (
                      <Grid item xs={12} sm={15}>
                        <TextField
                          value={value ?? ''}
                          {...field}
                          size='small'
                          onChange={e => {
                            field.onChange(e.target.value)

                            if (e.target.value != '') {
                              promise(() => {
                                checkProductName({
                                  product_id: productData?.product.id,
                                  name: e.target.value
                                })
                              })
                            } else {
                              setProductNameAvailable(true)
                            }
                          }}
                          fullWidth
                          {...errorInput(errors, 'name', !productNameAvailable)}
                          {...(!productNameAvailable && {
                            helperText: `${t('Product Name')} ${t('already exists')}`
                          })}
                          InputProps={{
                            endAdornment: isLoadingCheckProductName ? (
                              <InputAdornment position='end'>
                                <Icon icon={'eos-icons:loading'} fontSize={18} />
                              </InputAdornment>
                            ) : productNameAvailable ? (
                              getValues().name ? (
                                <InputAdornment position='end'>
                                  <Icon icon={'bi:check'} fontSize={18} color='green' />
                                </InputAdornment>
                              ) : (
                                <></>
                              )
                            ) : (
                              <InputAdornment position='end'>
                                <IconButton onClick={() => setValue('name', '')} edge='end'>
                                  <Icon icon={'bi:x'} fontSize={18} color='red' />
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                    )}
                  />

                  {(checkPermission('product.create_product_show_category') || !productData) && (
                    <>
                      <GridLabel item xs={12} sm={2}>
                        {t('Material Group')}
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <Controller
                          name='category1_id'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <SelectCustom
                              {...field}
                              {...errorInput(errors, 'category1_id')}
                              options={categoriesData}
                              {...(categoriesData.length > 0 &&
                                productData &&
                                productData.product.category_id &&
                                {
                                  // defaultValue: categoriesData.find(item => {
                                  //   return item.category.id == productData.product.category_id
                                  // })
                                })}
                              optionKey={['category', 'id']}
                              labelKey={['category', 'name']}
                              placeholder={t('Material Group') ?? 'Material Group'}
                              onSelect={item => {
                                handleChangeCategory(item?.category.id)
                                setValue('category1_id', item?.category.id, {
                                  shouldValidate: true,
                                  shouldDirty: isCanDirty
                                })
                              }}
                              onAddButton={() => {
                                setCreateDialogOpen('category')
                              }}
                              onShowButton={() => {
                                window.open('/product/category', '_blank')
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </>
                  )}
                  {getValues('category1_id') && subCategoryLv1Data.length > 0 && (
                    <>
                      <GridLabel item xs={12} sm={2}>
                        Sub {t('Category')} {subCategoryLv2Data.length > 0 ? '1' : ''}
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <Controller
                          name='category2_id'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <SelectCustom
                              {...field}
                              {...errorInput(errors, 'category2_id')}
                              options={subCategoryLv1Data ?? []}
                              // defaultValue={subCategoryLv1Data.find(
                              //   data => data.category.id == productData?.category2_id
                              // )}
                              optionKey={['category', 'id']}
                              labelKey={['category', 'name']}
                              placeholder={`Sub ${t('Category')}`}
                              onSelect={item => {
                                handleChangeCategory2(item?.id)
                                setValue('category2_id', item?.category.id, {
                                  shouldValidate: true,
                                  shouldDirty: isCanDirty
                                })
                              }}
                              onAddButton={() => {
                                setCreateDialogOpen('category')
                              }}
                              onShowButton={() => {
                                window.open('/product/category', '_blank')
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </>
                  )}
                  {getValues('category2_id') && subCategoryLv2Data.length > 0 && (
                    <>
                      <GridLabel item xs={12} sm={2}>
                        Sub {t('Category')} {subCategoryLv2Data.length > 0 ? '2' : ''}
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <SelectCustom
                          {...errorInput(errors, 'category3_id')}
                          options={subCategoryLv2Data ?? []}
                          // defaultValue={subCategoryLv2Data.find(
                          //   data => data.category.id == productData?.category3_id
                          // )}
                          optionKey={['category', 'id']}
                          labelKey={['category', 'name']}
                          placeholder={`Sub ${t('Category')} 2`}
                          onSelect={item => {
                            setValue('category3_id', item?.category.id, {
                              shouldValidate: true,
                              shouldDirty: isCanDirty
                            })
                          }}
                          onAddButton={() => {
                            setCreateDialogOpen('category')
                          }}
                          onShowButton={() => {
                            window.open('/product/category', '_blank')
                          }}
                        />
                      </Grid>
                    </>
                  )}
                  {/* {brandData.length > 0 && (
                    <>
                      {' '}
                      <GridLabel item xs={12} sm={2}>
                        <Typography variant='body1'>{t('Brand')}</Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <Controller
                          name='brand_id'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <SelectCustom
                              {...field}
                              {...errorInput(errors, 'brand_id')}
                              // defaultValueId={brandData.find(item => item.is_default)?.id ?? undefined}
                              options={brandData}
                              optionKey='id'
                              labelKey='name'
                              placeholder={t('Brand') ?? 'Brand'}
                              onSelect={item => {
                                setValue('brand_id', item?.id, {
                                  shouldValidate: true,
                                  shouldDirty: isCanDirty
                                })
                              }}
                              onAddButton={() => {
                                setCreateDialogOpen('brand')
                              }}
                              onShowButton={() => {
                                window.open('/product/brand', '_blank')
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </>
                  )} */}
                  {(checkPermission('product.create_product_show_unit') || !productData) && (
                    <>
                      <GridLabel item xs={12} sm={2}>
                        <Typography variant='body1'>{t('UOM')}</Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <Controller
                          name='unit_id'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <SelectCustom
                              {...field}
                              {...errorInput(errors, 'unit_id')}
                              options={unitData}
                              optionKey='id'
                              // defaultValueId={unitData.find(item => item.is_default)?.id ?? undefined}
                              labelKey='name'
                              placeholder={t('UOM') ?? 'UOM'}
                              onSelect={item => {
                                setValue('unit_id', item?.id, {
                                  shouldValidate: true,
                                  shouldDirty: isCanDirty
                                })
                              }}
                              onAddButton={() => {
                                setCreateDialogOpen('unit')
                              }}
                              onShowButton={() => {
                                window.open('/product/unit', '_blank')
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </>
                  )}
                  {/* {supplierData.length > 0 && (
                    <>
                      <GridLabel item xs={12} sm={2}>
                        <Typography variant='body1'>{t('Supplier')}</Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <Controller
                          name='supplier_id'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <SelectCustom
                              {...field}
                              {...errorInput(errors, 'supplier_id')}
                              // defaultValueId={brandData.find(item => item.is_default)?.id ?? undefined}
                              options={supplierData}
                              optionKey='id'
                              labelKey='name'
                              placeholder={t('Supplier') ?? 'Supplier'}
                              onSelect={item => {
                                setValue('supplier_id', item?.id, {
                                  shouldValidate: true,
                                  shouldDirty: isCanDirty
                                })
                              }}
                              onAddButton={() => {
                                setCreateDialogOpen('brand')
                              }}
                              onShowButton={() => {
                                window.open('/purchase/supplier', '_blank')
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </>
                  )} */}

                  <GridLabel alignItems={'start'} item xs={12} sm={2}>
                    <Typography variant='body1'>{t('Description')}</Typography>
                  </GridLabel>
                  <Grid item xs={12} sm={15}>
                    <Box position={'relative'}>
                      <Editor
                        editorState={descriptionRTE}
                        toolbarClassName='demo-toolbar-custom'
                        onEditorStateChange={e => {
                          promise(() => {
                            setDescriptionRTE(e)

                            setValue(
                              'detail',
                              convertToHTML({
                                // blockToHTML: block => {
                                //   console.log('block', block)
                                //   return <span />
                                //   // if (block.type === 'PARAGRAPH') {
                                //   //   return <span />
                                //   // }
                                // }
                              })(e.getCurrentContent()),
                              {
                                shouldValidate: true,
                                shouldDirty: isCanDirty
                              }
                            )
                          })
                        }}
                        wrapperStyle={{
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 4
                        }}
                        editorStyle={{
                          minHeight: 100,
                          padding: 8
                        }}
                        toolbarStyle={{
                          display: enableDescriptionRTE ? 'flex' : 'none',
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderLeft: 'none',
                          borderRight: 'none',
                          borderTop: 'none'
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 4,
                          right: 6,
                          zIndex: 5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          rowGap: '2px'
                        }}
                      >
                        <Typography
                          variant='body2'
                          textAlign={'end'}
                          mt={2}
                          color={theme.palette.primary.main}
                          sx={{
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setEnableDescriptionRTE(old => !old)
                          }}
                        >
                          {!enableDescriptionRTE ? 'Aktifkan' : 'Matikan'} format rich text
                        </Typography>
                      </Box>
                    </Box>
                    {errors.detail && (
                      <Typography color={'error'} variant='body2'>
                        {translateFormYupMsg(errors.detail.message)}
                      </Typography>
                    )}
                  </Grid>
                  {/* <Controller
                      name='detail'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Grid item xs={12} sm={10}>
                          <StyledTextarea
                            {...field}
                            minRows={10}
                            sx={theme =>
                              Boolean(errors.detail)
                                ? {
                                    borderColor: theme.palette.error.main
                                  }
                                : {}
                            }
                          />
                          <Typography color={'error'} variant='body2'>
                            {errors.detail && errors.detail.message}
                          </Typography>
                        </Grid>
                      )}
                    /> */}
                </Grid>
                {/* section sales information */}
                <Grid container sx={{ mb: 2 }} spacing={2} columns={17}>
                  {/* {(checkPermission('product.create_product_show_msku') || !productData) && (
                    <>
                      <GridLabel item xs={12} sm={2}>
                        <Typography variant='body1'>Material ID</Typography>
                      </GridLabel>
                      <Controller
                        name='sku'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Grid item xs={12} sm={15}>
                            <Grid container columns={10} spacing={2}>
                              <Grid item xs={2}>
                                <TextField
                                  {...field}
                                  onChange={e => {
                                    field.onChange(e.target.value)

                                    promise(() => {
                                      setMasterSku(e.target.value)
                                    })

                                    if (e.target.value != '') {
                                      promise(() => {
                                        checkSku({
                                          product_id: productData?.product.id,
                                          sku: e.target.value
                                        })
                                      })
                                    } else {
                                      setSkuAvailable(true)
                                    }
                                  }}
                                  size='small'
                                  fullWidth
                                  {...errorInput(errors, 'sku', !skuAvailable)}
                                  {...(!skuAvailable && {
                                    helperText: `${t('MSKU')} ${t('already exists')}`
                                  })}
                                  InputProps={{
                                    endAdornment: isLoadingCheckSku ? (
                                      <InputAdornment position='end'>
                                        <Icon icon={'eos-icons:loading'} fontSize={18} />
                                      </InputAdornment>
                                    ) : skuAvailable ? (
                                      getValues().sku ? (
                                        <InputAdornment position='end'>
                                          <Icon icon={'bi:check'} fontSize={18} color='green' />
                                        </InputAdornment>
                                      ) : (
                                        <></>
                                      )
                                    ) : (
                                      <InputAdornment position='end'>
                                        <IconButton onClick={() => setValue('sku', '')} edge='end'>
                                          <Icon icon={'bi:x'} fontSize={18} color='red' />
                                        </IconButton>
                                      </InputAdornment>
                                    )
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        )}
                      />
                    </>
                  )} */}
                  {/* {checkPermission('product.create_product_show_purchase_price') && (
                    <>
                      <GridLabel item xs={12} sm={2}>
                        <Typography variant='body1'>{t('Purchase Price')}</Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <Grid container columns={10} spacing={2}>
                          <Controller
                            name='purchase_price'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <Grid item xs={2}>
                                <TextFieldNumber
                                  {...field}
                                  isFloat
                                  label={t('Purchase Price')}
                                  size='small'
                                  fullWidth
                                  {...errorInput(errors, 'purchase_price')}
                                  prefix='Rp '
                                  onChange={value => {
                                    field.onChange(value)

                                    promise(() => {
                                      setPurchasePirce(value)
                                    })
                                  }}
                                />
                              </Grid>
                            )}
                          />
                          {devMode && (
                            <Grid item xs={2}>
                              <InputDiscountOrNominal
                                value={purchaseDiscount ?? undefined}
                                discountType={purchaseDiscountType ?? undefined}
                                label={t('Discount') ?? 'Discount'}
                                onChange={value => {
                                  if (isCanDirty) setDirty2(true)
                                  promise(() => {
                                    setPurchaseDiscount(value)
                                  })
                                }}
                                onChangeDiscountType={value => {
                                  setPurchaseDiscountType(value)
                                }}
                              />
                            </Grid>
                          )}
                        </Grid>
                      </Grid>
                    </>
                  )} */}
                  {(checkPermission('product.create_product_show_selling_price_1') ||
                    checkPermission('product.create_product_show_selling_price_2') ||
                    checkPermission('product.create_product_show_selling_price_3') ||
                    checkPermission('product.create_product_show_selling_price_4') ||
                    checkPermission('product.create_product_show_selling_price_5')) && (
                    <>
                      <GridLabel item xs={12} sm={2}>
                        <Typography variant='body1'>{t('Unit Price')}</Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <Grid container columns={10} spacing={2}>
                          <Controller
                            name='selling_price'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <Grid item xs={2}>
                                <TextFieldNumber
                                  {...field}
                                  isFloat
                                  size='small'
                                  fullWidth
                                  {...errorInput(errors, 'selling_price')}
                                  prefix='Rp '
                                  onChange={value => {
                                    field.onChange(value)

                                    promise(() => {
                                      setSellingPrice(value)
                                    })
                                  }}
                                />
                              </Grid>
                            )}
                          />
                        </Grid>
                      </Grid>
                    </>
                  )}

                  {/* {(checkPermission('product.create_product_show_selling_price_1') ||
                    checkPermission('product.create_product_show_selling_price_2') ||
                    checkPermission('product.create_product_show_selling_price_3') ||
                    checkPermission('product.create_product_show_selling_price_4') ||
                    checkPermission('product.create_product_show_selling_price_5')) && (
                    <>
                      <GridLabel item xs={12} sm={2} alignItems={'start'}>
                        <Typography variant='body1'>
                          {variants.length > 0 ? t('Selling Price') : t('Selling Price')}
                        </Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <Grid container spacing={2}>
                          {(membsershipData?.data.data.filter(item => !item.is_default) ?? []).map(
                            (item, index) => {
                              // const profitPercentage = masterProfitPercentage[index + 1] ?? 0

                              // const profitPercentageText = formatNumberMax2digit(
                              //   masterProfitPercentage[index + 1] ?? 0
                              // )

                              console.log('index', index + 1)
                              console.log(
                                'permission',
                                checkPermission('product.create_product_show_selling_price_1')
                              )

                              if (
                                !checkPermission('product.create_product_show_selling_price_1') &&
                                index == 0
                              ) {
                                return null
                              } else if (
                                !checkPermission('product.create_product_show_selling_price_2') &&
                                index == 1
                              ) {
                                return null
                              } else if (
                                !checkPermission('product.create_product_show_selling_price_3') &&
                                index == 2
                              ) {
                                return null
                              } else if (
                                !checkPermission('product.create_product_show_selling_price_4') &&
                                index == 3
                              ) {
                                return null
                              } else if (
                                !checkPermission('product.create_product_show_selling_price_5') &&
                                index == 4
                              ) {
                                return null
                              }

                              return (
                                <InputMasterPrice
                                  key={index}
                                  label={item.name}
                                  placeholder={index > 0 ? masterPriceDisplay[index] : undefined}
                                  required={index == 0}
                                  showSellingPrice
                                  onClickSellingPrice={() => {
                                    setLevelSellingDialog(item.level)
                                  }}
                                  purchasePrice={purchasePrice ?? 0}
                                  discountPurchasePrice={purchaseDiscount ?? 0}
                                  discountPurchasePriceType={purchaseDiscountType ?? 'nominal'}
                                  masterPrice={masterPriceDisplay[index + 1]}
                                  masterPriceDiscount={masterPriceDiscount[index + 1]}
                                  masterPriceDiscountType={
                                    masterPriceDiscountType[index + 1] ?? 'nominal'
                                  }
                                  setMasterPrice={value => {
                                    if (value != masterPriceDisplay[index + 1]) {
                                      if (isCanDirty) setDirty2(true)
                                      console.log('debugx masterPriceDisplay is not same')
                                      console.log('debugx masterPriceDisplay', masterPriceDisplay)
                                      console.log('debugx value', value)

                                      setMasterPriceDisplay(old => ({
                                        ...old,
                                        ...{ [index + 1]: value }
                                      }))
                                      setValue(`price.${index}`, value ?? 0, {
                                        shouldDirty: isCanDirty
                                      })
                                    }
                                  }}
                                  setMasterPriceDiscount={value => {
                                    if (value != masterPriceDiscount[index + 1]) {
                                      if (isCanDirty) setDirty2(true)
                                      console.log('debugx masterPriceDiscount is not same')
                                      console.log('debugx masterPriceDiscount', masterPriceDiscount)
                                      console.log('debugx value', value)

                                      setMasterPriceDiscount(old => ({
                                        ...old,
                                        ...{ [index + 1]: value }
                                      }))
                                    }
                                    // setValue(`discount.${index + 1}`, value)
                                  }}
                                  setMasterPriceDiscountType={value => {
                                    if (value != masterPriceDiscountType[index + 1]) {
                                      if (isCanDirty) setDirty2(true)
                                      console.log('debugx masterPriceDiscountType is not same')
                                      console.log(
                                        'debugx masterPriceDiscountType',
                                        masterPriceDiscountType
                                      )
                                      console.log('debugx value', value)

                                      setMasterPriceDiscountType(old => ({
                                        ...old,
                                        ...{ [index + 1]: value }
                                      }))
                                    }
                                    // setValue(`discount_type.${index + 1}`, value)
                                  }}
                                  setPriceError={setPriceError}
                                  priceError={priceError}
                                />
                                // <Grid item container columns={10} spacing={2} key={index}>
                                //   <Controller
                                //     name={`price.${index}`}
                                //     control={control}
                                //     rules={{ required: true }}
                                //     render={({ field }) => (
                                //       <>
                                //         <Grid item xs={2}>
                                //           <TextFieldNumber
                                //             isFloat
                                //             placeholder={formatNumber(masterPriceDisplay[index] ?? 0)}
                                //             {...field}
                                //             {...(index == 0
                                //               ? {
                                //                   onChange: value => {
                                //                     if (value == undefined)
                                //                       setPriceError(
                                //                         `${t('Selling Price')} ${t(
                                //                           'is a required field'
                                //                         )}`
                                //                       )
                                //                     else setPriceError(undefined)

                                //                     field.onChange(value)
                                //                     promise(() => {
                                //                       setMasterPrice(old => ({
                                //                         ...old,
                                //                         ...{ [index + 1]: value }
                                //                       }))
                                //                     })
                                //                   }
                                //                 }
                                //               : {
                                //                   onChange: value => {
                                //                     field.onChange(value)

                                //                     promise(() => {
                                //                       setMasterPrice(old => ({
                                //                         ...old,
                                //                         ...{ [index + 1]: value }
                                //                       }))
                                //                     })
                                //                   }
                                //                 })}
                                //             label={item.name}
                                //             error={priceError !== undefined && index == 0}
                                //             {...(priceError !== undefined &&
                                //               index == 0 && {
                                //                 helperText: priceError
                                //               })}
                                //             size='small'
                                //             fullWidth
                                //             prefix='Rp '
                                //             InputProps={{
                                //               inputProps: {
                                //                 min: 0
                                //               },
                                //               ...(index == 0 && productData
                                //                 ? {
                                //                     endAdornment: (
                                //                       <InputAdornment position='end'>
                                //                         <IconButton
                                //                           color='primary'
                                //                           size='small'
                                //                           onClick={() => {
                                //                             setLevelSellingDialog(item.level)
                                //                           }}
                                //                         >
                                //                           <Icon
                                //                             icon={'bi:graph-up-arrow'}
                                //                             fontSize={14}
                                //                           />
                                //                         </IconButton>
                                //                       </InputAdornment>
                                //                     )
                                //                   }
                                //                 : {})
                                //             }}
                                //           />
                                //         </Grid>
                                //         {checkPermission('product.create_product_show_discount') && (
                                //           <Grid item xs={2}>
                                //             <InputDiscountOrNominal
                                //               value={masterPriceDiscount[index + 1] ?? 0}
                                //               discountType={
                                //                 masterPriceDiscountType[index + 1] ?? undefined
                                //               }
                                //               label={t('Discount') ?? 'Discount'}
                                //               onChange={value => {
                                //                 if (isCanDirty) setDirty2(true)
                                //                 setMasterPriceDiscount(old => ({
                                //                   ...old,
                                //                   ...{ [index + 1]: value }
                                //                 }))
                                //               }}
                                //               onChangeDiscountType={value => {
                                //                 if (isCanDirty) setDirty2(true)
                                //                 setMasterPriceDiscountType(old => ({
                                //                   ...old,
                                //                   ...{ [index + 1]: value }
                                //                 }))
                                //               }}
                                //             />
                                //           </Grid>
                                //         )}
                                //         {checkPermission(
                                //           'product.create_product_show_purchase_price'
                                //         ) && (
                                //           <>
                                //             <Grid item xs={2}>
                                //               <TextField
                                //                 sx={theme => ({
                                //                   '& .MuiOutlinedInput-root': {
                                //                     mt: 1,
                                //                     color:
                                //                       profitPercentage < 0
                                //                         ? theme.palette.error.main
                                //                         : 'unset'
                                //                   }
                                //                 })}
                                //                 label='Margin %'
                                //                 size='small'
                                //                 defaultValue={0}
                                //                 value={profitPercentageText + '%'}
                                //                 error={profitPercentage < 0}
                                //               />
                                //             </Grid>
                                //           </>
                                //         )}
                                //       </>
                                //     )}
                                //   />
                                // </Grid>
                              )
                            }
                          )}
                        </Grid>
                      </Grid>
                    </>
                  )} */}

                  {vendorSetting && vendorSetting.is_fix_tax_product_checkout_active ? (
                    <>
                      <GridLabel item xs={12} sm={2}>
                        <Typography variant='body1'>{t('Fix Tax')}</Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <Grid container columns={10} spacing={2}>
                          <Controller
                            name='fix_tax'
                            control={control}
                            render={({ field }) => (
                              <Grid item xs={2}>
                                <TextFieldNumber
                                  {...field}
                                  size='small'
                                  fullWidth
                                  prefix='Rp '
                                  InputProps={{
                                    inputProps: {
                                      min: 0
                                    }
                                  }}
                                />
                              </Grid>
                            )}
                          />
                        </Grid>
                      </Grid>
                    </>
                  ) : (
                    <></>
                  )}

                  {/* {(commissionData?.data?.data ?? []).length > 0 && (
                    <>
                      <GridLabel item xs={12} sm={2}>
                        <Typography variant='body1'>{t('Commission')}</Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <Grid container columns={10} spacing={2}>
                          <Grid item xs={2}>
                            <InputDiscountOrNominal
                              value={getValues().commission_value ?? undefined}
                              discountType={getValues().commission_type}
                              onChange={value => {
                                setValue('commission_value', value ?? null, { shouldDirty: isCanDirty })
                              }}
                              onChangeDiscountType={value => {
                                setValue('commission_type', value, { shouldDirty: isCanDirty })
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </>
                  )} */}
                  {/* {checkPermission('product.create_product_show_product_type') && (
                    <>
                      <GridLabel item xs={12} sm={2}>
                        <Typography variant='body1'>{t('Product Type')}</Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <RadioButtonCustom
                          sx={{
                            ml: 3
                          }}
                          options={[
                            { value: 'STOCK', label: t('Stock') },
                            { value: 'NONSTOCK', label: 'Non ' + t('Stock') }
                          ]}
                          value={productType}
                          onChange={value => {
                            setProductType(value.value as unknown as 'STOCK' | 'NONSTOCK')
                          }}
                        />
                      </Grid>
                    </>
                  )} */}
                  {variants.length == 0 ? (
                    <>
                      {/* <GridLabel item xs={12} sm={2}>
                        <Typography variant='body1'>{t('Variant')}</Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={15} mb={2}>
                        <Grid container columns={10} spacing={2}>
                          <Grid item xs={2}>
                            <Button
                              fullWidth
                              onClick={handleAddVariant}
                              variant='outlined'
                              startIcon={<Icon icon='ic:baseline-plus' />}
                            >
                              {t('Create Variant')}
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                      {productType == 'STOCK' &&
                        checkPermission('product.create_product_show_stock') && (
                          <>
                            <GridLabel item xs={12} sm={2}>
                              <Typography variant='body1'>{t('Stock')}</Typography>
                            </GridLabel>
                            <Grid item xs={12} sm={15}>
                              <Grid container columns={10} spacing={2}>
                                <Grid item xs={2}>
                                  <Controller
                                    name='stock'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                      <TextFieldNumber
                                        {...field}
                                        {...errorInput(errors, 'stock')}
                                        defaultValue={productData?.product.stock}
                                        size='small'
                                        fullWidth
                                      />
                                    )}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                          </>
                        )} */}
                    </>
                  ) : (
                    // MULTIPLE VARIANT
                    <MultipleWrapper
                      container
                      spacing={2}
                      sx={{
                        mt: 2,
                        mb: 8
                      }}
                      columns={17}
                    >
                      <GridLabel alignItems={'start'} item xs={12} md={2}>
                        {t('Variant')}
                      </GridLabel>
                      <Grid
                        item
                        xs={12}
                        md={15}
                        display={'flex'}
                        flexDirection={'column'}
                        rowGap={2}
                      >
                        {variants.map((variant, index) => (
                          <VariantWrapper key={index}>
                            <Grid container columns={10} spacing={2}>
                              <GridLabel item xs={1}>
                                <Typography variant='h6'>
                                  {t('Variant')} {index + 1}
                                </Typography>
                              </GridLabel>
                              <Grid item xs={2}>
                                <SelectChip
                                  freeSolo
                                  multiple={false}
                                  error={false}
                                  options={[t('Color'), t('Size')].filter(
                                    item => !variantNames.includes(item) || item == variant.name
                                  )}
                                  defaultValue={variant.name}
                                  onSelect={value => {
                                    if (isCanDirty) setDirty2(true)

                                    setVariants(old =>
                                      old.map((item, _index) =>
                                        _index == index
                                          ? {
                                              name: value,
                                              options: variants[index].options
                                            }
                                          : item
                                      )
                                    )
                                    // handleChangeVariant(value, index)
                                  }}
                                />
                              </Grid>
                              <Grid item xs={3}>
                                {devMode && index == 0 && (
                                  <FormControlLabel
                                    sx={{
                                      ml: 2
                                    }}
                                    control={
                                      <Switch
                                        checked={variantPhoto}
                                        onChange={() => {
                                          setVariantPhoto(!variantPhoto)
                                        }}
                                      />
                                    }
                                    label={t('Upload Image Variant')}
                                  />
                                )}
                              </Grid>
                              <Grid item xs={4} textAlign={'end'}>
                                <Button
                                  variant='text'
                                  color='error'
                                  onClick={() => deleteVariant(index)}
                                >
                                  <Icon icon={'bi:trash'} />
                                </Button>
                              </Grid>
                              <GridLabel item xs={1}>
                                <Typography variant='h6'>{t('Options')}</Typography>
                              </GridLabel>
                              <Grid item xs={9}>
                                {/* <Controller
                              name='outlet_ids'
                              control={control}
                              rules={{ required: true }}
                              render={() => ( */}
                                <SelectChip
                                  editable
                                  freeSolo
                                  error={variant.options.length == 0}
                                  {...(variant.options.length == 0 && {
                                    helperText: 'Please select at least one option'
                                  })}
                                  options={
                                    variant.name == t('Color')
                                      ? colorAttribute.map(item => item.value)
                                      : variant.name == t('Size')
                                      ? sizeAttribute.map(item => item.value)
                                      : []
                                    // variantsData.find(item => item.name == variant.name)?.options ?? []
                                  }
                                  defaultValue={variant.options}
                                  placeholder={`/ ${t('Write')} ` + variant.name}
                                  onSelect={value => {
                                    if (isCanDirty) setDirty2(true)

                                    // check delete or add
                                    setVariants(old =>
                                      old.map((item, _index) =>
                                        _index == index
                                          ? {
                                              ...item,
                                              options: value
                                            }
                                          : item
                                      )
                                    )

                                    handleChangeVariant(value, index)
                                  }}
                                />
                                {/* )}
                            /> */}
                              </Grid>
                              {index == 0 && variantPhoto && (
                                <>
                                  <GridLabel
                                    item
                                    xs={1}
                                    display={'flex'}
                                    flexDirection={'column'}
                                    alignItems={'flex-end'}
                                    textAlign={'end'}
                                    alignSelf={'start'}
                                  >
                                    <Typography variant='h6'>{t('Image Variant')}</Typography>
                                    <Typography variant='body2' color={'textSecondary'}>
                                      <span
                                        style={{
                                          color: 'red'
                                        }}
                                      >
                                        *
                                      </span>
                                      {t('Photo')} 1:1
                                    </Typography>
                                  </GridLabel>
                                  <Grid item xs={9}>
                                    <Grid
                                      container
                                      border={1}
                                      borderRadius={1}
                                      borderColor={'divider'}
                                      minHeight={80}
                                      p={1}
                                    >
                                      {variants.length > 0 &&
                                        imageVariantsStr &&
                                        variants[0].options.map((variant, index1) => (
                                          <RenderImageVariantUpload
                                            key={index1}
                                            index={index1}
                                            label={variant}
                                            size={80}
                                          />
                                        ))}
                                    </Grid>
                                  </Grid>
                                </>
                              )}
                            </Grid>
                          </VariantWrapper>
                        ))}

                        {variants.length == 1 && (
                          <div
                            style={{
                              marginTop: 16
                            }}
                          >
                            <Button
                              onClick={handleAddVariant}
                              variant='outlined'
                              startIcon={<Icon icon='ic:baseline-plus' />}
                            >
                              {t('Variant')}
                            </Button>
                          </div>
                        )}
                      </Grid>
                      <GridLabel item xs={12} md={2}>
                        Daftar {t('Variant')}
                      </GridLabel>
                      <Grid item xs={12} md={15}>
                        <Grid
                          container
                          marginTop={4}
                          marginBottom={4}
                          columnSpacing={1}
                          columns={
                            3 *
                            (2 +
                              (productType == 'STOCK' ? 1 : 0) +
                              (vendorSetting?.is_maximum_order_qty_product_in_cart ? 1 : 0))
                            // +(membsershipData?.data.data.filter(item => !item.is_default).length ??0)
                          }
                        >
                          {productType == 'STOCK' && (
                            <Grid item xs={3}>
                              <TextFieldNumberOnBlur
                                isFloat
                                onFocus={() => setHoverStock(true)}
                                onBlur={() => setHoverStock(false)}
                                label={t('Stock')}
                                size='small'
                                value={applyStock}
                                fullWidth
                                onChange={value => setApplyStock(value)}
                              />
                            </Grid>
                          )}
                          {vendorSetting?.is_maximum_order_qty_product_in_cart && (
                            <Grid item xs={3}>
                              <TextFieldNumberOnBlur
                                isFloat
                                onFocus={() => setHoverMaxOrder(true)}
                                onBlur={() => setHoverMaxOrder(false)}
                                label={t('Max Order')}
                                size='small'
                                value={applyMaxOrder}
                                fullWidth
                                onChange={value => setApplyMaxOrder(value)}
                              />
                            </Grid>
                          )}
                          {/* <Grid item xs={2}>
                        <TextField label='Discount' size='small' />
                      </Grid> */}
                          {/* {(membsershipData?.data.data.filter(item => !item.is_default) ?? []).map(
                            (membership, index) => (
                              <Grid item xs={3} key={index}>
                                <TextFieldNumberOnBlur
                                  isFloat
                                  onFocus={() => setHoverMembership(index)}
                                  onBlur={() => setHoverMembership(null)}
                                  label={membership.name}
                                  size='small'
                                  value={
                                    applyMembership[index.toString()] != undefined
                                      ? parseInt(applyMembership[index.toString()]!)
                                      : undefined
                                  }
                                  fullWidth
                                  onChange={value =>
                                    promise(() => {
                                      setApplyMembership(old => ({
                                        ...old,
                                        [index.toString()]:
                                          value != undefined ? value.toString() : undefined
                                      }))
                                    })
                                  }
                                  prefix='Rp '
                                  InputProps={{
                                    inputProps: {
                                      min: 0
                                    }
                                  }}
                                />
                              </Grid>
                            )
                          )} */}

                          <Grid item xs={3}>
                            <TextFieldNumberOnBlur
                              isFloat
                              onFocus={() => setHoverSellingPrice(true)}
                              onBlur={() => setHoverSellingPrice(false)}
                              label={t('Selling Price')}
                              size='small'
                              value={applySellingPrice}
                              fullWidth
                              onChange={value => {
                                setApplySellingPrice(value)
                              }}
                              prefix='Rp '
                              InputProps={{
                                inputProps: {
                                  min: 0
                                }
                              }}
                            />
                          </Grid>

                          <Grid item xs={3}>
                            <TextField
                              sx={{
                                mt: 1
                              }}
                              onFocus={() => setHoverSku(true)}
                              onBlur={() => setHoverSku(false)}
                              label='VSKU'
                              size='small'
                              value={applySku}
                              fullWidth
                              onChange={e => {
                                setApplySku(e.target.value)
                              }}
                            />
                          </Grid>
                          {/* <Grid item xs={2}>
                        <TextField label='Weight' size='small' />
                      </Grid> */}
                          <Grid item xs={3}>
                            <Button
                              sx={{
                                mt: 1
                              }}
                              variant='contained'
                              fullWidth
                              onClick={handleApplyAll}
                            >
                              {t('Apply All')}
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} md={2}></Grid>
                      <Grid item xs={12} md={15}>
                        <div
                          style={{
                            overflowX: 'auto'
                          }}
                        >
                          <Table
                            sx={theme => ({
                              background: theme.palette.customColors.tableHeaderBg,
                              // '& tr:hover': {
                              //   background: theme.palette.divider
                              // },
                              '& th': {
                                borderTop: `thin solid ${theme.palette.divider}`,
                                borderBottom: `thin solid ${theme.palette.divider}`
                              },
                              '& th:first-child': {
                                borderLeft: `thin solid ${theme.palette.divider}`
                              },
                              '& th:last-child': {
                                borderRight: `thin solid ${theme.palette.divider}`
                              },
                              '& td': {
                                borderBottom: `thin solid ${theme.palette.divider}`
                              },
                              '& td:first-child': {
                                borderLeft: `thin solid ${theme.palette.divider}`
                              },
                              '& td:last-child': {
                                borderRight: `thin solid ${theme.palette.divider}`
                              }
                            })}
                          >
                            <thead>
                              <tr>
                                {variantPhoto && <th>{t('Image')}</th>}
                                {variantNames.map((variant, index) => (
                                  <th
                                    key={index}
                                    style={{
                                      // width:
                                      //   (membsershipData?.data.data.length ?? 0) > 1
                                      //     ? '10%'
                                      //     : '20%',
                                      width: '20%',
                                      textAlign: 'left'
                                    }}
                                  >
                                    {variant}
                                  </th>
                                ))}
                                {productType == 'STOCK' && (
                                  <th
                                    style={{
                                      // width: (membsershipData?.data.data.length ?? 0) > 3 ? '8%' : '15%',
                                      width: '15%',
                                      textAlign: 'left'
                                    }}
                                  >
                                    {t('Stock')}
                                  </th>
                                )}
                                {vendorSetting?.is_maximum_order_qty_product_in_cart && (
                                  <th
                                    style={{
                                      // width: (membsershipData?.data.data.length ?? 0) > 3 ? '9%' : '15%',
                                      width: '15%',
                                      textAlign: 'left'
                                    }}
                                  >
                                    {t('Max Order')}
                                  </th>
                                )}
                                {/* <th>Discount</th> */}
                                {/* {(
                                  membsershipData?.data.data.filter(item => !item.is_default) ?? []
                                ).map((membership, index) => (
                                  <th
                                    style={{
                                      width:
                                        (membsershipData?.data.data.length ?? 0) > 3
                                          ? '12%'
                                          : '15%',
                                      textAlign: 'left'
                                    }}
                                    key={index}
                                  >
                                    {membership.name}
                                  </th>
                                ))} */}
                                <th
                                  style={{
                                    width: '15%',
                                    textAlign: 'left'
                                  }}
                                >
                                  {t('Selling Price')}
                                </th>
                                <th
                                  style={{
                                    width: '15%',
                                    textAlign: 'left'
                                  }}
                                >
                                  VSKU
                                </th>
                                {/* <th>Weight</th> */}
                                {/* <th>Active</th> */}
                              </tr>
                            </thead>
                            <tbody
                              style={{
                                backgroundColor: theme.palette.background.paper
                              }}
                            >
                              {/* IF VARIANT 2 */}
                              {variants.length > 1 && imageVariantsStr
                                ? variants[0].options.map((variant1, index1) =>
                                    variants[1].options.map((variant2, index2) => {
                                      const _index = index1 * variants[1].options.length + index2

                                      setValue(
                                        `variants.${_index}.attributes.0.name`,
                                        variantNames[0],
                                        { shouldDirty: isCanDirty }
                                      )
                                      setValue(`variants.${_index}.attributes.0.value`, variant1, {
                                        shouldDirty: isCanDirty
                                      })

                                      setValue(
                                        `variants.${_index}.attributes.1.name`,
                                        variantNames[1],
                                        { shouldDirty: isCanDirty }
                                      )
                                      setValue(`variants.${_index}.attributes.1.value`, variant2, {
                                        shouldDirty: isCanDirty
                                      })
                                      if (idVariants[`${variant1}_${variant2}`]) {
                                        setValue(
                                          `variants.${_index}.id`,
                                          idVariants[`${variant1}_${variant2}`],
                                          { shouldDirty: isCanDirty }
                                        )
                                      }

                                      return (
                                        <tr key={index2}>
                                          {variantPhoto && (
                                            <td>
                                              <RenderImageVariantUpload index={index1} disabled />
                                            </td>
                                          )}
                                          <td
                                            style={{
                                              textAlign: 'center',
                                              minWidth: '100px',
                                              maxWidth: '120px'
                                              // overflow: 'hidden',
                                              // textOverflow: 'ellipsis'
                                            }}
                                            rowSpan={1}
                                            // rowSpan={
                                            //   variants.length > 1 ? variants[1].options.length : 1
                                            // }
                                          >
                                            {variant1}
                                          </td>
                                          {variants.length > 1 && (
                                            <td
                                              style={{
                                                textAlign: 'left',
                                                minWidth: '100px',
                                                maxWidth: '120px'
                                                // overflow: 'hidden',
                                                // textOverflow: 'ellipsis'
                                              }}
                                              rowSpan={1}
                                            >
                                              {variant2}
                                            </td>
                                          )}
                                          {productType == 'STOCK' && (
                                            <td>
                                              <Controller
                                                name={`variants.${_index}.stock`}
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field: { onChange, ...field } }) => (
                                                  <TextFieldNumber
                                                    {...field}
                                                    focused={hoverStock}
                                                    {...errorInput(
                                                      errors,
                                                      `variants.${_index}.stock`
                                                    )}
                                                    value={stockVariants[`${variant1}_${variant2}`]}
                                                    onChange={value => {
                                                      promise(() => {
                                                        setStockVariants(old => ({
                                                          ...old,
                                                          [`${variant1}_${variant2}`]: value ?? 0
                                                        }))

                                                        onChange(value)
                                                      })
                                                    }}
                                                    size='small'
                                                  />
                                                )}
                                              />
                                            </td>
                                          )}

                                          {vendorSetting?.is_maximum_order_qty_product_in_cart && (
                                            <td>
                                              <Controller
                                                name={`variants.${_index}.maximum_order`}
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field: { onChange, ...field } }) => (
                                                  <TextFieldNumber
                                                    {...field}
                                                    placeholder='Unlimited'
                                                    focused={hoverMaxOrder}
                                                    {...errorInput(
                                                      errors,
                                                      `variants.${_index}.maximum_order`
                                                    )}
                                                    value={
                                                      maxOrderVariants[`${variant1}_${variant2}`]
                                                    }
                                                    onChange={value => {
                                                      promise(() => {
                                                        setMaxOrderVariants(old => ({
                                                          ...old,
                                                          [`${variant1}_${variant2}`]: value ?? null
                                                        }))

                                                        onChange(value)
                                                      })
                                                    }}
                                                    size='small'
                                                  />
                                                )}
                                              />
                                            </td>
                                          )}

                                          {/* {(
                                            membsershipData?.data.data.filter(
                                              item => !item.is_default
                                            ) ?? []
                                          ).map((_membership, index) => (
                                            <td key={index}>
                                              <Controller
                                                name={`variants.${_index}.price.${index}`}
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field: { onChange, ...field } }) => (
                                                  <TextFieldNumber
                                                    {...field}
                                                    placeholder={t('Price') ?? 'Price'}
                                                    focused={hoverMembership == index}
                                                    {...errorInput(
                                                      errors,
                                                      `variants.${_index}.price.${index}`
                                                    )}
                                                    value={parseInt(
                                                      membershipVariants[index.toString()][
                                                        `${variant1}_${variant2}`
                                                      ]
                                                    )}
                                                    onChange={value =>
                                                      promise(() => {
                                                        setMembershipVariants(old => {
                                                          const newMembershipVariants = JSON.parse(
                                                            JSON.stringify(old)
                                                          )
                                                          newMembershipVariants[index.toString()][
                                                            `${variant1}_${variant2}`
                                                          ] = value

                                                          return newMembershipVariants
                                                        })

                                                        onChange(value)
                                                      })
                                                    }
                                                    size='small'
                                                    prefix='Rp '
                                                    InputProps={{
                                                      inputProps: {
                                                        min: 0
                                                      }
                                                    }}
                                                  />
                                                )}
                                              />
                                            </td>
                                          ))} */}
                                          <td>
                                            <Controller
                                              name={`variants.${_index}.price`}
                                              control={control}
                                              rules={{ required: true }}
                                              render={({ field: { onChange, ...field } }) => (
                                                <TextFieldNumber
                                                  {...field}
                                                  placeholder={t('Price') ?? 'Price'}
                                                  focused={hoverSellingPrice}
                                                  {...errorInput(
                                                    errors,
                                                    `variants.${_index}.price`
                                                  )}
                                                  value={
                                                    sellingPriceVariants[`${variant1}_${variant2}`]
                                                  }
                                                  onChange={value => {
                                                    promise(() => {
                                                      setSellingPriceVariants(old => ({
                                                        ...old,
                                                        [`${variant1}_${variant2}`]: value ?? 0
                                                      }))

                                                      onChange(value)
                                                    })
                                                  }}
                                                  size='small'
                                                  prefix='Rp '
                                                  InputProps={{
                                                    inputProps: {
                                                      min: 0
                                                    }
                                                  }}
                                                />
                                              )}
                                            />
                                          </td>

                                          <td>
                                            <Controller
                                              name={`variants.${_index}.sku`}
                                              control={control}
                                              rules={{ required: true }}
                                              render={({ field }) => (
                                                <TextField
                                                  {...field}
                                                  placeholder={masterSku}
                                                  focused={hoverSku}
                                                  {...errorInput(errors, `variants.${_index}.sku`)}
                                                  value={skuVariants[`${variant1}_${variant2}`]}
                                                  onChange={e => {
                                                    setSkuVariants(old => ({
                                                      ...old,
                                                      [`${variant1}_${variant2}`]: e.target.value
                                                    }))
                                                  }}
                                                  size='small'
                                                />
                                              )}
                                            />
                                          </td>
                                        </tr>
                                      )
                                    })
                                  )
                                : // IF VARIANT 1
                                  variants[0].options.map((variant1, index1) => {
                                    setValue(
                                      `variants.${index1}.attributes.0.name`,
                                      variantNames[0]
                                    )
                                    setValue(`variants.${index1}.attributes.0.value`, variant1)

                                    if (idVariants[`${variant1}`]) {
                                      setValue(`variants.${index1}.id`, idVariants[`${variant1}`])
                                    }

                                    return (
                                      <tr key={index1}>
                                        {variantPhoto && (
                                          <td>
                                            {/* <Controller
                                                name={`variants.${index1}.id`}
                                                control={control}
                                                rules={{ required: false }}
                                                render={({ field }) => (
                                                  <TextField
                                                    sx={{
                                                      display: 'none'
                                                    }}
                                                    {...field}
                                                    value={idVariants[`${variant1}`]}
                                                    type='hidden'
                                                  />
                                                )}
                                              /> */}
                                            <RenderImageVariantUpload index={index1} disabled />
                                          </td>
                                        )}
                                        <td
                                          style={{
                                            textAlign: 'left',
                                            minWidth: '100px',
                                            maxWidth: '120px'
                                            // overflow: 'hidden',
                                            // textOverflow: 'ellipsis'
                                          }}
                                          rowSpan={1}
                                        >
                                          {variant1}
                                        </td>
                                        {productType == 'STOCK' && (
                                          <td>
                                            <Controller
                                              name={`variants.${index1}.stock`}
                                              control={control}
                                              rules={{ required: true }}
                                              render={({ field: { onChange, ...field } }) => (
                                                <TextFieldNumber
                                                  {...field}
                                                  focused={hoverStock}
                                                  {...errorInput(
                                                    errors,
                                                    `variants.${index1}.stock`
                                                  )}
                                                  value={stockVariants[`${variant1}`]}
                                                  onChange={value =>
                                                    promise(() => {
                                                      setStockVariants(old => ({
                                                        ...old,
                                                        [`${variant1}`]: value ?? 0
                                                      }))

                                                      onChange(value)
                                                    })
                                                  }
                                                  size='small'
                                                />
                                              )}
                                            />
                                          </td>
                                        )}
                                        {vendorSetting?.is_maximum_order_qty_product_in_cart && (
                                          <td>
                                            <Controller
                                              name={`variants.${index1}.maximum_order`}
                                              control={control}
                                              rules={{ required: true }}
                                              render={({ field: { onChange, ...field } }) => (
                                                <TextFieldNumber
                                                  {...field}
                                                  placeholder='Unlimited'
                                                  focused={hoverMaxOrder}
                                                  {...errorInput(
                                                    errors,
                                                    `variants.${index1}.maximum_order`
                                                  )}
                                                  value={maxOrderVariants[`${variant1}`]}
                                                  onChange={value => {
                                                    promise(() => {
                                                      setMaxOrderVariants(old => ({
                                                        ...old,
                                                        [`${variant1}`]: value ?? null
                                                      }))

                                                      onChange(value)
                                                    })
                                                  }}
                                                  size='small'
                                                />
                                              )}
                                            />
                                          </td>
                                        )}
                                        {/* {(
                                          membsershipData?.data.data.filter(
                                            item => !item.is_default
                                          ) ?? []
                                        ).map((_membership, index) => (
                                          <td key={index}>
                                            <Controller
                                              name={`variants.${index1}.price.${index}`}
                                              control={control}
                                              rules={{ required: true }}
                                              render={({ field: { onChange, ...field } }) => (
                                                <TextFieldNumber
                                                  {...field}
                                                  placeholder={formatNumber(
                                                    masterPriceDisplay[index + 1] ?? 0
                                                  )}
                                                  focused={hoverMembership == index}
                                                  {...errorInput(
                                                    errors,
                                                    `variants.${index1}.price.${index}`
                                                  )}
                                                  defaultValue={parseInt(
                                                    membershipVariants[index.toString()][
                                                      `${variant1}`
                                                    ]
                                                  )}
                                                  onChange={value =>
                                                    promise(() => {
                                                      setMembershipVariants(old => {
                                                        const newMembershipVariants = JSON.parse(
                                                          JSON.stringify(old)
                                                        )
                                                        newMembershipVariants[index.toString()][
                                                          `${variant1}`
                                                        ] = value

                                                        return newMembershipVariants
                                                      })

                                                      onChange(value)
                                                    })
                                                  }
                                                  size='small'
                                                  prefix='Rp '
                                                  InputProps={{
                                                    inputProps: {
                                                      min: 0
                                                    }
                                                  }}
                                                />
                                              )}
                                            />
                                          </td>
                                        ))} */}

                                        <td>
                                          <Controller
                                            name={`variants.${index1}.price`}
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field: { onChange, ...field } }) => (
                                              <TextFieldNumber
                                                {...field}
                                                placeholder={t('Price') ?? 'Price'}
                                                focused={hoverSellingPrice}
                                                {...errorInput(errors, `variants.${index1}.price`)}
                                                value={sellingPriceVariants[`${variant1}`]}
                                                onChange={value =>
                                                  promise(() => {
                                                    setSellingPriceVariants(old => ({
                                                      ...old,
                                                      [`${variant1}`]: value ?? 0
                                                    }))

                                                    onChange(value)
                                                  })
                                                }
                                                size='small'
                                                prefix='Rp '
                                                InputProps={{
                                                  inputProps: {
                                                    min: 0
                                                  }
                                                }}
                                              />
                                            )}
                                          />
                                        </td>

                                        <td>
                                          <Controller
                                            name={`variants.${index1}.stock`}
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                              <TextField
                                                {...field}
                                                placeholder={masterSku}
                                                focused={hoverSku}
                                                {...errorInput(errors, `variants.${index1}.sku`)}
                                                value={skuVariants[`${variant1}`]}
                                                onChange={e => {
                                                  setSkuVariants(old => ({
                                                    ...old,
                                                    [`${variant1}`]: e.target.value
                                                  }))
                                                }}
                                                size='small'
                                              />
                                            )}
                                          />
                                        </td>
                                      </tr>
                                    )
                                  })}
                            </tbody>
                          </Table>
                        </div>
                      </Grid>
                    </MultipleWrapper>
                  )}
                  {/* {productExtraData.length > 0 && devMode && (
                    <>
                      <GridLabel item xs={12} sm={2} alignItems={'start'}>
                        <Typography variant='body1'>{t('Extra')}</Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        {productExtra == null ? (
                          <Button
                            variant='outlined'
                            onClick={() => setOpenDialogProductExtra(true)}
                            startIcon={<Icon icon='ic:baseline-plus' />}
                            sx={{ mb: 2 }}
                          >
                            Extra
                          </Button>
                        ) : (
                          <Box
                            sx={{
                              border: theme => `1px solid ${theme.palette.divider}`,
                              borderRadius: 1,
                              my: 2
                            }}
                          >
                            <Table
                              sx={{
                                '& td, & th': {
                                  px: '0.8rem !important',
                                  py: '0.5rem !important'
                                }
                              }}
                            >
                              <TableBody>
                                <TableRow>
                                  <TableCell sx={{ width: '200px' }}>{t('Name')}</TableCell>
                                  <TableCell>: {productExtra?.name}</TableCell>
                                  <TableCell align='right'>
                                    <IconButton
                                      size='small'
                                      onClick={() => setOpenDialogProductExtra(true)}
                                    >
                                      <Icon icon='tabler:pencil' />
                                    </IconButton>
                                    <IconButton
                                      size='small'
                                      color='error'
                                      onClick={() => {
                                        setProductExtra(null)
                                        setValue('product_extra_id', 0, { shouldDirty: true })
                                      }}
                                    >
                                      <Icon icon='tabler:trash' />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>{t('Type')}</TableCell>
                                  <TableCell>: {productExtra?.type}</TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>{t('Choice Type')}</TableCell>
                                  <TableCell>: {productExtra?.choice_type}</TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>{t('Minimum Choice')}</TableCell>
                                  <TableCell>
                                    : {formatNumber(productExtra?.minimum_choice)}
                                  </TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>{t('Maximum Choice')}</TableCell>
                                  <TableCell>
                                    : {formatNumber(productExtra?.maximum_choice)}
                                  </TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                            <Table
                              sx={{
                                borderTop: theme => `1px solid ${theme.palette.divider}`,
                                mt: 4,
                                '& td, & th': {
                                  px: '0.8rem !important',
                                  py: '0.5rem !important'
                                }
                              }}
                            >
                              <TableHead>
                                <TableRow>
                                  <TableCell>{t('Options')}</TableCell>
                                  <TableCell>{t('Price')}</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {(productExtra?.items ?? [])
                                  .filter(item => item.is_active)
                                  .map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{item.name}</TableCell>
                                      <TableCell>{formatPriceIDR(item.selling_price)}</TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </Box>
                        )}
                      </Grid>
                    </>
                  )} */}

                  {/* <GridLabel item xs={12} sm={2}>
                    <Typography variant='body1'>{t('Minimum Order')}</Typography>
                  </GridLabel>
                  <Grid item xs={12} sm={15}>
                    <Grid container columns={10} spacing={2}>
                      <Grid item xs={2}>
                        <Controller
                          name='minimum_order'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <TextFieldNumber
                              {...field}
                              min={1}
                              size='small'
                              fullWidth
                              {...errorInput(errors, 'minimum_order')}
                            />
                          )}
                        />
                      </Grid>
                      {vendorSetting?.is_maximum_order_qty_product_in_cart && (
                        <>
                          <GridLabel item>
                            <Typography variant='body1'>{t('Maximum Order')}</Typography>
                          </GridLabel>
                          <Grid item xs={12} sm={2}>
                            <Controller
                              name='maximum_order'
                              control={control}
                              render={({ field }) => (
                                <TextFieldNumber
                                  {...field}
                                  size='small'
                                  placeholder='Unlimited'
                                  fullWidth
                                  {...errorInput(errors, 'maximum_order')}
                                />
                              )}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Grid> */}
                  {/* <GridLabel item xs={12} sm={2} alignItems={'start'}>
                    <Typography variant='body1'>{t('Wholesale')}</Typography>
                  </GridLabel> */}

                  {/* <Grid item xs={12} sm={15}> */}
                  {/* <Grid container columns={10} spacing={4}> */}
                  {!enableWholesale ? (
                    <></>
                  ) : (
                    // <Grid item xs={2}>
                    //   <Button
                    //     variant='outlined'
                    //     fullWidth
                    //     startIcon={<Icon icon='ic:baseline-plus' />}
                    //     onClick={() => setEnableWholesale(true)}
                    //   >
                    //     {t('Wholesale')}
                    //   </Button>
                    // </Grid>
                    <></>
                    // <>
                    //   <Grid item xs={2}>
                    //     <Button
                    //       variant='outlined'
                    //       fullWidth
                    //       startIcon={<Icon icon='ic:baseline-minus' />}
                    //       onClick={() => setEnableWholesale(false)}
                    //     >
                    //       {t('Delete Wholesale')}
                    //     </Button>
                    //   </Grid>
                    //   <Grid item xs={10}>
                    //     <Typography variant='body1' mb={4}>
                    //       Harga Utama
                    //       {/* icon info */}
                    //       <Button
                    //         aria-describedby={'popover-info-grosir'}
                    //         variant='text'
                    //         size='small'
                    //         onClick={event => setAnchorElInfoGrosir(event.currentTarget)}
                    //         sx={{ ml: 1 }}
                    //       >
                    //         <Icon icon={'bi:info-circle'} fontSize={14} />
                    //       </Button>
                    //       <Popover
                    //         id='popover-info-grosir'
                    //         open={Boolean(anchorElInfoGrosir)}
                    //         anchorEl={anchorElInfoGrosir}
                    //         onClose={handleCloseInfoGrosir}
                    //         anchorOrigin={{
                    //           vertical: 'top',
                    //           horizontal: 'center'
                    //         }}
                    //         transformOrigin={{
                    //           vertical: 'bottom',
                    //           horizontal: 'center'
                    //         }}
                    //       >
                    //         <Typography sx={{ p: 2 }}>
                    //           Semua variant otomatis mengikuti harga grosir jika produk memiliki
                    //           harga grosir.
                    //         </Typography>
                    //       </Popover>
                    //     </Typography>
                    //     <Grid container columns={10} spacing={2}>
                    //       {(membsershipData?.data.data.filter(item => !item.is_default) ?? []).map(
                    //         (item, index) => (
                    //           <Grid item xs={2} key={index}>
                    //             <Controller
                    //               name={`price.${index}`}
                    //               control={control}
                    //               rules={{ required: true }}
                    //               render={({ field: { value, ...field } }) => (
                    //                 <TextFieldNumber
                    //                   isFloat
                    //                   {...field}
                    //                   {...(index == 0
                    //                     ? {
                    //                         onChange: value => {
                    //                           field.onChange(value)
                    //                         }
                    //                       }
                    //                     : {
                    //                         onChange: value => {
                    //                           field.onChange(value)
                    //                         }
                    //                       })}
                    //                   value={value}
                    //                   label={item.name}
                    //                   {...errorInput(errors, `price.${index}`)}
                    //                   defaultValue={productData?.product.price[2 + index]}
                    //                   size='small'
                    //                   fullWidth
                    //                   prefix='Rp '
                    //                   InputProps={{
                    //                     inputProps: {
                    //                       min: 0
                    //                     },
                    //                     ...(index == 0 && productData
                    //                       ? {
                    //                           endAdornment: (
                    //                             <InputAdornment position='end'>
                    //                               <IconButton
                    //                                 color='primary'
                    //                                 size='small'
                    //                                 onClick={() => {
                    //                                   setLevelSellingDialog(item.level)
                    //                                 }}
                    //                               >
                    //                                 <Icon
                    //                                   icon={'bi:graph-up-arrow'}
                    //                                   fontSize={14}
                    //                                 />
                    //                               </IconButton>
                    //                             </InputAdornment>
                    //                           )
                    //                         }
                    //                       : {})
                    //                   }}
                    //                 />
                    //               )}
                    //             />
                    //           </Grid>
                    //         )
                    //       )}
                    //     </Grid>
                    //   </Grid>
                    //   <Grid item xs={10}>
                    //     <Grid container columns={13} rowSpacing={3}>
                    //       <Grid item xs={12} sm={2}>
                    //         Jumlah Minimal
                    //       </Grid>
                    //       <Grid item xs={12} sm={11}>
                    //         <Box ml={8}>Harga Grosir</Box>
                    //       </Grid>
                    //       {[...Array(wholesalePiceLength)].map((_, index) => (
                    //         <>
                    //           <Grid item xs={12} sm={2}>
                    //             <Controller
                    //               name={`wholesale_price.${index}.min_qty`}
                    //               control={control}
                    //               rules={{ required: true }}
                    //               render={({ field }) => (
                    //                 <TextFieldNumber
                    //                   {...field}
                    //                   onChange={value => {
                    //                     field.onChange(value)

                    //                     if (index + 1 == wholesalePiceLength && index < 4) {
                    //                       setWholesalePiceLength(old => old + 1)
                    //                     }
                    //                   }}
                    //                   fullWidth
                    //                   size='small'
                    //                   InputProps={{
                    //                     startAdornment: (
                    //                       <InputAdornment position='start'>{`>=`}</InputAdornment>
                    //                     )
                    //                   }}
                    //                   {...errorInput(errors, `wholesale_price.${index}.min_qty`)}
                    //                 />
                    //               )}
                    //             />
                    //           </Grid>
                    //           <Grid item xs={12} sm={11}>
                    //             <Box display='flex'>
                    //               <Box ml={3} mr={3}>
                    //                 =
                    //               </Box>
                    //               <Grid container columns={12} spacing={2}>
                    //                 {(
                    //                   membsershipData?.data.data.filter(item => !item.is_default) ??
                    //                   []
                    //                 ).map((item, indexMembership) => (
                    //                   <>
                    //                     <Grid item xs={2} key={indexMembership} pt={'0 !important'}>
                    //                       <Controller
                    //                         name={`wholesale_price.${index}.price.${indexMembership}`}
                    //                         control={control}
                    //                         rules={{ required: true }}
                    //                         render={({ field }) => (
                    //                           <TextFieldNumber
                    //                             isFloat
                    //                             {...field}
                    //                             label={item.name}
                    //                             {...errorInput(
                    //                               errors,
                    //                               `wholesale_price.${index}.price.${indexMembership}`
                    //                             )}
                    //                             size='small'
                    //                             fullWidth
                    //                             prefix='Rp '
                    //                             InputProps={{
                    //                               inputProps: {
                    //                                 min: 0
                    //                               }
                    //                             }}
                    //                           />
                    //                         )}
                    //                       />
                    //                     </Grid>
                    //                   </>
                    //                 ))}
                    //                 {index > 0 && (
                    //                   <Grid item xs={1}>
                    //                     <IconButton
                    //                       size='small'
                    //                       color='error'
                    //                       onClick={() => {
                    //                         setValue(
                    //                           `wholesale_price`,
                    //                           getValues().wholesale_price.filter(
                    //                             (_, _index) => _index != index
                    //                           ),
                    //                           {
                    //                             shouldValidate: true
                    //                           }
                    //                         )

                    //                         setWholesalePiceLength(old => old - 1)
                    //                       }}
                    //                     >
                    //                       <Icon icon='bi:trash' />
                    //                     </IconButton>
                    //                   </Grid>
                    //                 )}
                    //               </Grid>
                    //             </Box>
                    //           </Grid>
                    //         </>
                    //       ))}
                    //     </Grid>
                    //   </Grid>
                    // </>
                  )}
                  {/* </Grid> */}
                  {/* </Grid> */}
                  {/* <GridLabel item xs={12} sm={2} alignItems={'start'}>
                    <Typography variant='body1'>{t('Show On POS')}</Typography>
                  </GridLabel>
                  <Grid item xs={12} sm={15}>
                    <FormControlLabel
                      label=''
                      checked={showOnPOS}
                      control={
                        <Switch
                          onChange={e => {
                            setShowOnPOS(e.target.checked)
                          }}
                        />
                      }
                    />
                  </Grid> */}
                </Grid>
                {/* section shipping option */}
                {/* {layoutProduct.shipping && (
                  <Grid container sx={{ my: 2 }} spacing={2} columns={17}>
                    <GridLabel item xs={12} sm={2}>
                      <Typography variant='body1'>{t('Weight')}</Typography>
                    </GridLabel>
                    <Grid item xs={12} sm={15}>
                      <Grid container columns={10} spacing={2}>
                        <Grid item xs={2}>
                          <Controller
                            name='weight'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <TextFieldNumber
                                {...field}
                                size='small'
                                fullWidth
                                {...errorInput(errors, 'weight')}
                                InputProps={{
                                  endAdornment: <InputAdornment position='end'>gram</InputAdornment>
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <GridLabel item xs={12} sm={2}>
                      <Typography variant='body1'>{t('Dimention')}</Typography>
                    </GridLabel>
                    <Grid item xs={12} sm={15}>
                      <Grid container columns={10} spacing={2}>
                        <Grid item xs={2}>
                          <Controller
                            name='dimention.length'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <TextFieldNumber
                                isFloat
                                {...field}
                                label={t('Length')}
                                size='small'
                                {...errorInput(errors, 'dimention.length')}
                                defaultValue={productData?.product.dimention.length}
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <Controller
                            name='dimention.width'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <TextFieldNumber
                                isFloat
                                {...field}
                                label={t('Width')}
                                size='small'
                                {...errorInput(errors, 'dimention.width')}
                                defaultValue={productData?.product.dimention.width}
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <Controller
                            name='dimention.height'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <TextFieldNumber
                                isFloat
                                {...field}
                                label={t('Height')}
                                size='small'
                                {...errorInput(errors, 'dimention.height')}
                                defaultValue={productData?.product.dimention.height}
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    {devMode && (
                      <>
                        <GridLabel item xs={12} sm={2}>
                          <Typography
                            variant='body1'
                            sx={{
                              textAlign: 'right'
                            }}
                          >
                            {t('Danger Product')}
                          </Typography>
                        </GridLabel>
                        <Grid item xs={12} sm={15}>
                          <RadioGroup row aria-label='controlled' name='controlled'>
                            <FormControlLabel
                              value={'false'}
                              control={<Radio />}
                              label={t('Opsi-No')}
                            />
                            <FormControlLabel
                              value={'true'}
                              control={<Radio />}
                              label={t('Opsi-Yes')}
                            />
                          </RadioGroup>
                        </Grid>
                      </>
                    )}
                  </Grid>
                )} */}
                {/* section other */}
                {layoutProduct.other && (
                  <Grid container spacing={2} columns={17}>
                    {/* <Grid item xs={12} sm={2}>
                              <Controller
                                name='status'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { ...field } }) => (
                                  <SelectCustom
                                    label='Status Product'
                                    {...field}
                                    error={Boolean(errors.status)}
                                    {...(errors.status && {
                                      helperText: errors.status.message
                                    })}
                                    options={[
                                      {
                                        label: 'Live',
                                        value: 'live'
                                      },
                                      {
                                        label: 'Draft',
                                        value: 'draft'
                                      },
                                      {
                                        label: 'Archived',
                                        value: 'archived'
                                      }
                                    ]}
                                    optionKey='value'
                                    labelKey='label'
                                    placeholder='Status Product'
                                    onSelect={item => {
                                      setValue('status', item.value, { shouldValidate: true })
                                    }}
                                  />
                                )}
                              />
                            </Grid> */}
                    {checkPermission('product.create_product_show_position') && (
                      <>
                        <GridLabel item xs={12} sm={2}>
                          <Typography variant='body1'>{t('Position')}</Typography>
                        </GridLabel>

                        <Grid item xs={12} sm={15}>
                          <Grid container columns={10} spacing={2}>
                            <Grid item xs={2}>
                              <Controller
                                name='position'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                  <TextFieldNumber
                                    isFloat
                                    {...field}
                                    label={''}
                                    fullWidth
                                    size='small'
                                    {...errorInput(errors, 'position')}
                                    defaultValue={productData?.product.position}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    )}

                    <GridLabel item xs={12} sm={2}>
                      <Typography variant='body1'>{t('Rack Position')}</Typography>
                    </GridLabel>

                    <Grid item xs={12} sm={15}>
                      <Grid container columns={10} spacing={2}>
                        <Grid item xs={2}>
                          <Controller
                            name='rack_position'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <CustomTextField
                                {...field}
                                size='small'
                                fullWidth
                                {...errorInput(errors, 'rack_position')}
                                error={Boolean(errors.rack_position)}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* {checkModuleVendor('product-labels') && (
                      <>
                        <GridLabel item xs={12} sm={2}>
                          <Typography variant='body1'>Label</Typography>
                        </GridLabel>
                        <Grid item xs={12} sm={10} container display={'flex'} flexDirection={'row'}>
                          <FormControlLabel
                            sx={{
                              ml: 2
                            }}
                            checked={isNewest}
                            control={
                              <Switch
                                onChange={e => {
                                  if (e.target.checked == isNewestDefault) {
                                    setIsNewestDefault(!e.target.checked)
                                  }

                                  setIsNewest(e.target.checked)
                                }}
                              />
                            }
                            label={t('Terbaru')}
                          />

                          <FormControlLabel
                            sx={{
                              ml: 2
                            }}
                            checked={isPromo}
                            control={
                              <Switch
                                onChange={e => {
                                  setIsPromo(e.target.checked)
                                }}
                              />
                            }
                            label={t('Promo')}
                          />

                          <FormControlLabel
                            sx={{
                              ml: 2
                            }}
                            checked={isBestSeller}
                            control={<Switch onChange={e => setIsBestSeller(e.target.checked)} />}
                            label={t('Terlaris')}
                          />
                          <FormControlLabel
                            sx={{
                              ml: 2
                            }}
                            control={
                              <Switch onChange={e => setValue('notification', e.target.checked)} />
                            }
                            label={t('Push Notification')}
                          />
                        </Grid>
                      </>
                    )} */}
                  </Grid>
                )}
              </CardWrapper>
            )
          ) : (
            <></>
          )}
          {/* <CardWrapper> */}
          {/* <Typography variant='h5' fontWeight={'bold'} mb={4}>
              {t('Basic Information')}
            </Typography> */}
          {/* here was section basic information */}
          {/* </CardWrapper> */}
          {/* <CardWrapper> */}
          {/* <Typography variant='h5' fontWeight={'bold'} mb={4}>
              {t('Sales Information')}
            </Typography> */}
          {/* here was sales information form */}

          {/* </CardWrapper> */}
          {/* {checkModuleVendor('product-shipping') ? (
            layoutProduct.shipping && (
              <CardWrapper>
                <Typography variant='h5' fontWeight={'bold'} mb={4}>
                  {t('Shipping')}
                </Typography>
                <Grid container spacing={2} columns={17}>
                  <GridLabel item xs={12} sm={2}>
                    <Typography variant='body1'>{t('Weight')}</Typography>
                  </GridLabel>
                  <Grid item xs={12} sm={15}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Controller
                          name='weight'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <TextFieldNumber
                              {...field}
                              size='small'
                              fullWidth
                              placeholder={t('Weigth') ?? 'Weigth'}
                              {...errorInput(errors, 'weight')}
                              InputProps={{
                                endAdornment: <InputAdornment position='end'>gram</InputAdornment>
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <GridLabel item xs={12} sm={2}>
                    <Typography variant='body1'>{t('Dimention')}</Typography>
                  </GridLabel>
                  <Grid item xs={12} sm={15}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Controller
                          name='dimention.length'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <TextFieldNumber
                              isFloat
                              {...field}
                              label={t('Length')}
                              size='small'
                              {...errorInput(errors, 'dimention.length')}
                              defaultValue={productData?.product.dimention.length}
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Controller
                          name='dimention.width'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <TextFieldNumber
                              isFloat
                              {...field}
                              label={t('Width')}
                              size='small'
                              {...errorInput(errors, 'dimention.width')}
                              defaultValue={productData?.product.dimention.width}
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Controller
                          name='dimention.height'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <TextFieldNumber
                              isFloat
                              {...field}
                              label={t('Height')}
                              size='small'
                              {...errorInput(errors, 'dimention.height')}
                              defaultValue={productData?.product.dimention.height}
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  {devMode && (
                    <>
                      <GridLabel item xs={12} sm={2}>
                        <Typography
                          variant='body1'
                          sx={{
                            textAlign: 'right'
                          }}
                        >
                          {t('Danger Product')}
                        </Typography>
                      </GridLabel>
                      <Grid item xs={12} sm={15}>
                        <RadioGroup row aria-label='controlled' name='controlled'>
                          <FormControlLabel
                            value={'false'}
                            control={<Radio />}
                            label={t('Opsi-No')}
                          />
                          <FormControlLabel
                            value={'true'}
                            control={<Radio />}
                            label={t('Opsi-Yes')}
                          />
                        </RadioGroup>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardWrapper>
            )
          ) : (
            <></>
          )} */}
          {/* origin other section */}
        </form>
        <DialogSizes
          open={addDialogSizesOpen}
          onClose={onCloseDialogSizes}
          onSave={setVarianSizes}
          oldVariants={variantSizes}
        />
        {/* <FormOutletDialog
          open={createDialogOpen == 'outlet'}
          toggle={handleCloseCreateDialog}
          selectedData={null}
          setSelectedData={() => {
            console.log()
          }}
        /> */}
        <FormCategoryDialog
          open={createDialogOpen == 'category'}
          toggle={handleCloseCreateDialog}
          selectCategory={null}
        />
        <FormBrandDialog
          open={createDialogOpen == 'brand'}
          toggle={handleCloseCreateDialog}
          selectBrand={null}
        />
        <FormUnitDialog
          open={createDialogOpen == 'unit'}
          toggle={handleCloseCreateDialog}
          selectUnit={null}
        />
      </div>
      {productData && (
        <DialogLogPrice
          onClose={onCloseDialogLogPrice}
          productId={productData.product.id}
          level={levelSellingDialog}
        />
      )}

      <Dialog open={isOpenPreviewVideo} onClose={closePreviewVideo} title='Preview Video'>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <video
            controls
            style={{
              maxWidth: '100%'
            }}
          >
            <source src={videoSrc} type='video/*' />
          </video>
        </div>
      </Dialog>
      <Dialog
        maxWidth='sm'
        enableCloseBackdrop={true}
        open={previewImage != undefined}
        onClose={() => {
          setPreviewImage(undefined)
        }}
        title='Preview Image'
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <img
            src={previewImage != undefined ? previewImage.data : ''}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh'
            }}
          />
        </div>
      </Dialog>
      <DialogLayoutProduct
        layout={layoutProduct}
        setLayout={setLayoutProduct}
        open={isOpenLayoutProduct}
        onClose={closeLayoutProduct}
      />
      {/* <DialogProductExtra
        onClose={() => {
          setOpenDialogProductExtra(false)
        }}
        open={openDialogProductExtra}
        onSelect={value => {
          setProductExtra(value)
          setValue('product_extra_id', value.id, { shouldDirty: true })
        }}
        productExtraSelected={productExtra}
      /> */}
    </div>
  )
}

export default FormProduct
