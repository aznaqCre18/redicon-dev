import { PaletteColorOptions, PaletteColor } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    customColors: {
      dark: string
      main: string
      light: string
      bodyBg: string
      trackBg: string
      avatarBg: string
      darkPaperBg: string
      lightPaperBg: string
      tableHeaderBg: string
      violet?: string
    }
  }
  interface PaletteOptions {
    customColors?: {
      dark?: string
      main?: string
      light?: string
      bodyBg?: string
      trackBg?: string
      avatarBg?: string
      darkPaperBg?: string
      lightPaperBg?: string
      tableHeaderBg?: string
      violet?: string
    }
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    tonal: true
  }
}

declare module '@mui/material/styles' {
  interface Palette {
    violet: PaletteColor
  }
  interface PaletteOptions {
    violet?: PaletteColorOptions
  }
}

declare module '@mui/material/LinearProgress' {
  interface LinearProgressPropsColorOverrides {
    violet: true
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    violet: true
  }
}

declare module '@mui/material/Checkbox' {
  interface CheckboxPropsColorOverrides {
    violet: true
  }
}
declare module '@mui/material/Radio' {
  interface RadioPropsColorOverrides {
    violet: true
  }
}

declare module '@mui/material/CircularProgress' {
  interface CircularProgressPropsColorOverrides {
    violet: true
  }
}

declare module '@mui/material/ButtonGroup' {
  interface ButtonGroupPropsVariantOverrides {
    tonal: true
  }
}

export {}
