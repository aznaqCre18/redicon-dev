// ** MUI Theme Provider
import { deepmerge } from '@mui/utils'
import { PaletteMode, ThemeOptions } from '@mui/material'

// ** User Theme Options
import UserThemeOptions from 'src/layouts/UserThemeOptions'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Theme Override Imports
import palette from './palette'
import spacing from './spacing'
import shadows from './shadows'
import overrides from './overrides'
import typography from './typography'
import breakpoints from './breakpoints'

const themeOptions = (settings: Settings, overrideMode: PaletteMode): ThemeOptions => {
  // ** Vars
  const { skin, mode, direction, themeColor, displayFont } = settings

  const smaller = 0.9
  const bigger = 1.1
  const fontSizeBuilder = (s: string | number, d: string | number, m: string | number) => {
    switch (displayFont) {
      case 'default':
        return d
      case 'small':
        return s
      case 'medium':
        return m
      default:
        return d
    }
  }
  // ** Create New object before removing user component overrides and typography objects from userThemeOptions
  const userThemeConfig: ThemeOptions = Object.assign({}, UserThemeOptions())

  const mergedThemeConfig: ThemeOptions = deepmerge(
    {
      breakpoints: breakpoints(),
      direction,
      components: overrides(settings),
      palette: palette(mode === 'semi-dark' ? overrideMode : mode, skin),
      ...spacing,
      shape: {
        borderRadius: 6
      },
      mixins: {
        toolbar: {
          minHeight: 64
        }
      },
      fontSize: fontSizeBuilder(13.125 * smaller, 13.125, 13.125 * bigger),
      // .9 10% smaller
      // 1.1 10% bigger
      shadows: shadows(mode === 'semi-dark' ? overrideMode : mode),
      typography: {
        ...typography,

        h1: {
          fontWeight: 500,
          fontSize: fontSizeBuilder(`${2.375 * smaller}rem`, '2.375rem', `${2.375 * bigger}rem`),
          lineHeight: 1.368421
        },
        h2: {
          fontWeight: 500,
          fontSize: fontSizeBuilder(`${2 * smaller}rem`, '2rem', `${2 * bigger}rem`),
          lineHeight: 1.375
        },
        h3: {
          fontWeight: 500,
          lineHeight: 1.38462,
          fontSize: fontSizeBuilder(`${1.625 * smaller}rem`, '1.625rem', `${1.625 * bigger}rem`)
        },
        h4: {
          fontWeight: 500,
          lineHeight: 1.364,
          fontSize: fontSizeBuilder(`${1.375 * smaller}rem`, '1.375rem', `${1.375 * bigger}rem`)
        },
        h5: {
          fontWeight: 500,
          lineHeight: 1.3334,
          fontSize: fontSizeBuilder(`${1.125 * smaller}rem`, '1.125rem', `${1.125 * bigger}rem`)
        },
        h6: {
          lineHeight: 1.4,
          fontSize: fontSizeBuilder(`${0.9375 * smaller}rem`, '0.9375rem', `${0.9375 * bigger}rem`)
        },
        subtitle1: {
          fontSize: fontSizeBuilder(`${1 * smaller}rem`, '1rem', `${1 * bigger}rem`),
          letterSpacing: '0.15px'
        },
        subtitle2: {
          lineHeight: 1.32,
          fontSize: fontSizeBuilder(`${0.875 * smaller}rem`, '0.875rem', `${0.875 * bigger}rem`),
          letterSpacing: '0.1px'
        },
        body1: {
          lineHeight: 1.467,
          fontSize: fontSizeBuilder(`${0.9375 * smaller}rem`, '0.9375rem', `${0.9375 * bigger}rem`)
        },
        body2: {
          lineHeight: 1.53846154,
          fontSize: fontSizeBuilder(`${0.8125 * smaller}rem`, '0.8125rem', `${0.8125 * bigger}rem`)
        },
        button: {
          lineHeight: 1.2,
          fontSize: fontSizeBuilder(`${0.9375 * smaller}rem`, '0.9375rem', `${0.9375 * bigger}rem`),
          letterSpacing: '0.43px'
        },
        caption: {
          lineHeight: 1.273,
          fontSize: fontSizeBuilder(`${0.6875 * smaller}rem`, '0.6875rem', `${0.6875 * bigger}rem`)
        },
        overline: {
          fontSize: fontSizeBuilder(`${0.75 * smaller}rem`, '0.75rem', `${0.75 * bigger}rem`),
          letterSpacing: '1px'
        }
      }
    },
    userThemeConfig
  )

  return deepmerge(mergedThemeConfig, {
    palette: {
      primary: {
        ...(mergedThemeConfig.palette
          ? mergedThemeConfig.palette[themeColor]
          : palette(mode === 'semi-dark' ? overrideMode : mode, skin).primary)
      }
    }
  })
}

export default themeOptions
