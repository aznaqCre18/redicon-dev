export const isDisplayErrorToast = (url: string) => {
  const filter = patchDisabledToasts.filter(item => item === url)

  console.log(filter)

  return filter.length === 0
}

const patchDisabledToasts: string[] = ['/vendor/check-phone/', '/vendor/check-email/']
