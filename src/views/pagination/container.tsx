import React, { useEffect, useRef } from 'react'
import { Box, Card, SxProps, Theme } from '@mui/material'
import { atom, useAtom } from 'jotai'

type BottomPaginationContainerProps = {
  children: React.ReactNode | React.ReactNode[]
  sx?: SxProps<Theme>
}

export const bottomScrollElAtom = atom<Element | null>(null)
export const bottomWrapScrollWidthAtom = atom<number | null>(null)

const BottomPaginationContainer = ({ children, ...rest }: BottomPaginationContainerProps) => {
  const [bottomScrollEl] = useAtom(bottomScrollElAtom)
  const [bottomWrapScrollWidth] = useAtom(bottomWrapScrollWidthAtom)

  const refWrapper = useRef<HTMLDivElement | null>()

  useEffect(() => {
    if (bottomScrollEl?.parentElement) {
      bottomScrollEl.parentElement.onscroll = function () {
        if (refWrapper.current)
          refWrapper.current.scrollLeft = bottomScrollEl.parentElement?.scrollLeft ?? 0
      }
    }
    if (refWrapper?.current) {
      refWrapper.current.onscroll = function () {
        if (bottomScrollEl?.parentElement)
          bottomScrollEl.parentElement.scrollLeft = refWrapper.current?.scrollLeft ?? 0
      }
    }
  }, [bottomScrollEl, bottomWrapScrollWidth])

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        position: 'fixed',
        zIndex: 10,
        bottom: 0
      }}
    >
      {bottomWrapScrollWidth && bottomScrollEl && (
        <Box
          ref={refWrapper}
          sx={{
            width: `${bottomWrapScrollWidth}px`,
            overflowX: 'overlay',
            overflowY: 'hidden'
          }}
        >
          <Box
            sx={{
              width: `${bottomScrollEl.clientWidth}px`,
              height: '20px'
            }}
          ></Box>
        </Box>
      )}
      <Card
        sx={{
          display: 'flex',
          width: '100%',
          maxWidth: '100%',
          borderRadius: '0px',
          maxHeight: '50px',
          alignItems: 'center',
          overflow: 'hidden',
          marginLeft: theme => theme.spacing(-6),
          marginRight: theme => theme.spacing(-6),
          paddingLeft: theme => theme.spacing(6),
          paddingRight: theme => theme.spacing(4),
          gap: theme => theme.spacing(2),
          '@media (max-width: 900px)': {
            marginLeft: theme => theme.spacing(0),
            marginRight: theme => theme.spacing(0),
            paddingLeft: theme => theme.spacing(6),
            paddingRight: theme => theme.spacing(2),
            width: '100%',
            maxWidth: 'unset',
            // justifyContent: 'space-between',
            left: 0
          },
          ...rest.sx
        }}
        {...rest}
      >
        {children}
      </Card>
    </Box>
  )
}
export default BottomPaginationContainer
