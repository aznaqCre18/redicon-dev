import { Box, Checkbox, CircularProgress, Grid, IconButton, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PriceMembershipType, ProductDetailType } from 'src/types/apps/productType'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { CRUDPermission } from 'src/utils/permissionUtils'
import { useMutation } from 'react-query'
import { productService } from 'src/services/product'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import TableProductRow from './TableProductRow'
import { productVariantService } from 'src/services/product/variant'
import DialogPriceStockManagement from './DialogPriceStockManagement'
import { TableColumnSortProp } from 'src/components/table/TableCustom'
import { Icon } from '@iconify/react'
import { DefaultTFuncReturn } from 'i18next'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { useAuth } from 'src/hooks/useAuth'
import { SupplierType } from 'src/types/apps/supplier'
import { useData } from 'src/hooks/useData'
import { useSettings } from 'src/@core/hooks/useSettings'
import themeConfig from 'src/configs/themeConfig'

type Props = {
  isLoading: boolean
  data: ProductDetailType[]
  pagination: PageOptionRequestType
  permission: CRUDPermission
  itemSelected: ProductDetailType[]
  checkedAll: boolean
  outletData: OutletType[]
  supplierData: SupplierType[]
  onColumnSorting: (data: TableColumnSortProp) => void
  setItemSelected: (data: ProductDetailType[]) => void
  setCheckedAll: (data: boolean) => void
  refetch: () => void
}

const TableProduct = ({
  isLoading,
  data,
  pagination,
  permission,
  itemSelected,
  checkedAll,
  outletData,
  supplierData,
  onColumnSorting,
  setItemSelected,
  setCheckedAll,
  refetch
}: Props) => {
  const { t } = useTranslation()
  const { checkModuleVendor } = useAuth()

  const { membershipData } = useData()

  const [columnSort, setColumnSort] = useState<TableColumnSortProp>({
    column: 'updated_at',
    sort: 'desc'
  })

  useEffect(() => {
    // console.log('debugx pagination', pagination)
    // console.log('debugx columnSort', columnSort)

    if (!pagination.order || !pagination.sort) return

    if (columnSort.column != pagination.order || columnSort.sort != pagination.sort)
      setColumnSort({
        column: pagination.order,
        sort: pagination.sort
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination])

  useEffect(() => {
    onColumnSorting(columnSort)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnSort])

  const [deleteProduct, setDeleteProduct] = useState(false)
  const [selectDelete, setSelectDelete] = useState<number | null>(null)

  const isCheckboxIndeterminate = itemSelected.length > 0 && !checkedAll

  // useEffect(() => {
  //   onItemSelected(itemSelected)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [itemSelected])

  const handleChangeCheckbox = (checked: boolean, id: string, itemCheck?: ProductDetailType) => {
    if (id !== 'all') {
      if (itemCheck && checked) setItemSelected([...itemSelected, itemCheck])
      else if (itemCheck && !checked)
        setItemSelected(itemSelected.filter(item => itemCheck.product.id != item.product.id))

      // setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate) {
        setCheckedAll(checked)
        if (checked) setItemSelected(data)
        else if (!checked) setItemSelected([])
      } else {
        setCheckedAll(false)
        setItemSelected([])
      }
    }
  }

  const [openDialogPriceAndStock, setOpenDialogPriceAndStock] = useState<number | undefined>(
    undefined
  )

  const closeDialogManagement = () => {
    setOpenDialogPriceAndStock(undefined)

    refetch()
  }

  const { mutate: updatePrice } = useMutation(productService.updatePriceProduct, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      refetch()
    }
  })

  const { mutate: updatePurchasePrice } = useMutation(productService.updatePurchasePriceProduct, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      refetch()
    }
  })

  const { mutate: updateVariant } = useMutation(productVariantService.update, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      refetch()
    }
  })

  const { mutate: updateStock } = useMutation(productService.updateStockProduct, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      refetch()
    }
  })

  const { mutate: mutateDelete, isLoading: isLoadingDelete } = useMutation(
    productService.deleteProduct,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))

        refetch()
        setDeleteProduct(false)
        setSelectDelete(null)
      }
    }
  )

  const onChangePrice = (id: number, price: PriceMembershipType) => {
    updatePrice({ id: id, price: price })
  }

  const onChangePurchasePrice = (id: number, price: number) => {
    updatePurchasePrice({ id: id, purchase_price: price })
  }

  const onUpdateVariant = (id: number, data: any) => {
    updateVariant({ id, data })
  }

  const onChangeStock = (id: number, stock: number) => {
    updateStock({ id: id, stock: stock })
  }

  const handleDelete = (id: number | null) => {
    setSelectDelete(id)
    setDeleteProduct(true)
  }

  const handleCloseDeleteProduct = () => {
    setDeleteProduct(false)
    setSelectDelete(null)
  }

  const handleConfirmDeleteProduct = () => {
    if (selectDelete !== null) {
      mutateDelete(selectDelete)
    }
  }

  const HeaderSort = (data: { label?: DefaultTFuncReturn; column: string }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        ':hover': {
          cursor: 'pointer'
        }
      }}
      onClick={() => {
        if (
          data.column != 'updated_at' &&
          columnSort.column == data.column &&
          columnSort.sort == 'desc'
        ) {
          setColumnSort({
            column: 'updated_at',
            sort: 'desc'
          })

          return
        }

        setColumnSort({
          column: data.column,
          sort:
            columnSort.column === data.column ? (columnSort.sort === 'asc' ? 'desc' : 'asc') : 'asc'
        })
      }}
    >
      <Box>{data.label}</Box>
      {columnSort.column === data.column && (
        <IconButton size='small'>
          <Icon
            icon={columnSort.sort == 'asc' ? 'akar-icons:arrow-up' : 'akar-icons:arrow-down'}
            fontSize={'0.8rem'}
          />
        </IconButton>
      )}
    </Box>
  )

  const horizontalScroll = checkModuleVendor('product-table-scroll-horizontal')

  // virtual horizontal scroll
  const virtualScrollRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (virtualScrollRef.current && tableRef.current) {
      virtualScrollRef.current.addEventListener('scroll', () => {
        ;(tableRef.current as any).scrollLeft = (virtualScrollRef.current as any).scrollLeft
      })

      tableRef.current.addEventListener('scroll', () => {
        ;(virtualScrollRef.current as any).scrollLeft = (tableRef.current as any).scrollLeft
      })
    }
  }, [])

  const isGroupColumnDate = checkModuleVendor('product-table-column-group-date')

  const showColumnMembership = checkModuleVendor('product-table-column-price-membership')

  const widthTable =
    9 +
    (outletData.length > 1 ? 2 : 0) +
    (supplierData.length > 0 && checkModuleVendor('product-table-column-supplier') ? 2 : 0) +
    (checkModuleVendor('product-table-column-purchase-price') ? 1.5 : 0) +
    (showColumnMembership ? 1.5 * membershipData.length : 1.5) +
    (isGroupColumnDate ? 1.5 : 3) +
    // action full
    (horizontalScroll ? 1.5 : 1)

  const {
    settings: { navCollapsed, layout }
  } = useSettings()

  const { collapsedNavigationSize } = themeConfig

  return (
    <>
      <Box
        id='virtual-scrollbar'
        sx={{
          overflowX: horizontalScroll ? 'scroll' : 'auto',
          width: horizontalScroll
            ? `calc(100vw - 1rem - ${
                layout === 'vertical' ? (navCollapsed ? collapsedNavigationSize : 220) : 0
              }px)`
            : undefined,
          overflowY: 'hidden',
          display: horizontalScroll ? 'block' : 'none'
        }}
        ref={virtualScrollRef}
      >
        <Box
          sx={
            horizontalScroll
              ? {
                  width: `calc(100vw + ${widthTable}rem + ${layout == 'vertical' ? 220 : 0}px)`
                }
              : {}
          }
        >
          <Box
            sx={{
              height: 0
            }}
          >
            virtual
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          overflowX: horizontalScroll ? 'scroll' : 'auto',
          width: horizontalScroll
            ? `calc(100vw - 2rem - ${
                layout === 'vertical' ? (navCollapsed ? collapsedNavigationSize : 220) : 0
              }px)`
            : undefined
        }}
        ref={tableRef}
      >
        <Box
          sx={
            horizontalScroll
              ? {
                  width: `calc(100vw + ${widthTable}rem + ${layout === 'vertical' ? 220 : 0}px)`
                }
              : {}
          }
        >
          {/* Table Header */}
          <Box
            sx={{
              backgroundColor: theme => theme.palette.customColors.tableHeaderBg,
              width: '100%'
            }}
          >
            <Grid
              container
              columns={widthTable}
              columnSpacing={4}
              sx={{
                py: 2,
                px: 4,
                alignItems: 'center',
                textTransform: 'uppercase',
                fontSize: 14,
                fontWeight: 600
              }}
            >
              <Grid item xs={0.5}>
                <Checkbox
                  checked={checkedAll}
                  indeterminate={isCheckboxIndeterminate}
                  sx={{
                    padding: 0
                  }}
                  onChange={e => handleChangeCheckbox(e.target.checked, 'all')}
                />
              </Grid>
              <Grid item xs={0.5}>
                <Box>No</Box>
              </Grid>
              <Grid item xs={3}>
                <HeaderSort label={t('Product')} column='name' />
              </Grid>
              <Grid item xs={2}>
                <HeaderSort label={t('Category')} column='category_id' />
              </Grid>
              {/* <Grid item xs={1.5}>
                <HeaderSort label={t('Brand')} column='category_id' />
              </Grid> */}
              {outletData.length > 1 && (
                <Grid item xs={2}>
                  <HeaderSort label={t('Outlet')} column='outlet_id' />
                </Grid>
              )}
              {checkModuleVendor('product-table-column-supplier') && supplierData.length > 0 && (
                <Grid item xs={2}>
                  <HeaderSort label={t('Supplier')} column='supplier_id' />
                </Grid>
              )}
              {checkModuleVendor('product-table-column-purchase-price') && (
                <Grid item xs={1.5}>
                  <HeaderSort label={t('Purchase Price')} column='price' />
                </Grid>
              )}
              {showColumnMembership ? (
                membershipData.map(item => (
                  <Grid item xs={1.5} key={item.id}>
                    <HeaderSort label={item.name} column='price' />
                  </Grid>
                ))
              ) : (
                <Grid item xs={1.5}>
                  <HeaderSort label={t('Price')} column='price' />
                </Grid>
              )}
              <Grid item xs={1}>
                <HeaderSort label={t('Stock')} column='stock' />
              </Grid>
              {isGroupColumnDate ? (
                <Grid item xs={1.5}>
                  <HeaderSort label={t('Date')} column='updated_at' />
                </Grid>
              ) : (
                <>
                  <Grid item xs={1.5}>
                    <HeaderSort label={t('Created At')} column='created_at' />
                  </Grid>
                  <Grid item xs={1.5}>
                    <HeaderSort label={t('Updated At')} column='updated_at' />
                  </Grid>
                </>
              )}

              <Grid
                item
                xs={horizontalScroll ? 1.5 : 2}
                sx={{
                  display: 'flex',
                  justifyContent: 'end'
                }}
              >
                <Box> {t('Action')}</Box>
              </Grid>
            </Grid>
          </Box>
          {/* Table Body */}
          {permission.read ? (
            <Box>
              {isLoading ? (
                <Box
                  sx={{
                    py: 2,
                    px: 4,
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: 500,
                    color: theme => theme.palette.text.secondary
                  }}
                >
                  <CircularProgress />
                  <Typography>{!isLoading ? '' : t('Loading')}</Typography>
                </Box>
              ) : data.length > 0 ? (
                <>
                  {data.map((item, index) => (
                    <TableProductRow
                      key={item.product.id}
                      no={pagination.limit * (pagination.page - 1) + index + 1}
                      item={item}
                      permission={permission}
                      setOpenDialogPriceAndStock={setOpenDialogPriceAndStock}
                      onChangePurchasePrice={onChangePurchasePrice}
                      onChangePrice={onChangePrice}
                      onChangeStock={onChangeStock}
                      handleDelete={handleDelete}
                      onUpdateVariant={onUpdateVariant}
                      checked={itemSelected.includes(item) || false}
                      handleChangeCheckbox={handleChangeCheckbox}
                      outletData={outletData}
                      supplierData={supplierData}
                      membershipData={membershipData}
                    />
                  ))}
                </>
              ) : (
                <Box
                  sx={{
                    py: 2,
                    px: 4,
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: 500,
                    color: theme => theme.palette.text.secondary
                  }}
                >
                  <Typography variant='body1'>{t('No data')}</Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                py: 2,
                px: 4,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 500,
                color: theme => theme.palette.text.secondary
              }}
            >
              <Typography variant='body1'>
                {t('You do not have permission to show data')}
              </Typography>
            </Box>
          )}
          <Box></Box>
          <DialogPriceStockManagement
            productId={openDialogPriceAndStock}
            onClose={() => closeDialogManagement()}
          />

          <DialogConfirmation
            open={deleteProduct}
            handleClose={handleCloseDeleteProduct}
            handleConfirm={handleConfirmDeleteProduct}
            loading={isLoadingDelete}
            name='Product'
          />
        </Box>
      </Box>
    </>
  )
}

export default TableProduct
