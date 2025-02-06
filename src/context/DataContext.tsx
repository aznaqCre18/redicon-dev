import { createContext, useState } from 'react'
import { SupplierType } from 'src/types/apps/supplier'
import { BrandType } from 'src/types/apps/brandType'
import { CategoryType } from 'src/types/apps/categoryType'
import { MembershipType } from 'src/types/apps/membershipType'
import { useQuery } from 'react-query'
import { supplierService } from 'src/services/supplier'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { brandService } from 'src/services/brand'
import { categoryService } from 'src/services/category'
import { membershipService } from 'src/services/membership'
import { useAuth } from 'src/hooks/useAuth'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { outletService } from 'src/services/outlet/outlet'

export type DataContextType = {
  outletData: OutletType[]
  setOutletData: (data: OutletType[]) => void
  supplierData: SupplierType[]
  setSupplierData: (data: SupplierType[]) => void
  brandData: BrandType[]
  setBrandData: (data: BrandType[]) => void
  categoryData: CategoryType[]
  setCategoryData: (data: CategoryType[]) => void
  membershipData: MembershipType[]
  setMembershipData: (data: MembershipType[]) => void
}

export const DataContext = createContext<DataContextType>({} as DataContextType)

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [outletData, setOutletData] = useState<OutletType[]>([])
  const [supplierData, setSupplierData] = useState<SupplierType[]>([])
  const [brandData, setBrandData] = useState<BrandType[]>([])
  const [categoryData, setCategoryData] = useState<CategoryType[]>([])
  const [membershipData, setMembershipData] = useState<MembershipType[]>([])

  const { user } = useAuth()

  // DISABLE WHEN UPDATE ENDPOINT API
  // useQuery({
  //   enabled: !!user,
  //   queryKey: ['filter-outlet'],
  //   queryFn: () => outletService.getListOutlet(maxLimitPagination),
  //   onSuccess: data => {
  //     setOutletData(data.data.data ?? [])
  //   },
  //   onError: error => {
  //     setOutletData([])

  //     console.log('get outlet error', error)
  //   }
  // })

  // DISABLE WHEN UPDATE ENDPOINT API
  // useQuery({
  //   enabled: !!user,
  //   queryKey: ['filter-supplier'],
  //   queryFn: () => supplierService.getListActive(maxLimitPagination),
  //   onSuccess: data => {
  //     setSupplierData(data.data.data)
  //   },
  //   onError: error => {
  //     setSupplierData([])

  //     console.log('get supplier error', error)
  //   }
  // })

  useQuery({
    enabled: !!user,
    queryKey: ['filter-brand'],
    queryFn: () => brandService.getListBrandActive(maxLimitPagination),
    onSuccess: data => {
      setBrandData(data.data.data)
    },
    onError: error => {
      setBrandData([])

      console.log('get brand error', error)
    }
  })

  useQuery({
    enabled: !!user,
    queryKey: ['filter-category'],
    queryFn: () => categoryService.getListCategoryActive(maxLimitPagination),
    onSuccess: data => {
      setCategoryData(data.data.data)
    },
    onError: error => {
      setCategoryData([])

      console.log('get category error', error)
    }
  })

  // DISABLE WHEN UPDATE ENDPOINT API
  // useQuery({
  //   enabled: !!user,
  //   queryKey: ['filter-membership'],
  //   queryFn: () => membershipService.getListMembershipActive(maxLimitPagination),
  //   onSuccess: data => {
  //     setMembershipData(data.data.data)
  //   },
  //   onError: error => {
  //     setMembershipData([])

  //     console.log('get membership error', error)
  //   }
  // })

  return (
    <DataContext.Provider
      value={{
        outletData,
        setOutletData,
        supplierData,
        setSupplierData,
        brandData,
        setBrandData,
        categoryData,
        setCategoryData,
        membershipData,
        setMembershipData
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
