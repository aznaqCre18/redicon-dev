import React from 'react'
import FormPurchase from '../components/FormPurchase'
import { setTitlePage } from 'src/utils/metaUtils'
import { useTranslation } from 'react-i18next'

const AddInvoice = () => {
  const { t } = useTranslation()
  setTitlePage(t('Add Purchase'))

  return <FormPurchase />
}

export default AddInvoice
