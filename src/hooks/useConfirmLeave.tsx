import { useRouter } from 'next/router'
import nProgress from 'nprogress'
import React from 'react'

export const useConfirmLeave = (shouldConfirmLeave = true) => {
  const [_shouldConfirmLeave, setShouldConfirmLeave] = React.useState(shouldConfirmLeave)
  const [shouldShowLeaveConfirmDialog, setShouldShowLeaveConfirmDialog] = React.useState(false)
  const [nextRouterPath, setNextRouterPath] = React.useState<string | null>()

  const Router = useRouter()

  const onRouteChangeStart = React.useCallback(
    (nextPath: string) => {
      if (!_shouldConfirmLeave) {
        return
      }

      setShouldShowLeaveConfirmDialog(true)
      setNextRouterPath(nextPath)

      throw 'cancelRouteChange'
    },
    [_shouldConfirmLeave]
  )

  const onRejectRouteChange = () => {
    nProgress.done()
    setNextRouterPath(null)
    setShouldShowLeaveConfirmDialog(false)
  }

  const onConfirmRouteChange = () => {
    setShouldShowLeaveConfirmDialog(false)
    // simply remove the listener here so that it doesn't get triggered when we push the new route.
    // This assumes that the component will be removed anyway as the route changes
    removeListener()
    if (nextRouterPath) Router.push(nextRouterPath)
  }

  const removeListener = () => {
    Router.events.off('routeChangeStart', onRouteChangeStart)
  }

  React.useEffect(() => {
    Router.events.on('routeChangeStart', onRouteChangeStart)

    return removeListener
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRouteChangeStart])

  React.useEffect(() => {
    if (!_shouldConfirmLeave) {
      return
    }
    window.onbeforeunload = function (event) {
      const confirmationMessage = 'Are you sure you want to leave?'
      if (!confirm(confirmationMessage)) {
        event.preventDefault()
      }
    }

    return () => {
      window.onbeforeunload = null
    }
  }, [_shouldConfirmLeave])

  React.useEffect(() => {
    if (shouldShowLeaveConfirmDialog) {
      const confirmationMessage = 'Are you sure you want to leave?'
      if (!confirm(confirmationMessage)) {
        onRejectRouteChange()
      } else {
        onConfirmRouteChange()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowLeaveConfirmDialog])

  return { setShouldConfirmLeave }
}
