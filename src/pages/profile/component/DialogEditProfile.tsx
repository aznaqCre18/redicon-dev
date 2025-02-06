import { yupResolver } from '@hookform/resolvers/yup'
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'
import React, { ChangeEvent, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { UserAuthType } from 'src/context/types'
import { profileService } from 'src/services/profile'
import { ProfileDataType, ProfileSchema, ProfileType } from 'src/types/apps/profileType'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'
import awsConfig from 'src/configs/aws'
import { useAuth } from 'src/hooks/useAuth'
import FormChangePinDialog from './FormChangePinDialog'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { vendorService } from 'src/services/vendor'
import { Icon } from '@iconify/react'
import FormChangePasswordDialog from './FormChangePasswordDialog'
import { formatPhone } from 'src/utils/numberUtils'

interface FormChangePasswordDialogType {
  open: boolean
  toggle: () => void
}

const DialogEditProfile = ({ open, toggle }: FormChangePasswordDialogType) => {
  const handleClose = () => {
    toggle()
  }

  const { t } = useTranslation()
  const auth = useAuth()
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState<boolean>(false)
  const toggleChangePasswordDialog = () => setChangePasswordDialogOpen(!changePasswordDialogOpen)

  const [changePinDialogOpen, setChangePinDialogOpen] = useState<boolean>(false)
  const toggleChangePinDialog = () => setChangePinDialogOpen(!changePinDialogOpen)

  const [imgSrc, setImgSrc] = useState('')

  const [files, setFiles] = useState<File | null>(null)
  const [inputFileValue, setInputFileValue] = useState('')

  const { mutate: updateProfilePicture, isLoading: loadingUpdateProfilePicture } = useMutation(
    profileService.updateProfilePicture,
    {
      onSuccess: data => {
        queryClient.invalidateQueries('user-profile')
        auth.initAuth()

        const response = data as unknown as ResponseType
        toast.success(t(response.data.message))
      }
    }
  )

  // check email available
  const [msgErrEmail, setMsgErrEmail] = useState<string>('')
  const [isEmailAvailable, setIsEmailAvailable] = useState(true)
  const { mutate: checkEmailAvailable, isLoading: isLoadingCheckEmailAvailable } = useMutation(
    vendorService.checkEmailAvailable,
    {
      onSuccess: () => {
        setIsEmailAvailable(true)
      },
      onError: () => {
        setIsEmailAvailable(false)
        setMsgErrEmail('Email is already registered')
      }
    }
  )

  //  check phone available

  const [msgErrPhone, setMsgErrPhone] = useState<string>('')
  const [isPhoneAvailable, setIsPhoneAvailable] = useState(true)
  const { mutate: checkPhoneAvailable, isLoading: isLoadingCheckPhoneAvailable } = useMutation(
    vendorService.checkPhoneAvailable,
    {
      onSuccess: () => {
        setIsPhoneAvailable(true)
      },
      onError: () => {
        setIsPhoneAvailable(false)
        setMsgErrPhone('Phone number is already registered')
      }
    }
  )

  const queryClient = useQueryClient()
  const { mutate: updateProfile, isLoading: loadingUpdateProfile } = useMutation(
    profileService.updateProfile,
    {
      onSuccess: data => {
        if (files) {
          updateProfilePicture(files)
        } else {
          queryClient.invalidateQueries('user-profile')
          auth.initAuth()

          const response = data as unknown as ResponseType
          toast.success(t(response.data.message))

          handleClose()
        }
      }
    }
  )

  const {
    control,
    setValue,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm<ProfileType>({
    mode: 'onChange',
    resolver: yupResolver(ProfileSchema)
  })

  const [oldUser, setOldUser] = useState<ProfileDataType | null>(null)

  const { isLoading: isLoadingProfileData } = useQuery('user-profile', {
    queryFn: profileService.getProfile,
    onSuccess: data => {
      setOldUser(data.data.data)

      auth.setUser({
        ...(data.data.data as any as UserAuthType),
        role: 'admin',
        superadmin: true
      })
      const user = data.data.data.user

      setValue('name', user.name)
      setValue('username', user.username)
      setValue('email', user.email)
      setValue('phone', user.phone)
      if (user.profile_picture) setImgSrc(`${awsConfig.s3_bucket_url}/${user.profile_picture}`)
      setFiles(null)
    }
  })

  const onSubmit = (data: ProfileType) => {
    // replace data.phone first 0 to +62
    if (data.phone.charAt(0) === '0') {
      data.phone = '+62' + data.phone.substr(1)
    }

    updateProfile(data)
  }

  const handleInputImageChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      setFiles(files[0])

      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(files[0])
      if (reader.result !== null) {
        setInputFileValue(reader.result as string)
      }
    }
  }

  if (isLoadingProfileData) return <CircularProgress />

  return (
    <Dialog title={t('Account Information')} open={open} onClose={handleClose}>
      <Box>
        <Box display='flex' justifyContent={'center'} marginBottom={4}>
          <IconButton component='label'>
            <Avatar src={imgSrc} sx={{ width: '72px', height: '72px' }} alt='Profile Pic'>
              <Box alignItems={'center'} display={'flex'} flexDirection={'column'}>
                <Icon icon='bi:person' width={24} height={24} />
                <Typography variant='caption'>Upload</Typography>
              </Box>
            </Avatar>
            <input
              hidden
              type='file'
              value={inputFileValue}
              accept='image/png, image/jpeg'
              onChange={handleInputImageChange}
              id='account-settings-upload-image'
            />
          </IconButton>
        </Box>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container rowSpacing={4} columnSpacing={6}>
            <Grid item xs={6}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, ...field } }) => (
                  <TextField
                    value={value ?? ''}
                    {...field}
                    error={Boolean(errors.name)}
                    {...(errors.name && {
                      helperText: errors.name.message
                    })}
                    label={t('Name')}
                    variant='outlined'
                    size='small'
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name='username'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, ...field } }) => (
                  <TextField
                    value={value ?? ''}
                    {...field}
                    error={Boolean(errors.username)}
                    {...(errors.username && {
                      helperText: errors.username.message
                    })}
                    label={t('Username')}
                    variant='outlined'
                    size='small'
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, ...field } }) => (
                  <TextField
                    value={value ?? ''}
                    onChange={e => {
                      onChange(e)

                      if (e.target.value != '') {
                        if (oldUser?.user.email == e.target.value) setIsEmailAvailable(true)
                        else checkEmailAvailable(e.target.value)
                      } else {
                        setIsEmailAvailable(true)
                      }
                    }}
                    {...field}
                    label='Email'
                    variant='outlined'
                    size='small'
                    fullWidth
                    error={Boolean(errors.email) || !isEmailAvailable}
                    placeholder='johndoe@email.com'
                    {...(errors.email && { helperText: errors.email.message })}
                    {...(!isEmailAvailable && { helperText: msgErrEmail })}
                    InputProps={{
                      endAdornment: isLoadingCheckEmailAvailable ? (
                        <InputAdornment position='end'>
                          <Icon icon={'eos-icons:loading'} fontSize={18} />
                        </InputAdornment>
                      ) : isEmailAvailable && !Boolean(errors.email) ? (
                        getValues().email ? (
                          <InputAdornment position='end'>
                            <Icon icon={'bi:check'} fontSize={18} color='green' />
                          </InputAdornment>
                        ) : (
                          <></>
                        )
                      ) : (
                        <InputAdornment position='end'>
                          <IconButton onClick={() => setValue('email', '')} edge='end'>
                            <Icon icon={'bi:x'} fontSize={18} color='red' />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name='phone'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, ...field } }) => (
                  <TextField
                    value={value ?? ''}
                    {...field}
                    onChange={e => {
                      const value = formatPhone(e.target.value)
                      // input only number and +
                      onChange(value)

                      if (value != '') {
                        if (oldUser?.user.phone == value) setIsPhoneAvailable(true)
                        else checkPhoneAvailable(value)
                      } else {
                        setIsPhoneAvailable(true)
                      }
                    }}
                    label={t('Phone Number')}
                    variant='outlined'
                    size='small'
                    type='tel'
                    fullWidth
                    error={Boolean(errors.phone) || !isPhoneAvailable}
                    {...(errors.phone && {
                      helperText: errors.phone.message
                    })}
                    {...(!isPhoneAvailable && { helperText: msgErrPhone })}
                    InputProps={{
                      inputMode: 'tel',
                      endAdornment: isLoadingCheckPhoneAvailable ? (
                        <InputAdornment position='end'>
                          <Icon icon={'eos-icons:loading'} fontSize={18} />
                        </InputAdornment>
                      ) : isPhoneAvailable && !Boolean(errors.phone) ? (
                        getValues().phone ? (
                          <InputAdornment position='end'>
                            <Icon icon={'bi:check'} fontSize={18} color='green' />
                          </InputAdornment>
                        ) : (
                          <></>
                        )
                      ) : (
                        <InputAdornment position='end'>
                          <IconButton onClick={() => setValue('phone', '')} edge='end'>
                            <Icon icon={'bi:x'} fontSize={18} color='red' />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <SelectCustom
                readOnly
                options={[oldUser?.department?.name ?? '']}
                placeholder={t('Department') ?? 'Department'}
                label={t('Department') ?? 'Department'}
                isFloating
              />
            </Grid>
            <Grid item xs={6}>
              <SelectCustom
                readOnly
                options={[oldUser?.role?.name ?? '']}
                placeholder={t('Role') ?? 'Role'}
                label={t('Role') ?? 'Role'}
                isFloating
              />
            </Grid>
            {/* <Grid item xs={6}>
              <FormControl size='small' fullWidth>
                <InputLabel id='demo-simple-select-label'>Outlet</InputLabel>
                <Select labelId='demo-simple-select-labels' id='demo-simple-select' label='Role'>
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}
            {/* <Grid item xs={6}></Grid> */}
            <Grid item xs={12} display={'flex'} gap={4}>
              <Button fullWidth variant='outlined' onClick={toggleChangePasswordDialog}>
                {t('Change Password')}
              </Button>
              <Button fullWidth variant='outlined' onClick={toggleChangePinDialog}>
                {t('Change PIN')}
              </Button>
            </Grid>
          </Grid>
          <Box mt={6} sx={{ display: 'flex', justifyContent: 'end' }}>
            <Button variant='tonal' color='secondary' onClick={handleClose}>
              {t('Cancel')}
            </Button>
            <Button
              type='submit'
              variant='contained'
              disabled={isLoadingProfileData || loadingUpdateProfile || loadingUpdateProfilePicture}
              sx={{ ml: 3 }}
            >
              {t('Submit')}
            </Button>
          </Box>
        </form>
        <FormChangePasswordDialog
          open={changePasswordDialogOpen}
          toggle={toggleChangePasswordDialog}
        />
        <FormChangePinDialog open={changePinDialogOpen} toggle={toggleChangePinDialog} />
      </Box>
    </Dialog>
  )
}

export default DialogEditProfile
