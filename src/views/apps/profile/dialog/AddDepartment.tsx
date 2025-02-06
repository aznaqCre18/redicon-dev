// ** React Imports

// ** MUI Imports
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
// ** Icon Imports
import Icon from 'src/@core/components/icon'
// ** Types Imports
import { Dialog } from '@mui/material'
import { formatPhone } from 'src/utils/numberUtils'

interface AddUserType {
  open: boolean
  toggle: () => void
}

const Header = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
  // backgroundColor: theme.palette.background.default
}))

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
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  phone: yup
    .number()
    .typeError('Phone Number field is required')
    .min(10, obj => showErrors('Contact Number', obj.value.length, obj.min))
    .required()
})

const defaultValues = {
  name: '',
  description: '',
  phone: Number('')
}

const AddDepartment = (props: AddUserType) => {
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
    <Dialog open={open} onClose={handleClose}>
      <Header>
        <Typography variant='h5'>Add Department</Typography>
        <IconButton
          size='small'
          onClick={handleClose}
          sx={{
            p: '0.438rem',
            borderRadius: 100,
            color: 'text.primary',
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>
      <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Name'
                onChange={onChange}
                placeholder=''
                error={Boolean(errors['name'])}
                {...(errors['name'] && { helperText: errors['name'].message })}
              />
            )}
          />
          <Controller
            name='description'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Description'
                onChange={onChange}
                placeholder=''
                error={Boolean(errors['description'])}
                {...(errors['description'] && { helperText: errors['description'].message })}
              />
            )}
          />
          <Controller
            name='phone'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                type='tel'
                value={value}
                sx={{ mb: 4 }}
                label='Phone'
                onChange={e => {
                  const value = formatPhone(e.target.value)
                  onChange(value)
                }}
                placeholder='(397) 294-5153'
                error={Boolean(errors.phone)}
                {...(errors.phone && { helperText: errors.phone.message })}
                InputProps={{
                  inputMode: 'tel'
                }}
              />
            )}
          />
          <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
            <Button type='submit' variant='contained' sx={{ mr: 3 }}>
              Submit
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleClose}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Dialog>
  )
}

export default AddDepartment
