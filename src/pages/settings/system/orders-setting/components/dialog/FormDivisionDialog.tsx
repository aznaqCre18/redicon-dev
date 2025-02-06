import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, Checkbox, FormControlLabel, FormGroup } from '@mui/material'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import CustomTextField from 'src/@core/components/mui/text-field'
import SelectChip from 'src/components/form/select/SelectChip'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { useApp } from 'src/hooks/useApp'
import { useDataLoading } from 'src/hooks/useDataLoading'
import { membershipService } from 'src/services/membership'
import { outletService } from 'src/services/outlet/outlet'
import { divisionService } from 'src/services/vendor/division'
import { MembershipType } from 'src/types/apps/membershipType'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { DivisionDetailType, DivisionSchema, DivisionType } from 'src/types/apps/vendor/division'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { ResponseType } from 'src/types/response/response'
import { pluck } from 'src/utils/arrayUtils'
import Dialog from 'src/views/components/dialogs/Dialog'

interface DialogType {
  open: boolean
  toggle: () => void
  selectData: DivisionDetailType | null
}

const FormDivisionDialog = (props: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { open, toggle, selectData } = props

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<DivisionType>({
    mode: 'all',
    resolver: yupResolver(DivisionSchema)
  })

  const [membershipList, setMembershipList] = React.useState<MembershipType[]>([])
  const [membershipLevel, setMembershipLevel] = React.useState<number | undefined>()

  useQuery(['membership-list-active'], {
    queryFn: () =>
      membershipService.getList({
        is_active: 'true',
        ...maxLimitPagination
      }),
    onSuccess: data => {
      setMembershipList(data.data.data)
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [outletIdsDefault, setOutletIdsDefault] = React.useState<number[] | undefined>()
  const [outletIds, setOutletIds] = React.useState<number[]>([])
  const {
    data: outletData,
    onLoaded: setOutletData,
    isLoading: isLoadingOutlet
  } = useDataLoading<OutletType[]>([])

  useQuery(['outlet-list'], {
    enabled: Boolean(open),
    queryFn: () => outletService.getListOutlet({ ...maxLimitPagination }),
    onSuccess: data => {
      const outlets = data.data.data

      if (outlets && outlets.length > 0) {
        if (outlets.length == 1) {
          setOutletIdsDefault([outlets[0].id])
          setOutletIds([outlets[0].id])
        } else {
          let defaultOutlet = outlets.find(item => item.is_default)
          if (!defaultOutlet) {
            defaultOutlet = outlets[0]
          }

          // setValue('outlet_ids', [defaultOutlet.id], {
          //   shouldValidate: true,
          //   shouldDirty: true
          // })
        }
      }
      setOutletData(data.data.data ?? [])
    }
  })

  const { mutate, isLoading } = useMutation(divisionService.post, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('division-list')

      if (mappingCreateAndDelete) {
        mappingCreateAndDelete([], outletIds ?? [], (data as any).data.data.id)
      }

      handleClose()
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(divisionService.patch, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('division-list')

      if (mappingCreateAndDelete) {
        mappingCreateAndDelete(
          pluck((selectData?.outlets ?? []) as any, 'id') ?? [],
          outletIds ?? [],
          (data as any).data.data.id
        )
      }

      handleClose()
    }
  })

  const { mutate: mutateOutletAdd } = useMutation(divisionService.mapOutletCreate, {
    onSuccess: () => {
      queryClient.invalidateQueries('division-list')
    }
  })

  const { mutate: mutateOutletDelete } = useMutation(divisionService.deleteOutletMapping, {
    onSuccess: () => {
      queryClient.invalidateQueries('division-list')
    }
  })

  const mappingCreateAndDelete = (
    oldsOutlet: number[],
    newOutlets: number[],
    division_id: number
  ) => {
    const addOutlet = newOutlets.filter(item => !oldsOutlet.includes(item))
    const deleteOutlet = oldsOutlet.filter(item => !newOutlets.includes(item))

    if (addOutlet.length > 0) {
      mutateOutletAdd(addOutlet.map(item => ({ division_id: division_id, outlet_id: item })))
    }

    if (deleteOutlet.length > 0) {
      mutateOutletDelete(
        deleteOutlet.map(item => ({
          division_id: division_id,
          outlet_id: item
        }))
      )
    }
  }

  const onSubmit = (data: DivisionType) => {
    console.log(data)

    toggle()
    reset()

    if (selectData) {
      mutateEdit({ id: selectData.division.id, data: data })
    } else {
      mutate(data)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  useEffect(() => {
    if (open) {
      if (selectData) {
        setValue('name', selectData.division.name)
        setValue('selling_price', selectData.division.selling_price)
        setValue('unique_order_number', selectData.division.unique_order_number)

        setOutletIds(pluck(selectData.outlets ?? [], 'id'))
        setMembershipLevel(selectData.division.selling_price)
      } else {
        setValue('name', '')
        setValue('selling_price', 1)
        setValue('unique_order_number', false)

        setOutletIds([])
        setMembershipLevel(1)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectData, open])

  useEffect(() => {
    setValue('selling_price', membershipLevel ?? 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipLevel])

  return (
    <Dialog
      title={t(selectData ? t('Edit') : t('Add')) + ' ' + t('Division')}
      open={open}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {isLoadingOutlet ||
          (outletData.length > 1 && (
            <Box mb={2}>
              <SelectChip
                multiple
                value={outletIds}
                label={t('Outlet') ?? 'Outlet'}
                options={outletData}
                placeholder='Outlet'
                labelKey='name'
                optionKey={'id'}
                onSelect={item => {
                  setOutletIds(item ? pluck(item, 'id') : [])
                }}
                onSelectAll={() => {
                  setOutletIds(pluck(outletData, 'id'))
                }}
                {...errorInput(errors, 'outlet_ids')}
              />
            </Box>
          ))}

        <Controller
          name='name'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ my: 4 }}
              label={t('Division Name')}
              {...errorInput(errors, 'name')}
            />
          )}
        />

        <SelectCustom
          value={membershipLevel}
          onSelect={(e: any) => {
            console.log(e)

            setMembershipLevel(e.level)
          }}
          fullWidth
          sx={{ mb: 4 }}
          label={t('Membership') ?? 'Membership'}
          options={membershipList}
          optionKey={'level'}
          labelKey={'name'}
          {...errorInput(errors, 'membership')}
        />

        <FormGroup sx={{ mt: 2 }}>
          <Controller
            name='unique_order_number'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} {...field} />}
                label={t('Unique Order Number')}
              />
            )}
          />
        </FormGroup>

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

export default FormDivisionDialog
