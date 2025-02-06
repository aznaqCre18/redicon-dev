import { Box, Button, capitalize, Divider, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import CustomTextField from 'src/components/form/CustomTextField'
import { productService } from 'src/services/product'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'

type DialogImportProps = {
  open: boolean
  closeDialog: () => void
  type: 'single' | 'multiple'
}

const DialogImport = (props: DialogImportProps) => {
  // ref
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  // * i18n
  const { t } = useTranslation()

  // * States
  const [file, setFile] = React.useState<File | null>(null)
  const [msgError, setMsgError] = React.useState<string>('')

  // * Mutation
  const { mutate: downloadImportTemplateSingleVariant } = useMutation(
    productService.downloadImportTemplateSingleVariant,
    {
      onSuccess: data => {
        const url = window.URL.createObjectURL(new Blob([data.data as any]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'product-import-template-single-variant.xlsx')
        link.click()
      }
    }
  )

  const { mutate: downloadImportTemplateMultipleVariant } = useMutation(
    productService.downloadImportTemplateMultipleVariant,
    {
      onSuccess: data => {
        const url = window.URL.createObjectURL(new Blob([data.data as any]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'product-import-template-multiple-variant.xlsx')
        link.click()
      }
    }
  )

  const { mutate: importSigleVariant } = useMutation(productService.importSingleVariant, {
    onSuccess: response => {
      toast.success(t((response as unknown as ResponseType).data.message))
    }
  })

  const { mutate: importMultipleVariant } = useMutation(productService.importMultipleVariant, {
    onSuccess: response => {
      toast.success(t((response as unknown as ResponseType).data.message))
    }
  })

  // * Functions
  const clearInput = () => {
    setFile(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  // * Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // cek apakah file yang diupload adalah file excel
      const file = e.target.files[0]
      const fileType = file.type
      const validFileTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

      if (!validFileTypes.includes(fileType)) {
        setMsgError(
          t('File type is not valid only .xlsx file is allowed') ??
            'File type is not valid only .xlsx file is allowed'
        )
        clearInput()

        return
      }

      setFile(e.target.files[0])

      if (msgError) {
        setMsgError('')
      }
    } else {
      clearInput()
    }
  }

  const handleUpload = () => {
    if (file) {
      if (props.type == 'single') importSigleVariant(file)
      else importMultipleVariant(file)
    } else {
      setMsgError(t('File is required') ?? 'File is required')
    }
  }

  useEffect(() => {
    if (props.open) {
      clearInput()
    }
  }, [props.open])

  return (
    <Dialog
      open={props.open}
      onClose={props.closeDialog}
      title={'Import ' + t('Product') + ' ' + capitalize(props.type) + ' ' + t('Variant')}
    >
      <Box>
        <Box display={'flex'} gap={2} alignItems={'end'}>
          <CustomTextField
            ref={inputRef}
            fullWidth
            label={t('File')}
            type='file'
            variant='outlined'
            name='file'
            required
            autoFocus
            onChange={handleInputChange}
            error={msgError !== ''}
          />
          <Box>
            <Button variant='contained' color='primary' onClick={handleUpload}>
              {t('Upload')}
            </Button>
          </Box>
        </Box>
        {msgError && (
          <Box mt={2}>
            <Typography color='error'>{msgError}</Typography>
          </Box>
        )}

        {/* Cara Import Product */}
        <Box mt={2}>
          <Divider />
          <Typography variant='h5' my={2} fontWeight={'bold'}>
            {t('How to import product')}
          </Typography>
          <Box display={'flex'} flexDirection={'column'} gap={2}>
            <Box>
              {t('1. Download the template file')}
              <Button
                variant='outlined'
                color='primary'
                size='small'
                sx={{
                  ml: 2,
                  mb: 2
                }}
                onClick={() =>
                  props.type == 'single'
                    ? downloadImportTemplateSingleVariant()
                    : downloadImportTemplateMultipleVariant()
                }
              >
                {t('Download') + ' Template' + ' ' + capitalize(props.type) + ' ' + t('Variant')}
              </Button>
            </Box>
            <Box>{t('2. Fill the data in the template file')}</Box>
            <Box>
              <Box ml={4} fontWeight={'bold'}>
                Format:
              </Box>
              <Box
                sx={theme => ({
                  backgroundColor: theme.palette.divider,
                  borderRadius: 1,
                  padding: 2,
                  marginLeft: 4
                })}
              >
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 0
                  }}
                >
                  <li
                    style={{
                      listStyle: 'none'
                    }}
                  >
                    {t('1. Column with (*) means required')}
                  </li>
                  <li
                    style={{
                      listStyle: 'none'
                    }}
                  >
                    {t('2. Column with (ABC) means required with letters only')}
                  </li>
                  <li
                    style={{
                      listStyle: 'none'
                    }}
                  >
                    {t(
                      '3. Column with (ABC,ABC) means required with letters only, and can be more than one separated by (,)'
                    )}
                  </li>
                  <li
                    style={{
                      listStyle: 'none'
                    }}
                  >
                    {t('4. Column with (123) means required with numbers only')}
                  </li>
                  <li
                    style={{
                      listStyle: 'none'
                    }}
                  >
                    {t('5. Column with (A1B2C3) means required with letters and numbers')}
                  </li>
                </ul>
              </Box>
            </Box>
            <Box>{t('3. Upload the file')}</Box>
          </Box>
        </Box>
      </Box>
    </Dialog>
  )
}

export default DialogImport
