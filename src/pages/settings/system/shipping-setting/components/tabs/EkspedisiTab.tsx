import { Icon } from '@iconify/react'
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  Typography
} from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import { ChangeEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useAuth } from 'src/hooks/useAuth'
import { MetaType } from 'src/types/pagination/meta'
import {
  PageOptionRequestType,
  defaultPagination,
  maxLimitPagination
} from 'src/types/pagination/pagination'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import TableHeader from 'src/views/setting/components/TableHeader'
import FormEkspedisiDialog from '../dialog/FormEkspedisiDialog'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { ExpeditionType } from 'src/types/apps/vendor/expedition'
import { expeditionService } from 'src/services/vendor/expedition'
import { locationProvinceService } from 'src/services/location/province'
import {
  DistrictType,
  LocationRequestType,
  ProvinceType,
  SubDistrictType
} from 'src/types/apps/locationType'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { locationDistrictService } from 'src/services/location/discrict'
import { locationSubDistrictService } from 'src/services/location/subdistrict'
import { AddressStoreDetailType } from 'src/types/apps/vendor/settings/store'
import { vendorStoreAddressService } from 'src/services/vendor/storeAddress'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { ResponseType } from 'src/types/response/response'

const EkspedisiTab = () => {
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const { checkPermission } = useAuth()
  const router = useRouter()

  // TABLE BANK

  const [selectedData, setSelectedData] = useState<ExpeditionType | null>(null)
  const [openDialog, setOpenDialog] = useState(false)

  const [dataMeta, setDataMeta] = useState<MetaType>()
  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    order: 'created_at',
    ...defaultPagination,
    ...router.query
  } as any)
  const [datas, setDatas] = useState<ExpeditionType[]>([])

  useEffect(() => {
    router.replace({
      query: pageOption,
      hash: 'expedition'
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageOption])

  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')

  // ** Query
  useQuery(['expedition-list', pageOption], {
    queryFn: () => expeditionService.getList(pageOption),
    onSuccess: data => {
      setDatas(data.data.data ?? [])

      setDataMeta(data.data.meta)
    },
    enabled: checkPermission('setting - shipping.read')
  })

  // ** Mutation
  const [addressStore, setAddressStore] = useState<AddressStoreDetailType | null>(null)

  const [isLoadingOnlineStore, setIsLoadingOnlineStore] = useState(true)

  useQuery(['address-store'], vendorStoreAddressService.getAddress, {
    onSuccess: data => {
      setAddressStore(data.data.data)
    },
    onError: () => {
      setIsLoadingOnlineStore(false)
    },
    retry: 0
  })

  useEffect(() => {
    if (addressStore) {
      setProvinces([addressStore.address.province])
      setDistricts([addressStore.address.district])
      setSubDistricts([addressStore.address.sub_district])

      setProvince(addressStore.address.province)
      setDistrict(addressStore.address.district)
      setSubDistrict(addressStore.address.sub_district)

      setIsLoadingOnlineStore(false)
    }
  }, [addressStore])

  const { mutate: updateAddressStore } = useMutation(vendorStoreAddressService.setAddress, {
    onSuccess: data => {
      toast.success(t(data.data.message))
    }
  })

  const [provinceOptions, setProvinceOptions] = useState<LocationRequestType>({
    ...maxLimitPagination,
    name: ''
  })
  const [province, setProvince] = useState<ProvinceType | null>(null)
  const [provinces, setProvinces] = useState<ProvinceType[]>([])
  const { mutate: getProvince } = useMutation(locationProvinceService.getAll, {
    onSuccess: data => {
      if (provinceOptions.id) {
        setProvince(data.data.data.find(item => item.id === provinceOptions.id) ?? null)

        setProvinceOptions({ ...provinceOptions, id: undefined })
      } else setProvinces(data.data.data ?? [])
    }
  })

  useEffect(() => {
    getProvince(provinceOptions)
  }, [getProvince, provinceOptions, isLoadingOnlineStore])

  const [districtOptions, setDistrictOptions] = useState<LocationRequestType>({
    ...maxLimitPagination,
    name: ''
  })
  const [district, setDistrict] = useState<DistrictType | null>(null)
  const [districts, setDistricts] = useState<DistrictType[]>([])
  const { mutate: getDistrict } = useMutation(locationDistrictService.getAll, {
    onSuccess: data => {
      if (districtOptions.id) {
        setDistrict(data.data.data.find(item => item.id === districtOptions.id) ?? null)

        setDistrictOptions({ ...districtOptions, id: undefined })
      } else setDistricts(data.data.data ?? [])
    }
  })

  useEffect(() => {
    if (province)
      getDistrict({
        ...districtOptions,
        province_id: province.id
      })
  }, [isLoadingOnlineStore, getDistrict, districtOptions, province])

  const [subDistrictOptions, setSubDistrictOptions] = useState<LocationRequestType>({
    ...maxLimitPagination,
    name: ''
  })
  const [subDistrict, setSubDistrict] = useState<SubDistrictType | null>(null)
  const [subDistricts, setSubDistricts] = useState<SubDistrictType[]>([])
  const { mutate: getSubDistrict } = useMutation(locationSubDistrictService.getAll, {
    onSuccess: data => {
      if (subDistrictOptions.id) {
        setSubDistrict(data.data.data.find(item => item.id === subDistrictOptions.id) ?? null)

        setSubDistrictOptions({ ...subDistrictOptions, id: undefined })
      } else setSubDistricts(data.data.data ?? [])
    }
  })

  useEffect(() => {
    if (district)
      getSubDistrict({
        ...subDistrictOptions,
        district_id: district.id
      })
  }, [getSubDistrict, subDistrictOptions, district, isLoadingOnlineStore])

  // ** Handle
  const handleToggle = () => {
    setSelectedData(null)
    setOpenDialog(false)
  }

  const handleEdit = (data: ExpeditionType) => {
    setSelectedData(data)
    setOpenDialog(true)
  }

  const [itemSelected, setItemSelected] = useState<ExpeditionType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: setStatus } = useMutation(expeditionService.setStatus, {
    onSuccess: data => {
      toast.success(t((data as any).data.message))
      queryClient.invalidateQueries('expedition-list')
    }
  })
  const setStatusEkspedisi = (id: number, status: boolean) => {
    setStatus({ id: id, status })
  }

  const { mutate: setBatchStatus } = useMutation(expeditionService.batchUpdateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('expedition-list')
    }
  })

  const setBatchStatusEkspedisi = (status: boolean) => {
    const ids = itemSelected.map(item => item.id) as number[]

    setBatchStatus({ ids, status })
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number | 'all',
    data?: ExpeditionType
  ) => {
    if (id !== 'all') {
      if (data && event.target.checked) setItemSelected([...itemSelected, data])
      else if (data && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != data.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(datas)
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const columns: GridColDef<ExpeditionType>[] = [
    {
      cellClassName: 'padding-left-01rem',
      headerClassName: 'padding-left-01rem',
      width: 42,
      headerName: 'Checkbox',
      field: 'checkbox',
      renderCell: index => {
        return (
          <Checkbox
            checked={itemSelected.includes(index.row) || false}
            onChange={e => handleChange(e, index.row.id, index.row)}
            key={index.row.id}
          />
        )
      },
      sortable: false,
      renderHeader: () => (
        <Checkbox
          indeterminate={isCheckboxIndeterminate()}
          checked={checkedAll}
          onChange={e => handleChange(e, 'all')}
        />
      )
    },
    {
      width: 22,
      field: 'no',
      headerName: t('No') ?? 'No',
      renderCell: index => {
        return (
          (index.api.getRowIndexRelativeToVisibleRows(index.row.id) ?? 1) +
          1 +
          (pageOption?.limit ?? 50) * ((pageOption?.page ?? 1) - 1)
        )
      }
    },
    {
      field: 'image',
      sortable: false,
      headerName: 'Logo',
      renderCell: params => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              alt={params.row.name}
              style={{ objectFit: 'cover', width: 50 }}
              src={getImageAwsUrl(params.row.image)}
            />
          </Box>
        )
      }
    },
    {
      flex: 1,
      field: 'name',
      headerName: t('Expedition') ?? 'Expedition',
      renderCell: params => (
        <Typography
          className='hover-underline'
          variant='body2'
          onClick={() => handleEdit(params.row)}
          sx={{
            fontWeight: 600,
            color: 'primary.main'
          }}
        >
          {params.row.name}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: t('Status') ?? 'Status',
      flex: 1,
      renderCell: params => (
        <FormControlLabel
          control={
            <Switch
              checked={params.row.status}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (checkPermission('setting - shipping.update'))
                  setStatusEkspedisi(params.row.id, event.target.checked)
              }}
            />
          }
          label={params.row.status ? t('Active') : t('Inactive')}
        />
      )
    },
    {
      cellClassName: 'column-action',
      width: 100,
      sortable: false,
      field: 'action',
      headerName: t('Action') ?? 'Action',
      renderCell: params => {
        return (
          <>
            {checkPermission('setting - shipping.update') && (
              <IconButton size='small' onClick={() => handleEdit(params.row)}>
                <Icon icon='tabler:edit' fontSize='0.875rem' />
              </IconButton>
            )}
          </>
        )
      }
    }
  ]

  return (
    <>
      {!isLoadingOnlineStore && (
        <Box px={4} mt={4} display={'flex'} alignItems={'center'} columnGap={4}>
          <Typography minWidth={160}>{t('Online Store Location')}</Typography>
          <Grid container spacing={2} columns={3}>
            <Grid item xs={1}>
              <SelectCustom
                fullWidth
                serverSide
                isFloating
                label='Provinsi'
                options={provinces}
                optionKey='id'
                labelKey='name'
                value={province?.id ?? ''}
                onSelect={value => {
                  setProvince(value)
                }}
                onInputChange={(_e, value) =>
                  setProvinceOptions({ ...provinceOptions, name: value })
                }
              />
            </Grid>
            <Grid item xs={1}>
              <SelectCustom
                serverSide
                isFloating
                label='Kabupaten/Kota'
                options={districts}
                optionKey='id'
                labelKey='name'
                value={district?.id ?? ''}
                onSelect={value => {
                  setDistrict(value)
                }}
                onInputChange={(_e, value) =>
                  setDistrictOptions({ ...provinceOptions, name: value })
                }
              />
            </Grid>
            <Grid item xs={1}>
              <SelectCustom
                serverSide
                isFloating
                label='Kecamatan'
                options={subDistricts}
                optionKey='id'
                labelKey='name'
                value={subDistrict?.id ?? ''}
                onSelect={value => {
                  setSubDistrict(value)

                  if (value) {
                    updateAddressStore({
                      country_id: 62,
                      province_id: province?.id ?? 0,
                      district_id: district?.id ?? 0,
                      subdistrict_id: value.id,
                      address: 'blank'
                    })
                  }
                }}
                onInputChange={(_e, value) =>
                  setSubDistrictOptions({ ...provinceOptions, name: value })
                }
              />
            </Grid>
          </Grid>
        </Box>
      )}
      <Divider sx={{ mt: 3 }} />
      <TableHeader
        title={t('Expedition')}
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
          setPageOption({ ...pageOption, query: value })
        }}
      />
      <DataGridCustom
        getRowId={row => row.id}
        autoHeight
        rows={checkPermission('setting - shipping.read') ? datas : []}
        columns={columns}
        disableColumnMenu
        disableRowSelectionOnClick
        hideFooter
        setPaginationData={setPageOption}
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={dataMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('setting - shipping.update') && {
          button: (
            <>
              {/* set active */}
              <Button
                variant='contained'
                onClick={() => setBatchStatusEkspedisi(true)}
                color='success'
              >
                {t('Active')}
              </Button>
              {/* set disable */}
              <Button
                variant='contained'
                onClick={() => setBatchStatusEkspedisi(false)}
                color='warning'
              >
                {t('Disable')}
              </Button>
            </>
          )
        })}
      />
      <FormEkspedisiDialog open={openDialog} toggle={handleToggle} selectData={selectedData} />
    </>
  )
}

export default EkspedisiTab
