import React from 'react'
import SelectChip from '../form/select/SelectChip'
import { pluck } from 'src/utils/arrayUtils'
import { Box, capitalize } from '@mui/material'
import { useTranslation } from 'react-i18next'

const label = 'Type'
const datasDefault = ['transaction', 'product', 'category']

type FilterProps = {
  value?: string[]
  onChange: (value: number[] | undefined) => void
  multiple?: boolean
  width?: any
  minWidthPaper?: number
}

const FilterCommissionType = (props: FilterProps) => {
  const { t } = useTranslation()
  const _multiple = props.multiple ?? true
  const datas = datasDefault.map(item => ({ id: item, name: capitalize(t(item)) }))

  const _value: string[] = props.value ?? []

  const setValue = (value: number[]) => {
    props.onChange(value)
  }

  const selectedArr = _value

  return (
    <Box width={props.width || 200}>
      <SelectChip
        multiple={_multiple}
        mini
        error={false}
        minWidthPaper={props.minWidthPaper || 240}
        options={datas}
        label={t(label) ?? label}
        labelKey='name'
        isFloating
        placeholder={t(label) ?? label}
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

export default FilterCommissionType
