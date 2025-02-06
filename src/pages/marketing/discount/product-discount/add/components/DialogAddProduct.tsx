import { Box, Button, Checkbox, Grid, TextField, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import React, { memo, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { categoryService } from 'src/services/category'
import { productService } from 'src/services/product'
import { ProductDetailType } from 'src/types/apps/productType'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { formatNumber, formatPriceIDR } from 'src/utils/numberUtils'
import Dialog from 'src/views/components/dialogs/Dialog'
import SelectCustom from 'src/components/form/select/SelectCustom'
import RenderImageAws from 'src/views/setting/elements/render-images-aws'

type props = {
  selected: number[]
  open: boolean
  onClose: () => void
}

const DialogAddProduct = memo(({ open, onClose, selected }: props) => {
  const [productSelected, setProductSelected] = useState<number[]>(selected)

  const defaultPaginationProduct = defaultPagination
  defaultPaginationProduct.sort = 'desc'

  const [paginationData, setPaginationData] =
    useState<PageOptionRequestType>(defaultPaginationProduct)

  const onHandleSearch = (value: string) => {
    setPaginationData({ ...paginationData, query: value, page: 1 })
  }

  const [categoryFilterVal, setCategoryFilterVal] = useState<number | null>(null)
  const { data: categoriesData } = useQuery('category-list', {
    queryFn: () => categoryService.getListCategoriesDetailActive()
  })

  useEffect(() => {
    if (categoryFilterVal)
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        data.category_id = categoryFilterVal
        data.page = 1

        return data
      })
    else
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        delete data.category_id
        data.page = 1

        return data
      })
  }, [categoryFilterVal])

  const { data: dataProduct, isLoading: isLoadingProduct } = useQuery(
    ['list-product', paginationData],
    {
      queryFn: () => productService.getListProductDetail(paginationData)
    }
  )

  const columns: GridColDef<ProductDetailType>[] = [
    {
      cellClassName: 'padding-left-01rem',
      headerClassName: 'padding-left-01rem',
      width: 42,
      disableColumnMenu: true,
      sortable: false,
      headerName: 'Checkbox',
      field: 'checkbox',
      colSpan: () => {
        return undefined
      },
      renderCell: (index: GridRenderCellParams) => {
        return (
          <Checkbox
            sx={{
              paddingTop: 0,
              paddingBottom: 0
            }}
            checked={productSelected.includes(index.row.product.id)}
            onChange={e =>
              setProductSelected(old => {
                if (e.target.checked) {
                  return [...old, index.row.product.id]
                } else {
                  return old.filter(item => item !== index.row.product.id)
                }
              })
            }
          />
        )
      },
      renderHeader: () => (
        <Checkbox
          //   indeterminate={isCheckboxIndeterminate()}
          checked={(dataProduct?.data.data?.length ?? 0) === productSelected.length}
          onChange={e => {
            if (e.target.checked) {
              setProductSelected(dataProduct?.data.data.map(item => item.product.id) ?? [])
            } else {
              setProductSelected([])
            }
          }}
        />
      )
    },
    {
      flex: 0.4,
      field: 'product',
      headerName: 'Product',
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'start', columnGap: 2 }}>
            <RenderImageAws
              url={row.product.media && row.product.media.length > 0 ? row.product.media[0] : ''}
              name={params.row.product.name}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant='body2'
                sx={theme => ({
                  fontWeight: 600,
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  color: theme.palette.primary.main
                })}
              >
                {row.product.name}
              </Typography>
              <Typography variant='caption'>Parent SKU: {row.product.sku}</Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.3,
      field: 'price',
      headerName: 'Price',
      renderCell: params => <Typography>{formatPriceIDR(params.row.product.price['1'])}</Typography>
    },
    {
      flex: 0.2,
      field: 'stock',
      headerName: 'Total Stock',
      renderCell: params => <Typography>{formatNumber(params.row.product.stock)}</Typography>
    }
  ]

  return (
    <Dialog {...{ open, onClose }} title='Select Product' maxWidth={'md'}>
      <Grid container columnSpacing={2}>
        <Grid item xs={6}>
          <TextField
            size='small'
            fullWidth
            label={'Search'}
            onChange={e => {
              onHandleSearch(e.target.value ?? '')
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <SelectCustom
            isFloating
            value={categoryFilterVal}
            onSelect={category => {
              setCategoryFilterVal(category?.category.id ?? null)
            }}
            options={categoriesData?.data.data ?? []}
            optionKey={['category', 'id']}
            labelKey={['category', 'name']}
            label='Category'
            {...(categoriesData?.data.data.length == 1 && {
              defaultValueId: categoriesData?.data.data[0]
            })}
          />
        </Grid>
      </Grid>
      {/* Box overflow y max h 400 */}
      <Box
        sx={{
          maxHeight: 400,
          overflowY: 'auto'
        }}
      >
        <DataGrid
          autoHeight
          sx={{
            mt: 2,
            '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
              display: 'none'
            },
            '& .MuiDataGrid-cell': {
              alignItems: 'start',
              paddingY: 2
            }
          }}
          loading={isLoadingProduct}
          rows={dataProduct?.data.data ?? []}
          getRowId={param => param.product.id}
          // rows={manipulateRows(productData)}
          columns={columns}
          disableColumnMenu
          hideFooter
        />
      </Box>
      {/* Create Button Continue */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          mb: 2
        }}
      >
        <Box>{productSelected.length} Product Selected</Box>
        <Button
          variant='contained'
          color='primary'
          //   onClick={handleContinue}
        >
          Continue
        </Button>
      </Box>
    </Dialog>
  )
})

export default DialogAddProduct
