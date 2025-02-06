import api from './core'

export const integrationService = {
  getUrlShopee() {
    return api.get<{ data: string }>('/integration/shopee/link')
  }
}
