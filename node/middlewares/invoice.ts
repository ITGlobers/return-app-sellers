import { json } from 'co-body'

import createInvoiceService from '../services/invoice/createInvoiceService'
import { ExternalLogSeverity } from './errorHandler'
/**
 * @api {post} /_v/return-app/invoice/:orderId Create Return App Invoice
 * @apiName CreateReturnAppInvoice
 * @apiGroup ReturnApp
 * @apiVersion  0.5.29-hkignore
 * @apiHeader {String} VtexIdclientAutCookie Authentication token.

 * @apiParam {String} orderId Id of order to invoice (required).
 * @apiBody {String} type Type of the invoice (required).
 * @apiBody {String} description Description of the invoice (required).
 * @apiBody {String} issuanceDate Date of issuance of the invoice (required).
 * @apiBody {String} invoiceNumber Invoice number (required).
 * @apiBody {Number} invoiceValue Invoice value (required).
 * @apiBody {String} [invoiceKey] Invoice key, send "{\"preRefund\":true or false}"
 * @apiBody {String} [invoiceUrl] Invoice URL.
 * @apiBody {String} [courier] Courier information.
 * @apiBody {String} [trackingNumber] Tracking number.
 * @apiBody {String} [trackingUrl] Tracking URL.
 * @apiBody {String} [dispatchedDate] Date of dispatch.
 * @apiBody {Object[]} items Array of items associated with the invoice (required).
 * @apiBody {String} items.id ID of the item (required).
 * @apiBody {String} items.description Description of the item (required).
 * @apiBody {Number} items.amount Amount of the item (required).
 * @apiBody {Number} items.quantity Quantity of the item (required).
 *
 * @apiSuccess {String} date Date and time of the request.
 * @apiSuccess {String} orderId Order ID associated with the invoice.
 * @apiSuccess {String} receipt Receipt ID.
 *
 * @apiError {String} code Error code.
 * @apiError {String} message Error message.
 *
 * @apiExample {json} Request example:
 *     {
 *         "type": "Input",
 *         "description": "Return for items",
 *         "issuanceDate": "2024-03-04T18:25:43-05:00",
 *         "invoiceNumber": "1004003",
 *         "invoiceValue": 100000,
 *         "invoiceKey": "{\"preRefund\":true}",
 *         "invoiceUrl": "link",
 *         "courier": null,
 *         "trackingNumber": null,
 *         "trackingUrl": null,
 *         "dispatchedDate": null,
 *         "items": [
 *             {
 *                 "id": "3938479",
 *                 "description": "sonstiges - individuell",
 *                 "amount": 100000,
 *                 "quantity": 2
 *             }
 *         ]
 *     }
 *
 * @apiErrorExample {json} Error responses:
 *     HTTP/1.1 404 Not Found
 *     {
 *         "code": "INV000",
 *         "message": "Order not found"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "INV001",
 *         "message": "Invoice already created for invoiceNumber: ${invoiceRequest.invoiceNumber}"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "INV002",
 *         "message": "The quantity to be returned to the item ${itemToUpdate.id} is not valid, it is greater than the available"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "INV003",
 *         "message": "The amount to be returned to the item ${itemToUpdate.id} is not valid"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "INV004",
 *         "message": "The invoice value cant be negative"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "INV005",
 *         "message": "The invoice value to be refunded is not available"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "INV006",
 *         "message": "The shipping value to be refunded is greater than the available"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "INV007",
 *         "message": "The field amount to item ${itemToUpdate.id} is required"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "INV007",
 *         "message": "The field amount to item ${itemToUpdate.id} is required"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "INV008",
 *         "message": "Invoice type error"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "INV009",
 *         "message": "The following items with id: ${itemNotAvailable} are not available to be invoiced."
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "INV010",
 *         "message": "The invoice value cant be greater than order value."
 *     }
 * */

export async function invoice(
  ctx: Context,
  next: () => Promise<any>
): Promise<any> {
  const {
    req,
    vtex: {
      route: {
        params: { orderId },
      },
    },
  } = ctx

  const body: any = await json(req)

  ctx.state.logs.push({
    message: 'Request received',
    middleware: 'Middleware Invoice',
    severity: ExternalLogSeverity.INFO,
    payload: {
      details: 'Body of the request captured',
      stack: JSON.stringify(body),
    },
  })
  ctx.body = await createInvoiceService(ctx, body, orderId as string)

  ctx.set('Cache-Control', 'no-cache')
  await next()
}
