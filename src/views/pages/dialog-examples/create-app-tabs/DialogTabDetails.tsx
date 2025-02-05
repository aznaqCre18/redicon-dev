// ** React Imports
import { useState, ChangeEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Radio from '@mui/material/Radio'
import Typography from '@mui/material/Typography'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Config Import
import themeConfig from 'src/configs/themeConfig'

// ** Custom Avatar Component
import CustomAvatar from 'src/@core/components/mui/avatar'

const TabDetails = () => {
  const [value, setValue] = useState<string>('ecommerce')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
  }

  return (
    <div>
      <CustomTextField
        fullWidth
        sx={{ mb: 4 }}
        label='Application Name'
        placeholder={`${themeConfig.templateName} Admin`}
      />
      <Typography variant='h5' sx={{ mb: 4 }}>
        Category
      </Typography>
      <Box sx={{ mb: 8 }}>
        <Box
          onClick={() => setValue('crm')}
          sx={{
            mb: 6,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CustomAvatar
              skin='light'
              color='info'
              variant='rounded'
              sx={{ mr: 3, width: 48, height: 48 }}
            >
              <Icon icon='tabler:briefcase' />
            </CustomAvatar>
            <div>
              <Typography>CRM Application</Typography>
              <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                Scales with any business
              </Typography>
            </div>
          </Box>
          <Radio value='crm' onChange={handleChange} checked={value === 'crm'} />
        </Box>
        <Box
          onClick={() => setValue('ecommerce')}
          sx={{
            mb: 6,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CustomAvatar
              skin='light'
              color='success'
              variant='rounded'
              sx={{ mr: 3, width: 48, height: 48 }}
            >
              <Icon icon='tabler:shopping-cart' />
            </CustomAvatar>
            <div>
              <Typography>Ecommerce Platforms</Typography>
              <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                Grow Your Business With App
              </Typography>
            </div>
          </Box>
          <Radio value='ecommerce' onChange={handleChange} checked={value === 'ecommerce'} />
        </Box>
        <Box
          onClick={() => setValue('learning')}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CustomAvatar
              skin='light'
              color='error'
              variant='rounded'
              sx={{ mr: 3, width: 48, height: 48 }}
            >
              <Icon icon='tabler:award' />
            </CustomAvatar>
            <div>
              <Typography>Online Learning platform</Typography>
              <Typography variant='caption'>Start learning today</Typography>
            </div>
          </Box>
          <Radio value='learning' onChange={handleChange} checked={value === 'learning'} />
        </Box>
      </Box>
    </div>
  )
}

export default TabDetails
