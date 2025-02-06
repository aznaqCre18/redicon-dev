import { Avatar, Box, Grid, Radio, Typography } from '@mui/material'
import { useRef } from 'react'
import { BankVendorType } from 'src/types/apps/vendor/BankVendorType'
import { getImageAwsUrl } from 'src/utils/imageUtils'

export const CardBank = ({
  card,
  onChange,
  checked
}: {
  card: BankVendorType
  onChange: (val: number) => void
  checked: boolean
}) => {
  // const { t } = useTranslation()
  const ref = useRef<HTMLButtonElement>(null)

  return (
    <Box display={'flex'} flexDirection={'row'}>
      <Grid
        container
        sx={{
          border: 1,
          borderColor: theme => theme.palette.divider,
          borderRadius: 1,
          p: 2,
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: theme => theme.palette.action.hover
          }
        }}
        onClick={() => onChange(card.id)}
        columnSpacing={4}
      >
        <Grid item xs={2}>
          <Avatar
            src={getImageAwsUrl(card.bank_image)}
            alt={card.bank_name}
            variant='square'
            sx={{
              width: 'auto',
              height: 30,
              '& img': { objectFit: 'contain' }
            }}
          />
        </Grid>
        <Grid item xs={8}>
          <Typography variant={'body1'} fontWeight={600}>
            {card.account_name}
          </Typography>
          <Typography variant={'body2'}>
            {card.account_number} - {card.account_name?.toUpperCase()}
          </Typography>
          {/* {card.cost !== 0 && (
            <Typography variant={'caption'}>
              {t('Admin fee')} {formatPriceIDR(card.cost)}
            </Typography>
          )} */}
        </Grid>
        <Grid item xs={2}>
          <Radio checked={checked} inputRef={ref} />
        </Grid>
      </Grid>
    </Box>
  )
}
