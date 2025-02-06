// ** MUI Imports
import IconButton from '@mui/material/IconButton'
import { useEffect, useState } from 'react'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const FullscreenToggler = () => {
  // ** Props

  const fullScreen = () => {
    document.body.requestFullscreen()
    document.body.style.overflow = 'auto'
  }

  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }

  const [isFullscreen, setIsFullscreen] = useState(false)

  // Watch for fullscreenchange
  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)

    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  return (
    <IconButton
      color='inherit'
      aria-haspopup='true'
      onClick={isFullscreen ? exitFullScreen : fullScreen}
    >
      <Icon
        style={{
          opacity: 0.5
        }}
        fontSize='1.625rem'
        icon={isFullscreen ? 'tabler:window-minimize' : 'tabler:window-maximize'}
      />
    </IconButton>
  )
}

export default FullscreenToggler
