Saat ini saya ingin mengembangkan halaman menu (page) Profile. Pada Halaman tersebut terdapat beberapa section antara lain :
1. Section pertama profile user
2. Section kedua menampilkan informasi coins available dan button Redeem untuk penarikan dana
3. Section ketiga menampilkan Recent Coint beserta status nilai dan aktifitasnya (debit/credit). Yang akan ditampilkan disini adalah 5 Aktifitas Recent Coint. pada section ini juga ada button See More. Apabila di klik akan menampilkan lengkap recent coint
4. Section keempat menampilkan Recent Redeems point beserta status redeem point. Yang akan ditampilkan disini adalah 5 Aktifitas Redeem. pada section ini juga ada button See More. Apabila di klik akan menampilkan lengkap daftar Redeem 

Apabila page detail untuk Recent Coint dan Redeem Point belum ada, anda boleh membuatkan dengan mempertahankan style, layout dan uiux dari template yang digunakan saat ini.

Setiap section ini memiliki API masing-masing yang akan menyediakan datanya

Pastikan response sesuai dengan layout yang sudah dikembangkan.

Berikut API yang berelasi dengan Section tersebut

1. Untuk API Profile User anda dapat menggunakan API berikut
curl --location 'http://localhost:3000/api/v1/auth/profile/13' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {token}'

Response API Profile User
{
    "success": true,
    "message": "Your profile retrieved successfully",
    "timestamp": "2025-08-12T03:50:56.728Z",
    "data": {
        "user": {
            "id": 13,
            "username": "adesurya",
            "email": "adesurya.tkj@gmail.com",
            "phoneNumber": "08170261628",
            "role": "user",
            "googleId": null,
            "profilePicture": null,
            "isVerified": true,
            "isActive": true,
            "lastLogin": "2025-08-12T03:50:40.000Z",
            "passwordChangedAt": "2025-07-27T03:32:29.000Z",
            "emailVerifiedAt": "2025-07-27T03:33:22.000Z",
            "twoFactorEnabled": false,
            "currentPoints": 1070,
            "created_at": "2025-07-27 10:32:29",
            "updated_at": "2025-08-12 10:50:40",
            "deleted_at": null,
            "isLocked": null,
            "canEarnPoints": true,
            "accountAge": null,
            "verificationStatus": {
                "email": true,
                "twoFactor": false
            },
            "metrics": {
                "totalPoints": 1070,
                "lastLogin": "2025-08-12T03:50:40.000Z"
            }
        }
    },
    "code": "SUCCESS"
}


Tampilkan pada section pertama informasi seperti Username, Email, Phone Number

2. Section kedua anda sudah menampilkan informasi coin dari API. Untuk button Redeem, ketika di klik anda akan mengarahkan ke page baru (untuk page ini anda dapat membuat dan  sesuaikan dengan tone style UIUX dan layout aplikasi saat ini) dengan API yang akan direquest sebagai berikut
curl --location 'https://apihustl.sijago.ai/api/v1/points/redeem' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {token}' \
--data '{
    "pointsToRedeem": 1000,
    "redemptionType": "cash",
    "redemptionDetails": {
      "bankAccount": "1234567890",
      "bankName": "Bank ABCD",
      "accountName": "John Doe"
    }
  }'
  
Response dari api tersebut adalah
{
    "success": true,
    "message": "Redemption request submitted successfully",
    "timestamp": "2025-08-17T16:09:57.845Z",
    "data": {
        "redemption": {
            "id": 7,
            "pointsRedeemed": 1000,
            "redemptionType": "cash",
            "redemptionValue": 1000,
            "status": "pending",
            "requestedAt": "2025-08-17T16:09:57.834Z"
        }
    },
    "code": "SUCCESS"
}

3. Section ketiga untuk Recent Coint anda dapat menggunakan API berikut
curl --location 'http://localhost:3000/api/v1/points/my-transactions' \
--header 'Authorization: Bearer {token}'

Response API
{
    "success": true,
    "message": "Transaction history retrieved successfully",
    "timestamp": "2025-08-12T04:11:46.088Z",
    "data": {
        "transactions": [
            {
                "balanceAfter": 1070,
                "id": 14,
                "userId": 13,
                "transactionType": "credit",
                "amount": 5,
                "balanceBefore": 1065,
                "activityType": "DAILY_LOGIN",
                "activityDescription": "Daily Login Bonus",
                "referenceId": null,
                "referenceType": "daily_login",
                "status": "completed",
                "processedBy": null,
                "processedAt": "2025-08-12 10:50:40",
                "metadata": {
                    "event": "daily_login",
                    "loginDate": "2025-08-12",
                    "timestamp": "2025-08-12T03:50:40.168Z",
                    "activityId": 3,
                    "activityName": "Daily Login Bonus"
                },
                "notes": null,
                "created_at": "2025-08-12 10:50:40",
                "updated_at": "2025-08-12 10:50:40",
                "deletedAt": null
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalItems": 9,
            "itemsPerPage": 20
        }
    },
    "code": "SUCCESS"
}

Apabila response dari data.transactions.transactionType = credit maka tanda didepan point akan "+" dab apabila debit akan "-"

4. Section keempat adalam informasi redeem. Untuk API yang dapat digunakan adalah berikut
curl --location 'http://localhost:3000/api/v1/points/my-redemptions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {token}'

Response dari API tersebut adalah
{
    "success": true,
    "message": "Redemption history retrieved successfully",
    "timestamp": "2025-08-12T03:52:56.384Z",
    "data": {
        "redemptions": [
            {
                "id": 3,
                "userId": 13,
                "pointsRedeemed": 100,
                "redemptionType": "cash",
                "redemptionValue": "1.00",
                "redemptionDetails": {
                    "bankName": "Bank ABC",
                    "accountName": "John Doe",
                    "bankAccount": "1234567890"
                },
                "status": "pending",
                "requestedAt": "2025-08-12 10:52:33",
                "processedAt": null,
                "processedBy": null,
                "adminNotes": null,
                "transactionId": null,
                "created_at": "2025-08-12 10:52:33",
                "updated_at": "2025-08-12 10:52:33",
                "deletedAt": null
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalItems": 2,
            "itemsPerPage": 20
        }
    },
    "code": "SUCCESS"
}

Untuk nilai status yang akan ditampilkan akan diambil dari response data.redemptions.status