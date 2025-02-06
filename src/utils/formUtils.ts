import { yupLangId } from 'src/lang/yup-id'

export const translateFormYupMsg = (msg: string | undefined, lang?: 'id' | 'en') => {
  if (lang !== 'id') return msg
  if (!msg) return msg

  let newMsg = msg

  Object.keys(yupLangId).map(item => {
    newMsg = newMsg?.replace(item, (yupLangId as any)[item] ?? item)
  })

  return newMsg
}

export const errorInput = (
  errors: any,
  name: string,
  customValue?: boolean,
  lang?: 'id' | 'en'
) => {
  let error = Boolean(errors[name])
  let helperText = error && errors[name]?.message

  // translate custom error
  helperText = translateFormYupMsg(helperText, lang)

  if (customValue) {
    error = customValue
  }

  return {
    error,
    helperText
  }
}
