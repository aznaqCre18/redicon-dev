import { Icon } from '@iconify/react'
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  Switch,
  Typography
} from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import { ChangeEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useAuth } from 'src/hooks/useAuth'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { ResponseType } from 'src/types/response/response'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import TableHeader from 'src/views/setting/components/TableHeader'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { PaymentMethodNonCashType } from 'src/types/apps/vendor/PaymentMethodNonCash'
import { paymentMethodNonCashService } from 'src/services/vendor/paymentMethodNonCash'
import { formatPriceIDR } from 'src/utils/numberUtils'
import FormNonCashDialog from '../dialog/FormNonCashDialog'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { outletService } from 'src/services/outlet/outlet'
import SelectCustom from 'src/components/form/select/SelectCustom'

const NonCashTab = () => {
  const { t } = useTranslation()
  const { checkPermission } = useAuth()
  const router = useRouter()

  // REQUIRED
  const [outletList, setOutletList] = useState<OutletType[]>()
  useQuery(['outlet-list'], {
    queryFn: () => outletService.getListOutlet(defaultPagination),
    onSuccess: data => {
      setOutletList(data.data.data ?? [])
    }
  })

  // TABLE BANK
  const queryClient = useQueryClient()

  const [selectedData, setSelectedData] = useState<PaymentMethodNonCashType | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [deleteData, setDeleteData] = useState(false)

  const [dataMeta, setDataMeta] = useState<MetaType>()
  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...defaultPagination,
    order: 'created_at',
    ...router.query
  } as any)
  const [datas, setDatas] = useState<PaymentMethodNonCashType[]>([])
  const [deleteBatch, setDeleteBatch] = useState(false)

  useEffect(() => {
    router.replace({
      query: pageOption,
      hash: 'non-cash'
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageOption])

  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')

  const [outletFilterVal, setOutletFilterVal] = useState<number | null>(
    (pageOption.outlet_id as any) ?? null
  )

  useEffect(() => {
    if ((outletFilterVal && outletFilterVal != (pageOption.outlet_id as any)) ?? null)
      setPageOption(old => ({ ...old, outlet_id: outletFilterVal }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outletFilterVal])

  // ** Query
  useQuery(['payment-method-non-cash-list', pageOption], {
    queryFn: () => paymentMethodNonCashService.getList(pageOption),
    onSuccess: data => {
      setDatas(
        (data.data.data ?? []).map(item => {
          const outlet = outletList?.find(outlet => outlet.id == item.outlet_id)

          return {
            ...item,
            outlet_name: outlet?.name
          }
        })
      )

      setDataMeta(data.data.meta)
    },
    enabled: outletList !== undefined
  })

  const { mutate, isLoading } = useMutation(paymentMethodNonCashService.delete, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('payment-method-non-cash-list')
      setDeleteData(false)
      setSelectedData(null)
    }
  })

  // ** Handle
  const handleToggle = () => {
    setSelectedData(null)
    setOpenDialog(false)
  }

  const handleEdit = (data: PaymentMethodNonCashType) => {
    setSelectedData(data)
    setOpenDialog(true)
  }

  const handleDelete = (data: PaymentMethodNonCashType) => {
    setSelectedData(data)
    setDeleteData(true)
  }

  const handleCloseDeleteCategory = () => {
    setDeleteData(false)
    setSelectedData(null)
  }

  const handleConfirmDeleteCategory = () => {
    if (selectedData !== null) {
      mutate(selectedData.id)
    }
  }

  const { mutate: setStatus } = useMutation(paymentMethodNonCashService.setStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('payment-method-non-cash-list')
    }
  })

  const setStatusData = (id: number, status: boolean) => {
    setStatus({ id: id, status })
  }

  const [itemSelected, setItemSelected] = useState<PaymentMethodNonCashType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    paymentMethodNonCashService.deleteBatch,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        queryClient.invalidateQueries('payment-method-non-cash-list')
        setDeleteBatch(false)
        setItemSelected([])
        setCheckedAll(false)
      }
    }
  )

  const handleConfirmDeleteBatch = () => {
    if (itemSelected.length > 0) {
      mutateDeleteBatch(itemSelected.map(item => item.id) as number[])
    }
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number | 'all',
    data?: PaymentMethodNonCashType
  ) => {
    if (id !== 'all') {
      if (data && event.target.checked) setItemSelected([...itemSelected, data])
      else if (data && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != data.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(datas)
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const columns: GridColDef<PaymentMethodNonCashType>[] = [
    {
      cellClassName: 'padding-left-01rem',
      headerClassName: 'padding-left-01rem',
      width: 42,
      headerName: 'Checkbox',
      field: 'checkbox',
      renderCell: index => {
        return (
          <Checkbox
            checked={itemSelected.includes(index.row) || false}
            onChange={e => handleChange(e, index.row.id, index.row)}
            key={index.row.id}
          />
        )
      },
      sortable: false,
      renderHeader: () => (
        <Checkbox
          indeterminate={isCheckboxIndeterminate()}
          checked={checkedAll}
          onChange={e => handleChange(e, 'all')}
        />
      )
    },
    {
      width: 22,
      field: 'no',
      headerName: t('No') ?? 'No',
      renderCell: index => {
        return (
          (index.api.getRowIndexRelativeToVisibleRows(index.row.id) ?? 1) +
          1 +
          (pageOption?.limit ?? 50) * ((pageOption?.page ?? 1) - 1)
        )
      }
    },
    {
      field: 'image',
      sortable: false,
      headerName: 'Logo',
      renderCell: params => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              alt={params.row.payment_name}
              style={{ objectFit: 'cover', width: 50 }}
              src={getImageAwsUrl(params.row.payment_image)}
            />
          </Box>
        )
      }
    },
    {
      flex: 1,
      field: 'payment_name',
      headerName: t('Name') ?? 'Name',
      renderCell: params => (
        <Typography
          className='hover-underline'
          variant='body2'
          onClick={() => handleEdit(params.row)}
          sx={{
            fontWeight: 600,
            color: 'primary.main'
          }}
        >
          {params.row.payment_name}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'account_name',
      headerName: t('Account Name') ?? 'Account Name',
      renderCell: params => <Typography variant='body2'>{params.row.account_name}</Typography>
    },
    {
      flex: 1,
      field: 'payment_type',
      headerName: t('Type') ?? 'Type'
    },
    {
      flex: 1,
      field: 'mdr_value',
      headerName: t('MDR Fee') ?? 'MDR Fee',
      renderCell: params => (
        <Typography variant='body2' color='text.secondary'>
          {params.row.mdr_value > 0
            ? params.row.mdr_type == 1
              ? params.row.mdr_value + '%'
              : formatPriceIDR(params.row.mdr_value)
            : '-'}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'outlet_id',
      headerName: t('Outlet') ?? 'Outlet',
      renderCell: params => (
        <Typography variant='body2' color='text.secondary'>
          {params.row.outlet_name}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: t('Status') ?? 'Status',
      flex: 1,
      renderCell: params => (
        <FormControlLabel
          control={
            <Switch
              checked={params.row.status}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (checkPermission('setting - payment.update'))
                  setStatusData(params.row.id, event.target.checked)
              }}
            />
          }
          label={params.row.status ? t('Active') : t('Inactive')}
        />
      )
    },
    {
      cellClassName: 'column-action',
      width: 100,
      sortable: false,
      field: 'action',
      headerName: t('Action') ?? 'Action',
      renderCell: params => {
        return (
          <>
            {checkPermission('setting - payment.update') && (
              <IconButton size='small' onClick={() => handleEdit(params.row)}>
                <Icon icon='tabler:edit' fontSize='0.875rem' />
              </IconButton>
            )}
            {checkPermission('setting - payment.delete') && (
              <IconButton size='small' onClick={() => handleDelete(params.row)}>
                <Icon icon='tabler:trash' fontSize='0.875rem' />
              </IconButton>
            )}
          </>
        )
      }
    }
  ]

  return (
    <>
      <TableHeader
        title={t('Non Cash')}
        {...(checkPermission('setting - payment.create') && {
          onAdd: () => setOpenDialog(true)
        })}
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
          setPageOption({ ...pageOption, query: value })
        }}
        filterComponent={[
          <>
            {''}

            {outletList && outletList.length > 1 && (
              <FormControl size='small' sx={{ width: '150px' }}>
                <SelectCustom
                  isFloating
                  value={outletFilterVal}
                  onSelect={outlet => {
                    setOutletFilterVal(outlet?.id ?? null)
                  }}
                  minWidthPaper={280}
                  optionKey={'id'}
                  labelKey={'name'}
                  label='Outlet'
                  options={outletList ?? []}
                  {...(outletList.length == 1 && {
                    defaultValueId: outletList[0]
                  })}
                />
              </FormControl>
            )}
          </>
        ]}
      />
      <DataGridCustom
        getRowId={row => row.id}
        autoHeight
        rows={checkPermission('setting - payment.read') ? datas : []}
        columns={columns}
        disableColumnMenu
        disableRowSelectionOnClick
        hideFooter
        setPaginationData={setPageOption}
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={dataMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('setting - payment.delete') && {
          onDeleteButton: () => setDeleteBatch(true)
        })}
      />
      <FormNonCashDialog open={openDialog} toggle={handleToggle} selectNonCash={selectedData} />
      <DialogConfirmation
        open={deleteData}
        handleClose={handleCloseDeleteCategory}
        handleConfirm={handleConfirmDeleteCategory}
        loading={isLoading}
        name='Non Cash'
      />
      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmDeleteBatch}
        loading={isLoadingDeleteBatch}
        name='Non Cash'
      />
    </>
  )
}

export default NonCashTab
