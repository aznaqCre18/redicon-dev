// ** MUI Imports
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types Import
import { Settings } from 'src/@core/context/settingsContext'

interface Props {
  settings: Settings
  saveSettings: (values: Settings) => void
}

const LayoutToggler = (props: Props) => {
  // ** Props
  const { settings, saveSettings } = props

  const handleModeChange = (mode: 'vertical' | 'horizontal') => {
    saveSettings({ ...settings, layout: mode, lastLayout: mode })
  }

  const handleModeToggle = () => {
    if (settings.layout === 'vertical') {
      handleModeChange('horizontal')
    } else {
      handleModeChange('vertical')
    }
  }

  return (
    <IconButton color='inherit' aria-haspopup='true' onClick={handleModeToggle}>
      <Icon
        style={{
          opacity: 0.5
        }}
        fontSize='1.625rem'
        icon={
          settings.layout === 'vertical'
            ? 'fluent:panel-left-text-24-regular'
            : 'fluent:panel-top-gallery-24-regular'
        }
      />
    </IconButton>
  )
}

export default LayoutToggler
