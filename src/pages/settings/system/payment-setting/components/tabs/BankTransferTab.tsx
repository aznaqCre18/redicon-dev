import { Icon } from '@iconify/react'
import {
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  ListItem,
  Switch,
  Typography
} from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import { ChangeEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useAuth } from 'src/hooks/useAuth'
import MuiSwitch from 'src/pages/settings/components/Switch'
import { MetaType } from 'src/types/pagination/meta'
import {
  PageOptionRequestType,
  defaultPagination,
  maxLimitPagination
} from 'src/types/pagination/pagination'
import { ResponseType } from 'src/types/response/response'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import TableHeader from 'src/views/setting/components/TableHeader'
import FormBankDialog from '../dialog/FormBankDialog'
import { BankVendorType } from 'src/types/apps/vendor/BankVendorType'
import { bankVendorService } from 'src/services/vendor/bank-vendor'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { outletService } from 'src/services/outlet/outlet'
import { OutletType } from 'src/types/apps/outlet/outlet'

const BankTransferTab = () => {
  const { t } = useTranslation()
  const { checkPermission } = useAuth()
  const router = useRouter()
  const [bankTransferManually, setBankTransferManually] = useState<boolean>(false)

  // TABLE BANK
  const queryClient = useQueryClient()

  const [selectedData, setSelectedData] = useState<BankVendorType | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [deleteData, setDeleteData] = useState(false)

  const [dataMeta, setDataMeta] = useState<MetaType>()
  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...defaultPagination,
    order: 'created_at',
    ...router.query
  } as any)
  const [datas, setDatas] = useState<BankVendorType[]>([])
  const [deleteBatch, setDeleteBatch] = useState(false)

  useEffect(() => {
    router.replace({
      query: pageOption,
      hash: 'bank-transfer'
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageOption])

  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')

  // ** Query
  useQuery(['bank-vendor-list', pageOption], {
    queryFn: () => bankVendorService.getList(pageOption),
    onSuccess: data => {
      setDatas(data.data.data ?? [])

      setDataMeta(data.data.meta)
    }
  })

  const { mutate, isLoading } = useMutation(bankVendorService.delete, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('bank-vendor-list')
      setDeleteData(false)
      setSelectedData(null)
    }
  })

  const [outletFilterVal, setOutletFilterVal] = useState<number | null>(
    (pageOption.outlet_id as any) ?? null
  )
  const [outletData, setOutletData] = useState<OutletType[]>([])

  useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      setOutletData(data.data.data ?? [])
    }
  })

  useEffect(() => {
    if ((outletFilterVal && outletFilterVal != (pageOption.outlet_id as any)) ?? null)
      setPageOption(old => ({ ...old, outlet_id: outletFilterVal }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outletFilterVal])

  // ** Handle
  const handleToggle = () => {
    setSelectedData(null)
    setOpenDialog(false)
  }

  const handleEdit = (data: BankVendorType) => {
    setSelectedData(data)
    setOpenDialog(true)
  }

  const handleDelete = (data: BankVendorType) => {
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

  const { mutate: setStatus } = useMutation(bankVendorService.setStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('bank-vendor-list')
    }
  })

  const setStatusData = (id: number, status: boolean) => {
    setStatus({ id: id, status })
  }

  const [itemSelected, setItemSelected] = useState<BankVendorType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    bankVendorService.deleteBatch,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        queryClient.invalidateQueries('bank-vendor-list')
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
    data?: BankVendorType
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

  const columns: GridColDef<BankVendorType>[] = [
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
              alt={params.row.bank_name}
              style={{ objectFit: 'cover', width: 50 }}
              src={getImageAwsUrl(params.row.bank_image)}
            />
          </Box>
        )
      }
    },
    {
      flex: 1,
      field: 'bank_name',
      headerName: t('Bank Name') ?? 'Bank Name',
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
          {params.row.bank_name}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'account_name',
      headerName: t('Account Name') ?? 'Account Name'
    },
    {
      flex: 1,
      field: 'account_number',
      headerName: t('Account Number') ?? 'Account Number'
    },
    {
      flex: 1,
      field: 'outlet_id',
      headerName: t('Outlet') ?? 'Outlet',
      renderCell: params => outletData.find(outlet => outlet.id == params.row.outlet_id)?.name
    },
    {
      field: 'is_active',
      headerName: t('Status') ?? 'Status',
      flex: 1,
      renderCell: ({ row }) => (
        <FormControlLabel
          control={
            <Switch
              checked={row.is_active == 'Active'}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (checkPermission('setting - payment.update'))
                  setStatusData(row.id, event.target.checked)
              }}
            />
          }
          label={row.is_active ? 'Active' : 'Inactive'}
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
      <Box pl={4} pt={4}>
        <Grid container columnSpacing={2}>
          <Grid item xs={12} md={6}>
            <ListItem
              sx={{
                padding: 0
              }}
            >
              <InputLabel>{t('Bank Transfer Manually')}: </InputLabel>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: 2
                }}
              >
                <MuiSwitch
                  checked={bankTransferManually}
                  onChange={e => {
                    setBankTransferManually(e.target.checked)
                  }}
                />
              </Box>
            </ListItem>
          </Grid>
        </Grid>
      </Box>
      <Divider />
      <TableHeader
        title={t('Bank Transfer')}
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

            {outletData.length > 1 && (
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
                  options={outletData ?? []}
                  {...(outletData.length == 1 && {
                    defaultValueId: outletData[0]
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
      <FormBankDialog open={openDialog} toggle={handleToggle} selectBankVendor={selectedData} />
      <DialogConfirmation
        open={deleteData}
        handleClose={handleCloseDeleteCategory}
        handleConfirm={handleConfirmDeleteCategory}
        loading={isLoading}
        name='Bank Transfer'
      />
      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmDeleteBatch}
        loading={isLoadingDeleteBatch}
        name='Bank Transfer'
      />
    </>
  )
}

export default BankTransferTab
