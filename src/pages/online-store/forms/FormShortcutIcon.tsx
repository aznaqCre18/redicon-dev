// ** React Imports

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
import IconUploader from 'src/@core/components/file-uploader/IconUploader'
import Dialog from 'src/views/components/dialogs/Dialog'

interface AddUserType {
  open: boolean
  toggle: () => void
}

// const showErrors = (field: string, valueLen: number, min: number) => {
//   if (valueLen === 0) {
//     return `${field} field is required`
//   } else if (valueLen > 0 && valueLen < min) {
//     return `${field} must be at least ${min} characters`
//   } else {
//     return ''
//   }
// }

const schema = yup.object().shape({
  'shortcut-name': yup.string().required('Shortcut Name is required'),
  'shortcut-purpose': yup.string().required('Shortcut Purpose is required')
})

const defaultValues = {
  'shortcut-name': '',
  'shortcut-purpose': ''
}

const FormShortcutIcon = (props: AddUserType) => {
  // ** Props
  const { open, toggle } = props

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })
  const onSubmit = () => {
    toggle()
    reset()
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  return (
    <Dialog open={open} onClose={handleClose} title='Add Shorcut Icon'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            p: '0.438rem'
          }}
        >
          <IconUploader />
        </Box>
        <Controller
          name='shortcut-name'
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <CustomTextField
              fullWidth
              value={value}
              sx={{ mb: 4 }}
              label='Shortcut Name'
              onChange={onChange}
              placeholder=''
              error={Boolean(errors['shortcut-name'])}
              {...(errors['shortcut-name'] && { helperText: errors['shortcut-name'].message })}
            />
          )}
        />
        <Controller
          name='shortcut-purpose'
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <CustomTextField
              fullWidth
              value={value}
              sx={{ mb: 4 }}
              label='Shortcut Purpose'
              onChange={onChange}
              placeholder=''
              error={Boolean(errors['shortcut-purpose'])}
              {...(errors['shortcut-purpose'] && {
                helperText: errors['shortcut-purpose'].message
              })}
            />
          )}
        />
        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            // disabled={isLoading || isLoadingEdit}
            type='submit'
            variant='contained'
            sx={{ ml: 3 }}
          >
            Submit
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default FormShortcutIcon
