import { Icon } from '@iconify/react'
import { Grid, Box, Card, Avatar, Typography, Button, Select, MenuItem } from '@mui/material'
// ** React Imports

// ** MUI Imports
// ** Custom Table Components Imports
import { useTranslation } from 'react-i18next'
import CustomTextField from 'src/components/form/CustomTextField'
import { useDisclosure } from 'src/hooks/useDisclosure'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import Dialog from 'src/views/components/dialogs/Dialog'

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

const AccountList = () => {
  // get params msku
  const formDisclousure = useDisclosure()

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
          <Box>
            <Box p={4} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
              <Typography variant={'body1'}>
                Saldo kamu bisa ditarik ke akun ewallet/bank ini.
              </Typography>
              <Button
                variant='contained'
                startIcon={<Icon icon='bi:plus' />}
                onClick={formDisclousure.onOpen}
              >
                Tambah Akun
              </Button>
            </Box>
            {accountCards.map((card, index) => (
              <CardWallet
                key={index}
                card={card}
                onClickDelete={() => {
                  console.log('delete')
                }}
                onClickEdit={() => {
                  formDisclousure.onOpen()
                }}
              />
            ))}
          </Box>
          <DialogFormAccount open={formDisclousure.isOpen} onClose={formDisclousure.onClose} />
        </Card>
      </Grid>
    </Grid>
  )
}

const CardWallet = ({
  card,
  onClickDelete,
  onClickEdit
}: {
  card: CardType
  onClickDelete: () => void
  onClickEdit: () => void
}) => {
  const { t } = useTranslation()

  return (
    <Box display={'flex'} flexDirection={'row'}>
      <Grid
        container
        sx={{
          py: 2,
          px: 8,
          alignItems: 'center',
          cursor: 'pointer'
        }}
        columnSpacing={4}
      >
        <Grid item xs={1}>
          <Avatar
            src={getImageAwsUrl(card.image)}
            alt={card.wallet_name}
            variant='square'
            sx={{
              width: 'auto',
              height: 30,
              '& img': { objectFit: 'contain' }
            }}
          />
        </Grid>
        <Grid item xs={8}>
          <Typography variant={'caption'}>{card.wallet_name}</Typography>
          <Typography variant={'body1'} fontWeight={600}>
            {card.account_number}
          </Typography>
          <Typography variant={'body2'}>a.n Sdr {card.account_name.toUpperCase()}</Typography>
        </Grid>
        <Grid item xs={3} display={'flex'}>
          <Box ml={'auto'}>
            <Button
              variant='outlined'
              size='small'
              color='primary'
              sx={{
                mr: 2
              }}
              onClick={onClickEdit}
            >
              {t('Edit')}
            </Button>
            <Button variant='outlined' size='small' color='error' onClick={onClickDelete}>
              {t('Delete')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

const DialogFormAccount = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  return (
    <Dialog title='Tambah Akun' open={open} onClose={onClose}>
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='body2' mb={1}>
              Pilih tipe rekening
            </Typography>
            <Select fullWidth placeholder='Tipe Rekening' variant='outlined' size='small'>
              <MenuItem value='bank'>Bank</MenuItem>
              <MenuItem value='ewallet'>E-Wallet</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12}>
            <CustomTextField fullWidth label='Nama Bank / E-Wallet' variant='outlined' />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField fullWidth label='Nomor Akun' variant='outlined' />
          </Grid>
        </Grid>
      </Box>
      <Box display='flex' justifyContent='flex-end' mt={4} gap={2}>
        <Button variant='outlined' onClick={onClose}>
          Batal
        </Button>
        <Button variant='contained' color='primary'>
          Simpan
        </Button>
      </Box>
    </Dialog>
  )
}

export default AccountList
