import {
  Box,
  Button,
  InputLabel,
  MenuItem,
  Pagination,
  PaginationItem,
  Select
} from '@mui/material'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MetaType } from 'src/types/pagination/meta'
import BottomPaginationContainer from 'src/views/pagination/container'

type paginationCustomProps = {
  meta: MetaType | undefined
  itemSelected: any[]
  onChangePagination: (page: number, limit: number) => void
  itemPerPagesOption?: number[]
  onDeleteButton?: () => void
  button?: JSX.Element
}

export const defaultItemPerPages = [25, 50, 100, 250, 500]

const PaginationCustom = ({
  meta,
  itemSelected,
  onChangePagination,
  itemPerPagesOption,
  onDeleteButton,
  button
}: paginationCustomProps) => {
  const { t } = useTranslation()
  const [page, setPage] = useState<number>(1)
  const [itemPerPages, setItemPerPages] = useState(defaultItemPerPages[0])

  const [_itemPerPagesOption, setItemPerPagesOption] = useState<number[]>(
    itemPerPagesOption ?? defaultItemPerPages
  )

  useEffect(() => {
    if (itemPerPagesOption) {
      setItemPerPagesOption(itemPerPagesOption)
    }
  }, [itemPerPagesOption])

  useEffect(() => {
    if (meta && meta.per_page > 0) setItemPerPages(meta.per_page)

    if (meta && meta.page != page) setPage(meta.page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta])

  return (
    <BottomPaginationContainer>
      {itemSelected.length > 0 ? (
        <Fragment>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Select {itemSelected.length} record
          </Box>
          <div style={{ display: 'flex', padding: '20px', gap: 4 }}>
            {onDeleteButton && (
              <Button color='error' onClick={() => onDeleteButton()} variant='contained'>
                {t('Delete')}
              </Button>
            )}
            {button}
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              verticalAlign: 'center'
              // paddingLeft: theme => theme.spacing(0, 4)
            }}
          >
            <InputLabel>{t('Show')}</InputLabel>
            <Select
              placeholder='1'
              size='small'
              sx={{
                maxWidth: 60
              }}
              defaultValue={_itemPerPagesOption[0]}
              value={itemPerPages}
              onChange={e => {
                setPage(1)
                onChangePagination(1, e.target.value as number)

                setItemPerPages(e.target.value as number)
              }}
            >
              {_itemPerPagesOption.map((item, index) => (
                <MenuItem key={index} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
            <InputLabel>{t('Record per page')}</InputLabel>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '24px'
            }}
          >
            <Pagination
              page={page ?? 1}
              count={meta && meta.total_pages > 0 ? meta.total_pages : 1}
              shape='rounded'
              color='primary'
              onChange={(e, p) => {
                setPage(p)
                onChangePagination(p, itemPerPages)
              }}
              sx={{
                paddingTop: theme => theme.spacing(2),
                paddingBottom: theme => theme.spacing(2)
              }}
              renderItem={item => <PaginationItem {...item} />}
            />
          </Box>
          <Box
            sx={{
              position: 'fixed',
              alignItems: 'center',
              display: 'flex',
              paddingRight: '8px',
              right: 0,
              bottom: 0,
              height: '50px'
            }}
          >
            {t('Showing')} {meta?.per_page == 0 ? 0 : (page - 1) * itemPerPages + 1} {t('to')}{' '}
            {(meta?.total_count ?? 0) < page * itemPerPages
              ? meta?.total_count ?? 0
              : page * itemPerPages}{' '}
            {t('of')} {meta?.total_count} {t('Entries')}
          </Box>
        </Fragment>
      )}
    </BottomPaginationContainer>
  )
}

export default PaginationCustom
