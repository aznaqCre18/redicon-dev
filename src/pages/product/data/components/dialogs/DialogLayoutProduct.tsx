import { FormControlLabel, Switch } from '@mui/material'
import React, { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from 'src/views/components/dialogs/Dialog'

export type LayoutProduct = {
  media: boolean
  shipping: boolean
  other: boolean
}

export type DialogLayoutProductProps = {
  open: boolean
  onClose: () => void
  layout: LayoutProduct
  setLayout: (layout: LayoutProduct) => void
}

const DialogLayoutProduct = ({ open, onClose, layout, setLayout }: DialogLayoutProductProps) => {
  const { t } = useTranslation()

  return (
    <Dialog title={t('Layout Product')} open={open} onClose={onClose} enableCloseBackdrop>
      {/* SWITCH MUI */}

      <FormControlLabel
        sx={{
          ml: 2
        }}
        control={
          <Switch
            checked={layout.media}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setLayout({ ...layout, media: event.target.checked })
            }}
          />
        }
        label={t('Media')}
      />

      <FormControlLabel
        sx={{
          ml: 2
        }}
        control={
          <Switch
            checked={layout.shipping}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setLayout({ ...layout, shipping: event.target.checked })
            }}
          />
        }
        label={t('Shipping')}
      />

      <FormControlLabel
        sx={{
          ml: 2
        }}
        control={
          <Switch
            checked={layout.other}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setLayout({ ...layout, other: event.target.checked })
            }}
          />
        }
        label={t('Other')}
      />
    </Dialog>
  )
}

export default DialogLayoutProduct
