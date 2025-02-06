// ** React Imports

// ** MUI Imports
import Button from '@mui/material/Button'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
// ** Third Party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
// ** Types Imports
import { UnitSchema, UnitType } from 'src/types/apps/unitType'
import { useEffect, useState } from 'react'
import { unitService } from 'src/services/unit'
import { useMutation, useQueryClient } from 'react-query'
import Dialog from 'src/views/components/dialogs/Dialog'
import { Box, Grid, Typography } from '@mui/material'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { useTranslation } from 'react-i18next'
import { devMode } from 'src/configs/dev'
import { useApp } from 'src/hooks/useApp'

interface DialogType {
  open: boolean
  toggle: () => void
  selectUnit: UnitType | null
}

const FormUnitDialog = (props: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  // ** Props
  const { open, toggle, selectUnit } = props

  useEffect(() => {
    if (open) {
      setunitDetailList([])
    }
  }, [open])

  const [unitDetailList, setunitDetailList] = useState<string[]>([])

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<UnitType>({
    mode: 'all',
    resolver: yupResolver(UnitSchema)
  })

  const { mutate, isLoading } = useMutation(unitService.postUnit, {
    onSuccess: data => {
      queryClient.invalidateQueries('units-list')

      toast.success(t((data as unknown as ResponseType).data.message))
      reset()
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(unitService.patchUnit, {
    onSuccess: data => {
      queryClient.invalidateQueries('units-list')

      toast.success(t((data as unknown as ResponseType).data.message))
      toggle()
      reset()
    }
  })

  const onSubmit = (data: UnitType) => {
    if (data.id) {
      mutateEdit(data)
    } else {
      mutate(data)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  useEffect(() => {
    if (selectUnit) {
      setValue('id', selectUnit.id)

      setValue('name', selectUnit.name)
      setValue('quantity', selectUnit.quantity)
    } else {
      setValue('id', null)
      setValue('name', '')
      setValue('quantity', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectUnit, open])

  return (
    <Dialog
      title={(selectUnit ? t('Edit') : t('Add')) + ' ' + t('Unit')}
      open={open}
      onClose={handleClose}
    >
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
              label={t('Name')}
              placeholder='pcs'
              {...errorInput(errors, 'name')}
            />
          )}
        />

        {devMode ? (
          <>
            <Typography variant='body1' sx={{ mb: 2 }}>
              {t('Unit Details')}
            </Typography>

            <Grid container spacing={2} columns={11} columnSpacing={4} mb={2}>
              <Grid item xs={1} textAlign={'end'} alignSelf={'center'}>
                No
              </Grid>
              <Grid item xs={5}>
                {t('Name')} {t('Unit')}
              </Grid>
              <Grid item xs={5}>
                {t('Quantity')}
              </Grid>
            </Grid>
            {[...Array(unitDetailList.length + 1).keys()]
              .filter(item => item < 5)
              .map(index => (
                <Grid container columns={11} key={index} columnSpacing={4}>
                  <Grid item xs={1} textAlign={'end'} alignSelf={'center'}>
                    {index + 1}
                  </Grid>
                  <Grid item xs={5}>
                    <CustomTextField
                      fullWidth
                      size='small'
                      onChange={e => {
                        if (e.target.value) {
                          if (unitDetailList.length == index) {
                            setunitDetailList([...unitDetailList, ''])
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    {index == 0 ? (
                      <Controller
                        name='quantity'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextFieldNumber
                            {...field}
                            fullWidth
                            placeholder='1'
                            {...errorInput(errors, 'quantity')}
                          />
                        )}
                      />
                    ) : (
                      <TextFieldNumber fullWidth />
                    )}
                  </Grid>
                </Grid>
              ))}
          </>
        ) : (
          <Controller
            name='quantity'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextFieldNumber
                {...field}
                isFloat
                fullWidth
                label={t('Quantity')}
                placeholder='1'
                {...errorInput(errors, 'quantity')}
              />
            )}
          />
        )}

        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            {t('Cancel')}
          </Button>
          <Button
            disabled={isLoading || isLoadingEdit}
            type='submit'
            variant='contained'
            sx={{ ml: 3 }}
          >
            {t('Submit')}
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default FormUnitDialog
