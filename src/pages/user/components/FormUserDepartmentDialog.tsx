// ** React Imports
import { useEffect } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports

// ** Types Imports
import { useMutation, useQueryClient } from 'react-query'
import { departmentService } from 'src/services/department'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'
import { useTranslation } from 'react-i18next'

interface FormDepartmentType {
  open: boolean
  toggle: () => void
  selectedData: string | null
  setSelectedData: (value: string | null) => void
}

interface UserData {
  name: string
  description: string
}

const showErrors = (field: string, valueLen: number, min: number) => {
  if (valueLen === 0) {
    return `${field} field is required`
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} must be at least ${min} characters`
  } else {
    return ''
  }
}

const schema = yup.object().shape({
  name: yup
    .string()
    .min(3, obj => showErrors('Name', obj.value.length, obj.min))
    .required(),
  description: yup
    .string()
    .min(3, obj => showErrors('Description', obj.value.length, obj.min))
    .required()
})

const defaultValues = {
  name: '',
  description: ''
}

const UserDepartmentDialog = (props: FormDepartmentType) => {
  const { t } = useTranslation()

  // ** Props
  const { open, toggle } = props

  // ** Hooks
  const queryClient = useQueryClient()
  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(schema)
  })

  const { mutate, isLoading } = useMutation(departmentService.postDepartment, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      // toggle()
      reset()
      queryClient.invalidateQueries('department-list')
    }
  })

  const getUserRole = useMutation(departmentService.getDepartment, {
    onSuccess: (data: any) => {
      const resp = data.data.data
      setValue('name', resp.name)
      setValue('description', resp.description)
    }
  })

  const patchUser = useMutation(departmentService.patchDepartment, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      toggle()
      reset()
      queryClient.invalidateQueries('department-list')
    }
  })

  const onSubmit = (data: UserData) => {
    const request = {
      name: data.name,
      description: data.description
    }
    if (props.selectedData !== null) {
      patchUser.mutate({ id: +props.selectedData, request })
    } else {
      mutate(request)
    }
  }

  useEffect(() => {
    if (props.selectedData && open) {
      getUserRole.mutate(props.selectedData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedData, open])

  const handleClose = () => {
    setValue('name', '')
    setValue('description', '')
    props.setSelectedData(null)
    toggle()
    reset()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={(props.selectedData !== null ? t('Edit') : t('Add')) + ' ' + t('Department')}
      maxWidth='xs'
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name='name'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label={t('Department')}
              placeholder='Human Resource'
              error={Boolean(errors.name)}
              {...(errors.name && { helperText: errors.name.message })}
            />
          )}
        />
        <Controller
          name='description'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label={t('Description')}
              placeholder='Department for handle human resources'
              error={Boolean(errors.description)}
              {...(errors.description && { helperText: errors.description.message })}
            />
          )}
        />
        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            {t('Cancel')}
          </Button>
          <Button type='submit' variant='contained' disabled={isLoading} sx={{ ml: 3 }}>
            {t('Submit')}
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default UserDepartmentDialog
