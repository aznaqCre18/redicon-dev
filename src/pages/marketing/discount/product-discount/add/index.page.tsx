import {
  Box,
  Button,
  Card,
  Checkbox,
  Grid,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Typography,
  styled
} from '@mui/material'
import React, { useState } from 'react'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import IconifyIcon from 'src/@core/components/icon'
import { Icon } from '@iconify/react'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import DialogAddProduct from './components/DialogAddProduct'
import { useDisclosure } from 'src/hooks/useDisclosure'
import PickerDate from 'src/components/form/datepicker/PickerDate'

const CardWrapper = styled(Card)(() => ({
  padding: '20px',
  '&:not(:first-of-type)': { marginTop: '20px' }
}))

const GridLabel = styled(Grid)(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: '5px'
}))

const AddProductDiscount = () => {
  const [startDate, setStartDate] = useState<DateType>(new Date())
  const [endDate, setEndDate] = useState<DateType>(new Date())

  const {
    isOpen: isOpenDialogAddProduct,
    onClose: onCloseDialogAddProduct,
    onOpen: openDialogAddProduct
  } = useDisclosure()

  return (
    <div>
      <CardWrapper>
        <Typography variant='h5' mb={2}>
          Basic Information
        </Typography>
        <Grid container spacing={2}>
          <GridLabel item xs={12} sm={3}>
            <Typography variant='body1'>Promo Name</Typography>
          </GridLabel>
          <Grid item xs={12} sm={9}>
            <TextField size='small' fullWidth />
          </Grid>
          <GridLabel item xs={12} sm={3}>
            <Typography variant='body1' mt={3}>
              Promo Period
            </Typography>
          </GridLabel>
          <Grid item xs={12} sm={9}>
            <PickerDate
              label={'Start Date'}
              value={startDate}
              onSelectDate={(date: Date) => setStartDate(date)}
            />

            <PickerDate
              label={'End Date'}
              value={endDate}
              onSelectDate={(date: Date) => setEndDate(date)}
            />
          </Grid>
        </Grid>
      </CardWrapper>
      <CardWrapper>
        <Box display={'flex'} justifyContent={'center'}>
          <Button
            variant='outlined'
            color='primary'
            startIcon={<IconifyIcon icon={'mdi:plus'} />}
            onClick={openDialogAddProduct}
          >
            Product
          </Button>
        </Box>
      </CardWrapper>
      <CardWrapper>
        <Grid container>
          <Grid item xs={12}>
            <Box
              borderRadius={1}
              sx={theme => ({
                backgroundColor: theme.palette.customColors.tableHeaderBg,
                borderColor: theme.palette.divider,
                borderWidth: '1px',
                borderStyle: 'solid',
                marginBottom: 2
              })}
            >
              <Grid container gap={2}>
                <Grid
                  item
                  borderRadius={1}
                  container
                  alignItems={'center'}
                  columns={11}
                  columnSpacing={3}
                >
                  <Grid item xs={2} display={'flex'} spacing={2} alignItems={'center'}>
                    <Checkbox />
                    <div>Product Name</div>
                  </Grid>
                  <Grid item xs={1}>
                    V SKU
                  </Grid>
                  <Grid item xs={1}>
                    Basic Price
                  </Grid>
                  <Grid item xs={2}>
                    Price Discount
                  </Grid>
                  <Grid item xs={2}>
                    OR % Discount
                  </Grid>
                  <Grid item xs={1}>
                    Stock
                  </Grid>
                  <Grid item xs={1}>
                    Status
                  </Grid>
                  <Grid item xs={1}>
                    Action
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box
              borderRadius={1}
              sx={theme => ({
                backgroundColor: theme.palette.customColors.tableHeaderBg,
                borderColor: theme.palette.divider,
                borderWidth: '1px',
                borderStyle: 'solid',
                marginBottom: 2
              })}
            >
              <Grid container>
                <Grid
                  item
                  borderRadius={1}
                  container
                  alignItems={'center'}
                  columns={12}
                  columnSpacing={3}
                >
                  <Grid item px={2} display={'flex'} spacing={2} alignItems={'center'}>
                    <Checkbox />
                    <div>Lorem Ipsum</div>
                  </Grid>
                  <Grid
                    item
                    xs={1}
                    sx={{
                      marginLeft: 'auto'
                    }}
                  >
                    <IconButton>
                      <Icon icon={'mdi:delete'} />
                    </IconButton>
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  borderRadius={1}
                  sx={theme => ({
                    backgroundColor: theme.palette.background.paper
                  })}
                  container
                  rowGap={1}
                  py={2}
                >
                  <Grid item xs={12} columns={11} container alignItems={'center'} columnSpacing={3}>
                    <Grid item xs={2}>
                      <Typography ml={3}>Black</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      V.SKU : 001
                    </Grid>
                    <Grid item xs={1}>
                      Rp65000
                    </Grid>
                    <Grid item xs={2}>
                      <TextFieldNumber
                        InputProps={{
                          inputProps: {
                            min: 0
                          }
                        }}
                        prefix='Rp '
                      />
                    </Grid>
                    <Grid item xs={2} display={'flex'} alignItems={'center'} gap={2}>
                      OR
                      <TextFieldNumber
                        InputProps={{
                          inputProps: {
                            min: 0
                          },
                          endAdornment: <InputAdornment position='start'>%</InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      0
                    </Grid>
                    <Grid item xs={1}>
                      <Switch />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardWrapper>
      <DialogAddProduct
        selected={[]}
        onClose={onCloseDialogAddProduct}
        open={isOpenDialogAddProduct}
      />
    </div>
  )
}

export default AddProductDiscount
