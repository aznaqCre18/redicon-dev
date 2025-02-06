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
import { useEffect } from 'react'
import Dialog from 'src/views/components/dialogs/Dialog'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { useTranslation } from 'react-i18next'
import { useApp } from 'src/hooks/useApp'
import { DepartmentSchema, DepartmentType, IDepartment } from 'src/types/apps/departmentType'
import { departmentService, patchDepartment } from 'src/services/department'

interface DialogType {
  open: boolean
  toggle: () => void
  selectDepartment: IDepartment | null
}

const FormBrandDialog = (props: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  // ** Props
  const queryClient = useQueryClient()
  const { open, toggle, selectDepartment } = props

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<DepartmentType>({
    mode: 'all',
    resolver: yupResolver(DepartmentSchema)
  })

  const { mutate, isLoading } = useMutation(departmentService.postDepartment, {
    onSuccess: (data: any) => {
      queryClient.invalidateQueries('department-list')

      toast.success(t((data as unknown as ResponseType).data.message))
      reset()
      toggle()
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(
    departmentService.patchDepartment,
    {
      onSuccess: (data: any) => {
        queryClient.invalidateQueries('department-list')

        toast.success(t((data as unknown as ResponseType).data.message))
        reset()
        toggle()
      }
    }
  )

  const onSubmit = (data: patchDepartment) => {
    const reformatData = { ...data }
    delete reformatData.id

    if (data.id) {
      mutateEdit({ id: data?.id, request: reformatData })
    } else {
      mutate(data)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  useEffect(() => {
    if (selectDepartment) {
      // if (selectDepartment.image != '') setImgSrc(getImageAwsUrl(selectDepartment.image))
      // else setImgSrc('')

      setValue('id', selectDepartment.id)
      setValue('name', selectDepartment.name)
    } else {
      setValue('id', null)
      setValue('name', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectDepartment, open])

  return (
    <Dialog
      title={(selectDepartment ? t('Edit') : t('Add')) + ' ' + t('Departement')}
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
              label={t('Department Name')}
              placeholder='Adidas'
              {...errorInput(errors, 'name')}
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

export default FormBrandDialog
