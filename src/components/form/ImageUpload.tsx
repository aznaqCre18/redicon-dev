import { Icon } from '@iconify/react'
import { Avatar, Box, Button, IconButton, Typography, useTheme } from '@mui/material'
import { ChangeEvent, useEffect, useState } from 'react'

export const ImageUpload = ({
  disabled,
  size,
  label,
  imagePreview,
  onDelete,
  onChange
}: {
  disabled?: boolean
  size?: { width: number; height: number }
  label?: string
  imagePreview?: string
  onDelete?: () => void
  onChange?: (file: File) => void
}) => {
  const theme = useTheme()

  const [_imagePreview, setImagePreview] = useState<string | undefined>(imagePreview)

  useEffect(() => {
    setImagePreview(imagePreview)
  }, [imagePreview])

  const handleInputChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      const file = files[0]
      if (file.size > 2097152) {
        alert('max file is 2MB')

        return
      }

      onChange?.(file)

      reader.onload = () => {
        const imageRenderStr = reader.result as string
        setImagePreview(imageRenderStr)
      }
      reader.readAsDataURL(files[0])
    }
  }

  const handleDelete = () => {
    setImagePreview(undefined)
    onDelete?.()
  }

  return (
    <Box
      display={'flex'}
      position={'relative'}
      sx={{
        '&:hover .hover-button': {
          display: 'flex'
        }
      }}
    >
      {_imagePreview && (
        <Box
          className='hover-button'
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 8,
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            rowGap: '2px'
          }}
        >
          {onDelete && (
            <IconButton
              onClick={() => {
                if (_imagePreview) handleDelete()
              }}
              size='small'
              color='success'
              sx={{
                color: theme.palette.common.black,
                background: theme.palette.grey[100],
                borderRadius: 0.4,
                '&:hover': {
                  background: theme.palette.grey[400],
                  color: theme.palette.common.black
                }
              }}
            >
              <Icon icon='bi:trash' width={16} height={16} />
            </IconButton>
          )}
        </Box>
      )}
      <Button
        disabled={disabled}
        component='label'
        sx={{
          p: 1
        }}
      >
        <Avatar
          variant='square'
          src={_imagePreview}
          sx={theme => ({
            display: 'flex',
            flexDirection: 'column',
            rowGap: '8px',
            background: theme.palette.background.paper,
            width: size ? size.width : '55px',
            height: size ? size.height : '55px',
            border: `1px dashed ${theme.palette.divider}`
          })}
          alt={label ?? 'Upload Photo'}
        >
          <Icon icon='bi:image' width={24} height={24} />
          {label && <Typography variant='caption'>{label}</Typography>}
        </Avatar>
        <input
          hidden
          type='file'
          accept='image/png, image/jpeg'
          onChange={e => handleInputChange(e)}
        />
      </Button>
    </Box>
  )
}
