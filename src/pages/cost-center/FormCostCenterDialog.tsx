// ** React Imports

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
// ** Third Party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
// ** Icon Imports
// ** Types Imports
import { useMutation, useQueryClient } from 'react-query'
import { ChangeEvent, useEffect, useState } from 'react'
import Dialog from 'src/views/components/dialogs/Dialog'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { useTranslation } from 'react-i18next'
import { useApp } from 'src/hooks/useApp'
import { IDepartment } from 'src/types/apps/departmentType'
import SelectCustom from 'src/components/form/select/SelectCustom'
import {
  CostCenterPatch,
  CostCenterSchmea,
  CostCenterType,
  ICostCenter
} from 'src/types/apps/costCenterType'
import { costCenterService } from 'src/services/cost-center'

interface DialogType {
  open: boolean
  toggle: () => void
  selectCostCenter: ICostCenter | null
  departmentData: IDepartment[]
}

const FormCostCenterDialog = (props: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  // ** Props
  const queryClient = useQueryClient()
  const { open, toggle, selectCostCenter } = props

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<CostCenterType>({
    mode: 'all',
    resolver: yupResolver(CostCenterSchmea)
  })

  const { mutate, isLoading } = useMutation(costCenterService.postCostCenter, {
    onSuccess: (data: any) => {
      queryClient.invalidateQueries('cost-center-list')

      toast.success(t((data as unknown as ResponseType).data.message))
      reset()
      toggle()
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(
    costCenterService.patchCostCenter,
    {
      onSuccess: (data: any) => {
        queryClient.invalidateQueries('cost-center-list')

        toast.success(t((data as unknown as ResponseType).data.message))
        reset()
        toggle()
      }
    }
  )

  const onSubmit = (data: CostCenterPatch) => {
    const reformatData = { ...data }
    delete reformatData.id

    if (data.id) {
      mutateEdit({ id: data?.id, request: reformatData })
    } else {
      mutate(reformatData)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  useEffect(() => {
    if (selectCostCenter) {
      // if (selectCostCenter.image != '') setImgSrc(getImageAwsUrl(selectCostCenter.image))
      // else setImgSrc('')

      setValue('id', selectCostCenter.id)
      setValue('name', selectCostCenter.name)
      setValue('department_id', selectCostCenter.department_id)
    } else {
      setValue('id', null)
      setValue('name', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectCostCenter, open])

  return (
    <Dialog
      title={(selectCostCenter ? t('Edit') : t('Add')) + ' ' + t('Cost Center')}
      open={open}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit(data => onSubmit(data))}>
        <Controller
          name='name'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label={t('Cost Center Name')}
              placeholder='Adidas'
              {...errorInput(errors, 'name')}
            />
          )}
        />
        <Controller
          name='department_id'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <SelectCustom
              {...field}
              label={t('Departement') ?? 'Departement'}
              options={props.departmentData}
              labelKey='name'
              optionKey={'id'}
              fullWidth
              onSelect={(data: any, value) => {
                setValue('department_id', +value)
              }}
              {...errorInput(errors, 'department_id')}
            />
          )}
        />

        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            {t('Cancel')}
          </Button>
          <Button
            disabled={isLoading || isLoadingEdit}
            type='submit'
            variant='contained'
            sx={{ ml: 3 }}
          >
            {t('Submit')}
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default FormCostCenterDialog
