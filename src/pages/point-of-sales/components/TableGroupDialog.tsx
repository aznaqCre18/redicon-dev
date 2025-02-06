import { Icon } from '@iconify/react'
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { outletService } from 'src/services/outlet/outlet'
import { tableGroupService } from 'src/services/outlet/tableGroup'
import { TableGroupType } from 'src/types/apps/outlet/tableGroup'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import Dialog from 'src/views/components/dialogs/Dialog'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import toast from 'react-hot-toast'
import Select, { SelectOption } from 'src/components/form/select/Select'
import { useTranslation } from 'react-i18next'

interface DialogType {
  open: boolean
  toggle: () => void
  outlet_id: string
  setOutletFilter: (id: string) => void
}

const TableGroupDialog = ({ open, toggle, outlet_id, setOutletFilter }: DialogType) => {
  const { t } = useTranslation()
  // ** Init
  const queryClient = useQueryClient()

  // ** State
  // const [openForm, setOpenForm] = useState<boolean>(false)

  const [deleteIds, setDeleteIds] = useState<number[]>([])

  const [selectedData, setSelectedData] = useState<TableGroupType>()

  const [deleteDialog, setDeleteDialog] = useState<boolean>(false)

  const [outletId, setOutletId] = useState<string | undefined>(outlet_id)
  const [outletData, setOutletData] = useState<SelectOption[]>([])
  const [groupData, setGroupData] = useState<TableGroupType[]>([])

  // ** Query
  const getOutlet = useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      const datas = data.data.data ?? []

      if (datas.length > 0) {
        setOutletData([
          // { value: 'all', label: 'All Outlet' },
          ...datas.map(item => ({
            value: item.id.toString(),
            label: item.name
          }))
        ])
      }
    }
  })

  const deleteData = useMutation((id: number) => tableGroupService.delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('group-list')
    }
  })

  const createData = useMutation(tableGroupService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('group-list')
    }
  })

  const updateData = useMutation(tableGroupService.update, {
    onSuccess: () => {
      queryClient.invalidateQueries('group-list')
    }
  })

  const { isLoading: isLoadingGroup } = useQuery(['group-list', outletId], {
    queryFn: () =>
      tableGroupService.getList({
        ...maxLimitPagination,
        outlet_id: outletId
      }),
    onSuccess: data => {
      const datas = data.data.data ?? []
      setGroupData(datas)
    },
    enabled: outletId !== undefined
  })

  // ** Handle
  const handleClose = () => {
    toggle()
  }

  const addTableGroupData = () => {
    if (outletId) {
      // const lastName =
      //   groupData[groupData.length - 1] && groupData[groupData.length - 1]
      //     ? groupData[groupData.length - 1].name
      //     : 'Lantai 1'
      // const newName = autoIncrementString(lastName)

      const data: TableGroupType = {
        id: Math.floor(Math.random() * 100),
        name: '',
        outlet_id: parseInt(outletId),
        vendor_id: '',
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: null,
        is_new: true,
        is_updated: false
      }

      setGroupData(old => [...old, data])
    }
  }

  const handleSave = async () => {
    if (deleteIds.length > 0) {
      deleteIds.forEach(id => {
        deleteData.mutate(id)
      })
    }

    groupData.forEach(item => {
      if (item.is_new) {
        createData.mutate({
          name: item.name,
          outlet_id: item.outlet_id
        })
      } else if (item.is_updated) {
        updateData.mutate({
          id: item.id,
          data: {
            name: item.name,
            outlet_id: item.outlet_id
          }
        })
      }
    })

    toast.success('Table Group has been saved!')
    setOutletFilter(outletId as string)

    handleClose()
  }

  const handleDelete = () => {
    // selectedData && deleteData.mutate(selectedData.id)
    if (selectedData) {
      setDeleteIds(old => [...old, selectedData.id])
      setGroupData(groupData.filter(item => item.id !== selectedData.id))

      handleCloseDeleteDialog()
    }
  }

  const handleDeleteDialog = (data: TableGroupType) => {
    setDeleteDialog(true)
    setSelectedData(data)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false)
  }

  useEffect(() => {
    if (open) {
      setOutletId(outlet_id)
      deleteIds.length > 0 && setDeleteIds([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog open={open} onClose={handleClose} title={t('Table Group')}>
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'end'}>
        <Box width={200}>
          {!getOutlet.isLoading && outletData.length > 1 && (
            <Select
              fullWidth
              label={`${t('Select')} Outlet`}
              options={outletData}
              value={outletId}
              onChange={e => {
                setOutletId((e?.target?.value as string) ?? undefined)
              }}
            />
          )}
        </Box>

        <Box>
          <Button
            variant='contained'
            startIcon={<Icon icon='bi:plus' />}
            onClick={addTableGroupData}
          >
            {t('Table Group')}
          </Button>
        </Box>
      </Box>

      <Box mt={4}>
        <TableContainer>
          <Table>
            <TableHead
              sx={{
                th: {
                  paddingBottom: '0.4rem !important',
                  paddingTop: '0.4rem !important'
                }
              }}
            >
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>{t('Table Group Name')}</TableCell>
                <TableCell>{t('Action')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody
              sx={{
                td: {
                  paddingBottom: '0.4rem !important',
                  paddingTop: '0.4rem !important'
                }
              }}
            >
              {groupData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      defaultValue={item.name}
                      size='small'
                      onChange={e => {
                        const value = e.target.value

                        setGroupData(old =>
                          old.map(item2 => {
                            if (item2.id === item.id) {
                              return { ...item2, name: value, is_updated: true }
                            }

                            return item2
                          })
                        )
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size='small' onClick={() => handleDeleteDialog(item)}>
                      <Icon icon='bi:trash' />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* {outletId ? (
        <FormTableGroupDialog
          open={openForm}
          toggle={handleCloseForm}
          outlet_id={outletId as unknown as number}
          selectedData={selectedData}
        />
      ) : (
        <></>
      )} */}

      <DialogConfirmation
        open={deleteDialog}
        handleClose={handleCloseDeleteDialog}
        handleConfirm={handleDelete}
        loading={deleteData.isLoading}
        name='Table Group'
      />

      <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
        <Button variant='tonal' color='secondary' onClick={handleClose}>
          {t('Cancel')}
        </Button>

        <Button variant='contained' disabled={isLoadingGroup} onClick={handleSave} sx={{ ml: 3 }}>
          {t('Save')}
        </Button>
      </Box>
    </Dialog>
  )
}

export default TableGroupDialog
