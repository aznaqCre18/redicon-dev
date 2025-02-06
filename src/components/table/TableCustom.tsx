import { Icon } from '@iconify/react'
import {
  Box,
  Checkbox,
  CheckboxProps,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import {
  ColumnDef,
  OnChangeFn,
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PageOptionRequestType } from 'src/types/pagination/pagination'

type GridRowModel<R extends GridValidRowModel = GridValidRowModel> = R
type GridRowsProp<R extends GridValidRowModel = GridValidRowModel> = GridRowModel<R>[]
type GridValidRowModel = {
  [key: string]: any
}

export interface GridCheckedProp {
  checked: boolean
  type: 'all' | 'row'
  row: GridValidRowModel
}

export interface TableColumnSortProp {
  column: string
  sort: 'asc' | 'desc'
}

export interface TableCustomProps<R extends GridValidRowModel = any> {
  data: GridRowsProp<R>
  columns: ColumnDef<R>[]
  pagination: PageOptionRequestType
  isLoading?: boolean
  onRowSelected?: OnChangeFn<RowSelectionState>
  onColumnSorting?: (data: TableColumnSortProp) => void
}

const TableCustom = ({
  data,
  columns,
  pagination,
  isLoading,
  onRowSelected,
  onColumnSorting
}: TableCustomProps) => {
  const { t } = useTranslation()
  const [rowSelection, setRowSelection] = React.useState({})
  const [sorting, setSorting] = React.useState<SortingState>([])

  useEffect(() => {
    if (onRowSelected) {
      onRowSelected(rowSelection)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  useEffect(() => {
    if (onColumnSorting && sorting[0]) {
      onColumnSorting({
        column: sorting[0]?.id,
        sort: sorting[0]?.desc ? 'desc' : 'asc'
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting])

  const _columns: typeof columns = [
    {
      id: 'select',
      size: 1,
      header: ({ table }) => (
        <IndeterminateCheckbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler()
          }}
        />
      ),
      cell: ({ row }) => (
        <div className='px-1'>
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        </div>
      )
    },
    ...columns
  ]

  const table = useReactTable({
    data,
    columns: _columns,
    enableRowSelection: true,
    state: {
      rowSelection,
      sorting
    },
    // selection
    onRowSelectionChange: setRowSelection,
    // sorting
    onSortingChange: setSorting,
    // resizing
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',

    // Pipeline
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  useEffect(() => {
    table.setPageSize(pagination.limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination])

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper}>
        <Table
          {...{
            style: {
              // width: table.getCenterTotalSize()
            }
          }}
        >
          <TableHead
            sx={theme => ({
              '& > *': {
                backgroundColor: theme.palette.customColors.tableHeaderBg,
                borderColor: theme.palette.divider
              },
              '& th': {
                paddingTop: 2.5,
                paddingBottom: 2.5
              },
              '& th:first-child': {
                paddingLeft: '0.8rem !important'
              }
            })}
          >
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableCell
                      key={header.id}
                      sx={{
                        width: header.getSize()
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? 'cursor-pointer select-none flex items-center'
                              : '',
                            onClick: header.column.getToggleSortingHandler()
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: (
                              <IconButton size='small'>
                                <Icon icon='akar-icons:arrow-up' fontSize={'0.8rem'} />
                              </IconButton>
                            ),
                            desc: (
                              <IconButton size='small'>
                                <Icon icon='akar-icons:arrow-down' fontSize={'0.8rem'} />
                              </IconButton>
                            )
                          }[header.column.getIsSorted() as string] ?? null}
                          <div
                            {...{
                              onDoubleClick: () => header.column.resetSize(),
                              onMouseDown: header.getResizeHandler(),
                              onTouchStart: header.getResizeHandler(),
                              className: `resizer ${table.options.columnResizeDirection} ${
                                header.column.getIsResizing() ? 'isResizing' : ''
                              }`,
                              style: {
                                transform: header.column.getIsResizing()
                                  ? `translateX(${
                                      (table.options.columnResizeDirection === 'rtl' ? -1 : 1) *
                                      (table.getState().columnSizingInfo.deltaOffset ?? 0)
                                    }px)`
                                  : ''
                              }
                            }}
                          />
                          {/* {header.column.getCanFilter() ? (
                            <div>
                              <Filter column={header.column} table={table} />
                            </div>
                          ) : null} */}
                        </div>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody
            sx={{
              '& td:first-child': {
                paddingLeft: '0.8rem !important'
              }
            }}
          >
            {isLoading ? (
              <Box
                sx={{
                  marginY: '1rem',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <CircularProgress />
                <Typography>{t('Loading...')}</Typography>
              </Box>
            ) : (
              table.getRowModel().rows.map(row => {
                return (
                  <TableRow
                    key={row.id}
                    sx={{
                      verticalAlign: 'top'
                    }}
                  >
                    {row.getVisibleCells().map(cell => {
                      return (
                        <TableCell
                          key={cell.id}
                          sx={{
                            width: cell.column.getSize()
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {isLoading && (
        <Box
          sx={{
            marginY: '1rem',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}
        >
          <span>{t('No data')}</span>
        </Box>
      )}
    </Box>
  )
}

export default TableCustom

function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & CheckboxProps) {
  const ref = React.useRef<HTMLInputElement>(null!)

  React.useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, indeterminate])

  return (
    <Checkbox
      sx={{
        '&.MuiCheckbox-root': {
          padding: 0
        }
      }}
      inputRef={ref}
      className={className + ' cursor-pointer'}
      indeterminate={indeterminate}
      {...rest}
    />
  )

  //   return <input type='checkbox' ref={ref} className={className + ' cursor-pointer'} {...rest} />
}
