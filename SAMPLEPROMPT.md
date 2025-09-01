Pada halaman dashboard terdapat 4 section utama, yaitu
1. Section coin point
2. Section Category
3. Section Featured Products
4. Section Active campaign

Setiap section ini memiliki API masing-masing yang akan menyediakan datanya

Pastikan response sesuai dengan layout yang sudah dikembangkan. Pastikan juga setiap informasi product yang di klik akan menampilkan informasi detailnya Seperti ketika click category akan menampilkan detail category yang di click. Apabila click product akan menampilkan detail productnya

Berikut API yang berelasi dengan Section tersebut

1. Sample Request API Coin Point
curl --location 'https://apihustl.sijago.ai/api/v1/points/my-points' \
--header 'Authorization: Bearer {token}'

ample Response API Coin Point
{
    "success": true,
    "message": "Points retrieved successfully",
    "timestamp": "2025-08-12T04:28:39.478Z",
    "data": {
        "currentBalance": 1070,
        "summary": {
            "currentBalance": 1070,
            "totalEarned": 1070,
            "totalSpent": 0,
            "transactionCounts": {
                "credit": 9,
                "debit": 0
            }
        },
        "availableActivities": [
            {
                "id": 1,
                "code": "PRODUCT_SHARE",
                "name": "Product Share",
                "description": "Points awarded for sharing products outside campaigns",
                "points": 10,
                "dailyLimit": 10,
                "totalLimit": null,
                "canEarn": true,
                "reason": null
            }
        ]
    },
    "code": "SUCCESS"
}

Untuk response yang akan anda tampilkan pada point adalah informasi dari data.currentBalance

2. Sample Request API Category
curl --location 'https://apihustl.sijago.ai/api/v1/categories/'

Sample Rezponse API Category
{
    "success": true,
    "message": "Active categories retrieved successfully",
    "timestamp": "2025-08-17T06:59:25.133Z",
    "data": [
        {
            "id": 1,
            "name": "Electronics",
            "slug": "electronics",
            "description": "Electronic devices and gadgets",
            "image": null,
            "sortOrder": 1,
            "imageUrl": null
        }
    ],
    "code": "SUCCESS"
}

Untuk response category yang akan anda tampilkan adalah pada informasi dari array data

Apabila anda ingi menampilkan detail category, anda dapat menggunakan  Sample Request API Category by ID berikut
curl --location 'https://apihustl.sijago.ai/api/v1/categories/1'

Sample Response API Category by ID 
{
    "success": true,
    "message": "Category retrieved successfully",
    "timestamp": "2025-08-12T05:00:08.727Z",
    "data": {
        "id": 1,
        "name": "Electronics",
        "slug": "electronics",
        "description": "Electronic devices and gadgets",
        "image": null,
        "isActive": true,
        "sortOrder": 1,
        "createdBy": null,
        "updatedBy": null,
        "created_at": "2025-07-25 18:27:24",
        "updated_at": "2025-07-25 18:35:12",
        "deleted_at": null,
        "imageUrl": null
    },
    "code": "SUCCESS"
}

dan list Product ketika category ini di click akan memanggil API 
curl --location 'https://apihustl.sijago.ai/api/v1/products?categoryId=1'

response API
{
    "success": true,
    "message": "Products retrieved successfully",
    "timestamp": "2025-08-12T03:49:03.057Z",
    "data": [
        {
            "id": 1,
            "title": "Smartphone Android Terbaru",
            "slug": "smartphone-android-terbaru",
            "description": "Smartphone Android dengan teknologi terdepan, kamera berkualitas tinggi, dan performa yang luar biasa.",
            "points": 1500,
            "price": "5999999.00",
            "url": "https://example.com/products/smartphone-android",
            "image": null,
            "categoryId": 1,
            "isActive": true,
            "isFeatured": true,
            "stockQuantity": 50,
            "viewCount": 0,
            "sortOrder": 0,
            "metaTitle": "Smartphone Android Terbaru - Teknologi Terdepan",
            "metaDescription": "Dapatkan smartphone Android terbaru dengan fitur canggih dan harga terjangkau",
            "createdBy": null,
            "updatedBy": null,
            "createdAt": "2025-07-25 18:27:24",
            "updatedAt": "2025-07-25 18:35:12",
            "created_at": "2025-07-25 18:27:24",
            "updated_at": "2025-07-25 18:35:12",
            "deletedAt": null,
            "category": {
                "id": 1,
                "name": "Electronics",
                "slug": "electronics"
            },
            "formattedPrice": "Rp 5.999.999,00",
            "imageUrl": null
        }
    ],
    "code": "SUCCESS",
    "meta": {
        "pagination": {
            "currentPage": 1,
            "itemsPerPage": 5,
            "totalItems": 1,
            "totalPages": 1,
            "hasNextPage": false,
            "hasPrevPage": false
        }
    }
}

API nomor 2 ini juga akan diimplementasikan pada menu page Category

3. Sample Request untuk API Featured Product pada section ketiga akan menggunakan API 
curl --location 'https://apihustl.sijago.ai/api/v1/products/featured'

Response dari API Featured Product adalah sebagai berikut
{
    "success": true,
    "message": "Featured products retrieved successfully",
    "timestamp": "2025-08-12T03:48:52.786Z",
    "data": [
        {
            "id": 1,
            "title": "Smartphone Android Terbaru",
            "slug": "smartphone-android-terbaru",
            "description": "Smartphone Android dengan teknologi terdepan, kamera berkualitas tinggi, dan performa yang luar biasa.",
            "points": 1500,
            "price": "5999999.00",
            "url": "https://example.com/products/smartphone-android",
            "image": null,
            "categoryId": 1,
            "isActive": true,
            "isFeatured": true,
            "stockQuantity": 50,
            "viewCount": 0,
            "sortOrder": 0,
            "metaTitle": "Smartphone Android Terbaru - Teknologi Terdepan",
            "metaDescription": "Dapatkan smartphone Android terbaru dengan fitur canggih dan harga terjangkau",
            "createdBy": null,
            "updatedBy": null,
            "createdAt": "2025-07-25 18:27:24",
            "updatedAt": "2025-07-25 18:35:12",
            "created_at": "2025-07-25 18:27:24",
            "updated_at": "2025-07-25 18:35:12",
            "deletedAt": null,
            "category": {
                "id": 1,
                "name": "Electronics",
                "slug": "electronics"
            },
            "formattedPrice": "Rp 5.999.999,00",
            "imageUrl": null
        }
    ],
    "code": "SUCCESS"
}

Ketika product ini di klik maka akan menampilkan detail product dan memanggil API yang sama dengan proses sebelumnya yaitu API  https://apihustl.sijago.ai/api/v1/products?categoryId=1


4. Section Active Campaign akan memanggil API berikut
curl --location 'https://apihustl.sijago.ai/api/v1/campaigns/active'

Sample response dari campaign active adalah sebagai berikut
{
    "success": true,
    "message": "Active campaigns retrieved successfully",
    "data": [
        {
            "id": 13,
            "name": "Test Campaign",
            "slug": "test-campaign",
            "description": "asdsadsa",
            "image": null,
            "isActive": true,
            "startDate": "2025-08-13 10:46:00",
            "endDate": "2025-08-20 03:44:00",
            "createdBy": 1,
            "updatedBy": null,
            "created_at": "2025-08-13 17:45:46",
            "updated_at": "2025-08-13 17:45:58",
            "deleted_at": null,
            "status": "active"
        }
    ]
}

dan list campaign juga akan diimplementasikan pada page menu Campaign. Apabila salah satu campaign di klik maka akan memanggil API 
curl --location 'https://apihustl.sijago.ai/api/v1/campaigns/15'

dan response akan sebagai berikut
{
    "success": true,
    "message": "Campaign retrieved successfully",
    "data": {
        "id": 17,
        "name": "Summer Sale 2029",
        "slug": "summer-sale-2029",
        "description": "Dapatkan poin lebih banyak!",
        "image": "test-campaign-17.jpg",
        "isActive": true,
        "startDate": "2025-08-18 07:00:00",
        "endDate": "2025-09-01 06:59:59",
        "createdBy": 1,
        "updatedBy": null,
        "created_at": "2025-08-17 14:03:17",
        "updated_at": "2025-08-17 19:39:02",
        "deleted_at": null,
        "products": [],
        "status": "upcoming",
        "productCount": 0,
        "imageUrl": "https://apihustl.sijago.ai/uploads/campaigns/test-campaign-17.jpg"
    }
}

Lakukan implementasi dan integrasi API diatas dengan code vue js saya

