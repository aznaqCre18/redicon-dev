// ** React Imports
import React, {
  memo,
  useEffect,
  // useRef,
  useState
} from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
// import Typography from '@mui/material/Typography'
// import {
//   DataGrid,
//   ElementSize,
//   GridColDef,
//   GridRenderCellParams,
//   useGridApiRef
// } from '@mui/x-data-grid'

// ** Data Import
import {
  Button,
  Tab,
  Box,
  FormControl,
  TextField,
  Select as SelectMUI,
  MenuItem
} from '@mui/material'
import { TabContext, TabList } from '@mui/lab'
// import { useSelector } from 'react-redux'
// import { RootState } from 'src/store'
// import { useSettings } from 'src/@core/hooks/useSettings'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { PageOptionRequestType, maxLimitPagination } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
// import { useSetAtom } from 'jotai'
// import { bottomScrollElAtom, bottomWrapScrollWidthAtom } from 'src/views/pagination/container'
import { useAuth } from 'src/hooks/useAuth'
// import { CartDetailType } from 'src/types/apps/cartType'
import { useQuery, useQueryClient } from 'react-query'
// import awsConfig from 'src/configs/aws'
import styled from '@emotion/styled'
import TableCartCheckout from './components/TableCartCheckout'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { outletService } from 'src/services/outlet/outlet'
import {
  OrderFullDetailType,
  OrderStatusCount,
  OrderStatusTab,
  OrderStatusType,
  convertTrolleyDetailTypeToOrderType
} from 'src/types/apps/order'
import { orderService } from 'src/services/order'
import toast from 'react-hot-toast'
import Select from 'src/components/form/select/Select'
import { expeditionService } from 'src/services/vendor/expedition'
import { ExpeditionType } from 'src/types/apps/vendor/expedition'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import { rangeDateValue } from 'src/utils/apiUtils'
import { promise } from 'src/utils/promise'
import { useRouter } from 'next/router'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { useTranslation } from 'react-i18next'
import ScanOrder from './components/ScanOrder'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PickersRangeMonth from 'src/components/form/datepicker/PickersRangeMonth'
import { addDays } from 'date-fns'

// ** renders client column

const InputGroupComponent = styled('div')(() => {
  return {
    display: 'flex',
    alignItems: 'center',
    '& :first-of-type > div': {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0
    },
    '& :last-child > div': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      '& fieldset': {
        borderLeftColor: 'transparent'
      }
    }
  }
})

const optionsFilterSearch = [
  {
    value: 'order_number',
    label: 'Order ID'
  },
  {
    value: 'sku',
    label: 'MSKU'
  },
  {
    value: 'product_name',
    label: 'Product Name'
  },
  {
    value: 'customer_name',
    label: 'Customer'
  },
  {
    value: 'query',
    label: 'Other'
  }
]

// Default Filter Value
const defaultSearchType = 'order_number'
const defaultSearchValue = ''

const today = new Date()
const defaultStartDate = addDays(today, -30)
const defaultEndDate = today

const defaultPaymentMethod = 'all'
const defaultShippingMethod = 'all'

const OrderList = memo(() => {
  const { checkPermission } = useAuth()
  const router = useRouter()
  const { is_trolley, ...queryPagination } = router.query

  const [isTrolley, setIsTrolley] = useState<boolean>(
    (is_trolley as any) ? is_trolley == 'true' : false
  )

  console.log('isTrolley', isTrolley)

  const defaultPaginationOrder = {
    limit: 50,
    page: 1,
    order_status: 'UNPAID,WAITING VALIDATION',
    created_at: rangeDateValue(defaultStartDate, defaultEndDate)
  }

  const [paginationData, setPaginationData] = useState<PageOptionRequestType>({
    ...defaultPaginationOrder,
    ...queryPagination
  } as any)

  const [paginationDataTrolley, setPaginationDataTrolley] = useState<PageOptionRequestType>({
    ...defaultPaginationOrder,
    ...queryPagination
  } as any)

  useEffect(() => {
    router.replace({
      query: {
        is_trolley: isTrolley,
        ...(isTrolley ? paginationDataTrolley : paginationData)
      }
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationData, paginationDataTrolley, isTrolley])

  const { t } = useTranslation()
  // ** Hook
  const queryClient = useQueryClient()

  // state filter
  const searchTypeFromQuery = paginationData.order_number
    ? 'order_number'
    : paginationData.sku
    ? 'sku'
    : paginationData.product_name
    ? 'product_name'
    : paginationData.customer_name
    ? 'customer_name'
    : defaultSearchType
  const searchTypeValue = searchTypeFromQuery
    ? paginationData[searchTypeFromQuery]
    : defaultSearchValue
  const [searchType, setSearchType] = useState<string | number | undefined>(searchTypeFromQuery)
  const [searchValue, setSearchValue] = useState<string>(searchTypeValue as string)

  const dateFromQuery =
    paginationData.created_at != undefined
      ? (paginationData.created_at as string).split('~')
      : rangeDateValue(defaultStartDate, defaultEndDate).split('~')

  const defaultStartDateFromQuery = new Date(dateFromQuery[0])
  const defaultEndDateFromQuery = new Date(dateFromQuery[1])

  const [startDateRange, setStartDateRange] = useState<DateType | undefined>(
    defaultStartDateFromQuery
  )
  const [endDateRange, setEndDateRange] = useState<DateType | undefined>(defaultEndDateFromQuery)

  const [paymentMethod, setPaymentMethod] = useState<string | number | null>(defaultPaymentMethod)
  const [shippingMethod, setShippingMethod] = useState<string>(defaultShippingMethod)

  // tab
  const [statusCount, setStatusCount] = useState<OrderStatusCount | undefined>()

  const [outletFilterVal, setOutletFilterVal] = useState<number | null>(
    (paginationData.outlet_id as any) ?? null
  )
  const [outletData, setOutletData] = useState<OutletType[]>([])

  useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      setOutletData(data.data.data ?? [])
    },
    cacheTime: 0
  })

  const [tabValue, setTabValue] = useState<OrderStatusType>(
    isTrolley
      ? 'TROLLEY'
      : (paginationData.order_status as any) == 'UNPAID,WAITING VALIDATION'
      ? 'UNPAID'
      : (paginationData.order_status as any) == 'UNPAID,ON PROCESS,WAITING VALIDATION'
      ? 'RECAP'
      : (paginationData.order_status as any) ?? ''
  )

  // Service constans
  const [cartData, setCartData] = useState<OrderFullDetailType[]>([])
  const [cartMeta, setCartMeta] = useState<MetaType>()

  const [createdAt, setCreatedAt] = useState<string>(
    rangeDateValue(defaultStartDate, defaultEndDate)
  )

  useEffect(() => {
    setCartData([])
    setItemSelected([])
    queryClient.invalidateQueries('order-status-count')

    if (tabValue != 'TROLLEY') {
      setIsTrolley(false)
      delete paginationData.order_number
      delete paginationData.sku
      delete paginationData.product_name
      delete paginationData.customer_name
      delete paginationData.query

      setPaginationData(old => ({
        ...old,
        payment_method: paymentMethod === 'all' ? null : paymentMethod,
        shipping_type:
          shippingMethod === 'all'
            ? null
            : ['SELFPICKUP', 'COURIER MANUAL'].includes(shippingMethod)
            ? shippingMethod
            : 'COURIER RAJA ONGKIR',
        shipping_name: ['all', 'SELFPICKUP', 'COURIER MANUAL'].includes(shippingMethod)
          ? null
          : shippingMethod,
        outlet_id: outletFilterVal,
        order_status:
          tabValue == ''
            ? null
            : tabValue == 'RECAP'
            ? 'UNPAID,ON PROCESS,WAITING VALIDATION'
            : tabValue == 'UNPAID'
            ? 'UNPAID,WAITING VALIDATION'
            : tabValue,
        page: 1
      }))

      if (searchType && searchValue) {
        setPaginationData(old => ({
          ...old,
          [searchType]: searchValue == '' ? undefined : searchValue,
          page: 1
        }))
      }

      if (startDateRange && endDateRange) {
        setPaginationData(old => ({
          ...old,
          created_at: rangeDateValue(startDateRange, endDateRange),
          page: 1
        }))
      }

      refecthOrder()
    } else {
      setIsTrolley(true)
      delete paginationDataTrolley.id
      delete paginationDataTrolley.sku
      delete paginationDataTrolley.product_name
      delete paginationDataTrolley.customer_name
      delete paginationData.query

      setPaginationDataTrolley(old => ({
        ...old,
        payment_method: paymentMethod === 'all' ? null : paymentMethod,
        shipping_type:
          shippingMethod === 'all'
            ? null
            : ['SELFPICKUP', 'COURIER MANUAL'].includes(shippingMethod)
            ? shippingMethod
            : 'COURIER RAJA ONGKIR',
        shipping_name: ['all', 'SELFPICKUP', 'COURIER MANUAL'].includes(shippingMethod)
          ? null
          : shippingMethod,
        outlet_id: outletFilterVal,
        page: 1,
        order_status: undefined
      }))

      if (searchType && searchValue) {
        let _searchType: string = searchType as string
        if (searchType == 'order_number') _searchType = 'id'

        setPaginationDataTrolley(old => ({
          ...old,
          [_searchType]: searchValue == '' ? undefined : searchValue,
          page: 1
        }))
      }

      if (startDateRange && endDateRange) {
        setPaginationDataTrolley(old => ({
          ...old,
          created_at: rangeDateValue(startDateRange, endDateRange),
          page: 1
        }))
      }

      refecthTrolley()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchType,
    searchValue,
    startDateRange,
    endDateRange,
    paymentMethod,
    shippingMethod,
    outletFilterVal,
    tabValue
  ])

  useEffect(() => {
    if (startDateRange && endDateRange) setCreatedAt(rangeDateValue(startDateRange, endDateRange))
  }, [startDateRange, endDateRange])

  // Service
  const { isLoading, refetch: refecthOrder } = useQuery(['order-list', paginationData], {
    queryFn: () => orderService.getList(paginationData),
    onSuccess: data => {
      setCartData(data.data.data ?? [])
      setCartMeta(data.data.meta)
    },
    cacheTime: 0
  })

  const { isLoading: isLoadingTrolley, refetch: refecthTrolley } = useQuery(
    ['trolley-list', paginationDataTrolley],
    {
      queryFn: () => orderService.getListTrolleyDetail(paginationDataTrolley),
      onSuccess: data => {
        const _data = convertTrolleyDetailTypeToOrderType(data.data.data ?? [])
        setCartData(_data)
        setCartMeta(data.data.meta)
      },
      cacheTime: 0,
      enabled: tabValue == 'TROLLEY'
    }
  )

  useQuery(['order-status-count', createdAt], {
    queryFn: () =>
      orderService.getStatusCount({
        created_at: createdAt
      }),
    onSuccess: data => {
      setStatusCount(data.data.data)
    },
    cacheTime: 0
  })

  const [dataExpedition, setExpeditionData] = useState<ExpeditionType[]>([])
  useQuery(['expedition-list'], {
    queryFn: () =>
      expeditionService.getList({
        status: 'true',
        limit: 100,
        page: 1
      }),
    onSuccess: data => {
      setExpeditionData(data.data.data ?? [])
    }
  })

  // const store = useSelector((state: RootState) => state.layout)
  // const { hiddenNavbar } = store

  const [itemSelected, setItemSelected] = useState<OrderFullDetailType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = itemSelected.length > 0 && !checkedAll

  const handleChange = (checked: boolean, id: string, itemCheck?: OrderFullDetailType) => {
    if (id !== 'all') {
      if (itemCheck && checked) setItemSelected([...itemSelected, itemCheck])
      else if (itemCheck && !checked)
        setItemSelected(itemSelected.filter(item => itemCheck.order.id != item.order.id))

      // setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate) {
        setCheckedAll(checked)
        if (checked) setItemSelected(cartData)
        else if (!checked) setItemSelected([])
      } else {
        setCheckedAll(false)
        setItemSelected([])
      }
    }
  }

  const bulkAction = (order_status: 'CANCELED' | 'ON PROCESS' | 'COMPLETED') => {
    // wait all request
    Promise.all(
      itemSelected.map(item => {
        return orderService.updateStatus({
          id: item.order.id,
          order_status: order_status
        })
      })
    ).then(() => {
      setItemSelected([])
      setCheckedAll(false)

      queryClient.invalidateQueries('order-list')
      queryClient.invalidateQueries('order-status-count')

      toast.success(t('Data updated successfully.'))
    })
  }

  const [isOpenCancelBatchTrolley, setIsCancelBatchTrolley] = useState(false)

  const openCancelBatchTrolley = () => {
    setIsCancelBatchTrolley(true)
  }

  const closeCancelBatchTrolley = () => {
    setIsCancelBatchTrolley(false)
  }

  const handleCancelBatchTrolley = () => {
    // wait all request
    Promise.all(
      itemSelected.map(item => {
        return orderService.cancelBatchTrolley(item.order_items.map(item => item.id))
      })
    ).then(() => {
      setItemSelected([])
      setCheckedAll(false)

      queryClient.invalidateQueries('trolley-list')
      queryClient.invalidateQueries('order-status-count')

      toast.success(t('Data updated successfully.'))
    })

    closeCancelBatchTrolley()
  }

  const makeToRecap = () => {
    const ids = itemSelected.map(item => item.order.id)

    // check customer is same
    const customerIsSame = itemSelected.every(
      (val, i, arr) => val.order.customer_id === arr[0].order.customer_id
    )

    if (!customerIsSame) {
      toast.error(t('Customer must be same'))

      return
    }

    router.push({
      pathname: '/recap/add',
      query: {
        ids: ids.join(','),
        customer_id: itemSelected[0].order.customer_id
      }
    })
  }

  const resetFilter = () => {
    setSearchType(defaultSearchType)
    setSearchValue(defaultSearchValue)

    setStartDateRange(defaultStartDate)
    setEndDateRange(defaultEndDate)
    setPaymentMethod(defaultPaymentMethod)
    setShippingMethod(defaultShippingMethod)
    setOutletFilterVal(null)
  }

  return (
    <>
      <Card style={{ marginBottom: 70 }}>
        <Box p={2} pt={4} display={'flex'} gap={2}>
          <InputGroupComponent>
            <FormControl size='small'>
              <SelectMUI
                value={searchType}
                placeholder='Product Name'
                className='select-input-group'
                id='demo-simple-select-outlined'
                onChange={e => promise(() => setSearchType(e.target.value as string))}
              >
                {optionsFilterSearch.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {t(option.label)}
                  </MenuItem>
                ))}
              </SelectMUI>
            </FormControl>

            <TextField
              value={searchValue}
              onChange={e => {
                setSearchValue(e.target.value)
              }}
              variant='outlined'
              className='text-input-group'
              placeholder={t('Search') + '...'}
              size='small'
            />
          </InputGroupComponent>
          {outletData.length > 1 && (
            <Box width={200}>
              <SelectCustom
                fullWidth
                isFloating
                value={outletFilterVal}
                onSelect={outlet => {
                  setOutletFilterVal(outlet?.id ?? null)
                }}
                minWidthPaper={280}
                optionKey={'id'}
                labelKey={'name'}
                label='Outlet'
                options={outletData ?? []}
                {...(outletData.length == 1 && {
                  defaultValueId: outletData[0]
                })}
              />
            </Box>
          )}
          <PickersRangeMonth
            startDate={startDateRange}
            endDate={endDateRange}
            defaultStartDate={defaultStartDate}
            defaultEndDate={defaultEndDate}
            onChangeDateRange={(start, end) => {
              if (start && end) {
                setStartDateRange(start)
                setEndDateRange(end)
              }

              if (start == null && end == null) {
                setStartDateRange(defaultStartDate)
                setEndDateRange(defaultEndDate)
              }
            }}
          />
          <Select
            label={t('Filter Payment')}
            value={paymentMethod}
            onChange={e => {
              e.target.value
                ? setPaymentMethod(e.target.value as string | number)
                : setPaymentMethod(defaultPaymentMethod)
            }}
            sx={{
              minWidth: 100
            }}
            options={[
              {
                value: 'all',
                label: t('All Method')
              },
              {
                value: 'BANK TRANSFER',
                label: t('Bank Transfer')
              },
              {
                value: 'CASH',
                label: 'COD'
              }
            ]}
          />
          <Select
            label={t('Shipping Method')}
            value={shippingMethod}
            onChange={e => {
              e.target.value
                ? setShippingMethod(e.target.value as string)
                : setShippingMethod(defaultShippingMethod)
            }}
            sx={{
              minWidth: 100
            }}
            options={[
              {
                value: 'all',
                label: t('All Method')
              },
              {
                value: 'SELFPICKUP',
                label: t('Self Pickup')
              },
              {
                value: 'COURIER MANUAL',
                label: t('Courier Manual')
              },
              ...dataExpedition.map(item => ({
                value: item.name,
                label: item.name
              }))
            ]}
          />
          <Button variant='outlined' style={{ marginRight: '10px' }} onClick={resetFilter}>
            Reset
          </Button>
          <Box ml={'auto'} mr={2}>
            <Button
              LinkComponent={Link}
              href='/order/add'
              variant='contained'
              startIcon={<Icon icon={'tabler:plus'} />}
            >
              {t('Order')}
            </Button>
          </Box>
        </Box>
        <TabContext value={tabValue}>
          <TabList onChange={(e, value) => setTabValue(value)}>
            {OrderStatusTab.map((item, index) => {
              let label = (item == '' ? `${t('All Status')} ` : t(item))
                .replace('_', ' ')
                .toLowerCase()

              if (statusCount) {
                const count =
                  item == '' ? statusCount['TOTAL'] - statusCount['TROLLEY'] : statusCount[item]

                if (count != undefined) label = label.concat(` ${count}`)
              }

              return (
                <Tab
                  sx={{
                    textTransform: 'capitalize'
                  }}
                  key={index}
                  value={item}
                  label={label}
                />
              )
            })}
          </TabList>
        </TabContext>
        <Box p={2}>
          {tabValue === 'SCAN' ? (
            <ScanOrder />
          ) : (
            <>
              <TableCartCheckout
                isLoading={isLoading || isLoadingTrolley}
                data={cartData}
                itemSelected={itemSelected}
                handleChangeCheckbox={handleChange}
                checkedAll={checkedAll}
                tabValue={tabValue}
              />
            </>
          )}
        </Box>
      </Card>
      <PaginationCustom
        itemSelected={itemSelected}
        meta={cartMeta}
        onChangePagination={(page, limit) => setPaginationData(old => ({ ...old, page, limit }))}
        button={
          tabValue != 'TROLLEY' ? (
            <>
              <Button color='error' variant='contained' onClick={() => bulkAction('CANCELED')}>
                {t('Cancel Order')}
              </Button>
              {/* <Button color='info' variant='contained'>
                Pickup
              </Button> */}
              <Button color='warning' variant='contained' onClick={() => bulkAction('ON PROCESS')}>
                {t('Process Order')}
              </Button>
              <Button color='success' variant='contained' onClick={() => bulkAction('COMPLETED')}>
                {t('Complete Order')}
              </Button>

              {['RECAP', 'UNPAID', 'ON PROCESS', 'WAITING VALIDATION'].includes(tabValue) &&
                checkPermission('recap.create') && (
                  <Button color='primary' variant='contained' onClick={() => makeToRecap()}>
                    {t('RECAP')}
                  </Button>
                )}
            </>
          ) : (
            <>
              <Button color='error' variant='contained' onClick={openCancelBatchTrolley}>
                {t('Cancel Order')}
              </Button>
            </>
          )
        }
      />
      <DialogConfirmation
        open={isOpenCancelBatchTrolley}
        handleClose={closeCancelBatchTrolley}
        handleConfirm={handleCancelBatchTrolley}
        action='Cancel2'
        name='Trolley'
        loading={false}
      />
    </>
  )
})

export default OrderList
