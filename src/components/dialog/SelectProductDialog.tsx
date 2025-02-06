import {
  Box,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import FilterCategory from 'src/components/filter/FilterCategory'
import { stockService } from 'src/services/product/stock'
import { StockDetail } from 'src/types/apps/product/stock'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { formatNumber, formatPriceIDR } from 'src/utils/numberUtils'
import Dialog from 'src/views/components/dialogs/Dialog'

interface DialogType {
  open: boolean
  toggle: () => void
  selectData: string[]
  setSelectData: (value: string[]) => void
  setSelectDataName: (value: string[]) => void
  onLoadedData?: (data: StockDetail[]) => void
}

const SelectProductDialog = (props: DialogType) => {
  const { open, toggle, selectData } = props

  // ** Hook
  const { t } = useTranslation()

  // ** Props
  const [searchProduct, setSearchProduct] = useState<string>('')
  const [productSelected, setProductSelected] = useState<string[]>(selectData)
  const [productData, setProductData] = useState<StockDetail[]>([])
  const [categorySelected, setCategorySelected] = useState<number>()

  useQuery(['product-select'], {
    queryFn: () => stockService.getList(maxLimitPagination),
    onSuccess: data => {
      const _data = data.data.data ?? []

      setProductData(_data)

      props.onLoadedData && props.onLoadedData(_data)
    },
    cacheTime: 0
  })

  const handleClose = () => {
    toggle()
  }

  const handleSave = () => {
    toggle()

    props.setSelectData(productSelected)
    props.setSelectDataName(
      productData
        .filter(item =>
          productSelected.includes(`${item.product.id}-${item.product.product_variant_id}`)
        )
        .map(
          item =>
            item.product.name +
            (item.product.product_variant_id
              ? ` (${item.product.attributes?.map(item => item.value).join(', ')})`
              : '')
        )
    )
  }

  const toggleSelectAll = () => {
    if (productSelected.length === productFiltered.length) {
      const productFiltered = productData.map(
        item => `${item.product.id}-${item.product.product_variant_id}`
      )
      setProductSelected(old => old.filter(item => !productFiltered.includes(item)))
    } else {
      setProductSelected(
        productFiltered.map(item => `${item.product.id}-${item.product.product_variant_id}`)
      )
    }
  }

  useEffect(() => {
    if (open) {
      setProductSelected(selectData)
      setSearchProduct('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const productFiltered = useMemo(
    () =>
      productData
        .filter(item => {
          if (searchProduct === '') {
            return item
          } else if (
            item.product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
            item.product.sku.toLowerCase().includes(searchProduct.toLowerCase()) ||
            item.product.vsku?.toLowerCase().includes(searchProduct.toLowerCase()) ||
            item.product.attributes
              ?.map(item => item.value)
              .join(', ')
              .toLocaleLowerCase()
              .includes(searchProduct.toLocaleLowerCase())
          ) {
            return item
          }
        })
        .filter(item => {
          if (categorySelected === undefined) {
            return item
          } else if (item.product.category_id === categorySelected) {
            return item
          }
        }),
    [productData, searchProduct, categorySelected]
  )

  return (
    <Dialog title={t(`Select Product`)} open={open} onClose={handleClose} maxWidth='md'>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
        <TextField
          placeholder={t(`Search`) + ' ' + t(`Product`)}
          size='small'
          onChange={e => {
            setSearchProduct(e.target.value)
          }}
        />
        <FilterCategory
          multiple={false}
          value={categorySelected ? [categorySelected] : []}
          onChange={value => setCategorySelected(value ? value[0] : undefined)}
        />

        <Box sx={{ ml: 'auto' }}>
          <Button variant='contained' onClick={handleSave}>
            {t(`Save`)}
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ mt: 3, maxHeight: '400px', overflow: 'auto' }}>
        <Table
          sx={{
            '& td, & th': {
              p: theme => `${theme.spacing(2)} !important`
            }
          }}
        >
          <TableHead
            sx={{
              position: 'sticky',
              top: 0,
              backgroundColor: theme => theme.palette.customColors.tableHeaderBg,
              zIndex: 1
            }}
          >
            <TableRow>
              <TableCell width={'50px'}>
                <Checkbox
                  checked={productSelected.length === productFiltered.length}
                  sx={{ padding: 0 }}
                  onChange={toggleSelectAll}
                />
              </TableCell>

              <TableCell>{t(`SKU / VSKU`)}</TableCell>
              <TableCell>{t(`Product`)}</TableCell>
              <TableCell>{t(`Variant`)}</TableCell>
              <TableCell>{t(`Category`)}</TableCell>
              <TableCell>{t(`Stock`)}</TableCell>
              <TableCell>{t(`Price`)}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productFiltered.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox
                    sx={{ padding: 0 }}
                    checked={productSelected.includes(
                      `${item.product.id}-${item.product.product_variant_id}`
                    )}
                    onChange={() => {
                      if (
                        productSelected.includes(
                          `${item.product.id}-${item.product.product_variant_id}`
                        )
                      ) {
                        setProductSelected(
                          productSelected.filter(
                            item2 =>
                              item2 !== `${item.product.id}-${item.product.product_variant_id}`
                          )
                        )
                      } else {
                        setProductSelected([
                          ...productSelected,
                          `${item.product.id}-${item.product.product_variant_id}`
                        ])
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  {item.product.sku +
                    (item.product.is_variant && item.product.vsku ? ' / ' + item.product.vsku : '')}
                </TableCell>
                <TableCell>{item.product.name}</TableCell>
                <TableCell>
                  {item.product.attributes?.map(attribute => attribute.value).join(' - ') ?? '-'}
                </TableCell>
                <TableCell>{item.product?.category_name ?? '-'}</TableCell>
                <TableCell>{formatNumber(item.product.stock)}</TableCell>
                <TableCell>{formatPriceIDR(0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Dialog>
  )
}

export default SelectProductDialog
