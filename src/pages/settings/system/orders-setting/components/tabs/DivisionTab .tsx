import { Icon } from '@iconify/react'
import { Box, Checkbox, IconButton, Tooltip, Typography } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import { MetaType } from 'src/types/pagination/meta'
import {
  PageOptionRequestType,
  defaultPagination,
  maxLimitPagination
} from 'src/types/pagination/pagination'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import TableHeader from 'src/views/setting/components/TableHeader'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import FormDivisionDialog from '../dialog/FormDivisionDialog'
import { OutletType } from 'src/types/apps/outlet/outlet'
import FilterOutlet from 'src/components/filter/FilterOutlet'
import { DivisionDetailType } from 'src/types/apps/vendor/division'
import { divisionService } from 'src/services/vendor/division'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { MembershipType } from 'src/types/apps/membershipType'
import { membershipService } from 'src/services/membership'

const DivisionTab = () => {
  const { t } = useTranslation()
  const { checkPermission } = useAuth()
  const router = useRouter()

  const [membershipList, setMembershipList] = useState<MembershipType[]>([])

  const { isLoading: isLoadingMembership } = useQuery(['membership-list-active'], {
    queryFn: () => membershipService.getList(maxLimitPagination),
    onSuccess: data => {
      setMembershipList(data.data.data)
    }
  })

  // TABLE
  const queryClient = useQueryClient()

  const [selectedData, setSelectedData] = useState<DivisionDetailType | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [deleteData, setDeleteData] = useState(false)

  const [dataMeta, setDataMeta] = useState<MetaType>()
  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...defaultPagination,
    ...router.query
  } as any)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [datas, setDatas] = useState<DivisionDetailType[]>([])
  const [deleteBatch, setDeleteBatch] = useState(false)

  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')

  // Filter Outlet
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [outlets, setOutlets] = useState<OutletType[]>([])
  const [filterOutletVal, setFilterOutletVal] = useState<string>('')
  const outletSelectedArr = filterOutletVal
    ? filterOutletVal.split(',').map(item => parseInt(item))
    : []

  // ** Query
  useQuery(['division-list', pageOption], {
    queryFn: () => divisionService.getListDetail(pageOption),
    onSuccess: data => {
      setDatas(data.data.data ?? [])

      setDataMeta(data.data.meta)
    },
    enabled: isLoadingMembership === false
  })

  const { mutate, isLoading } = useMutation(divisionService.delete, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('division-list')
      setDeleteData(false)
      setSelectedData(null)
    }
  })

  // ** Handle
  const handleToggle = () => {
    setSelectedData(null)
    setOpenDialog(false)
  }

  const handleAdd = () => {
    setOpenDialog(true)
  }

  const handleEdit = (data: DivisionDetailType) => {
    setSelectedData(data)
    setOpenDialog(true)
  }

  const handleDelete = (data: DivisionDetailType) => {
    setSelectedData(data)
    setDeleteData(true)
  }

  const handleCloseDelete = () => {
    setDeleteData(false)
    setSelectedData(null)
  }

  const handleConfirmDelete = () => {
    if (selectedData !== null) {
      mutate(selectedData.division.id)
    }
  }

  const [itemSelected, setItemSelected] = useState<DivisionDetailType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  // const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
  //   adjustmentService.deleteBatch,
  //   {
  //     onSuccess: data => {
  //       toast.success(t((data as unknown as ResponseType).data.message))
  //       queryClient.invalidateQueries('division-list')
  //       setDeleteBatch(false)
  //       setItemSelected([])
  //       setCheckedAll(false)
  //     }
  //   }
  // )

  const handleConfirmDeleteBatch = () => {
    if (itemSelected.length > 0) {
      // mutateDeleteBatch(itemSelected.map(item => item.id) as number[])
    }
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number | 'all',
    data?: DivisionDetailType
  ) => {
    if (id !== 'all') {
      if (data && event.target.checked) setItemSelected([...itemSelected, data])
      else if (data && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.division.id != data.division.id))

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

  const columns: GridColDef<DivisionDetailType>[] = [
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
            onChange={e => handleChange(e, index.row.division.id, index.row)}
            key={index.row.division.id}
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
          (index.api.getRowIndexRelativeToVisibleRows(index.row.division.id) ?? 1) +
          1 +
          (pageOption?.limit ?? 50) * ((pageOption?.page ?? 1) - 1)
        )
      }
    },
    {
      flex: 1,
      field: 'name',
      headerName: t('Division Name') ?? 'Division Name',
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
          {params.row.division.name}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'selling_price',
      headerName: t('Membership') ?? 'Membership',
      renderCell: params => {
        const membership = membershipList.find(
          item => item.level === params.row.division.selling_price
        )

        return <Typography variant='body2'>{membership?.name ?? ''}</Typography>
      }
    },
    {
      flex: 1,
      field: 'outlet',
      headerName: t('Outlet') ?? 'Outlet',
      renderCell: params => (
        <Typography variant='body2'>
          {(params.row.outlets ?? []).map(outlet => outlet.name).join(', ')}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'unique_order_number',
      headerName: t('Unique Order Number') ?? 'Unique Order Number',
      renderCell: params => (
        <Typography
          variant='body2'
          color={params.row.division.unique_order_number ? '#0da10d' : 'error'}
          fontWeight={'bold'}
        >
          {params.row.division.unique_order_number ? t('Yes') : t('No')}
        </Typography>
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
            {checkPermission('setting - shipping.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {checkPermission('setting - shipping.delete') && (
              <Tooltip title={t('Delete')} placement='top'>
                <IconButton size='small' onClick={() => handleDelete(params.row)}>
                  <Icon icon='tabler:trash' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
          </>
        )
      }
    }
  ]

  useEffect(() => {
    setPageOption(old => ({ ...old, outlet_ids: filterOutletVal }))
  }, [filterOutletVal])

  return (
    <Box>
      <TableHeader
        title={t('Division')}
        {...(checkPermission('setting - shipping.create') && {
          onAdd: handleAdd
        })}
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
          setPageOption({ ...pageOption, query: value })
        }}
        filterComponent={[
          <FilterOutlet
            key={0}
            value={outletSelectedArr}
            // setOutlets={setOutlets}
            onChange={value => {
              setFilterOutletVal(value?.join(',') ?? '')
            }}
          />
        ]}
      />
      <DataGridCustom
        getRowId={row => row.division.id}
        autoHeight
        rows={checkPermission('setting - shipping.read') ? datas : []}
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
        {...(checkPermission('setting - shipping.delete') && {
          onDeleteButton: () => setDeleteBatch(true)
        })}
      />
      <FormDivisionDialog open={openDialog} toggle={handleToggle} selectData={selectedData} />
      <DialogConfirmation
        open={deleteData}
        handleClose={handleCloseDelete}
        handleConfirm={handleConfirmDelete}
        loading={isLoading}
        name='Division'
      />
      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmDeleteBatch}
        // loading={isLoadingDeleteBatch}
        loading={false}
        name='Division'
      />
    </Box>
  )
}

export default DivisionTab
