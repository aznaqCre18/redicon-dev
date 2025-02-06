import { yupResolver } from '@hookform/resolvers/yup'
import {
  Timeline,
  TimelineConnector,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator
} from '@mui/lab'
import { Box, Button, Grid, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import TimelineContent from 'src/@core/components/mui/timeline-content'
import TimelineDot from 'src/@core/components/mui/timeline-dot'
import PickerDate from 'src/components/form/datepicker/PickerDate'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import ImagePreview from 'src/components/image/ImagePreview'
import {
  DeliveryOrdersSchema,
  DeliveryOrdersType,
  OrderDetailV2,
  OrderItemV2
} from 'src/types/apps/order'
import { formatDate } from 'src/utils/dateUtils'
import Dialog from 'src/views/components/dialogs/Dialog'

interface TimelineItemProps {
  status:
    | 'Completed'
    | 'Order Received'
    | 'Order In Delivery'
    | 'Order Processed'
    | 'Order Acknowledgedment'
    | 'Approved'
    | 'Checkout'
    | 'Add to Cart'
  entity: string
  user: string
  active: boolean
  date: string
}

interface Props {
  open: boolean
  handleClose: () => void
  data?: TimelineItemProps[]
  item?: OrderDetailV2
}

const mockTimelineData: TimelineItemProps[] = [
  {
    status: 'Order Received',
    entity: 'Customer',
    user: 'Admin',
    active: true,
    date: '2022-01-02'
  },
  {
    status: 'Order In Delivery',
    entity: 'Customer',
    user: 'Admin',
    active: false,
    date: '2022-01-03'
  },
  {
    status: 'Order Processed',
    entity: 'Customer',
    user: 'Admin',
    active: false,
    date: '2022-01-04'
  },
  {
    status: 'Order Acknowledgedment',
    entity: 'Customer',
    user: 'Admin',
    active: false,
    date: '2022-01-05'
  },
  {
    status: 'Approved',
    entity: 'Customer',
    user: 'Admin',
    active: false,
    date: '2022-01-06'
  },
  {
    status: 'Checkout',
    entity: 'Customer',
    user: 'Admin',
    active: false,
    date: '2022-01-07'
  }
]

const defaultDeliveryOrders = {
  deliveryOrders: [
    {
      date: undefined,
      remainingOrder: 0,
      order: 0
    }
  ]
}

const LogHistory = (props: Props) => {
  const { t } = useTranslation()
  const { open, handleClose, data = mockTimelineData } = props
  const [productItem, setProductItem] = useState<OrderItemV2 | undefined>(undefined)
  const { control, reset } = useForm<DeliveryOrdersType>({
    defaultValues: defaultDeliveryOrders,
    mode: 'all',
    resolver: yupResolver(DeliveryOrdersSchema)
  })
  const { fields, update, append } = useFieldArray({ control, name: 'deliveryOrders' })

  useEffect(() => {
    if (props.item?.order_items?.[props.item?.index]) {
      setProductItem(props.item?.order_items?.[props.item?.index])
      update(0, {
        remainingOrder: props.item?.order_items?.[props.item?.index]?.quantity,
        order: 0,
        date: undefined as unknown as string
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.item?.order_items?.[props.item?.index]])

  useEffect(() => {
    if (!open) {
      reset(defaultDeliveryOrders)
    }
  }, [open])

  return (
    <Dialog title='Acknowledgement' open={open} onClose={handleClose}>
      <Box display={'flex'}>
        <ImagePreview
          avatar={
            productItem?.product_media && productItem?.product_media?.length > 0
              ? productItem.product_media[0]
              : ''
          }
          fullName={
            productItem?.product_name ? productItem?.product_name : (productItem?.name as string)
          }
        />
        <Box>
          <Typography
            variant='body1'
            sx={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              lineHeight: '1rem',
              maxHeight: '2rem',
              mb: 1
            }}
          >
            {productItem?.product_name}
          </Typography>
          <Box display={'flex'} flexDirection={'column'}>
            <Typography variant='body2' color={'secondary'}>
              MSKU : {productItem?.product_sku ?? '-'}
            </Typography>
            <Typography variant='body2' color={'secondary'}>
              {t('Variation')}:{' '}
              {productItem?.product_name &&
                (productItem.product_variant_attributes && productItem.product_variant_attributes
                  ? productItem.product_variant_attributes
                      .map(attribute => attribute.value)
                      .join(' - ')
                  : '-')}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Grid
        py={2}
        item
        borderRadius={1}
        sx={theme => ({
          backgroundColor: theme.palette.customColors.tableHeaderBg,
          borderColor: theme.palette.divider,
          borderWidth: '1px',
          borderStyle: 'solid',
          marginBottom: 2,
          mt: 2,
          spacing: 1
        })}
        container
        alignItems={'center'}
      >
        <Grid item xs={4} sx={{ ml: 2 }}>
          Date
        </Grid>
        <Grid item xs={3}>
          Order
        </Grid>
        <Grid item xs={3}>
          Delivery
        </Grid>
      </Grid>
      <Grid item width={'100%'}>
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
          <Grid py={2} spacing={1} container alignItems={'center'}>
            {fields.map((item, idx) => (
              <>
                <Grid key={idx} item xs={4} sx={{ ml: 2 }}>
                  <PickerDate />
                </Grid>
                <Grid item xs={3}>
                  <Controller
                    control={control}
                    name={`deliveryOrders.${idx}.remainingOrder`}
                    render={({ field }) => <TextFieldNumber disabled size='small' {...field} />}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Controller
                    control={control}
                    name={`deliveryOrders.${idx}.order`}
                    render={({ field }) => (
                      <TextFieldNumber
                        size='small'
                        {...field}
                        max={productItem?.quantity || 0}
                        onBlur={e => {
                          if (+e.target.value == 0) return
                          if (+e.target.value < (productItem?.quantity || 0)) {
                            if (!fields[idx + 1]) {
                              append({
                                date: undefined as unknown as string,
                                remainingOrder:
                                  (productItem?.quantity || 0) -
                                  (fields.reduce((a, b) => a + +b.order, 0) + +e.target.value),
                                order: 0
                              })
                            } else {
                              update(idx + 1, {
                                date: undefined as unknown as string,
                                remainingOrder:
                                  (productItem?.quantity || 0) -
                                  (fields.reduce((a, b) => a + +b.order, 0) + +e.target.value),
                                order: 0
                              })
                            }
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
              </>
            ))}
          </Grid>
        </Box>
      </Grid>
      <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
        <Button variant='tonal' color='secondary' onClick={handleClose}>
          {t('Cancel')}
        </Button>
        <Button type='submit' variant='contained' sx={{ ml: 3 }}>
          {t('Submit')}
        </Button>
      </Box>
    </Dialog>
  )
}

export default LogHistory
