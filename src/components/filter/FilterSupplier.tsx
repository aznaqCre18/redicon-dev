import React, { useState } from 'react'
import SelectChip from '../form/select/SelectChip'
import { useQuery } from 'react-query'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { pluck } from 'src/utils/arrayUtils'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { supplierService } from 'src/services/supplier'
import { SupplierType } from 'src/types/apps/supplier'

const label = 'Supplier'
const queryKey = 'filter-supplier-list'
const service = supplierService.getListActive
type DataType = SupplierType

type FilterProps = {
  showIfOne?: boolean
  isFloating?: boolean
  label?: string
  value?: number[]
  onChange: (value: number[] | undefined) => void
  multiple?: boolean
  width?: any
  minWidthPaper?: number
}

const FilterSupplier = (props: FilterProps) => {
  const { t } = useTranslation()
  const _multiple = props.multiple ?? true
  const [datas, setDatas] = useState<DataType[]>([])
  const _value: number[] = props.value ?? []

  const setValue = (value: number[]) => {
    props.onChange(value)
  }

  useQuery(queryKey, {
    queryFn: () => service(maxLimitPagination),
    onSuccess: data => {
      setDatas(data.data.data ?? [])
    },
    cacheTime: 0
  })

  const selectedArr = _value

  if (!props.showIfOne && datas.length <= 1) {
    return null
  }

  return (
    <Box width={props.width || 200}>
      <SelectChip
        multiple={_multiple}
        mini
        error={false}
        minWidthPaper={props.minWidthPaper || 240}
        options={datas ?? []}
        label={props.label ?? t(label) ?? label}
        isFloating={props.isFloating}
        labelKey='name'
        placeholder={props.label ?? t(label) ?? label}
        onSelect={item => {
          if (!_multiple) {
            setValue([item?.id])

            return
          }

          setValue(pluck(item ?? [], 'id'))
        }}
        value={selectedArr}
        onSelectAll={
          !_multiple
            ? undefined
            : () => {
                setValue(pluck(datas, 'id'))
              }
        }
      />
    </Box>
  )
}

export default FilterSupplier
