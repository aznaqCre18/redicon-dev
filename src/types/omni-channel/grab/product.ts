import * as yup from 'yup'

export type GrabProductData = {
  merchant_id: number
  provider_id: number
  name: string
  msku: string // sku motapos
  channel_sku: string
  spu: string
  price: number
  stock: number
  variation: string

  description: string // belum ada di BE
}

export type GrabProductType = GrabProductData & {
  id: string

  photos: string[] // belum ada di BE
  category?: string
  modifiers?: GrabProdductModifierType[]

  settings?: GrabProductSettingsType
}

export type GrabProdductModifierType = {
  id: string
  name: string
  price: number
}

export type GrabProductSettingsType = {
  Delivery_OnDemand_GrabApp: boolean
  Delivery_OnDemand_GrabApp_Price: number
  Delivery_Scheduled_GrabApp: boolean
  Delivery_Scheduled_GrabApp_Price: number
  SelfPickUp_OnDemand_GrabApp: boolean
  SelfPickUp_OnDemand_GrabApp_Price: number
  DineIn_OnDemand_GrabApp: boolean
  DineIn_OnDemand_GrabApp_Price: number
  Delivery_OnDemand_StoreFront: boolean
  Delivery_OnDemand_StoreFront_Price: number
  Delivery_Scheduled_StoreFront: boolean
  Delivery_Scheduled_StoreFront_Price: number
  SelfPickUp_OnDemand_StoreFront: boolean
  SelfPickUp_OnDemand_StoreFront_Price: number
}

export const grabProductSchema = yup.object<GrabProductData>().shape({
  // merchant_id: yup.number().required().label('Merchant ID'),
  // provider_id: yup.number().required().label('Provider ID'),
  name: yup.string().required().label('Name'),
  // msku: yup.string().required().label('MSKU'),
  channel_sku: yup.string().required().label('Channel SKU'),
  // spu: yup.string().required().label('SPU'),
  price: yup.number().required().label('Price'),
  stock: yup.number().label('Stock').min(1),

  description: yup.string().optional().label('Description')
})
