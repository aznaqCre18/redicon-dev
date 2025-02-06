// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
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
import { Dialog, InputAdornment } from '@mui/material'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { userService } from 'src/services/user'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { useTranslation } from 'react-i18next'
import { formatPhone } from 'src/utils/numberUtils'

interface AddUserType {
  open: boolean
  toggle: () => void
  selectedUser: string | null
  setSelectedUser: (value: string | null) => void
}

interface UserData {
  name: string
  username: string
  email: string
  phone: string
  password: string
  role_id?: string
  department_id?: string
  language_id?: string
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

const Header = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const schema = yup.object().shape({
  email: yup.string().email().required(),
  phone: yup
    .string()
    .typeError('Phone Number field is required')
    .min(10, obj => showErrors('Phone Number', obj.value.length, obj.min))
    .required(),
  name: yup
    .string()
    .min(3, obj => showErrors('Name', obj.value.length, obj.min))
    .required(),
  username: yup
    .string()
    .min(3, obj => showErrors('Username', obj.value.length, obj.min))
    .required()
})

const defaultValues = {
  email: '',
  name: '',
  password: '',
  username: '',
  phone: ''
}

const showPasswordValue = atom<boolean>(false)

const AddUserDialog = (props: AddUserType) => {
  const { t } = useTranslation()
  // ** Props
  const { open, toggle } = props

  const setShowPassword = useSetAtom(showPasswordValue)
  const showPassword = useAtomValue(showPasswordValue)

  // ** State
  const [role, setRole] = useState<string>('0')

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
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const { mutate, isLoading } = useMutation(userService.postUser, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      toggle()
      reset()
      queryClient.invalidateQueries('user-list')
    }
  })

  const getUser = useMutation(userService.getUser, {
    onSuccess: (data: any) => {
      const resp = data.data.data
      console.log(data)
      setValue('name', resp.name)
      setValue('username', resp.username)
      setValue('email', resp.email)
      setValue('phone', resp.phone)
      setRole(resp.role_id.toString())
    }
  })

  const patchUser = useMutation(userService.patchUser, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      toggle()
      reset()
      queryClient.invalidateQueries('user-list')
    }
  })

  const onSubmit = (data: UserData) => {
    const request = {
      name: data.name,
      username: data.username,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role_id: parseInt(role),
      department_id: 1,
      language_id: 1
    }
    if (props.selectedUser !== null) {
      patchUser.mutate({ id: props.selectedUser, request })
    } else {
      mutate(request)
    }
  }

  useEffect(() => {
    if (props.selectedUser && open) {
      getUser.mutate(props.selectedUser)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedUser, open])

  const handleClose = () => {
    setRole('subscriber')
    setValue('phone', '')
    props.setSelectedUser(null)
    toggle()
    reset()
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <Header>
        <Typography variant='h5'>Add User</Typography>
        <IconButton
          size='small'
          onClick={handleClose}
          sx={{
            p: '0.438rem',
            borderRadius: 1,
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
                label='Full Name'
                onChange={onChange}
                placeholder='John Doe'
                error={Boolean(errors.name)}
                {...(errors.name && { helperText: errors.name.message })}
              />
            )}
          />
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
                placeholder='johndoe'
                error={Boolean(errors.username)}
                {...(errors.username && { helperText: errors.username.message })}
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
                type='email'
                label='Email'
                value={value}
                sx={{ mb: 4 }}
                onChange={onChange}
                error={Boolean(errors.email)}
                placeholder='johndoe@email.com'
                {...(errors.email && { helperText: errors.email.message })}
              />
            )}
          />
          <CustomTextField
            select
            fullWidth
            value={role}
            sx={{ mb: 4 }}
            label='Select Role'
            onChange={e => setRole(e.target.value)}
            SelectProps={{ value: role, onChange: e => setRole(e.target.value as string) }}
          >
            <MenuItem value='0' disabled selected>
              Select
            </MenuItem>
            <MenuItem value='1'>Admin</MenuItem>
            <MenuItem value='2'>Author</MenuItem>
            <MenuItem value='3'>Editor</MenuItem>
            <MenuItem value='4'>Maintainer</MenuItem>
            <MenuItem value='5'>Subscriber</MenuItem>
          </CustomTextField>
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
          <Controller
            name='password'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <CustomTextField
                fullWidth
                value={value}
                onBlur={onBlur}
                label='Password'
                onChange={onChange}
                id='auth-login-v2-password'
                error={Boolean(errors.password)}
                {...(errors.password && { helperText: errors.password.message })}
                type={showPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Icon
                          fontSize='1.25rem'
                          icon={showPassword ? 'tabler:eye' : 'tabler:eye-off'}
                        />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
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
      </Box>
    </Dialog>
  )
}

export default AddUserDialog
