import React, { useEffect, useState } from 'react'
import { Box } from '@mui/system'
import { GridColDef } from '@mui/x-data-grid'
import { IconButton, Checkbox, Tooltip, Typography } from '@mui/material'
import Icon from 'src/@core/components/icon'
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
import { outletService } from 'src/services/outlet/outlet'
import Select, { SelectOption } from 'src/components/form/select/Select'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import { ReceiptSettingType } from 'src/types/apps/vendor/settings/point-of-sales/receipt'
import { receiptService } from 'src/services/vendor/settings/point-of-sales/receipt'
import FormReceiptDialog from './FormReceiptDialog'

const ReceiptComponent = () => {
  const { checkPermission } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  // ** States
  const queryClient = useQueryClient()
  const [formAddOpen, setFormAddOpen] = useState(false)
  const [formDeleteOpen, setFormDeleteOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<ReceiptSettingType | null>(null)

  const [datas, setDatas] = useState<ReceiptSettingType[]>([])
  const [dataMeta, setDataMeta] = useState<MetaType>()
  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...defaultPagination,
    ...router.query,
    order: 'sort_position',
    sort: 'asc'
  } as any)

  useEffect(() => {
    router.replace({
      query: pageOption,
      hash: 'Receipt'
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageOption])

  const [search, setSearch] = useState<string>((pageOption.destination_name as any) ?? '')

  const [outletFilter, setOutletFilter] = useState<number | undefined>(
    (pageOption.outlet_id as number) ?? undefined
  )
  const [outletData, setOutletData] = useState<SelectOption[]>([])

  const getOutlet = useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      const datas = data.data.data
      if (datas.length > 1) {
        setOutletFilter(datas.find(item => item.is_default)?.id ?? datas[0].id)

        setOutletData([
          ...datas.map(item => ({
            value: item.id.toString(),
            label: item.name
          }))
        ])
      } else {
        setOutletFilter(datas[0].id)
        setOutletData([
          ...datas.map(item => ({
            value: item.id.toString(),
            label: item.name
          }))
        ])
      }
    }
  })

  const { isLoading } = useQuery(['receipt-list', outletFilter, search], {
    queryFn: () =>
      receiptService.getList({
        outlet_id: outletFilter!,
        ...pageOption
      }),
    enabled: checkPermission('receipt.read') && Boolean(outletFilter),
    onSuccess: data => {
      setDatas(data?.data.data ?? [])
      setDataMeta(data.data.meta)
    }
  })

  const deleteMutation = useMutation(receiptService.delete, {
    onSuccess: response => {
      toast.success(t((response as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('receipt-list')

      setFormDeleteOpen(false)
      setSelectedData(null)
    }
  })

  const handleEdit = (data: ReceiptSettingType) => {
    setFormAddOpen(true)
    setSelectedData(data)
  }

  const handleDelete = (data: ReceiptSettingType) => {
    setSelectedData(data)
    setFormDeleteOpen(true)
  }

  const handleCloseDelete = () => {
    setFormDeleteOpen(false)
    setSelectedData(null)
  }

  const handleConfirmDeleteUser = () => {
    if (selectedData !== null) {
      deleteMutation.mutate(selectedData.id)
    }
  }

  const [itemSelected, setItemSelected] = useState<ReceiptSettingType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string | number,
    data?: ReceiptSettingType
  ) => {
    if (id !== 'all') {
      if (data && event.target.checked) setItemSelected([...itemSelected, data])
      else if (data && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != data.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(datas.map(item => item))
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const columns: GridColDef<ReceiptSettingType>[] = [
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
      headerName: 'No',
      renderCell: index => {
        return (
          (index.api.getRowIndexRelativeToVisibleRows(index.row.id) ?? 1) +
          1 +
          (pageOption?.limit ?? 50) * ((pageOption?.page ?? 1) - 1)
        )
      }
    },
    {
      flex: 1,
      field: 'destination_name',
      headerName: t('Destination') ?? 'Destination',
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
          {params.value}
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
            {checkPermission('receipt.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {checkPermission('receipt.delete') && !params.row.is_default && (
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

  const handleCloseFormDialog = () => {
    setFormAddOpen(false)
    setSelectedData(null)
  }

  return (
    <Box>
      <TableHeader
        title={t('Receipt') ?? 'Receipt'}
        {...(checkPermission('receipt.create') && {
          onAdd: () => setFormAddOpen(true)
        })}
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
          setPageOption({ ...pageOption, query: value })
        }}
        filterComponent={
          !getOutlet.isLoading && outletData.length > 1
            ? [
                <Select
                  fullWidth
                  sx={{ minWidth: 160 }}
                  options={outletData}
                  value={outletFilter}
                  onChange={e => {
                    setOutletFilter((e?.target?.value as number) ?? undefined)
                  }}
                  label='Outlet'
                  key={1}
                />
              ]
            : undefined
        }
      />
      <DataGridCustom
        getRowId={param => param.id}
        loading={isLoading}
        autoHeight
        rows={datas}
        columns={columns}
        setPaginationData={setPageOption}
        hideFooter
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={dataMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
      />
      <FormReceiptDialog
        open={formAddOpen}
        toggle={handleCloseFormDialog}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
      />
      <DialogConfirmation
        open={formDeleteOpen}
        handleClose={handleCloseDelete}
        handleConfirm={handleConfirmDeleteUser}
        loading={deleteMutation.isLoading}
        name='Receipt'
        action='Delete'
      />
    </Box>
  )
}

export default ReceiptComponent
