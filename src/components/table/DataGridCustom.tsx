import { DataGrid, DataGridProps, GridSortModel } from '@mui/x-data-grid'
import React, { Ref, SetStateAction, forwardRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'

type props = {
  setPaginationData?: (value: SetStateAction<PageOptionRequestType>) => void | null
  meta?: MetaType | undefined
  onChangePagination?: (page: number, limit: number) => void
  pageSize?: number
} & Omit<DataGridProps, 'sortingMode' & 'onSortModelChange'>

const DataGridCustom = forwardRef(({ setPaginationData, ...props }: props, ref) => {
  const { t } = useTranslation()
  const handleSortModelChange = useCallback(
    (sortModel: GridSortModel) => {
      if (setPaginationData) {
        // Here you save the data you need from the sort model
        if (sortModel.length > 0) {
          setPaginationData(old => ({
            ...old,
            order: sortModel[0].field,
            sort: sortModel[0].sort as 'asc' | 'desc'
          }))
        } else {
          setPaginationData(old => ({
            ...old,
            order: 'created_at',
            sort: 'desc'
          }))
        }
      }

      // setQueryOptions({ sortModel: [...sortModel] })
    },
    [setPaginationData]
  )

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: props.pageSize ?? 25
  })

  useEffect(() => {
    if (props.onChangePagination) {
      props.onChangePagination(paginationModel.page + 1, paginationModel.pageSize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel])

  return (
    <DataGrid
      ref={ref as Ref<HTMLDivElement>}
      {...props}
      initialState={{
        ...props.initialState,
        pagination: {
          paginationModel: {
            pageSize: props.pageSize ?? 25
          }
        }
      }}
      pageSizeOptions={[10, 25, 50, 100]}
      localeText={{
        noRowsLabel: t('No data') ?? 'No data'
      }}
      slotProps={{
        pagination: {
          labelRowsPerPage: t('Rows per page:')
        }
      }}
      sortingMode='server'
      filterMode='server'
      paginationMode='server'
      onSortModelChange={handleSortModelChange}
      onPaginationModelChange={setPaginationModel}
      rowCount={props.meta?.total_count ?? undefined}
    />
  )
})

export default DataGridCustom
