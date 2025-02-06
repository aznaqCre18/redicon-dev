// ** React Imports
import { useEffect } from 'react'

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
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'
import { membershipService } from 'src/services/membership'
import { MembershipData, MembershipSchema, MembershipType } from 'src/types/apps/membershipType'
import { useTranslation } from 'react-i18next'
import { useApp } from 'src/hooks/useApp'

interface FormMembershipType {
  open: boolean
  toggle: () => void
  selectedData: MembershipType | null
  setSelectedData: (value: MembershipType | null) => void
}

const defaultValues: MembershipData = {
  name: ''
}

const FormMembership = (props: FormMembershipType) => {
  const { errorInput } = useApp()
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
    resolver: yupResolver(MembershipSchema)
  })

  const { mutate, isLoading } = useMutation(membershipService.postItem, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      toggle()
      reset()
      queryClient.invalidateQueries('membership-list')
    }
  })

  const patchItem = useMutation(membershipService.patchItem, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      toggle()
      reset()
      queryClient.invalidateQueries('membership-list')
    }
  })

  const onSubmit = (data: MembershipData) => {
    if (props.selectedData !== null) {
      patchItem.mutate({ id: props.selectedData.id, request: data })
    } else {
      mutate(data)
    }
  }

  useEffect(() => {
    if (props.selectedData) {
      setValue('name', props.selectedData.name)
    } else {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedData])

  const handleClose = () => {
    if (props.selectedData !== null) {
      props.setSelectedData(null)
    }
    toggle()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={(props.selectedData !== null ? t('Edit') : t('Add')) + ' ' + t('Membership')}
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
              label={t('Membership Name') ?? 'Membership Name'}
              placeholder='Silver'
              {...errorInput(errors, 'name')}
            />
          )}
        />
        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' disabled={isLoading} sx={{ ml: 3 }}>
            Submit
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default FormMembership
