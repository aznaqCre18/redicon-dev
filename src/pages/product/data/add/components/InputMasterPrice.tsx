import { Icon } from '@iconify/react'
import { Grid, IconButton, InputAdornment } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { useAuth } from 'src/hooks/useAuth'
import { formatNumber } from 'src/utils/numberUtils'
import InputDiscountOrNominal from './InputDiscountOrNominal'

type InputMasterPriceProps = {
  // control: any
  // name: string
  label: string
  placeholder: number | undefined
  required: boolean
  showSellingPrice: boolean
  onClickSellingPrice: () => void
  masterPrice: number | undefined
  masterPriceDiscount: number | undefined
  masterPriceDiscountType: 'nominal' | 'percentage'
  setMasterPrice: (value: number | undefined) => void
  setMasterPriceDiscount: (value: number | undefined) => void
  setMasterPriceDiscountType: (value: 'nominal' | 'percentage') => void
  purchasePrice: number
  discountPurchasePrice: number
  discountPurchasePriceType: 'nominal' | 'percentage'
  setPriceError: (value: string | undefined) => void
  priceError: string | undefined
}

const InputMasterPrice = ({
  // control,
  // name,
  label,
  required,
  placeholder,
  showSellingPrice,
  onClickSellingPrice,
  masterPrice,
  masterPriceDiscount,
  masterPriceDiscountType,
  setMasterPrice,
  setMasterPriceDiscount,
  setMasterPriceDiscountType,
  purchasePrice,
  discountPurchasePrice,
  discountPurchasePriceType,
  setPriceError,
  priceError
}: InputMasterPriceProps) => {
  // Hooks
  const { t } = useTranslation()
  const { checkPermission } = useAuth()

  const [price, setPrice] = useState<number | undefined>(masterPrice)
  const [discount, setDiscount] = useState<number | undefined>(masterPriceDiscount)
  const [discountType, setDiscountType] = useState<'nominal' | 'percentage'>(
    masterPriceDiscountType
  )

  const modalUntukDiscount =
    masterPriceDiscountType == 'nominal'
      ? masterPriceDiscount
      : ((masterPriceDiscount ?? 0) / 100) * (masterPrice ?? 0)

  console.log('debugx modalUntukDiscount', modalUntukDiscount)

  const modal =
    discountPurchasePriceType == 'nominal'
      ? purchasePrice - discountPurchasePrice + (modalUntukDiscount ?? 0)
      : purchasePrice - (discountPurchasePrice / 100) * purchasePrice + (modalUntukDiscount ?? 0)

  console.log('debugx modal total dengan harga beli', modal)

  const [margin, setMargin] = useState<number | undefined>(
    masterPrice ? ((masterPrice - modal) / modal) * 100 : undefined
  )

  console.log('debugx', label, masterPrice, masterPriceDiscountType, masterPriceDiscount)

  console.log('debugx purchasePrice', purchasePrice)
  console.log(
    'debugx margin',
    masterPriceDiscountType == 'nominal'
      ? (((masterPrice ?? 0) -
          ((purchasePrice ?? 0) - (discountPurchasePrice ?? 0) + (masterPriceDiscount ?? 0))) /
          ((purchasePrice ?? 0) - (discountPurchasePrice ?? 0) + (masterPriceDiscount ?? 0))) *
          100
      : (masterPrice ?? 0) - 2000
  )

  const [onEditPrice, setOnEditPrice] = useState(false)
  const [onEditDiscount, setOnEditDiscount] = useState(false)
  const [onEditMargin, setOnEditMargin] = useState(false)

  const getPurchasePriceWithDiscount = () => {
    return discountPurchasePriceType == 'nominal'
      ? purchasePrice - discountPurchasePrice
      : purchasePrice - (discountPurchasePrice / 100) * purchasePrice
  }

  const changePrice = (newPrice: number) => {
    if (!onEditPrice) return
    // refresh margin

    const _purchasePrice = getPurchasePriceWithDiscount()

    const _discount = discount ?? 0

    const priceWithDiscount =
      discountType == 'nominal' ? newPrice - _discount : newPrice - (_discount / 100) * newPrice

    const _margin = ((priceWithDiscount - _purchasePrice) / _purchasePrice) * 100

    setMargin(_margin)
  }

  const changeDiscount = (newDiscount: number | undefined) => {
    if (!onEditDiscount) return

    // refresh margin
    const _purchasePrice = getPurchasePriceWithDiscount()

    const _discount = newDiscount ?? 0

    const _price = price ?? 0

    const priceWithDiscount =
      discountType == 'nominal' ? _price - _discount : _price - (_discount / 100) * _price

    const _margin = ((priceWithDiscount - _purchasePrice) / _purchasePrice) * 100

    setMargin(_margin)
  }

  const changeDiscountType = (newDiscountType: 'nominal' | 'percentage') => {
    if (!onEditDiscount) return
    const _purchasePrice = getPurchasePriceWithDiscount()

    const _discount = discount ?? 0

    const _price = price ?? 0

    const priceWithDiscount =
      newDiscountType == 'nominal' ? _price - _discount : _price - (_discount / 100) * _price

    const _margin = ((priceWithDiscount - _purchasePrice) / _purchasePrice) * 100

    setMargin(_margin)
  }

  const changeMargin = (newMargin: number | undefined) => {
    if (!onEditMargin) return
    // refresh price
    const _purchasePrice = getPurchasePriceWithDiscount()

    const _margin = newMargin ?? 0

    const _discount = discount ?? 0
    // if discount nominal
    if (discountType == 'nominal') {
      const priceWithMargin =
        _purchasePrice + _discount + ((_purchasePrice + _discount) * _margin) / 100
      setPrice(priceWithMargin)
    } else {
      const priceWithMargin = _purchasePrice + (_purchasePrice * _margin - _discount / 100)
      setPrice(priceWithMargin)
    }
  }

  useEffect(() => {
    console.log('price', price)
    console.log('discount', discount)
    console.log('discountType', discountType)

    setMasterPrice(price)
    setMasterPriceDiscount(discount)
    setMasterPriceDiscountType(discountType)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, discount, discountType])

  useEffect(() => {
    setMargin(masterPrice ? ((masterPrice - modal) / modal) * 100 : undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchasePrice, discountPurchasePrice, discountPurchasePriceType])

  return (
    <Grid item container columns={10} spacing={2}>
      {/* <Controller
        name={name}
        control={control}
        rules={{ required: true }}
        render={({ field }) => ( */}
      {/* <> */}
      <Grid item xs={2}>
        <TextFieldNumber
          onFocus={() => setOnEditPrice(true)}
          onBlur={() => setOnEditPrice(false)}
          isFloat
          placeholder={formatNumber(placeholder ?? 0)}
          value={price}
          onChange={value => {
            if (value == undefined && required)
              setPriceError(`${t('Selling Price')} ${t('is a required field')}`)
            else setPriceError(undefined)

            setPrice(value ?? undefined)
            changePrice(value ?? 0)
          }}
          label={label}
          error={priceError !== undefined && required}
          {...(priceError !== undefined &&
            required && {
              helperText: priceError
            })}
          size='small'
          fullWidth
          prefix='Rp '
          InputProps={{
            inputProps: {
              min: 0
            }
            // ...(showSellingPrice
            //   ? {
            //       endAdornment: (
            //         <InputAdornment position='end'>
            //           <IconButton color='primary' size='small' onClick={onClickSellingPrice}>
            //             <Icon icon={'bi:graph-up-arrow'} fontSize={14} />
            //           </IconButton>
            //         </InputAdornment>
            //       )
            //     }
            //   : {})
          }}
        />
      </Grid>
      {/* {checkPermission('product.create_product_show_discount') && (
        <Grid item xs={2}>
          <InputDiscountOrNominal
            onFocus={() => setOnEditDiscount(true)}
            onBlur={() => setOnEditDiscount(false)}
            value={discount ?? 0}
            discountType={discountType ?? undefined}
            label={t('Discount') ?? 'Discount'}
            onChange={value => {
              setDiscount(value ?? undefined)
              changeDiscount(value ?? 0)
            }}
            onChangeDiscountType={value => {
              setDiscountType(value ?? undefined)
              changeDiscountType(value)
            }}
          />
        </Grid>
      )} */}
      {/* {checkPermission('product.create_product_show_purchase_price') && (
        <>
          <Grid item xs={2}>
            <TextFieldNumber
              onFocus={() => setOnEditMargin(true)}
              onBlur={() => setOnEditMargin(false)}
              sx={theme => ({
                '& .MuiOutlinedInput-root': {
                  mt: 1,
                  color: (margin ?? 0) < 0 ? theme.palette.error.main : 'unset'
                }
              })}
              isFloat
              label='Margin %'
              size='small'
              // defaultValue={0}
              value={margin}
              error={(margin ?? 0) < 0}
              suffix='%'
              onChange={value => {
                setMargin(value ?? undefined)
                changeMargin(value ?? 0)
              }}
            />
          </Grid>
        </>
      )} */}
      {/* </> */}
      {/* )} */}
      {/* /> */}
    </Grid>
  )
}

export default InputMasterPrice
