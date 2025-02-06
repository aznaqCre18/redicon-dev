import { Icon } from '@iconify/react'
import { Avatar, Box, Button, Grid, InputLabel, Typography } from '@mui/material'
import { ChangeEvent, useState } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import TextFieldNumber from 'src/components/form/TextFieldNumber'

const DiantarTab = () => {
  // upload
  const [imgSrc, setImgSrc] = useState('')
  const [, setFiles] = useState<File | null>(null)
  const [inputFileValue, setInputFileValue] = useState('')

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

  return (
    <Box>
      <Grid container columnSpacing={2}>
        <Grid item xs={12} md={4}>
          <Box display='flex' justifyContent={'center'} marginBottom={4}>
            <Button component='label'>
              <Avatar
                variant='square'
                src={imgSrc}
                sx={{ width: '150px', height: '150px' }}
                alt='Profile Pic'
              >
                <Box alignItems={'center'} display={'flex'} flexDirection={'column'}>
                  <Icon icon='bi:image' width={24} height={24} />
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
            </Button>
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          <CustomTextField label='Kode' defaultValue={'Self Pickup'} fullWidth />
          <CustomTextField label='Nama' defaultValue={'Di Antar'} fullWidth />
          <TextFieldNumber
            prefix='Rp '
            InputProps={{
              inputProps: {
                min: 0
              }
            }}
            label='Harga'
            defaultValue={0}
            fullWidth
          />

          <div>
            <InputLabel>Aktifkan Diantar:</InputLabel>
            <input type='radio' name='status' id='aktifkan' defaultChecked={true} />
            <label htmlFor='aktifkan'>Aktifkan</label>
            <input type='radio' name='status' id='nontaktifkan' />
            <label htmlFor='nontaktifkan'>Nonaktifkan</label>
          </div>

          <Button variant='contained' sx={{ mt: 4 }}>
            Simpan
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DiantarTab
