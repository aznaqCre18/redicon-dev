import themeConfig from 'src/configs/themeConfig'

export const setTitlePage = (title: string) => {
  document.title = themeConfig.templateName + ' - ' + title
}
