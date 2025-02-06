import React from 'react'
import FormOrder from '../components/FormOrder'
import { useQuery } from 'react-query'
import { bankVendorService } from 'src/services/vendor/bank-vendor'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { courierService } from 'src/services/vendor/courier'
import { expeditionService } from 'src/services/vendor/expedition'
import { customerService } from 'src/services/customer'
import { unitService } from 'src/services/unit'
import { outletService } from 'src/services/outlet/outlet'
import { vendorSettingShippingService } from 'src/services/vendor/settings/shipping'
import { paymentMethodNonCashService } from 'src/services/vendor/paymentMethodNonCash'

const Page = () => {
  const outletQuery = useQuery('get-outlet', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination)
  })

  const outlet = outletQuery.data?.data.data

  const vendorBankQuery = useQuery('get-vendor-bank', {
    queryFn: () => bankVendorService.getListActive(maxLimitPagination)
  })

  const vendorBank = vendorBankQuery.data?.data.data

  const vendorNonCashQuery = useQuery('get-vendor-non-cash', {
    queryFn: () => paymentMethodNonCashService.getList(maxLimitPagination)
  })

  const vendorNonCash = vendorNonCashQuery.data?.data.data

  const courierManualQuery = useQuery('get-courier-manual', {
    queryFn: () => courierService.getListActive(maxLimitPagination)
  })

  const courierManual = courierManualQuery.data?.data.data

  const courierRajaOngkirQuery = useQuery('get-courier-raja-ongkir', {
    queryFn: () => expeditionService.getListActive(maxLimitPagination)
  })

  const courierRajaOngkir = courierRajaOngkirQuery.data?.data.data

  const customerQuery = useQuery('get-customer', {
    queryFn: () => customerService.getListCustomerActive(maxLimitPagination)
  })

  const customer = customerQuery.data?.data.data

  const unitQuery = useQuery('get-list', {
    queryFn: () => unitService.getListUnit(maxLimitPagination)
  })

  const codQuery = useQuery('get-cod', {
    queryFn: () => vendorSettingShippingService.getCodSetting()
  })

  const cod = codQuery.data?.data.data

  const units = unitQuery.data?.data.data

  if (!outlet) return null
  if (!vendorBank) return null
  if (!courierManual) return null
  if (!vendorNonCash) return null
  if (!courierRajaOngkir) return null
  if (!customer) return null
  if (!units) return null
  if (!cod) return null

  return (
    <FormOrder
      outlet={outlet}
      vendorBank={vendorBank}
      vendorNonCash={vendorNonCash}
      courierRajaOngkir={courierRajaOngkir}
      courierManual={courierManual}
      customer={customer}
      units={units}
      cod={cod}
    />
  )
}

export default Page
