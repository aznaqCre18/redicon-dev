import React, { useEffect, useState } from 'react'
import SelectChip from '../form/select/SelectChip'
import { useQuery } from 'react-query'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { pluck } from 'src/utils/arrayUtils'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { deviceService } from 'src/services/vendor/settings/point-of-sales/device'
import { DeviceType } from 'src/types/apps/vendor/settings/point-of-sales/device'
import SelectCustom from '../form/select/SelectCustom'

const label = 'Device'
const queryKey = 'filter-device-list'
const service = deviceService.getList
type DataType = DeviceType

type FilterProps = {
  filterBy?: {
    outlet_id?: number
  }
  label?: string
  value?: number[]
  onChange: (value: number[] | undefined) => void
  multiple?: boolean
  width?: any
  minWidthPaper?: number
  hideIfLessThanOne?: boolean
}

const FilterDevice = ({ hideIfLessThanOne = true, ...props }: FilterProps) => {
  const { t } = useTranslation()
  const _multiple = props.multiple ?? true
  const [datas, setDatas] = useState<DataType[]>([])
  const _value: number[] = props.value ?? []

  const setValue = (value: number[]) => {
    props.onChange(value)
  }

  const { isLoading } = useQuery([queryKey, props.filterBy?.outlet_id], {
    queryFn: () =>
      service({ ...maxLimitPagination, outlet_id: props.filterBy?.outlet_id ?? undefined }),
    onSuccess: data => {
      setDatas(data.data.data ?? [])
    },
    cacheTime: 0
  })

  const selectedArr = _value

  useEffect(() => {
    if (datas.length === 1) {
      setValue([datas[0].id])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datas])

  if (isLoading) {
    return null
  }

  if (datas.length <= 1 && hideIfLessThanOne) {
    return null
  }

  const datasFilter = datas
  // ? datas.filter(item =>
  //     props.filterBy
  //       ? props.filterBy?.outlet_id == undefined
  //         ? false
  //         : item.outlet_id === props.filterBy?.outlet_id
  //       : true
  //   )
  // : []

  return (
    <Box width={props.width || 200}>
      {_multiple ? (
        <SelectChip
          mini
          error={false}
          minWidthPaper={props.minWidthPaper || 240}
          options={datasFilter}
          label={props.label ? t(props.label) ?? props.label : t(label) ?? label}
          isFloating
          labelKey='device_name'
          optionKey='id'
          placeholder={props.label ? t(props.label) ?? props.label : t(label) ?? label}
          onSelect={item => {
            setValue(pluck(item ?? [], 'id'))
          }}
          value={selectedArr}
          onSelectAll={() => {
            setValue(pluck(datas, 'id'))
          }}
        />
      ) : (
        <SelectCustom
          isFloating
          label={props.label ? t(props.label) ?? props.label : t(label) ?? label}
          options={datasFilter}
          optionKey='id'
          labelKey='device_name'
          value={selectedArr.length > 0 ? selectedArr[0] : undefined}
          onSelect={item => {
            setValue([item?.id])
          }}
          placeholder={props.label ? t(props.label) ?? props.label : t(label) ?? label}
        />
      )}
    </Box>
  )
}

export default FilterDevice
