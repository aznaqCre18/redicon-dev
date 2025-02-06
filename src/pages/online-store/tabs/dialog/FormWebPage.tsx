// ** React Imports

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
// ** Third Party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
// ** Icon Imports
// ** Types Imports
import Dialog from 'src/views/components/dialogs/Dialog'
import { FormLabel, Typography, useTheme } from '@mui/material'
import toast from 'react-hot-toast'
import { ShortcutSchema } from 'src/types/apps/shortcutType'

import { EditorProps } from 'react-draft-wysiwyg'
import { ContentState, EditorState, convertFromHTML, convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const Editor = dynamic<EditorProps>(() => import('react-draft-wysiwyg').then(mod => mod.Editor), {
  ssr: false
})

interface props {
  open: boolean
  toggle: () => void
  // selectShorcut: ShortcutType | null
}

const FormWebPage = (props: props) => {
  const { t } = useTranslation()
  const theme = useTheme()
  // ** Props
  // const queryClient = useQueryClient()
  const { open, toggle } = props

  const [descriptionRTE, setDescriptionRTE] = useState<EditorState | undefined>(undefined)

  const defaultValue = {
    name: '',
    slug: '',
    description: '',
    url: '',
    status: true,
    image: ''
  }

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: defaultValue,
    mode: 'all',
    resolver: yupResolver(ShortcutSchema)
  })

  // const { mutate, isLoading } = useMutation(shortcutService.post, {
  //   onSuccess: (data: any) => {
  //     // const resp = data.data.data
  //     // const id = resp.id

  //     // if (files) {
  //     //   updateImage({ id: id, file: files })
  //     // }

  //     toast.success(t((data as unknown as ResponseType).data.message))
  //     toggle()
  //     queryClient.invalidateQueries('shortcut-list')

  //     reset(defaultValue)
  //   }
  // })

  // const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(shortcutService.patch, {
  //   onSuccess: (data: any) => {
  //     // const resp = data.data.data
  //     // const id = resp.id

  //     // if (files) {
  //     //   updateImage({ id: id, file: files })
  //     // }

  //     queryClient.invalidateQueries('shortcut-list')

  //     toast.success(t((data as unknown as ResponseType).data.message))
  //     toggle()
  //     reset(defaultValue)
  //   }
  // })

  const onSubmit = () =>
    // data: ShortcutData
    {
      toast.success(t('Data created successfully.'))
      toggle()
      reset(defaultValue)
      // if (selectShortcut && selectShortcut.id) {
      //   mutateEdit({ id: selectShortcut.id, data: data })
      // } else {
      //   if (files1) {
      //     mutate({ data: data, file: files1 })
      //   }
      // }
    }

  const handleClose = () => {
    toggle()
    reset()
  }

  // useEffect(() => {
  //   if (selectShortcut) {
  //     // if (selectBanner.image != '') setImgSrc(getImageAwsUrl(selectBanner.image))
  //     // else setImgSrc('')

  //     setValue('name', selectShortcut.name)
  //     setValue('slug', selectShortcut.slug)
  //     setValue('description', selectShortcut.description)
  //     setValue('url', selectShortcut.url)
  //     setValue('status', selectShortcut.status)
  //     setValue('image', selectShortcut.image)

  //     setImgSrc1(getImageAwsUrl(selectShortcut.image))
  //   } else {
  //     setImgSrc1(undefined)
  //   }
  // }, [selectShortcut, setValue])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const htmlToDraftBlocks = (html: string) => {
    const blocksFromHtml = convertFromHTML(html)
    const { contentBlocks, entityMap } = blocksFromHtml
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap)
    const editorState = EditorState.createWithContent(contentState)

    return editorState
  }

  return (
    <Dialog title={'Add Web Page'} open={open} onClose={handleClose}>
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
              label='Title'
              onChange={e => {
                setValue('slug', e.target.value.replace(/\W+/g, '-'))
                field.onChange(e)
              }}
              placeholder=''
              error={Boolean(errors['name'])}
              {...(errors['name'] && { helperText: errors['name'].message })}
            />
          )}
        />
        <FormLabel sx={{ mb: 1 }}>Page Content</FormLabel>
        <Editor
          editorState={descriptionRTE}
          toolbarClassName='demo-toolbar-custom'
          onEditorStateChange={e => {
            setDescriptionRTE(e)

            setValue('description', draftToHtml(convertToRaw(e.getCurrentContent())))
          }}
          wrapperStyle={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 4
          }}
          editorStyle={{
            minHeight: 200,
            padding: 8
          }}
          toolbarStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none'
          }}
        />
        {/* <InputTextArea
                {...field}
                minRows={3}
                sx={theme =>
                  Boolean(errors.description)
                    ? {
                        borderColor: theme.palette.error.main
                      }
                    : {}
                }
              /> */}
        <Typography color={'error'} variant='body2'>
          {errors.description && errors.description.message}
        </Typography>
        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            // disabled={isLoading || isLoadingEdit}
            type='submit'
            variant='contained'
            sx={{ ml: 3 }}
          >
            Submit
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default FormWebPage
