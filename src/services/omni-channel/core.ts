import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'
import authConfig from 'src/configs/auth'
import { getErrorCustomMsg } from '../../utils/customErrorMsg'
import { isDisplayErrorToast } from 'src/utils/toastUtils'

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_OMNICHANNEL_URL ?? 'https://omnichannel.shopi.id'
})

instance.interceptors.request.use(config => {
  const accessToken = localStorage.getItem(authConfig.storageTokenKeyName)

  if (accessToken) {
    config.headers.Authorization = `${accessToken}`
  }

  config.headers['Accept'] = 'application/json'

  return config
})

// handle error response
instance.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response && error.response.status === 500) {
      if (error.response.data && error.response.data.message == 'Internal server error') {
        toast.error(
          'Terjadi kendala saat proses permintaa Anda, silakan coba kembali beberapa saat lagi.'
        )
      } else {
        toast.error(
          'Saat ini sistem kami sedang mengalami lonjakan pengguna, mohon coba kembali dalam beberapa saat kemudian'
        )
      }
    } else if (error.response && error.response.status === 502) {
      toast.error(
        'Saat ini sistem kami sedang mengalami lonjakan pengguna, mohon coba kembali dalam beberapa saat kemudian'
      )
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Silakan cek koneksi jaringan anda.')
    } else {
      if (isDisplayErrorToast(error.config.url)) {
        if (error.response && error.response.data && error.response.data.data) {
          toast.error(getErrorCustomMsg(error.response?.data?.data))
        } else if (error.response && error.response.data && error.response.data.message) {
          toast.error(getErrorCustomMsg(error.response?.data?.message))
        } else {
          toast.error(getErrorCustomMsg(error.message))
        }
      }
    }

    return Promise.reject(error)
  }
)

const endSlash = false

const urlTrail = (url: string) => {
  const paramsGet = url.split('?')
  const endpoint = paramsGet[0]
  const params = paramsGet[1]

  if (endSlash) {
    return `${endpoint}/`
  }
  console.log(`${endpoint}/`)

  return params ? `${endpoint}?${params}` : endpoint
}

const api = (axios: AxiosInstance) => {
  return {
    get<T>(url: string, config?: AxiosRequestConfig, unslash?: boolean) {
      if (config && config.params) {
        // delete space in start and end string
        Object.keys(config.params).forEach(key => {
          if (typeof config.params[key] === 'string') {
            config.params[key] = config.params[key].trim()
            if (config.params[key] === '') {
              delete config.params[key]
            }
          }
        })
      }

      return axios.get<T>(unslash ? url : urlTrail(url), config)
    },

    getAsync<T>(url: string, config?: AxiosRequestConfig, unslash?: boolean) {
      if (config && config.params) {
        // delete space in start and end string
        Object.keys(config.params).forEach(key => {
          if (typeof config.params[key] === 'string') {
            config.params[key] = config.params[key].trim()
            if (config.params[key] === '') {
              delete config.params[key]
            }
          }
        })
      }

      return axios.get<T>(unslash ? url : urlTrail(url), config)
    },

    post<T>(
      url: string,
      body?: Record<string, any>,
      config?: AxiosRequestConfig,
      unslash?: boolean
    ) {
      if (config && config.params) {
        // delete space in start and end string
        Object.keys(config.params).forEach(key => {
          if (typeof config.params[key] === 'string') {
            config.params[key] = config.params[key].trim()
          }
        })
      }

      return axios.post<T>(unslash ? url : urlTrail(url), body, config)
    },

    postFormData<T>(url: string, body?: FormData, config?: AxiosRequestConfig, unslash?: boolean) {
      if (config && config.params) {
        // delete space in start and end string
        Object.keys(config.params).forEach(key => {
          if (typeof config.params[key] === 'string') {
            config.params[key] = config.params[key].trim()
          }
        })
      }

      return axios.post<T>(unslash ? url : urlTrail(url), body, config)
    },

    patch<T>(
      url: string,
      body?: Record<string, any>,
      config?: AxiosRequestConfig,
      unslash?: boolean
    ) {
      if (config && config.params) {
        // delete space in start and end string
        Object.keys(config.params).forEach(key => {
          if (typeof config.params[key] === 'string') {
            config.params[key] = config.params[key].trim()
          }
        })
      }

      return axios.patch<T>(unslash ? url : urlTrail(url), body, config)
    },

    put<T>(
      url: string,
      body?: Record<string, any>,
      config?: AxiosRequestConfig,
      unslash?: boolean
    ) {
      if (config && config.params) {
        // delete space in start and end string
        Object.keys(config.params).forEach(key => {
          if (typeof config.params[key] === 'string') {
            config.params[key] = config.params[key].trim()
          }
        })
      }

      return axios.put<T>(unslash ? url : urlTrail(url), body, config)
    },

    patchFormData<T>(url: string, body?: FormData, config?: AxiosRequestConfig, unslash?: boolean) {
      if (config && config.params) {
        // delete space in start and end string
        Object.keys(config.params).forEach(key => {
          if (typeof config.params[key] === 'string') {
            config.params[key] = config.params[key].trim()
          }
        })
      }

      return axios.patch<T>(unslash ? url : urlTrail(url), body, config)
    },

    delete<T>(url: string, config?: AxiosRequestConfig, unslash?: boolean) {
      if (config && config.params) {
        // delete space in start and end string
        Object.keys(config.params).forEach(key => {
          if (typeof config.params[key] === 'string') {
            config.params[key] = config.params[key].trim()
          }
        })
      }

      return axios.delete<T>(unslash ? url : urlTrail(url), config)
    },

    deleteBatch<T>(
      url: string,
      body?: Record<string, any>,
      config?: AxiosRequestConfig,
      unslash?: boolean
    ) {
      if (config && config.params) {
        // delete space in start and end string
        Object.keys(config.params).forEach(key => {
          if (typeof config.params[key] === 'string') {
            config.params[key] = config.params[key].trim()
          }
        })
      }

      return axios.delete<T>(unslash ? url : urlTrail(url), { ...config, data: body })
    }
  }
}

export default api(instance)
