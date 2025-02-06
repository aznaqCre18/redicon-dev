type FontSizeBuilderOptions = {
  small: number | string
  default: number | string
  medium: number | string
}

type DisplayFont = 'small' | 'default' | 'medium'

type FontSizeBuilder = (
  displayFont: 'small' | 'default' | 'medium',
  options: FontSizeBuilderOptions
) => number | string

export const smaller = 0.9
export const bigger = 1.1

const fontSizeBuilder = (
  displayFont: DisplayFont,
  options: FontSizeBuilderOptions
): ReturnType<FontSizeBuilder> => {
  const { small, default: d, medium } = options

  switch (displayFont) {
    case 'default':
      return d
    case 'small':
      return small
    case 'medium':
      return medium
    default:
      return d
  }
}

export default fontSizeBuilder
