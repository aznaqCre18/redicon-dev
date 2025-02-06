import { useTheme } from '@mui/material'
import React from 'react'
import { zeroPad } from 'src/utils/numberUtils'

type CountDownComponentProps = {
  from: Date
  to: Date
}

const CountDownDateComponent = ({ from, to }: CountDownComponentProps) => {
  const [countDown, setCountDown] = React.useState<number>(0)
  const theme = useTheme()

  React.useEffect(() => {
    const now = new Date()
    const diff = to.getTime() - now.getTime()
    const diffSeconds = Math.floor(diff / 1000)

    setCountDown(diffSeconds)
  }, [from, to])

  React.useEffect(() => {
    if (countDown <= 0) return

    const interval = setInterval(() => {
      setCountDown(countDown - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [countDown])

  const days = Math.floor(countDown / 86400)
  const hours = Math.floor((countDown % 86400) / 3600)
  const minutes = Math.floor(((countDown % 86400) % 3600) / 60)
  const seconds = Math.floor(((countDown % 86400) % 3600) % 60)

  if (countDown <= 0) return null

  return (
    <span
      style={{
        color: theme.palette.error.main
      }}
    >
      Exp: {`${days} hari ${zeroPad(hours, 2)}:${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`}
    </span>
  )
}

export default CountDownDateComponent
