[
    -- "adjustment stock.create",

    -- belum implement masih di dev dan karena belum ada endpoint
    "adjustment stock.delete",
    "adjustment stock.read",
    "adjustment stock.update",
    -- 

    -- "banner.create",
    -- "banner.delete",
    -- "banner.read",
    -- "banner.update",
    -- "brand.create",
    -- "brand.delete",
    -- "brand.read",
    -- "brand.update",
    -- "cms.read",
    -- "cms.update",

    -- hanya ada di aplikasi POS
    "cashier.change_price",
    "cashier.change_quantity",
    "cashier.create",
    "cashier.global_discount",
    "cashier.lock_order_after",
    "cashier.manual_sales",
    "cashier.non_stok_sales",
    "cashier.read",
    "cashier.void",
    "cashier.void_with_pin",
    -- 

    -- "category.create",
    -- "category.delete",
    -- "category.read",
    -- "category.update",
    -- "commission.create",
    -- "commission.delete",
    -- "commission.read",
    -- "commission.update",
    -- "cost.create",
    -- "cost.delete",
    -- "cost.read",
    -- "cost.update",
    -- "customer.create",
    -- "customer.delete",
    -- "customer.read",
    -- "customer.update",
    -- "dashboard.read",

    -- harusnya tidak ada create, delete, 
    "data stock.create",
    "data stock.delete",
    --

    -- "data stock.read",
    -- "data stock.update",

    -- "department.create",
    -- "department.delete",
    -- "department.read",
    -- "department.update",
    -- "device.create",
    -- "device.delete",
    -- "device.read",
    -- "device.update",
    -- "features.read",
    -- "features.update",
    -- "general.read",
    -- "general.update",

    -- harusnya tidak ada create, delete, 
    "history stock.create",
    "history stock.delete",
    --

    -- "history stock.read",
    -- "history stock.update",
    -- "invoice.create",
    -- "invoice.delete",
    -- "invoice.read",
    -- "invoice.update",
    -- "invoice return.create",
    -- "invoice return.delete",
    -- "invoice return.read",
    -- "invoice return.update",
    -- "list order.read",

    -- hanya ada di aplikasi POS
    "local server.read",
    "local server.update",
    -- "login setting.read",
    -- "login setting.update",
    -- 

    -- "membership.read",
    -- "membership.update",
    -- "online store - tax.read",
    -- "online store - tax.update",

    -- harusnya tidak ada create, delete, update, karena belum di implement
    "order.create",
    "order.delete",
    "order.update",
    -- 

    -- "order.read",
    -- "outlet.create",
    -- "outlet.delete",
    -- "outlet.read",
    -- "outlet.update",

    -- duplikat dengan setting - payment
    "payment setting.create",
    "payment setting.delete",
    "payment setting.read",
    "payment setting.update",
    -- 

    -- "product.create",
    -- "product.create_product_show_category",
    -- "product.create_product_show_discount",
    -- "product.create_product_show_image",
    -- "product.create_product_show_msku",
    -- "product.create_product_show_outlet",
    -- "product.create_product_show_position",
    -- "product.create_product_show_product_type",
    -- "product.create_product_show_purchase_price",
    -- "product.create_product_show_selling_price_1",
    -- "product.create_product_show_selling_price_2",
    -- "product.create_product_show_selling_price_3",
    -- "product.create_product_show_selling_price_4",
    -- "product.create_product_show_selling_price_5",
    -- "product.create_product_show_stock",
    -- "product.create_product_show_unit",
    -- "product.delete",
    -- "product.read",
    -- "product.update",
    -- "purchase.create",
    -- "purchase.delete",
    -- "purchase.read",
    -- "purchase.update",
    -- "purchase return.create",
    -- "purchase return.delete",
    -- "purchase return.read",
    -- "purchase return.update",

    -- hanya ada read
    "recap.create",
    "recap.delete",
    "recap.update",
    -- 

    -- "recap.read",
    
    -- hanya ada di aplikasi POS
    "receipt.create",
    "receipt.delete",
    "receipt.read",
    "receipt.update",

    -- "reports.read",
    -- "role.create",
    -- "role.delete",
    -- "role.read",
    -- "role.update",
    "sales.read",
    -- "setting - order.read",
    -- "setting - order.update",
    -- "setting - payment.create",
    -- "setting - payment.delete",
    -- "setting - payment.read",
    -- "setting - payment.update",
    -- "setting - product.read",

    -- ini salah harusnya dibuat di endpoint baru atau di shopi/v1/vendor/setting/
    "setting - product.setting_product_show_brand",
    "setting - product.setting_product_show_commission",
    "setting - product.setting_product_show_description",
    "setting - product.setting_product_show_dimention",
    "setting - product.setting_product_show_fix_tax",
    "setting - product.setting_product_show_is_show_on_pos",
    "setting - product.setting_product_show_label",
    "setting - product.setting_product_show_maximal_order",
    "setting - product.setting_product_show_minimal_order",
    "setting - product.setting_product_show_position",
    "setting - product.setting_product_show_rack_position",
    "setting - product.setting_product_show_supplier",
    "setting - product.setting_product_show_url_video",
    "setting - product.setting_product_show_video",
    "setting - product.setting_product_show_weight",
    "setting - product.setting_product_show_wholesale_price",

    -- "setting - product.update",
    -- "setting - shipping.create",
    -- "setting - shipping.delete",
    -- "setting - shipping.read",
    -- "setting - shipping.update",

    -- pengaturan shift di POS, hanya ada read dan update
    "shift.create",
    "shift.delete",


    -- "shift.read",
    -- "shift.update",

    -- "shortcut.create",
    -- "shortcut.delete",
    -- "shortcut.read",
    -- "shortcut.update",
    
    "stock opname.create",
    "stock opname.delete",
    "stock opname.read",
    "stock opname.update",
    -- "supplier.create",
    -- "supplier.delete",
    -- "supplier.read",
    -- "supplier.update",
    -- "table management.create",
    -- "table management.delete",
    -- "table management.read",
    -- "table management.update",

    -- hanya ada di aplikasi POS
    "taking order.auto_print_order",
    "taking order.create",
    "taking order.print_bill",
    "taking order.print_order",
    "taking order.read",
    "taking order.reset_order",
    -- 

    -- "tax setting.read",
    -- "tax setting.update_service_charge",
    -- "tax setting.update_tax",

    -- belum implement masih di dev dan karena belum ada endpoint
    "transfer stock.create",
    "transfer stock.delete",
    "transfer stock.read",
    "transfer stock.update",
    -- 

    -- "unit.create",
    -- "unit.delete",
    -- "unit.read",
    -- "unit.update",
    -- "update.read",
    -- "update.update",
    -- "user list.create",
    -- "user list.delete",
    -- "user list.read",
    -- "user list.update"
]