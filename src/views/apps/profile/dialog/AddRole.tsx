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
import { Dialog, FormControl, InputLabel, MenuItem, Select } from '@mui/material'

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

const schema = yup.object().shape({
  username: yup.string().required('Username is required'),
  email: yup.string().email().required('Email is required'),
  department: yup.string().required('Department is required'),
  role: yup.string().required('Role is required')
})

const defaultValues = {
  username: '',
  email: '',
  department: '',
  role: ''
}

const AddRole = (props: AddUserType) => {
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
        <Typography variant='h5'>Add Role</Typography>
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
            name='username'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Username'
                onChange={onChange}
                placeholder=''
                error={Boolean(errors['username'])}
                {...(errors['username'] && { helperText: errors['username'].message })}
              />
            )}
          />
          <Controller
            name='email'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Email'
                onChange={onChange}
                placeholder=''
                error={Boolean(errors['email'])}
                {...(errors['email'] && { helperText: errors['email'].message })}
              />
            )}
          />
          <Controller
            name='department'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Department'
                onChange={onChange}
                placeholder=''
                error={Boolean(errors['department'])}
                {...(errors['department'] && { helperText: errors['department'].message })}
              />
            )}
          />
          {/* <Controller
            name=''
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
                error={Boolean(errors['email'])}
                {...(errors['email'] && { helperText: errors['email'].message })}
              />
            )}
          /> */}
          <InputLabel
            id='select-role'
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500
            }}
          >
            Role
          </InputLabel>
          <FormControl size='small' sx={{ mb: 4 }} fullWidth>
            <Select id='select-role' displayEmpty>
              <MenuItem value='admin'>Admin</MenuItem>
              <MenuItem value='author'>Author</MenuItem>
              <MenuItem value='editor'>Editor</MenuItem>
              <MenuItem value='maintainer'>Maintainer</MenuItem>
              <MenuItem value='subscriber'>Subscriber</MenuItem>
            </Select>
          </FormControl>

          <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
            <Button variant='tonal' color='secondary' onClick={handleClose}>
              Cancel
            </Button>
            <Button type='submit' variant='contained' sx={{ ml: 3 }}>
              Submit
            </Button>
          </Box>
        </form>
      </Box>
    </Dialog>
  )
}

export default AddRole
