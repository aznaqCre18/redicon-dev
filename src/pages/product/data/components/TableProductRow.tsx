import { Box, Checkbox, Grid, InputAdornment, Tooltip, Typography } from '@mui/material'
import React, { useState } from 'react'
import { PriceMembershipType, ProductDetailType } from 'src/types/apps/productType'
import ColumnProduct from './table/ColumnProduct'
import { CRUDPermission } from 'src/utils/permissionUtils'
import ColumnPrice from './table/ColumnPrice'
import ColumnStock from './table/ColumnStock'
import { formatDate } from 'src/utils/dateUtils'
import ColumnAction from './table/ColumnAction'
import { Icon } from '@iconify/react'
import TextFieldNumberOnBlur from 'src/components/form/TextFieldNumberOnBlur'
import { useTranslation } from 'react-i18next'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { useAuth } from 'src/hooks/useAuth'
import { SupplierType } from 'src/types/apps/supplier'
import ColumnPurchasePrice from './table/ColumnPurchasePrice'
import { MembershipType } from 'src/types/apps/membershipType'
import { useSettings } from 'src/@core/hooks/useSettings'
import themeConfig from 'src/configs/themeConfig'

type Props = {
  no: number
  item: ProductDetailType
  permission: CRUDPermission
  checked: boolean
  outletData: OutletType[]
  supplierData: SupplierType[]
  membershipData: MembershipType[]
  setOpenDialogPriceAndStock: (id: number) => void
  onChangePrice: (id: number, price: PriceMembershipType) => void
  onChangePurchasePrice: (id: number, purchase_price: number) => void
  onChangeStock: (id: number, stock: number) => void
  handleDelete: (id: number) => void
  onUpdateVariant: (id: number, data: any) => void
  handleChangeCheckbox: (e: boolean, id: string, item?: ProductDetailType) => void
}

const TableProductRow = ({
  no,
  item,
  permission,
  checked,
  outletData,
  supplierData,
  membershipData,
  setOpenDialogPriceAndStock,
  onChangePrice,
  onChangePurchasePrice,
  onChangeStock,
  handleDelete,
  onUpdateVariant,
  handleChangeCheckbox
}: Props) => {
  const { checkModuleVendor } = useAuth()

  const { t } = useTranslation()
  const [showVariant, setShowVariant] = useState(false)

  const handleToggleVariant = () => {
    setShowVariant(!showVariant)
  }

  const horizontalScroll = checkModuleVendor('product-table-scroll-horizontal')
  const isGroupColumnDate = checkModuleVendor('product-table-column-group-date')
  const showColumnMembership = checkModuleVendor('product-table-column-price-membership')

  const {
    settings: { navCollapsed, layout }
  } = useSettings()

  const { collapsedNavigationSize } = themeConfig

  return (
    <Grid
      container
      columns={
        9 +
        (outletData.length > 1 ? 2 : 0) +
        (supplierData.length > 0 && checkModuleVendor('product-table-column-supplier') ? 2 : 0) +
        (checkModuleVendor('product-table-column-purchase-price') ? 1.5 : 0) +
        (showColumnMembership ? 1.5 * membershipData.length : 1.5) +
        (isGroupColumnDate ? 1.5 : 3) +
        // action full
        (horizontalScroll ? 1.5 : 1)
      }
      columnSpacing={4}
      sx={{
        py: 2,
        px: 4,
        borderBottom: '1px solid',
        borderColor: theme => theme.palette.divider
      }}
    >
      <Grid item xs={0.5}>
        <Checkbox
          checked={checked}
          sx={{
            padding: 0
          }}
          onChange={e => handleChangeCheckbox(e.target.checked, item.product.id.toString(), item)}
        />
      </Grid>
      <Grid item xs={0.5}>
        {no}
      </Grid>
      <Grid item xs={3}>
        <ColumnProduct product={item} permission={permission} showImage />
      </Grid>
      <Grid item xs={2}>
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {item.category?.name}
        </Typography>
      </Grid>
      {/* <Grid item xs={1.5}>
        {item.brand.name}
      </Grid> */}
      {outletData.length > 1 && (
        <Grid item xs={2}>
          {item.outlets ? (
            <Tooltip
              title={item.outlets.map(outlet => outlet.outlet.name).join(', ')}
              placement='top'
            >
              {item.outlets.length == outletData.length ? (
                <Typography variant='body2' sx={{ color: 'text.primary' }}>
                  {t('All') + ' Outlet'}
                </Typography>
              ) : item.outlets.length <= 1 ? (
                <Typography variant='body2' sx={{ color: 'text.primary' }}>
                  {item.outlets.map(outlet => outlet.outlet.name).join(', ')}
                </Typography>
              ) : (
                <Typography variant='body2' sx={{ color: 'text.primary' }}>
                  {item.outlets
                    .map(outlet => outlet.outlet.name)
                    .slice(0, 1)
                    .join(', ')}{' '}
                  , {item.outlets.length - 1} {t('Outlet')} lainnya
                </Typography>
              )}
            </Tooltip>
          ) : (
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
              {t('No Outlet')}
            </Typography>
          )}
        </Grid>
      )}
      {supplierData.length > 0 && checkModuleVendor('product-table-column-supplier') && (
        <Grid item xs={2}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {item.supplier?.name ?? '-'}
          </Typography>
        </Grid>
      )}
      {checkModuleVendor('product-table-column-purchase-price') && (
        <Grid item xs={1.5}>
          <ColumnPurchasePrice
            product={item}
            permission={permission}
            onChangePurchasePrice={onChangePurchasePrice}
          />
        </Grid>
      )}
      {showColumnMembership ? (
        membershipData.map(membership => (
          <Grid item xs={1.5} key={membership.id}>
            <ColumnPrice
              product={item}
              onChangePrice={onChangePrice}
              permission={permission}
              setShowVariant={handleToggleVariant}
              level={membership.level}
            />
          </Grid>
        ))
      ) : (
        <Grid item xs={1.5}>
          <ColumnPrice
            readonly
            product={item}
            onChangePrice={onChangePrice}
            permission={permission}
            setShowVariant={handleToggleVariant}
            level={1}
          />
        </Grid>
      )}
      <Grid item xs={1}>
        <ColumnStock
          product={item}
          onChangeStock={onChangeStock}
          permission={permission}
          setShowVariant={() => {
            setOpenDialogPriceAndStock(item.product.id)
          }}
        />
      </Grid>
      {isGroupColumnDate ? (
        <Grid item xs={1.5}>
          <div>
            <Typography variant='caption' color={'secondary'}>
              {t('Create/Update Time')}
            </Typography>
            <Typography variant='body2' fontSize={12} sx={{ color: 'text.primary' }}>
              {formatDate(item.product.created_at)}
            </Typography>
            <Typography variant='body2' fontSize={12} sx={{ color: 'text.primary' }}>
              {formatDate(item.product.updated_at)}
            </Typography>
          </div>
        </Grid>
      ) : (
        <>
          <Grid item xs={1.5}>
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
              {formatDate(item.product.created_at)}
            </Typography>
          </Grid>
          <Grid item xs={1.5}>
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
              {formatDate(item.product.updated_at)}
            </Typography>
          </Grid>
        </>
      )}
      <Grid item xs={horizontalScroll ? 1.5 : 2}>
        <ColumnAction product={item} permission={permission} handleDelete={handleDelete} />
      </Grid>
      {item.variants && (
        <>
          <Grid
            item
            xs={
              12 +
              (checkModuleVendor('product-table-column-supplier') ? 2 : 0) +
              (checkModuleVendor('product-table-column-purchase-price') ? 1.5 : 0) +
              (membershipData.length > 0 ? membershipData.length * 1.5 : 0) +
              (isGroupColumnDate ? 0 : 1.5)
            }
          >
            <Box
              sx={{
                backgroundColor: 'customColors.bodyBg',
                borderRadius: 1
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  px: 3,
                  py: 1.5,
                  mt: 4,
                  fontSize: 14,
                  fontWeight: 600,
                  ':hover': {
                    cursor: 'pointer'
                  },
                  maxWidth: horizontalScroll
                    ? `calc(100vw - 1rem - ${
                        layout === 'vertical' ? (navCollapsed ? collapsedNavigationSize : 220) : 0
                      }px - 2rem)`
                    : undefined
                }}
                onClick={handleToggleVariant}
              >
                <Box width={'100%'}>
                  {!showVariant ? (
                    t('Show product variant')
                  ) : (
                    // between
                    <Grid
                      container
                      columns={
                        membershipData.length > 1 ? 10.8 + (membershipData.length - 1) * 1 : 11.5
                      }
                    >
                      <Grid item xs={3.6}>
                        {t('Variant')}
                      </Grid>
                      <Grid item xs={2.1}>
                        VSKU
                      </Grid>
                      {membershipData.length > 1 ? (
                        <>
                          {membershipData.map((membership, index) => (
                            <Grid item xs={1.5} key={index}>
                              {membership.name}
                            </Grid>
                          ))}
                          <Grid item xs={1.5}>
                            {t('Stock')}
                          </Grid>
                        </>
                      ) : (
                        <>
                          {outletData.length > 1 && <Grid item xs={1}></Grid>}
                          <Grid item xs={outletData.length > 1 ? 1.5 : 2}>
                            {t('Price')}
                          </Grid>
                          <Grid item xs={outletData.length > 1 ? 1 : 1.5}>
                            {t('Stock')}
                          </Grid>
                        </>
                      )}
                    </Grid>
                  )}
                </Box>
                <Box>
                  {!showVariant ? (
                    <Icon icon='bi:chevron-down' width={14} height={14} inline />
                  ) : (
                    <Icon icon='bi:chevron-up' width={14} height={14} inline />
                  )}
                </Box>
              </Box>
              {showVariant && (
                <Box
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderTop: '1px solid',
                    borderColor: theme => theme.palette.divider,
                    maxWidth: horizontalScroll
                      ? `calc(100vw - 1rem - ${
                          layout === 'vertical' ? (navCollapsed ? collapsedNavigationSize : 220) : 0
                        }px - 2rem)`
                      : undefined
                  }}
                >
                  {item.variants.map((variant, index) => (
                    <Box
                      key={index}
                      sx={{
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: theme => theme.palette.divider,
                        // last
                        ...(index == item.variants.length - 1 && {
                          borderBottom: 'none'
                        })
                      }}
                    >
                      <Grid
                        container
                        columns={
                          membershipData.length > 1 ? 10.8 + (membershipData.length - 1) * 1 : 11.5
                        }
                        columnSpacing={4}
                        sx={{
                          alignItems: 'center'
                        }}
                      >
                        <Grid item xs={3.5}>
                          <Typography variant='body2' color='text.primary'>
                            {variant.attributes.map(a => a.value).join(' - ')}
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant='body2' color='text.primary'>
                            {variant.sku}
                          </Typography>
                        </Grid>
                        {membershipData.length > 1 ? (
                          <>
                            {membershipData.map((membership, index) => (
                              <Grid item xs={1.5} key={index}>
                                <TextFieldNumberOnBlur
                                  InputProps={{
                                    inputProps: {
                                      min: 0
                                    },
                                    startAdornment: (
                                      <InputAdornment position='start'>Rp</InputAdornment>
                                    )
                                  }}
                                  size='small'
                                  onBlur={value => {
                                    if (value != variant.price[membership.level]) {
                                      onUpdateVariant(variant.id, {
                                        price: {
                                          ...variant.price,
                                          [membership.level]: value as number
                                        }
                                      })
                                    }
                                  }}
                                  value={variant.price[membership.level]}
                                />
                              </Grid>
                            ))}
                            <Grid item xs={1.5}>
                              <TextFieldNumberOnBlur
                                InputProps={{
                                  inputProps: {
                                    min: 0
                                  }
                                }}
                                size='small'
                                onBlur={value => {
                                  if (value != variant.stock) {
                                    onUpdateVariant(variant.id, { stock: value as number })
                                  }
                                }}
                                value={variant.stock}
                              />
                            </Grid>
                          </>
                        ) : (
                          <>
                            {outletData.length > 1 && <Grid item xs={1}></Grid>}
                            <Grid item xs={outletData.length > 1 ? 1.5 : 2}>
                              <TextFieldNumberOnBlur
                                InputProps={{
                                  inputProps: {
                                    min: 0
                                  },
                                  startAdornment: (
                                    <InputAdornment position='start'>Rp</InputAdornment>
                                  )
                                }}
                                size='small'
                                onBlur={value => {
                                  if (value != variant.price['1']) {
                                    const price = variant.price
                                    price['1'] = value as number

                                    onUpdateVariant(variant.id, { price: price })
                                  }
                                }}
                                value={variant.price['1']}
                              />
                            </Grid>
                            <Grid item xs={outletData.length > 1 ? 1 : 1.5}>
                              <TextFieldNumberOnBlur
                                InputProps={{
                                  inputProps: {
                                    min: 0
                                  }
                                }}
                                size='small'
                                onBlur={value => {
                                  if (value != variant.stock) {
                                    onUpdateVariant(variant.id, { stock: value as number })
                                  }
                                }}
                                value={variant.stock}
                              />
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
        </>
      )}
    </Grid>
  )
}

export default TableProductRow
