import { json } from 'co-body'

import createGoodwillService from '../../services/goodwill/createGoodwillService'
import { ExternalLogSeverity } from '../errorHandler'
/**
 * @api {post} /_v/goodwill Create Goodwill Credit
 * @apiName CreateGoodwillCredit
 * @apiGroup Goodwill
 * @apiVersion  0.5.29-hkignore
 *
 * @apiHeader {String} VtexIdclientAutCookie Authentication token.
 *
 * @apiBody {String} orderId Order ID associated with the goodwill credit (required).
 * @apiBody {String} sellerId ID of the seller (required).
 * @apiBody {String} goodwillCreditId ID of the goodwill credit (required).
 * @apiBody {String} reason Reason for the goodwill credit (required).
 * @apiBody {Number} goodwillCreditAmount Amount of the goodwill credit (required).
 * @apiBody {Number} shippingCost Shipping cost (required).
 * @apiBody {Object[]} items Array of items associated with the goodwill credit (required).
 * @apiBody {String} items.id ID of the item (required).
 * @apiBody {Number} items.amount Amount of the item (required).
 * @apiBody {String} items.description Description of the item (required).
 *
 * @apiSuccess {String} message Success message.
 * @apiSuccess {Object} goodwill Details of the created goodwill credit.
 * @apiSuccess {String} goodwill.orderId Order ID associated with the goodwill credit.
 * @apiSuccess {String} goodwill.sellerId ID of the seller.
 * @apiSuccess {String} goodwill.goodwillCreditId ID of the goodwill credit.
 * @apiSuccess {String} goodwill.reason Reason for the goodwill credit.
 * @apiSuccess {Number} goodwill.goodwillCreditAmount Amount of the goodwill credit.
 * @apiSuccess {Number} goodwill.shippingCost Shipping cost.
 * @apiSuccess {Object[]} goodwill.items Array of items associated with the goodwill credit.
 * @apiSuccess {String} goodwill.items.id ID of the item.
 * @apiSuccess {Number} goodwill.items.amount Amount of the item.
 * @apiSuccess {String} goodwill.items.description Description of the item.
 *
 * @apiError {String} code Error code.
 * @apiError {String} message Error message.
 *
 * @apiExample {json} Request example:
 *     {
 *         "orderId": "SLR-1100306545-01",
 *         "sellerId": "obiecomstage",
 *         "goodwillCreditId": "1004002",
 *         "reason": "Lieferverzug",
 *         "goodwillCreditAmount": 1000,
 *         "shippingCost": 0,
 *         "items": [
 *             {
 *                 "id": "3938479",
 *                 "amount": 1000,
 *                 "description": "individuell - sonstiges"
 *             }
 *         ]
 *     }
 *
 * @apiErrorExample {json} Error responses :
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "GW000",
 *         "message": "Order is not invoiced"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "GW001",
 *         "message": "Shipping value ${goodwill.shippingCost} cannot exceed ${orderSummary.amountsAvailable.shipping} for orderId: ${orderId}"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "GW002",
 *         "message": "Goodwill already created for orderId: ${orderId}"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "GW003",
 *         "message": "Total value of goodWill ${totalValueOrder} cannot exceed ${amountAvailable} for orderId: ${orderId}"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "GW004",
 *         "message": "The item ${item.id} cannot be found on orderId: ${orderId}"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "GW005",
 *         "message": "Item ${item.id} value ${item.amount} cannot exceed ${itemSummary.amountAvailablePerItem.amount} for orderId: ${orderId}"
 *     }
 *     HTTP/1.1 404 Not Found
 *     {
 *         "code": "GW006",
 *         "message": "Order Not Fount: ${orderId}"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "GW007",
 *         "message": "No invoices availables to refund"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "GW008",
 *         "message": "Item Summary ${item.id} cannot be found on orderId: ${orderId}"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "GW009",
 *         "message": "Total value of goodWill ${totalValueOrder} not match with ${goodwill.goodwillCreditAmount} for items to orderId: ${orderId}"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "GW010",
 *         "message": "Cant create a goodwill without credit"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "GW011",
 *         "message": "Goodwill credit Id is Required"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "GW012",
 *         "message": "Goodwill order Id is Required"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "GW013",
 *         "message": "Goodwill reason is Required"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "GW014",
 *         "message": "Error getting Goodwill list"
 *     }
 */

export async function createGoodwill(
  ctx: Context,
  next: () => Promise<any>
): Promise<any> {
  const { req } = ctx

  const body: Goodwill = await json(req)

  ctx.state.logs.push({
    message: 'Request received',
    middleware: 'Middleware create Goodwill',
    severity: ExternalLogSeverity.INFO,
    payload: {
      details: 'Body of the request captured',
      stack: JSON.stringify(body),
    },
  })

  ctx.body = await createGoodwillService(ctx, body)

  ctx.set('Cache-Control', 'no-cache')
  await next()
}
