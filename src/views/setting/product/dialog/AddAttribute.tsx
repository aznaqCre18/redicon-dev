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
import Dialog from 'src/views/components/dialogs/Dialog'
import { formatPhone } from 'src/utils/numberUtils'

interface AddUserType {
  open: boolean
  toggle: () => void
}

// interface UserData {
//   email: string
//   name: string
//   address: string
//   phone: number
// }

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
  address: yup.string().required(),
  email: yup.string().email().required(),
  phone: yup
    .number()
    .typeError('Contact Number field is required')
    .min(10, obj => showErrors('Contact Number', obj.value.length, obj.min))
    .required(),
  name: yup
    .string()
    .min(3, obj => showErrors('First Name', obj.value.length, obj.min))
    .required()
})

const defaultValues = {
  email: '',
  name: '',
  address: '',
  phone: Number('')
}

const AddAttribute = (props: AddUserType) => {
  // ** Props
  const { open, toggle } = props

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'all',
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
    <Dialog open={open} onClose={handleClose} title='Add Attribute'>
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
              label='Full Name'
              placeholder='John Doe'
              error={Boolean(errors.name)}
              {...(errors.name && { helperText: errors.name.message })}
            />
          )}
        />

        <Controller
          name='email'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              type='email'
              label='Email'
              sx={{ mb: 4 }}
              error={Boolean(errors.email)}
              placeholder='johndoe@email.com'
              {...(errors.email && { helperText: errors.email.message })}
            />
          )}
        />
        <Controller
          name='phone'
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, ...field } }) => (
            <CustomTextField
              {...field}
              onChange={e => {
                const value = formatPhone(e.target.value)
                onChange(value)
              }}
              fullWidth
              type='tel'
              sx={{ mb: 4 }}
              label='Phone'
              placeholder='(397) 294-5153'
              error={Boolean(errors.phone)}
              {...(errors.phone && { helperText: errors.phone.message })}
              InputProps={{
                inputMode: 'tel'
              }}
            />
          )}
        />
        <Controller
          name='address'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label='Address'
              placeholder='Address..'
              error={Boolean(errors.address)}
              {...(errors.address && { helperText: errors.address.message })}
            />
          )}
        />

        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' sx={{ ml: 3 }}>
            Submit
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default AddAttribute
