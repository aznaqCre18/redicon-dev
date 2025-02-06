import { Icon } from '@iconify/react'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import TextFieldNumberOnBlur from 'src/components/form/TextFieldNumberOnBlur'
import MuiSwitch from 'src/pages/settings/components/Switch'
import { posDurationService } from 'src/services/point-of-sales/duration'
import { DurationType } from 'src/types/apps/point-of-sales/duration'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { ResponseType } from 'src/types/response/response'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'

const DurationSection = ({ outletId }: { outletId: string }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [deleteId, setDeleteId] = useState<number | undefined>(undefined)
  const [durationData, setDurationData] = useState<DurationType[]>([])

  useQuery(['duration-data', outletId], {
    enabled: !!outletId,
    queryFn: () => posDurationService.getList({ ...maxLimitPagination, outlet_id: outletId }),
    onSuccess: data => {
      const datas = data.data.data ?? []

      setDurationData(datas)
    }
  })

  const deleteMutation = useMutation(posDurationService.delete, {
    onSuccess: (data: any) => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries(['duration-data', outletId])
    }
  })

  const deleteDuration = (id: number) => {
    deleteMutation.mutate(id)
    setDeleteId(undefined)
  }

  const updateMutation = useMutation(posDurationService.update, {
    onSuccess: (data: any) => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries(['duration-data', outletId])
    }
  })

  const createMutation = useMutation(posDurationService.create, {
    onSuccess: (data: any) => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries(['duration-data', outletId])
    }
  })

  const createDuration = (minutes: number) => {
    createMutation.mutate({ minutes: minutes, outlet_id: Number(outletId), is_active: true })
  }

  const updateDuration = (id: number, minutes: number) => {
    updateMutation.mutate({ id: id, data: { minutes: minutes } })
  }

  const updateActive = (id: number, is_active: boolean) => {
    updateMutation.mutate({ id: id, data: { is_active: is_active } })
  }

  return (
    <Box maxWidth={'sm'} mt={2}>
      <Box display={'flex'} justifyContent={'flex-end'} mb={2}>
        <Button variant='contained' color='primary' onClick={() => createDuration(0)}>
          <Icon icon='tabler:plus' style={{ marginRight: 8 }} />
          {t('Add')} {t('Duration')}
        </Button>
      </Box>
      <Table>
        <TableHead sx={{ backgroundColor: theme => theme.palette.customColors.tableHeaderBg }}>
          <TableRow>
            <TableCell>{t('Duration')}</TableCell>
            <TableCell width={'100px'}>{t('Active')}</TableCell>
            <TableCell width={'100px'}>{''}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {durationData.map(item => (
            <TableRow key={item.id}>
              <TableCell>
                <TextFieldNumberOnBlur
                  defaultValue={item.minutes}
                  onBlur={value => updateDuration(item.id, (value ?? 0) as number)}
                  isFloat
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>{t('Minutes')}</InputAdornment>
                  }}
                />
              </TableCell>
              <TableCell>
                <MuiSwitch
                  onChange={() => updateActive(item.id, !item.is_active)}
                  defaultChecked={item.is_active}
                />
              </TableCell>
              <TableCell>
                <IconButton>
                  <Icon icon='tabler:trash' onClick={() => setDeleteId(item.id)} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DialogConfirmation
        open={!!deleteId}
        handleClose={() => setDeleteId(undefined)}
        loading={deleteMutation.isLoading}
        name='Duration'
        handleConfirm={() => deleteDuration(deleteId ?? 0)}
      />
    </Box>
  )
}

export default DurationSection
