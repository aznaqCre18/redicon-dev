import awsConfig from 'src/configs/aws'

export const getImageAwsUrl = (path: string) => {
  return `${awsConfig.s3_bucket_url}/${path}`
}

export const parseImageAws = (image: string) => {
  return image.replace(`${awsConfig.s3_bucket_url}/`, '')
}
