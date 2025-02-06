import React, { useEffect, useState } from 'react'
import { Box } from '@mui/system'
import { GridColDef } from '@mui/x-data-grid'
import { Typography, IconButton, Checkbox, Button, Tooltip } from '@mui/material'
import Icon from 'src/@core/components/icon'
// import FormOutlet from './FormOutletDialog'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import {
  PageOptionRequestType,
  defaultPagination,
  maxLimitPagination
} from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import TableHeader from 'src/views/setting/components/TableHeader'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { tableService } from 'src/services/outlet/table'
import { TableDetailType, TableType, createTableDetail } from 'src/types/apps/outlet/table'
import FormTableDialog from './FormTableDialog'
import Select, { SelectOption } from 'src/components/form/select/Select'
import { outletService } from 'src/services/outlet/outlet'
import { tableGroupService } from 'src/services/outlet/tableGroup'
import TableGroupDialog from './TableGroupDialog'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import DialogPrintQrCodeTable from './DialogPrintQrCodeTable'
import { useDisclosure } from 'src/hooks/useDisclosure'

const TableComponent = () => {
  const { checkPermission } = useAuth()

  const { t } = useTranslation()
  const router = useRouter()

  // dialog
  const {
    isOpen: isOpenDialogQrCode,
    onOpen: onOpenDialogQrCode,
    onClose: onCloseDialogQrCode
  } = useDisclosure()

  // ** States
  const [openTableGroup, setOpenTableGroup] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const [formAddOpen, setFormAddOpen] = useState(false)
  const [formDeleteOpen, setFormDeleteOpen] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [selectedData, setSelectedData] = useState<TableType | null>(null)

  const [data, setData] = useState<TableDetailType[]>([])
  const [unitMeta, setUnitMeta] = useState<MetaType>()
  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...defaultPagination,
    ...router.query,
    order: 'name',
    sort: 'asc'
  } as any)

  useEffect(() => {
    router.replace({
      query: pageOption,
      hash: 'Table_Management'
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageOption])

  const [deleteBatch, setDeleteBatch] = useState(false)

  // ** Filters
  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')

  const [outletFilter, setOutletFilter] = useState<string | undefined>(
    pageOption.outlet_id as string
  )

  useEffect(() => {
    setPageOption(old =>
      old.outlet_id == outletFilter ? old : { ...pageOption, outlet_id: outletFilter }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outletFilter])
  const [outletData, setOutletData] = useState<SelectOption[]>([])

  const [groupFilter, setGroupFilter] = useState<string | undefined>(
    (pageOption.group_id as string) ?? 'all'
  )

  const [groupData, setGroupData] = useState<SelectOption[]>([])
  //         group_id: groupFilter == 'all' ? undefined : groupFilter,

  useEffect(() => {
    const group_id = groupFilter == 'all' ? '' : groupFilter
    setPageOption(old => (old.group_id == group_id ? old : { ...pageOption, group_id: group_id }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupFilter])

  const {
    isLoading,
    refetch,
    data: dataTable
  } = useQuery(['table-list', pageOption], {
    queryFn: () =>
      tableService.getList({
        ...pageOption
        // sort: 'asc'
        // order: 'group_id'
      }),
    onSuccess: data => {
      setUnitMeta(data.data.meta)
    },
    enabled:
      checkPermission('table management.read') &&
      outletFilter != undefined &&
      groupFilter != undefined
  })

  const getOutlet = useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      const datas = data.data.data ?? []
      if (datas.length > 0) {
        // setOutletFilter('all')

        setOutletData([
          // { value: 'all', label: 'All Outlet' },
          ...datas.map(item => ({
            value: item.id.toString(),
            label: item.name
          }))
        ])

        const defaultVal = datas.filter(item => item.is_default)

        if (defaultVal.length > 0) {
          setOutletFilter((pageOption.outlet_id as string) ?? defaultVal[0].id.toString())
        } else if (datas.length > 0) {
          setOutletFilter((pageOption.outlet_id as string) ?? datas[0].id.toString())
        }
      }
    }
  })

  const getGroup = useQuery(['group-list', outletFilter], {
    queryFn: () =>
      tableGroupService.getList({
        ...maxLimitPagination,
        outlet_id: outletFilter
      }),
    onSuccess: data => {
      const datas = data.data.data ?? []
      if (datas.length > 0) {
        setGroupFilter((pageOption.group_id as string) ?? 'all')

        setGroupData([
          { value: 'all', label: t('All') },
          ...datas
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(item => ({
              value: item.id.toString(),
              label: item.name
            }))
        ])
      } else {
        setGroupFilter((pageOption.group_id as string) ?? 'all')
        setGroupData([{ value: 'all', label: t('All') }])
      }
    },
    enabled: outletFilter != undefined
  })

  useEffect(() => {
    if (dataTable !== undefined && getOutlet.data !== undefined && getGroup.data !== undefined) {
      setData(
        createTableDetail(dataTable.data.data, getGroup.data.data.data, getOutlet.data.data.data)
      )
    }
  }, [dataTable, getOutlet.data, getGroup.data])

  // const createMutation = useMutation(tableService.create, {
  //   onSuccess: response => {
  //     toast.success(t((response as unknown as ResponseType).data.message))

  //     queryClient.invalidateQueries('table-list')

  //     setFormDeleteOpen(false)
  //     setSelectedData(null)
  //   },
  //   onSettled: () => {
  //     setLoadingDelete(false)
  //   }
  // })

  const deleteMutation = useMutation(tableService.delete, {
    onSuccess: response => {
      toast.success(t((response as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('table-list')

      setFormDeleteOpen(false)
      setSelectedData(null)
    },
    onSettled: () => {
      setLoadingDelete(false)
    }
  })

  const handleEdit = (data: TableType | null) => {
    setFormAddOpen(true)
    setSelectedData(data)
  }

  const handleDelete = (data: TableType | null) => {
    setSelectedData(data)
    setFormDeleteOpen(true)
  }

  const handleCloseDelete = () => {
    setFormDeleteOpen(false)
    setSelectedData(null)
  }

  const handleConfirmDeleteTable = () => {
    if (selectedData) {
      deleteMutation.mutate(selectedData.id)
    }
  }

  const [itemSelected, setItemSelected] = useState<TableDetailType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    tableService.deleteBatch,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        refetch()
        setDeleteBatch(false)
        setItemSelected([])
        setCheckedAll(false)
      }
    }
  )

  const handleConfirmDeleteBatch = () => {
    if (itemSelected.length > 0) {
      mutateDeleteBatch(itemSelected.map(item => item.table.id) as number[])
    }
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    table?: TableDetailType
  ) => {
    if (id !== 'all') {
      if (table && event.target.checked) setItemSelected([...itemSelected, table])
      else if (table && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.table.id != table.table.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(data)
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const [columns, setColumns] = useState<GridColDef<TableDetailType>[] | undefined>(undefined)

  useEffect(() => {
    setColumns([
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
              onChange={e => handleChange(e, index.row.table.id.toString(), index.row)}
              key={index.row.table.id}
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
        field: 'created_at',
        headerName: 'No',
        renderCell: index => {
          return (
            (index.api.getRowIndexRelativeToVisibleRows(index.row.table.id) ?? 1) +
            1 +
            (pageOption?.limit ?? 50) * ((pageOption?.page ?? 1) - 1)
          )
        }
      },
      {
        width: 200,
        field: 'name',
        headerName: t('Table2') ?? 'Table',
        renderCell: params => (
          <Typography
            className='hover-underline'
            variant='body2'
            onClick={() => handleEdit(params.row.table)}
            sx={{
              fontWeight: 600,
              color: 'primary.main'
            }}
          >
            {params.row.table.name}
          </Typography>
        )
      },
      ...(outletData.length > 1
        ? [
            {
              flex: 1,
              field: 'outlet_id',
              headerName: 'Outlet',
              renderCell: (params: { row: { outlet: { name: any } } }) => {
                return params.row.outlet.name
              }
            }
          ]
        : []),
      {
        flex: 1,
        field: 'group_id',
        headerName: t('Table Group') ?? 'Table Group',
        renderCell: params => {
          return params.row.group ? params.row.group.name : '-'
        }
      },
      {
        flex: 1,
        field: 'table_code',
        headerName: t('Table Code') ?? 'Table Code',
        renderCell: params => {
          return params.row.table.table_code
        }
      },
      {
        flex: 1,
        field: 'table_status',
        headerName: t('Table Status') ?? 'Table Status',
        renderCell: params => {
          return params.row.table.table_status == 'Available' ? (
            <Typography variant='body2' color='success.main' fontWeight={'bold'}>
              {params.row.table.table_status}
            </Typography>
          ) : (
            <Typography variant='body2' color='warning.main' fontWeight={'bold'}>
              {params.row.table.table_status}
            </Typography>
          )
        }
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
              {checkPermission('table management.update') && (
                <Tooltip title={t('Edit')} placement='top'>
                  <IconButton size='small' onClick={() => handleEdit(params.row.table)}>
                    <Icon icon='tabler:edit' fontSize='0.875rem' />
                  </IconButton>
                </Tooltip>
              )}

              {checkPermission('table management.delete') && (
                <Tooltip title={t('Delete')} placement='top'>
                  <IconButton size='small' onClick={() => handleDelete(params.row.table)}>
                    <Icon icon='tabler:trash' fontSize='0.875rem' />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )
        }
      }
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outletData, itemSelected, checkedAll])

  const handleCloseFormDialog = () => {
    setFormAddOpen(false)
    setSelectedData(null)
  }

  const handleOpenTableGroup = () => {
    setOpenTableGroup(true)
  }

  const handleCloseTableGroup = () => {
    setOpenTableGroup(false)
  }

  return (
    <Box>
      <TableHeader
        title={t('Table2') ?? 'Table'}
        {...(checkPermission('table management.create') && { onAdd: () => setFormAddOpen(true) })}
        hideSearch={outletFilter == undefined}
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
          setPageOption({ ...pageOption, query: value })
        }}
        filterComponent={
          !getOutlet.isLoading && outletFilter != undefined
            ? [
                ...(outletData.length > 1
                  ? [
                      <Select
                        fullWidth
                        sx={{ minWidth: 160 }}
                        options={outletData}
                        value={outletFilter}
                        onChange={e => {
                          setOutletFilter((e?.target?.value as string) ?? 'all')
                        }}
                        label='Outlet'
                        key={1}
                      />
                    ]
                  : []),
                ...(groupFilter != undefined
                  ? [
                      <Select
                        fullWidth
                        sx={{ minWidth: 160 }}
                        options={groupData}
                        value={groupFilter}
                        onChange={e => {
                          setGroupFilter((e?.target?.value as string) ?? 'all')
                        }}
                        label={t('Table Group')}
                        key={2}
                      />
                    ]
                  : [])
              ]
            : undefined
        }
      >
        <Button variant='outlined' onClick={onOpenDialogQrCode}>
          {t('Print')} QR Code
        </Button>
        {checkPermission('table management.create') && (
          <Button variant='outlined' onClick={handleOpenTableGroup}>
            {t('Table Group')}
          </Button>
        )}
      </TableHeader>
      {outletFilter && data && columns && (
        <>
          <DataGridCustom
            getRowId={row => row.table.id}
            loading={isLoading}
            autoHeight
            rows={data}
            columns={columns}
            disableColumnMenu
            hideFooter
            setPaginationData={setPageOption}
          />
          <PaginationCustom
            itemSelected={itemSelected}
            meta={unitMeta}
            onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
            {...(checkPermission('table management.delete') && {
              onDelete: () => setDeleteBatch(true)
            })}
          />
          <FormTableDialog
            open={formAddOpen}
            toggle={handleCloseFormDialog}
            selectedData={selectedData}
            group_id={
              groupFilter == 'all' || groupFilter == undefined ? undefined : parseInt(groupFilter)
            }
            outlet_id={parseInt(outletFilter)}
            data={data}
            setOutletId={id => setOutletFilter(id)}
          />
          <TableGroupDialog
            open={openTableGroup}
            toggle={handleCloseTableGroup}
            outlet_id={outletFilter}
            setOutletFilter={setOutletFilter}
          />
        </>
      )}
      <DialogConfirmation
        open={formDeleteOpen}
        handleClose={handleCloseDelete}
        handleConfirm={handleConfirmDeleteTable}
        loading={loadingDelete}
        name={'Table2'}
      />
      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmDeleteBatch}
        loading={isLoadingDeleteBatch}
        name={'Table2'}
      />
      <DialogPrintQrCodeTable open={isOpenDialogQrCode} onClose={onCloseDialogQrCode} />
    </Box>
  )
}

export default TableComponent
