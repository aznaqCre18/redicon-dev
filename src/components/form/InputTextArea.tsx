import { TextareaAutosize, styled } from '@mui/material'

export const InputTextArea = styled(TextareaAutosize)(
  ({ theme }) => `
    min-width: 100%;
    max-width: 100%;
    min-height: 4.5;
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 12px;
    border-radius: 8px 8px 0 8px;
    color: ${theme.palette.text.primary};
    background: ${theme.palette.background.paper};
    border: 1px solid ${theme.palette.divider};

    &:focus {
      border-color: ${theme.palette.primary.main};
    }

    // firefox
    &:focus-visible {
      outline: 0;
    }
  `
)
