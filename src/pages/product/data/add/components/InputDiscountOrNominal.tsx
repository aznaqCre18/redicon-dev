import { Box, Button, ButtonGroup, InputAdornment } from '@mui/material'
import React, { useEffect, useState } from 'react'
import TextFieldNumber from 'src/components/form/TextFieldNumber'

type InputDiscountMemberProps = {
  readonly?: boolean
  label?: string
  discountType?: 'percentage' | 'nominal'
  value?: number
  isFloat?: boolean
  error?: boolean
  onChange?: (value: number | undefined | null) => void
  onChangeDiscountType?: (value: 'percentage' | 'nominal') => void
  onFocus?: () => void
  onBlur?: () => void
}

const InputDiscountOrNominal = ({
  readonly,
  label,
  discountType,
  value,
  isFloat = true,
  error,
  onChangeDiscountType,
  onChange,
  onFocus,
  onBlur
}: InputDiscountMemberProps) => {
  const [_value, setValue] = useState<number | undefined | null>(value)
  const [isDiscount, setIsDiscount] = useState(discountType === 'percentage')

  useEffect(() => {
    setIsDiscount(discountType === 'percentage')
  }, [discountType])

  useEffect(() => {
    onChangeDiscountType && onChangeDiscountType(isDiscount ? 'percentage' : 'nominal')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDiscount])

  useEffect(() => {
    value && setValue(value)
  }, [value])

  useEffect(() => {
    discountType && setIsDiscount(discountType === 'percentage')
  }, [discountType])

  return (
    <Box display='flex' gap={1}>
      <TextFieldNumber
        value={_value}
        error={error}
        id='input-discount-or-nominal'
        isFloat={isFloat}
        onChange={value => {
          if (onChange) onChange(value)
          else setValue(value)
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        label={label}
        size='small'
        max={isDiscount ? 100 : undefined}
        suffix={isDiscount ? '%' : undefined}
        prefix={!isDiscount ? 'Rp ' : undefined}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            paddingRight: 0,
            marginTop: 1
          }
        }}
        InputProps={{
          readOnly: readonly,
          inputProps: {
            min: 0
          },
          startAdornment: <div></div>,
          endAdornment: (
            <InputAdornment position='end'>
              <div
                style={{
                  paddingTop: 4,
                  paddingBottom: 4,
                  paddingLeft: 4,
                  paddingRight: 4,
                  borderRadius: 4
                }}
              >
                <ButtonGroup size='small'>
                  <Button
                    id='btn-click-percentage'
                    variant={isDiscount ? 'contained' : undefined}
                    sx={{
                      paddingLeft: 0,
                      paddingRight: 0
                    }}
                    onClick={() => {
                      if (readonly) return

                      setIsDiscount(true)

                      onChange && onChange(0)
                    }}
                  >
                    %
                  </Button>
                  <Button
                    id='btn-click-nominal'
                    variant={!isDiscount ? 'contained' : undefined}
                    sx={{
                      padding: 0,
                      paddingRight: 0
                    }}
                    onClick={() => {
                      if (readonly) return

                      setIsDiscount(false)

                      onChange && onChange(0)
                    }}
                  >
                    Rp
                  </Button>
                </ButtonGroup>
              </div>
            </InputAdornment>
          )
        }}
      />
    </Box>
  )
}

export default InputDiscountOrNominal
