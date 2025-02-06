import React, { useEffect } from 'react'
import FormOrder from '../components/FormOrder'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { orderService } from 'src/services/order'
import { bankVendorService } from 'src/services/vendor/bank-vendor'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { courierService } from 'src/services/vendor/courier'
import { expeditionService } from 'src/services/vendor/expedition'
import { customerService } from 'src/services/customer'
import { unitService } from 'src/services/unit'
import { outletService } from 'src/services/outlet/outlet'
import { InvoiceType } from '../components/OrderItem'
import { productService } from 'src/services/product'
import { promise } from 'src/utils/promise'
import { vendorSettingShippingService } from 'src/services/vendor/settings/shipping'
import { paymentMethodNonCashService } from 'src/services/vendor/paymentMethodNonCash'

const Page = () => {
  const router = useRouter()
  const { id: orderId } = router.query

  const outletQuery = useQuery('get-outlet', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination)
  })

  const outlet = outletQuery.data?.data.data

  const orderQuery = useQuery(['get-order-detail', orderId], {
    enabled: !!orderId,
    queryFn: () => orderService.getOne(orderId as string),
    cacheTime: 0
  })

  const order = orderQuery.data?.data.data

  if ((order?.order.id == 0 && orderQuery.isSuccess) || orderQuery.isError) {
    router.push('/order')
  }

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

  const unitQuery = useQuery('get-unit', {
    queryFn: () => unitService.getListUnit(maxLimitPagination)
  })

  const units = unitQuery.data?.data.data

  const codQuery = useQuery('get-cod', {
    queryFn: () => vendorSettingShippingService.getCodSetting()
  })

  const cod = codQuery.data?.data.data

  const [products, setProducts] = React.useState<InvoiceType[]>([])

  useEffect(() => {
    promise(async () => {
      if (order) {
        Promise.all(
          order.order_items.map(async item => {
            const product = await productService.getProductDetail(item.product_id.toString())

            return {
              id: undefined,
              price: item.price,
              discount: item.discount_per_item,
              product_id: item.product_id,
              qty: item.quantity,
              total: item.total,
              variant_id: item.product_variant_id ?? undefined,
              product: product!.data.data,
              membershipLevel: -1
            }
          })
        ).then(data => {
          setProducts(data)
        })
      }
    })
  }, [order])

  if (!outlet) return null
  if (!order) return null
  if (!vendorBank) return null
  if (!vendorNonCash) return null
  if (!courierManual) return null
  if (!courierRajaOngkir) return null
  if (!customer) return null
  if (!units) return null
  if (!cod) return null
  if (!(products.length > 0)) return null

  return (
    <FormOrder
      outlet={outlet}
      productsOld={products}
      data={order}
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
