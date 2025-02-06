import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, Grid, TextField } from '@mui/material'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'
import { useApp } from 'src/hooks/useApp'
import { tableGroupService } from 'src/services/outlet/tableGroup'
import { TableGroupData, TableGroupSchema, TableGroupType } from 'src/types/apps/outlet/tableGroup'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'

interface FormTableGrpupType {
  open: boolean
  toggle: () => void
  selectedData?: TableGroupType
  outlet_id: number
}

const FormTableGroupDialog = ({ open, toggle, selectedData, outlet_id }: FormTableGrpupType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  // ** Use Query
  const create = useMutation((data: TableGroupData) => tableGroupService.create(data), {
    onSuccess: data => {
      toast.success(t((data as ResponseType).data.message))
      toggle()
      queryClient.invalidateQueries('group-list')
    }
  })

  const update = useMutation({
    mutationFn: (data: TableGroupData) =>
      tableGroupService.update({ id: selectedData?.id ?? 0, data }),
    onSuccess: data => {
      toast.success(t((data as ResponseType).data.message))
      toggle()
      queryClient.invalidateQueries('group-list')
    }
  })

  // ** Use Form
  const {
    reset,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<TableGroupData>({
    mode: 'all',
    resolver: yupResolver(TableGroupSchema)
  })

  const onSubmit = (data: TableGroupData) => {
    if (selectedData) {
      update.mutate(data)
    } else {
      create.mutate(data)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  useEffect(() => {
    setValue('outlet_id', outlet_id)

    if (selectedData) {
      setValue('name', selectedData.name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedData])

  useEffect(() => {
    console.log(getValues())

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors])

  return (
    <Dialog
      maxWidth='xs'
      open={open}
      onClose={handleClose}
      title={selectedData ? 'Edit Table Group' : 'Add Table Group'}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* name */}
          <Grid item xs={12}>
            <Controller
              name='name'
              control={control}
              render={({ field: { value, ...field } }) => (
                <TextField
                  size='small'
                  fullWidth
                  {...field}
                  value={value ?? ''}
                  label={t('Table Group Name')}
                  {...errorInput(errors, 'name')}
                />
              )}
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
            disabled={create.isLoading || update.isLoading}
            sx={{ ml: 3 }}
          >
            Submit
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default FormTableGroupDialog
