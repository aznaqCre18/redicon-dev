import { RajaOngkirData } from 'src/types/apps/rajaOngkir'
import api from './core'

export const rajaOngkirService = {
  get(data: { subdistrict_id: number; weight: number }) {
    return api.get<{
      data: {
        data: RajaOngkirData[]
      }
    }>('/v1/storefront/courier/raja-ongkir', {
      baseURL: process.env.NEXT_PUBLIC_API_URL!.replace('/v1', ''),
      params: data
    })
  }
}
