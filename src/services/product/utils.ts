// import { ProductType } from 'src/types/apps/productType'
// import api from '../core'

// export const productUtilsService = {
//   checkSku(data: { currentId?: number | null; sku: string }) {
//     return api.get<{ data: ProductType[] }>(`product?limit=1&page=1&sku=${data.sku}`).then(res => {
//       if (res.data.data && res.data.data.length > 0) {
//         if (data.currentId && res.data.data[0].id === data.currentId) {
//           return true
//         } else {
//           return false
//         }
//       } else {
//         return true
//       }
//     })
//   },

//   checkProductName(data: { currentId?: number | null; name: string }) {
//     return api
//       .get<{ data: ProductType[] }>(`product?limit=1&page=1&name=${data.name}`)
//       .then(res => {
//         if (res.data.data && res.data.data.length > 0) {
//           if (data.currentId && res.data.data[0].id === data.currentId) {
//             return true
//           } else {
//             return false
//           }
//         } else {
//           return true
//         }
//       })
//   }
// }
