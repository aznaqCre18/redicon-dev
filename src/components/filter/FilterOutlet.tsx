import React, { useEffect, useState } from 'react'
import SelectChip from '../form/select/SelectChip'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { useQuery } from 'react-query'
import { outletService } from 'src/services/outlet/outlet'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { pluck } from 'src/utils/arrayUtils'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import SelectCustom from '../form/select/SelectCustom'

const label = 'Outlet'
const queryKey = 'filter-outlet-list'
const service = outletService.getListOutlet
const serviceShowDisable = outletService.getListOutletShowDisabled
type DataType = OutletType

type FilterProps = {
  showIfOne?: boolean
  label?: string
  setOutlets?: (value: OutletType[]) => void
  value?: number[]
  onChange: (value: number[] | undefined) => void
  multiple?: boolean
  width?: any
  showDisable?: boolean
  minWidthPaper?: number
  isFloating?: boolean
}

const FilterOutlet = (props: FilterProps) => {
  const { t } = useTranslation()
  const _multiple = props.multiple ?? true
  const [datas, setDatas] = useState<DataType[]>([])
  const _value: number[] = props.value ?? []

  const setValue = (value: number[]) => {
    props.onChange(value)
  }

  useQuery(queryKey, {
    queryFn: () =>
      props.showDisable ? serviceShowDisable(maxLimitPagination) : service(maxLimitPagination),
    onSuccess: data => {
      setDatas(data.data.data ?? [])
      if (props.setOutlets) props.setOutlets(data.data.data ?? [])
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

  if (!props.showIfOne && datas.length <= 1) {
    return null
  }

  return (
    <Box width={props.width || 200}>
      {_multiple ? (
        <SelectChip
          mini
          error={false}
          minWidthPaper={props.minWidthPaper || 240}
          options={datas ?? []}
          label={props.label != null ? t(props.label) ?? props.label : t(label) ?? label}
          isFloating={props.isFloating ?? true}
          labelKey='name'
          placeholder={props.label != null ? t(props.label) ?? props.label : t(label) ?? label}
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
          isFloating={props.isFloating ?? true}
          label={props.label != null ? t(props.label) ?? props.label : t(label) ?? label}
          options={datas ?? []}
          optionKey='id'
          labelKey='name'
          value={selectedArr.length > 0 ? selectedArr[0] : undefined}
          onSelect={item => {
            setValue([item?.id])
          }}
          placeholder={props.label != null ? t(props.label) ?? props.label : t(label) ?? label}
        />
      )}
    </Box>
  )
}

export default FilterOutlet
