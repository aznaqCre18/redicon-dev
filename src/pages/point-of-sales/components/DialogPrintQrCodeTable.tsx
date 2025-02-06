import { Icon } from '@iconify/react'
import { Box, Button, Checkbox, FormControlLabel } from '@mui/material'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import CustomTextField from 'src/components/form/CustomTextField'
import { useAuth } from 'src/hooks/useAuth'
import { tableService } from 'src/services/outlet/table'
import { TableType } from 'src/types/apps/outlet/table'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import Dialog from 'src/views/components/dialogs/Dialog'

type DialogPrintQrCodeTableProps = {
  open: boolean
  onClose: () => void
}

const DialogPrintQrCodeTable = (props: DialogPrintQrCodeTableProps) => {
  const { t } = useTranslation()
  const { vendorProfile } = useAuth()

  const [domain, setDomain] = React.useState<string>('motaresto.vercel.app')
  const [QrPerRow, setQrPerRow] = React.useState<number>(3)
  const [showTableCode, setShowTableCode] = React.useState<boolean>(false)

  const [tables, setTables] = React.useState<TableType[]>([])

  useQuery('tables', {
    queryFn: () => tableService.getList(maxLimitPagination),
    onSuccess: data => {
      setTables(data.data?.data ?? [])
    }
  })

  const print = () => {
    const html = document.getElementById('print-qr-code-table')?.outerHTML

    const oIframe = document.createElement('iframe')

    // Set the iframe configs and append to document body
    oIframe.style.position = 'absolute'
    oIframe.style.bottom = '200%'
    document.body.append(oIframe)

    // Get the contentWindow to write on the iframe
    const oDoc = (oIframe.contentWindow as any).document

    // Copy the stylesheets, the content and styles to iframe
    const head = document.getElementsByTagName('head')[0].outerHTML
    const styles = `<style>
    </style>`
    oDoc.write(head, html, styles)

    // When iframe loads they will print the content
    // And will remove the element from the document
    oIframe.onload = () => {
      ;(oIframe.contentWindow as any).print()
      oIframe.remove()
    }
    // Close the document where we are written
    oDoc.close()
  }

  useEffect(() => {
    if (vendorProfile) {
      setDomain(vendorProfile.vendor.website)
    }
  }, [vendorProfile])

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      title={t('Print') + ' QR Code ' + t('Table')}
      sx={{
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2
        }}
      >
        <CustomTextField
          label='Domain'
          value={domain}
          onChange={e => setDomain(e.target.value)}
          InputProps={{
            readOnly: true
          }}
        />
        <CustomTextField
          label={'QR ' + t('Per Row')}
          value={QrPerRow}
          onChange={e => setQrPerRow(Number(e.target.value))}
          sx={{ width: 100 }}
        />

        <Box sx={{ display: 'flex', alignItems: 'flex-end', ml: 'auto' }}>
          <Button variant='contained' startIcon={<Icon icon='mdi:printer' />} onClick={print}>
            {t('Print')}
          </Button>
        </Box>
      </Box>

      <Box>
        <FormControlLabel
          control={
            <Checkbox checked={showTableCode} onChange={e => setShowTableCode(e.target.checked)} />
          }
          label={t('Show Table Code')}
          sx={{ mb: 4 }}
        />
      </Box>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: QrPerRow < 1 ? '1fr' : `repeat(${QrPerRow}, 1fr)`,
          flexWrap: 'wrap',
          justifyContent: 'center',
          backgroundColor: '#fff'
        }}
        id='print-qr-code-table'
      >
        {tables.map(table => (
          <div
            style={{
              border: '1px solid #000',
              textAlign: 'center',
              padding: '10px'
            }}
            key={table.id}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://${domain}/t/${table.table_code}`}
              alt='qr code'
              style={{ width: '100%' }}
            />
            <p
              style={{
                fontWeight: 'bold',
                margin: '4px',
                color: '#000',
                fontSize: QrPerRow < 1 ? '54px' : `${54 / QrPerRow}px`
              }}
              color={'black'}
            >
              {table.name}
            </p>

            {showTableCode && (
              <p
                style={{
                  fontWeight: 'normal',
                  margin: '4px',
                  color: '#000',
                  fontSize: QrPerRow < 1 ? '40px' : `${40 / QrPerRow}px`
                }}
              >
                {table.table_code}
              </p>
            )}
          </div>
        ))}
      </div>
    </Dialog>
  )
}

export default DialogPrintQrCodeTable
