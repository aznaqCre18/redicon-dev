import {
  Button,
  TextField,
  InputAdornment,
  Grid,
  Box,
  Card,
  Divider,
  Typography
} from '@mui/material'
// import ImagePreview from 'src/components/image/ImagePreview'

// ** React Imports
import { useState, useEffect, useRef } from 'react'

// ** MUI Imports
import { ElementSize, GridColDef, useGridApiRef } from '@mui/x-data-grid'
// ** Custom Table Components Imports
import {
  PageOptionRequestType,
  defaultPaginationDesc,
  maxLimitPagination
} from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { useSetAtom } from 'jotai'
import { bottomScrollElAtom, bottomWrapScrollWidthAtom } from 'src/views/pagination/container'
import { Icon } from '@iconify/react'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { formatDate } from 'src/utils/dateUtils'
import { useTranslation } from 'react-i18next'
import PickersRangeMonth from 'src/components/form/datepicker/PickersRangeMonth'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import { rangeDateValue } from 'src/utils/apiUtils'
import { formatPriceIDR } from 'src/utils/numberUtils'
import SelectCustom from 'src/components/form/select/SelectCustom'
import Link from 'next/link'
import CardSummary from '../reports/components/CardSummary'
import { DigitalBalanceDetailType } from 'src/types/apps/vendor/digital-balance'
import { useQuery } from 'react-query'
import { digitalBalanceService } from 'src/services/vendor/digital-balance'
import { DigitalBalanceHistoryDetailType } from 'src/types/apps/vendor/digital-balance/history'
import { digitalBalanceHistoryService } from 'src/services/vendor/digital-balance/history'

const today = new Date()
const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1)
const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)

const BalanceHistoryList = () => {
  const { t } = useTranslation()
  // get params msku

  const [paginationData, setPaginationData] = useState<PageOptionRequestType>({
    ...defaultPaginationDesc
  } as any)

  // ** State
  const [outletBalances, setOutletBalances] = useState<DigitalBalanceDetailType[]>([])

  useQuery(['outlet-balances'], {
    queryFn: () => digitalBalanceService.getList(maxLimitPagination),
    onSuccess: data => {
      setOutletBalances(data?.data?.data ?? [])
    }
  })

  // select product
  // const [selectProduct, setSelectProduct] = useState<VariantResponseType | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [datas, setDatas] = useState<DigitalBalanceHistoryDetailType[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dataMeta, setDataMeta] = useState<MetaType>()

  // filters
  const [searchFilterVal, setSearchFilterVal] = useState('')
  const [typeFilterVal, setTypeFilterVal] = useState('all')
  const [groupFilterVal, setGroupFilterVal] = useState('all')
  const [statusFilterVal, setStatusFilterVal] = useState('all')

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

  useEffect(() => {
    setPaginationData(old => ({
      ...old,
      created_at: rangeDateValue(startDateRange ?? defaultStartDate, endDateRange ?? defaultEndDate)
    }))
  }, [startDateRange, endDateRange])

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      page: 1
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setIsLoading(true)

    delete paginationData.query
    delete paginationData.type
    delete paginationData.group
    delete paginationData.status

    setPaginationData({
      ...paginationData,
      query: searchFilterVal,
      type: typeFilterVal === 'all' ? undefined : typeFilterVal,
      group: groupFilterVal === 'all' ? undefined : groupFilterVal,
      status: statusFilterVal === 'all' ? undefined : statusFilterVal,
      page: 1
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilterVal, typeFilterVal, groupFilterVal, statusFilterVal])

  useQuery(['digital-balance-history-list', paginationData], {
    queryFn: () => digitalBalanceHistoryService.getList(paginationData),
    onSuccess: data => {
      setIsLoading(false)
      if (data) {
        setDatas((data?.data?.data ?? []).map((item, index) => ({ ...item, index })))
        setDataMeta(data.data.meta)
      }
    },
    onError: () => {
      setIsLoading(false)
    }
  })

  const resetFilter = () => {
    setStartDateRange(defaultStartDate)
    setEndDateRange(defaultEndDate)
  }

  const columns: GridColDef<DigitalBalanceHistoryDetailType>[] = [
    {
      width: 22,
      field: 'no',
      headerName: t('No') ?? 'No',
      renderCell: index => {
        // get shortable
        const isIdShortableDesc =
          (paginationData.order == 'id' && paginationData.sort == 'asc') || false

        return (
          (isIdShortableDesc ? dataMeta!.total_count + 1 : 0) +
          (isIdShortableDesc ? -1 : 1) *
            ((index.api.getRowIndexRelativeToVisibleRows(index.row.index) ?? 1) +
              1 +
              (paginationData?.limit ?? 50) * ((dataMeta?.page ?? 1) - 1))
        )
      }
    },
    {
      flex: 5,
      field: 'date',
      headerName: t('Date') ?? 'Date',
      renderCell: params => formatDate(params.row.digital_balance_history.created_at)
    },
    {
      flex: 5,
      field: 'description',
      headerName: t('Description') ?? 'Description',
      renderCell: params => params.row.digital_balance_history.description
    },
    {
      flex: 5,
      field: 'no_transaction',
      headerName: t('No. Transaction') ?? 'No. Transaction',
      renderCell: params => params.row.digital_balance_history.transaction_id
    },
    {
      flex: 5,
      field: 'transaction_group',
      headerName: t('Transaction Group') ?? 'Transaction Group',
      renderCell: params =>
        params.row.digital_balance_history.type_cash_flow == 'IN' ? 'Dana Masuk' : 'Dana Keluar'
    },
    {
      flex: 5,
      field: 'amount',
      headerName: t('Amount') ?? 'Amount',
      renderCell: params => (
        <Box
          sx={{
            color:
              params.row.digital_balance_history.type_cash_flow == 'IN'
                ? 'success.main'
                : 'error.main'
          }}
        >
          {formatPriceIDR(params.row.digital_balance_history.amount)}
        </Box>
      )
    },
    {
      flex: 5,
      field: 'status',
      headerName: t('Status') ?? 'Status',
      renderCell: params =>
        params.row.digital_balance_history.is_settlement ? 'Settlement' : 'Pending'
    },
    {
      flex: 4,
      field: 'action',
      headerName: t('Action') ?? 'Action',
      renderCell: params => (
        <Typography
          className='hover-underline'
          sx={{
            fontWeight: 600,
            color: 'primary.main'
          }}
          component={Link}
          href={`/order/detail/${params.row.digital_balance_history.order_id}`}
          target='_blank'
        >
          Detail
        </Typography>
      )
    }
  ]

  // Horizontal Scrollbar Table in Pagination
  const setBottomScrollEl = useSetAtom(bottomScrollElAtom)
  const setBottomWrapScrollWidth = useSetAtom(bottomWrapScrollWidthAtom)

  const gridRef = useGridApiRef()
  const dataGridRef = useRef<HTMLDivElement | null>(null)
  const onResize = (containerSize: ElementSize) => {
    setBottomWrapScrollWidth(containerSize.width)
    if (dataGridRef.current) {
      const el = dataGridRef.current.getElementsByClassName('MuiDataGrid-columnHeadersInner')
      if (el.length > 0) setBottomScrollEl(el[0])
    }
  }

  return (
    <Grid
      container
      spacing={6.5}
      sx={{
        mb: '50px'
      }}
    >
      <Grid item xs={12}>
        <Card>
          <Box display={'flex'} mx={4} mt={2}>
            <Box
              sx={{
                p: 4,
                borderColor: 'divider',
                alignItems: 'center'
              }}
            >
              <Typography>Total {t('Balance')}</Typography>

              <Box display={'flex'} alignItems={'center'} gap={7}>
                <Box
                  sx={{
                    fontWeight: 600,
                    fontSize: 24
                  }}
                >
                  {formatPriceIDR(
                    outletBalances.reduce((a, b) => a + b.digital_balance.Balance, 0)
                  )}
                </Box>
                <Button
                  LinkComponent={Link}
                  href='/funds/withdraw'
                  variant='contained'
                  color='primary'
                  disabled={outletBalances.reduce((a, b) => a + b.digital_balance.Balance, 0) == 0}
                >
                  Tarik Dana
                </Button>
              </Box>
            </Box>
          </Box>
          {outletBalances.length > 0 && (
            <Grid container sx={{ p: 4, gap: 4 }}>
              {outletBalances.map((balance, index) => (
                <Grid item xs={2} key={index}>
                  <CardSummary
                    title={balance.outlet.name}
                    value={formatPriceIDR(balance.digital_balance.Balance)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
          <Divider />
          <Box
            sx={{
              py: 4,
              px: 4,
              gap: 2,
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Box sx={{ gap: 1, display: 'flex', alignItems: 'center' }}>
              <TextField
                value={searchFilterVal}
                type='search'
                variant='outlined'
                className='text-input-group'
                placeholder={(t('Search') ?? 'Search') + ' ' + t('Transaction') + '...'}
                size='small'
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position='end'
                      sx={{
                        cursor: 'pointer'
                      }}
                    >
                      <Icon fontSize='1.125rem' icon='tabler:search' />
                    </InputAdornment>
                  )
                }}
                onChange={e => {
                  const value = e.target.value as string

                  setSearchFilterVal(value)
                }}
              />
              <Box width={150}>
                <SelectCustom
                  isFloating
                  label={t('Transaction Type') ?? 'Transaction Type'}
                  options={[
                    { value: 'all', name: t('All') },
                    { value: 'Pendapatan', name: 'Pendapatan' },
                    { value: 'Penjualan', name: 'Penjualan' },
                    { value: 'Penarikan', name: 'Penarikan' },
                    { value: 'Top Up', name: 'Top Up' }
                  ]}
                  optionKey={'value'}
                  labelKey={'name'}
                  value={typeFilterVal}
                  onSelect={data => {
                    setTypeFilterVal(data?.value ?? 'all')
                  }}
                />
              </Box>
              <Box width={150}>
                <SelectCustom
                  isFloating
                  label={t('Transaction Group') ?? 'Transaction Group'}
                  options={[
                    { value: 'all', name: t('All') },
                    { value: 'Dana Masuk', name: 'Dana Masuk' },
                    { value: 'Dana Keluar', name: 'Dana Keluar' }
                  ]}
                  optionKey={'value'}
                  labelKey={'name'}
                  value={groupFilterVal}
                  onSelect={data => {
                    setGroupFilterVal(data?.value ?? 'all')
                  }}
                />
              </Box>
              <Box width={150}>
                <SelectCustom
                  isFloating
                  label={t('Status') ?? 'Status'}
                  options={[
                    { value: 'all', name: t('All') },
                    { value: 'Berhasil', name: 'Berhasil' },
                    { value: 'Gagal', name: 'Gagal' }
                  ]}
                  optionKey={'value'}
                  labelKey={'name'}
                  value={statusFilterVal}
                  onSelect={data => {
                    setStatusFilterVal(data?.value ?? 'all')
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
              <PickersRangeMonth
                label='Date'
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
              <Button color='primary' variant='outlined' onClick={resetFilter}>
                Reset
              </Button>
            </Box>
          </Box>
          {/* <Divider sx={{ m: '0 !important' }} /> */}
          {/* <Box
            sx={{
              py: 4,
              px: 4,
              rowGap: 2,
              columnGap: 4,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box />
            <Box sx={{ rowGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button color='primary' variant='contained' startIcon={<Icon icon='tabler:upload' />}>
                Import/Export
              </Button>
            </Box>
          </Box> */}
          <DataGridCustom
            autoHeight
            sx={{
              '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
                display: 'none'
              },
              '& .MuiDataGrid-cell': {
                alignItems: 'start',
                paddingY: 2
              }
            }}
            getRowHeight={() => 'auto'}
            getRowId={row => row.index}
            ref={dataGridRef}
            apiRef={gridRef}
            onResize={onResize}
            // loading={isLoading}
            rows={datas ?? []}
            // rows={manipulateRows(productData)}
            columns={columns}
            disableColumnMenu
            hideFooter
            setPaginationData={setPaginationData}
          />
        </Card>
        <PaginationCustom
          itemSelected={[]}
          meta={dataMeta}
          onChangePagination={(page, limit) => setPaginationData(old => ({ ...old, page, limit }))}
        />
      </Grid>
    </Grid>
  )
}

export default BalanceHistoryList
