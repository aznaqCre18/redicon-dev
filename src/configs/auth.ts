export default {
  meEndpoint: '/auth/me',
  loginEndpoint: process.env.NEXT_PUBLIC_API_URL + '/v1/user/sign-in/',
  registerEndpoint: process.env.NEXT_PUBLIC_API_URL + '/v1/user/sign-up/',
  profileEndpoint: process.env.NEXT_PUBLIC_API_URL + '/v1/user/profile/',
  permissionEndpoint: process.env.NEXT_PUBLIC_API_URL + '/v1/user/profile/permission/',
  permissionV2Endpoint: process.env.NEXT_PUBLIC_API_URL + '/v1/user/profile/permission/v2/',
  profileBusinessEndpoint: process.env.NEXT_PUBLIC_API_URL + '/v1/dashboard/profile/',
  vendorProfileModuleEndpoint: process.env.NEXT_PUBLIC_API_URL + '/v1/vendor/profile/module/',
  vendorProfileEndpoint: process.env.NEXT_PUBLIC_API_URL + '/v1/vendor/profile/',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
