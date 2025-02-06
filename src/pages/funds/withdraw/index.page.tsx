import {
  Avatar,
  Box,
  Button,
  Card,
  Grid,
  GridProps,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material'
import { auto } from '@popperjs/core'
import Link from 'next/link'
import React from 'react'
import { useTranslation } from 'react-i18next'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import { formatPriceIDR } from 'src/utils/numberUtils'

type CardType = {
  wallet_name: string
  account_name: string
  account_number: string
  cost: number
  image: string
}

const accountCards: CardType[] = [
  {
    wallet_name: 'Bank Central Asia (BCA)',
    account_name: 'Jhon Doe',
    account_number: '12312421',
    cost: 2500,
    image: 'banks/default/bca.png'
  },
  {
    wallet_name: 'DANA',
    account_name: 'Jhon Doe',
    account_number: '081234567890',
    cost: 0,
    image: 'ewallets/default/dana.png'
  },
  {
    wallet_name: 'GOPAY',
    account_name: 'Jhon Doe',
    account_number: '081234567890',
    cost: 0,
    image: 'ewallets/default/gopay.png'
  }
]

const CardWallet = ({ card, onClick }: { card: CardType; onClick: () => void }) => {
  const { t } = useTranslation()
  const ref = React.useRef<HTMLButtonElement>(null)

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
        onClick={() => onClick()}
        columnSpacing={4}
      >
        <Grid item xs={2}>
          <Avatar
            src={getImageAwsUrl(card.image)}
            alt={card.wallet_name}
            variant='square'
            sx={{
              width: auto,
              height: 30,
              '& img': { objectFit: 'contain' }
            }}
          />
        </Grid>
        <Grid item xs={8}>
          <Typography variant={'body1'} fontWeight={600}>
            {card.wallet_name}
          </Typography>
          <Typography variant={'body2'}>
            {card.account_number} - {card.account_name.toUpperCase()}
          </Typography>
          {card.cost !== 0 && (
            <Typography variant={'caption'}>
              {t('Admin fee')} {formatPriceIDR(card.cost)}
            </Typography>
          )}
        </Grid>
        <Grid item xs={2}>
          <Radio value={card.wallet_name} ref={ref} />
        </Grid>
      </Grid>
    </Box>
  )
}

const GridLabel = ({
  alignItems = 'start',
  ...props
}: {
  children: React.ReactNode
  alignItems?: 'center' | 'start' | 'flex-end'
} & Omit<GridProps, ''>) => (
  <Grid
    {...props}
    sx={{
      display: 'flex',
      alignItems: alignItems,
      textAlign: 'left',
      justifyContent: 'start'
    }}
  />
)

const Page = () => {
  const { t } = useTranslation()
  const [value, setValue] = React.useState<number>(0)
  const [bankDestinationId, setBankDestinationId] = React.useState('')

  return (
    <Grid
      container
      spacing={6.5}
      sx={{
        mb: '50px'
      }}
    >
      <Grid item xs={12}>
        <Card>
          <Box display={'flex'} flexDirection={'column'} mx={4} my={2} p={4} gap={4}>
            <Box mt={4} maxWidth={'40rem'}>
              <Grid container spacing={2}>
                <GridLabel item xs={12} md={4} fontWeight={600} fontSize={18}>
                  {t('Funds')}
                </GridLabel>
                <Grid item xs={12} md={8} fontWeight={600} fontSize={18}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Box mr={'auto'}>{formatPriceIDR(99999999)}</Box>
                    <Button variant={'text'} size='small' onClick={() => setValue(99999999)}>
                      {t('Windraw all')}
                    </Button>
                  </Box>
                </Grid>
                <GridLabel item xs={12} md={4}>
                  {t('Withdrawal Amount')}
                </GridLabel>
                <Grid item xs={12} md={8}>
                  <Box>
                    <TextFieldNumber
                      fullWidth
                      placeholder='0'
                      defaultValue={0}
                      onChange={value => setValue(value || 0)}
                      value={value}
                      isFloat={true}
                      prefix={'Rp '}
                    />
                  </Box>
                  <Typography variant={'caption'}>
                    {t('Minimum withdrawal amount is')} {formatPriceIDR(10000)}
                  </Typography>
                </Grid>
                <GridLabel item xs={12} md={4}>
                  {t('Transaction fees')}
                </GridLabel>
                <Grid item xs={12} md={8}>
                  <Box>{formatPriceIDR(0)}</Box>
                  <Typography variant={'caption'}>
                    {t('Applied to successful withdrawals')}
                  </Typography>
                </Grid>
                <GridLabel
                  item
                  xs={12}
                  md={4}
                  mt={{
                    xs: 0,
                    md: 8
                  }}
                >
                  {t('Destination Account')}
                </GridLabel>
                <Grid item xs={12} md={8}>
                  <Box>
                    <Box textAlign={'right'} mb={2}>
                      <Link href='/funds/account'>
                        <Button variant={'text'} size='small' sx={{}}>
                          {t('Configure Account')}
                        </Button>
                      </Link>
                    </Box>
                    <RadioGroup
                      name='wallet'
                      value={bankDestinationId}
                      sx={{
                        ml: 4
                      }}
                    >
                      <Grid container spacing={2}>
                        {accountCards.map((card, index) => (
                          <Grid item xs={12} key={index}>
                            <CardWallet
                              card={card}
                              onClick={() => setBankDestinationId(card.wallet_name)}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </RadioGroup>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6} flexDirection={'row'} mt={4}>
                  <Typography variant={'caption'}>
                    Dengan klik tombol <b>Tarik Saldo</b>, kamu menyetujui{' '}
                    <Link
                      href={'#'}
                      style={{
                        textDecoration: 'none',
                        color: 'unset'
                      }}
                    >
                      <b>Syarat & Ketentuan</b>
                    </Link>{' '}
                    penarikan Saldo Motapos.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} flexDirection={'row'} mt={4}>
                  <Button
                    variant={'contained'}
                    color={'primary'}
                    fullWidth
                    disabled={value < 10000 || bankDestinationId === ''}
                  >
                    {t('Withdraw')}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Page
