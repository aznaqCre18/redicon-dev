import { TimelineContent, TimelineContentProps } from '@mui/lab'

const MuiTimelineContent = (props: TimelineContentProps) => {
  return (
    <TimelineContent
      sx={{ ...props.sx, marginTop: 'unset !important', paddingTop: 'unset !important' }}
      {...props}
    />
  )
}

export default MuiTimelineContent
