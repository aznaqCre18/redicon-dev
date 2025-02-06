// ** React Imports

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// ** Third Party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

// ** Icon Imports

// ** Types Imports
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'
import { Grid } from '@mui/material'
import {
  OneCreateTableData,
  TableDetailType,
  TableSchema,
  TableType
} from 'src/types/apps/outlet/table'
import { tableService } from 'src/services/outlet/table'
import { outletService } from 'src/services/outlet/outlet'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { useEffect, useState } from 'react'
import { OutletType } from 'src/types/apps/outlet/outlet'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { tableGroupService } from 'src/services/outlet/tableGroup'
import { TableGroupType } from 'src/types/apps/outlet/tableGroup'
import CustomTextField from 'src/components/form/CustomTextField'
import { useTranslation } from 'react-i18next'
import { autoIncrementString } from 'src/utils/stringUtils'
import { useApp } from 'src/hooks/useApp'

interface FormTableType {
  open: boolean
  toggle: () => void
  selectedData: TableType | null
  outlet_id: number
  group_id: number | undefined
  data: TableDetailType[]
  setOutletId: (group_id: string | undefined) => void
}

const FormTableDialog = (props: FormTableType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  // ** Props
  const { open, toggle, selectedData, outlet_id, group_id, setOutletId: setOutletId2 } = props

  const [tableName, setTableName] = useState<string | undefined>(selectedData?.name)
  const [outletId, setOutletId] = useState<number | undefined>()
  const [outletData, setOutletData] = useState<OutletType[]>([])
  const [groupId, setGroupId] = useState<number | undefined>()
  const [groupData, setGroupData] = useState<TableGroupType[]>([])

  // ** Hooks
  const queryClient = useQueryClient()
  const {
    getValues,
    reset,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors }
  } = useForm<OneCreateTableData>({
    mode: 'all',
    resolver: yupResolver(TableSchema)
  })

  const { isLoading: isLoadingOutlet } = useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      setOutletData(data.data.data)

      if (outlet_id) setOutletId(outlet_id)
      else if (data.data.data.length == 1) setOutletId(data.data.data[0].id)
    }
  })

  const [isLoadingGroup, setIsLoadingGroup] = useState(false)

  const { refetch: refecthGroup } = useQuery(['group-list', outletId], {
    queryFn: () =>
      tableGroupService.getList({
        ...maxLimitPagination,
        outlet_id: outletId
      }),
    onSuccess: data => {
      setIsLoadingGroup(false)
      const datas = data.data.data ?? []
      setGroupData(datas)

      if (group_id) setGroupId(group_id)
      else if (datas.length == 1) setGroupId(datas[0].id)
    },
    enabled: outletId !== undefined
  })

  const refetch = () => {
    setIsLoadingGroup(true)
    refecthGroup()
  }

  const { mutate, isLoading } = useMutation(tableService.create, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      const name = getValues().name as string
      const newName = autoIncrementString(name)

      setValue('name', newName)
      setTableName(newName)

      queryClient.invalidateQueries('table-list')
    }
  })

  const { mutate: mutateUpdate, isLoading: isLoadingUpdate } = useMutation(tableService.update, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      toggle()
      reset()
      queryClient.invalidateQueries('table-list')
    }
  })

  const onSubmit = (dataNew: OneCreateTableData) => {
    if (selectedData !== null) {
      mutateUpdate({ id: selectedData.id, data: dataNew })
    } else {
      mutate(dataNew)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  useEffect(() => {
    console.log(errors)
  }, [errors])

  useEffect(() => {
    if (open) {
      console.log(selectedData)

      if (selectedData) {
        setValue('name', selectedData.name)
        setValue('outlet_id', outletId)
        setValue('group_id', groupId)

        setGroupId(selectedData.group_id)
        setOutletId(selectedData.outlet_id)
        setTableName(selectedData.name)
      } else {
        setValue('outlet_id', outletId)
        setOutletId(outlet_id)
        setGroupId(group_id)

        resetField('name')
        setTableName('')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (outletId?.toString() == undefined) return

    if (outletId?.toString() !== outlet_id?.toString()) {
      // console.log(outletId?.toString(), outlet_id?.toString())

      setOutletId2(outletId?.toString() ?? undefined)
    }
    refetch()
    setValue('outlet_id', outletId)
    // resetField('group_id')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outletId])

  useEffect(() => {
    setValue('group_id', groupId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  // useEffect(() => {
  //   if (outlet_id) {
  //     setOutletId(outlet_id)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [outlet_id])

  // useEffect(() => {
  //   if (group_id) {
  //     setGroupId(group_id)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [group_id])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={(selectedData !== null ? t('Edit') : t('Add')) + ' ' + t('Table2')}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {!isLoadingOutlet && outletData.length > 1 && (
            <>
              <Grid item xs={6}>
                <SelectCustom
                  value={outletId}
                  fullWidth
                  label='Outlet'
                  options={outletData}
                  optionKey='id'
                  labelKey='name'
                  onSelect={value => {
                    if (value) setOutletId(value.id)
                    else setOutletId(undefined)
                  }}
                  {...errorInput(errors, 'outlet_id')}
                />
              </Grid>
            </>
          )}
          {!isLoadingGroup && (
            <>
              <Grid item xs={outletData.length > 1 ? 6 : 12}>
                <SelectCustom
                  value={groupId}
                  fullWidth
                  label={t('Table Group') ?? 'Table Group'}
                  options={groupData}
                  optionKey='id'
                  labelKey='name'
                  onSelect={value => {
                    if (value) setGroupId(value.id)
                    else setGroupId(undefined)
                  }}
                  {...errorInput(errors, 'group_id')}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} mb={3}>
            <CustomTextField
              size='small'
              fullWidth
              value={tableName}
              label={t('Table Name') ?? 'Table Name'}
              onChange={e => {
                setValue('name', e.target.value)
                setTableName(e.target.value)
              }}
              {...errorInput(errors, 'name')}
            />
          </Grid>
        </Grid>
        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={isLoading || isLoadingUpdate}
            sx={{ ml: 3 }}
          >
            Submit
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default FormTableDialog
