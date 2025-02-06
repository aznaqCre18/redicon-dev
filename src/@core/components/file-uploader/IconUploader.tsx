// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useDropzone } from 'react-dropzone'
import { Button } from '@mui/material'

interface FileProp {
  name: string
  type: string
  size: number
}

const IconUploader = () => {
  // ** State
  const [files, setFiles] = useState<File[]>([])

  // ** Hooks
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    onDrop: (acceptedFiles: File[]) => {
      setFiles(acceptedFiles.map((file: File) => Object.assign(file)))
    }
  })

  const img = files.map((file: FileProp) => (
    <img
      key={file.name}
      alt={file.name}
      src={URL.createObjectURL(file as any)}
      style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 6 }}
    />
  ))

  return (
    <Box {...getRootProps({ className: 'dropzone' })}>
      <input {...getInputProps()} />
      {files.length ? (
        <Box
          sx={{
            display: 'grid',
            placeContent: 'center'
          }}
        >
          {img}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            textAlign: 'center',
            alignItems: 'center',
            flexDirection: 'column'
          }}
        >
          <Button>
            <Box
              sx={{
                width: 100,
                height: 100,
                display: 'flex',
                borderRadius: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.08)`
              }}
            >
              <Icon icon='tabler:upload' fontSize='2rem' />
            </Box>
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default IconUploader
