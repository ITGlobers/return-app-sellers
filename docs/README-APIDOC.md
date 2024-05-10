<a name="top"></a>
# return-app-seller (OBI) v0.5.29-hkignore

App to returns seller

# Table of contents

- [Goodwill](#Goodwill)
  - [Create Goodwill Credit](#Create-Goodwill-Credit)
  - [Retrieve Goodwill Credit](#Retrieve-Goodwill-Credit)
- [ReturnApp](#ReturnApp)
  - [Create Return App Invoice](#Create-Return-App-Invoice)

___


# <a name='Goodwill'></a> Goodwill

## <a name='Create-Goodwill-Credit'></a> Create Goodwill Credit
[Back to top](#top)

```
POST /_v/goodwill
```

### Headers - `Header`

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| VtexIdclientAutCookie | `String` | <p>Authentication token.</p> |

### Request Body

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| orderId | `String` | <p>Order ID associated with the goodwill credit (required).</p> |
| sellerId | `String` | <p>ID of the seller (required).</p> |
| goodwillCreditId | `String` | <p>ID of the goodwill credit (required).</p> |
| reason | `String` | <p>Reason for the goodwill credit (required).</p> |
| goodwillCreditAmount | `Number` | <p>Amount of the goodwill credit (required).</p> |
| shippingCost | `Number` | <p>Shipping cost (required).</p> |
| items | `Object[]` | <p>Array of items associated with the goodwill credit (required).</p> |
| items.id | `String` | <p>ID of the item (required).</p> |
| items.amount | `Number` | <p>Amount of the item (required).</p> |
| items.description | `String` | <p>Description of the item (required).</p> |

### Examples

Request example:

```json
{
    "orderId": "SLR-1100306545-01",
    "sellerId": "obiecomstage",
    "goodwillCreditId": "1004002",
    "reason": "Lieferverzug",
    "goodwillCreditAmount": 1000,
    "shippingCost": 0,
    "items": [
        {
            "id": "3938479",
            "amount": 1000,
            "description": "individuell - sonstiges"
        }
    ]
}
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| message | `String` | <p>Success message.</p> |
| goodwill | `Object` | <p>Details of the created goodwill credit.</p> |
| goodwill.orderId | `String` | <p>Order ID associated with the goodwill credit.</p> |
| goodwill.sellerId | `String` | <p>ID of the seller.</p> |
| goodwill.goodwillCreditId | `String` | <p>ID of the goodwill credit.</p> |
| goodwill.reason | `String` | <p>Reason for the goodwill credit.</p> |
| goodwill.goodwillCreditAmount | `Number` | <p>Amount of the goodwill credit.</p> |
| goodwill.shippingCost | `Number` | <p>Shipping cost.</p> |
| goodwill.items | `Object[]` | <p>Array of items associated with the goodwill credit.</p> |
| goodwill.items.id | `String` | <p>ID of the item.</p> |
| goodwill.items.amount | `Number` | <p>Amount of the item.</p> |
| goodwill.items.description | `String` | <p>Description of the item.</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| code | `String` | <p>Error code.</p> |
| message | `String` | <p>Error message.</p> |

### Error response example

#### Error response example - `Error responses :`

```json
HTTP/1.1 400 Bad Request
{
    "code": "GW000",
    "message": "Order is not invoiced"
}
HTTP/1.1 400 Bad Request
{
    "code": "GW001",
    "message": "Shipping value ${goodwill.shippingCost} cannot exceed ${orderSummary.amountsAvailable.shipping} for orderId: ${orderId}"
}
HTTP/1.1 400 Bad Request
{
    "code": "GW002",
    "message": "Goodwill already created for orderId: ${orderId}"
}
HTTP/1.1 400 Bad Request
{
    "code": "GW003",
    "message": "Total value of goodWill ${totalValueOrder} cannot exceed ${amountAvailable} for orderId: ${orderId}"
}
HTTP/1.1 400 Bad Request
{
    "code": "GW004",
    "message": "The item ${item.id} cannot be found on orderId: ${orderId}"
}
HTTP/1.1 400 Bad Request
{
    "code": "GW005",
    "message": "Item ${item.id} value ${item.amount} cannot exceed ${itemSummary.amountAvailablePerItem.amount} for orderId: ${orderId}"
}
HTTP/1.1 404 Not Found
{
    "code": "GW006",
    "message": "Order Not Fount: ${orderId}"
}
HTTP/1.1 400 Bad Request
{
    "code": "GW007",
    "message": "No invoices availables to refund"
}
HTTP/1.1 400 Bad Request
{
    "code": "GW008",
    "message": "Item Summary ${item.id} cannot be found on orderId: ${orderId}"
}
HTTP/1.1 400 Bad Request
{
    "code": "GW009",
    "message": "Total value of goodWill ${totalValueOrder} not match with ${goodwill.goodwillCreditAmount} for items to orderId: ${orderId}"
}
HTTP/1.1 400 Bad Request
{
    "code": "GW010",
    "message": "Cant create a goodwill without credit"
}
HTTP/1.1 400 Bad Request
{
    "code": "GW011",
    "message": "Goodwill credit Id is Required"
}
HTTP/1.1 400 Bad Request
{
    "code": "GW012",
    "message": "Goodwill order Id is Required"
}
HTTP/1.1 400 Bad Request
{
    "code": "GW013",
    "message": "Goodwill reason is Required"
}
HTTP/1.1 400 Bad Request
{
    "code": "GW014",
    "message": "Error getting Goodwill list"
}
```

## <a name='Retrieve-Goodwill-Credit'></a> Retrieve Goodwill Credit
[Back to top](#top)

```
GET /_v/goodwill/:id
```

### Headers - `Header`

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| VtexIdclientAutCookie | `String` | <p>Authentication token.</p> |

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `String` | <p>ID of the goodwill credit (required).</p> |
### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| goodwillCredit | `Object` | <p>Details of the goodwill credit.</p> |

# <a name='ReturnApp'></a> ReturnApp

## <a name='Create-Return-App-Invoice'></a> Create Return App Invoice
[Back to top](#top)

```
POST /_v/return-app/invoice/:orderId
```

### Headers - `Header`

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| VtexIdclientAutCookie | `String` | <p>Authentication token.</p> |

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| orderId | `String` | <p>Id of order to invoice (required).</p> |

### Request Body

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| type | `String` | <p>Type of the invoice (required).</p> |
| description | `String` | <p>Description of the invoice (required).</p> |
| issuanceDate | `String` | <p>Date of issuance of the invoice (required).</p> |
| invoiceNumber | `String` | <p>Invoice number (required).</p> |
| invoiceValue | `Number` | <p>Invoice value (required).</p> |
| invoiceKey | `String` | **optional** <p>Invoice key.</p> |
| invoiceUrl | `String` | **optional** <p>Invoice URL.</p> |
| courier | `String` | **optional** <p>Courier information.</p> |
| trackingNumber | `String` | **optional** <p>Tracking number.</p> |
| trackingUrl | `String` | **optional** <p>Tracking URL.</p> |
| dispatchedDate | `String` | **optional** <p>Date of dispatch.</p> |
| items | `Object[]` | <p>Array of items associated with the invoice (required).</p> |
| items.id | `String` | <p>ID of the item (required).</p> |
| items.description | `String` | <p>Description of the item (required).</p> |
| items.amount | `Number` | <p>Amount of the item (required).</p> |
| items.quantity | `Number` | <p>Quantity of the item (required).</p> |

### Examples

Request example:

```json
{
    "type": "Input",
    "description": "Return for items",
    "issuanceDate": "2024-03-04T18:25:43-05:00",
    "invoiceNumber": "1004003",
    "invoiceValue": 100000,
    "invoiceKey": null,
    "invoiceUrl": "link",
    "courier": null,
    "trackingNumber": null,
    "trackingUrl": null,
    "dispatchedDate": null,
    "items": [
        {
            "id": "3938479",
            "description": "sonstiges - individuell",
            "amount": 100000,
            "quantity": 2
        }
    ]
}
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| date | `String` | <p>Date and time of the request.</p> |
| orderId | `String` | <p>Order ID associated with the invoice.</p> |
| receipt | `String` | <p>Receipt ID.</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| code | `String` | <p>Error code.</p> |
| message | `String` | <p>Error message.</p> |

### Error response example

#### Error response example - `Error responses:`

```json
HTTP/1.1 404 Not Found
{
    "code": "INV000",
    "message": "Order not found"
}
HTTP/1.1 400 Bad Request
{
    "code": "INV001",
    "message": "Invoice already created for invoiceNumber: ${invoiceRequest.invoiceNumber}"
}
HTTP/1.1 400 Bad Request
{
    "code": "INV002",
    "message": "The quantity to be returned to the item ${itemToUpdate.id} is not valid, it is greater than the available"
}
HTTP/1.1 400 Bad Request
{
    "code": "INV003",
    "message": "The amount to be returned to the item ${itemToUpdate.id} is not valid"
}

HTTP/1.1 400 Bad Request
{
    "code": "INV004",
    "message": "The invoice value cant be negative"
}
HTTP/1.1 400 Bad Request
{
    "code": "INV005",
    "message": "The invoice value to be refunded is not available"
} 
HTTP/1.1 400 Bad Request
{
    "code": "INV006",
    "message": "The shipping value to be refunded is greater than the available"
}

HTTP/1.1 400 Bad Request
{
    "code": "INV007",
    "message": "The field amount to item ${itemToUpdate.id} is required"
}

HTTP/1.1 400 Bad Request
{
    "code": "INV007",
    "message": "The field amount to item ${itemToUpdate.id} is required"
}
HTTP/1.1 400 Bad Request
{
    "code": "INV008",
    "message": "Invoice type error"
}
HTTP/1.1 400 Bad Request
{
    "code": "INV009",
    "message": "The following items with id: ${itemNotAvailable} are not available to be invoiced."
```

