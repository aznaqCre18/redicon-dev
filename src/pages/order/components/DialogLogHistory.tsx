import {
  Timeline,
  TimelineConnector,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator
} from '@mui/lab'
import { Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import TimelineContent from 'src/@core/components/mui/timeline-content'
import TimelineDot from 'src/@core/components/mui/timeline-dot'
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

const LogHistory = (props: Props) => {
  const { t } = useTranslation()
  const { open, handleClose, data = mockTimelineData } = props

  return (
    <Dialog title={t('Log History')} open={open} onClose={handleClose}>
      {data.length > 0 ? (
        <Timeline
          sx={{
            [`& .${timelineItemClasses.root}:before`]: {
              flex: 0,
              padding: 0
            }
          }}
        >
          <TimelineItem sx={{ mt: -10 }}>
            <TimelineSeparator>
              <TimelineDot sx={{ opacity: 0 }} />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent></TimelineContent>
          </TimelineItem>
          {data.map((item, idx) => (
            <TimelineItem key={idx}>
              <TimelineSeparator>
                <TimelineDot color={item.active ? 'primary' : undefined} />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent color={item.active ? 'primary.main' : undefined}>
                {`${item.status} (${item.entity}) by ${item.user}`}
                <Typography sx={{ fontWeight: 'lighter' }}>{formatDate(item.date)}</Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
          <TimelineItem sx={{ mt: -5 }}>
            <TimelineSeparator>
              <TimelineDot sx={{ opacity: 0 }} />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent></TimelineContent>
          </TimelineItem>
        </Timeline>
      ) : (
        <Typography variant='h5'>{t('No data')}</Typography>
      )}
    </Dialog>
  )
}

export default LogHistory
