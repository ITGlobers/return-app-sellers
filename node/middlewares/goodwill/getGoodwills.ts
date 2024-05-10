import getGoodwillService from '../../services/goodwill/getGoodwillService'
/**
 * @api {get} /_v/goodwill/:id Retrieve Goodwill Credit
 * @apiName RetrieveGoodwillCredit
 * @apiGroup Goodwill
 * @apiVersion  0.5.29-hkignore
 * @apiHeader {String} VtexIdclientAutCookie Authentication token.
 *
 * @apiParam {String} id ID of the goodwill credit (required).
 *
 * @apiSuccess {Object} goodwillCredit Details of the goodwill credit.
 */
export async function getGoodwills(
  ctx: Context,
  next: () => Promise<any>
): Promise<any> {
  const {
    vtex: {
      route: {
        params: { id },
      },
    },
  } = ctx

  try {
    ctx.body = await getGoodwillService(ctx, id as string)
  } catch (error) {
    ctx.status = error.response?.status || error.status || 500
    ctx.body = {
      message: error.response?.data?.Message || error.message || error,
    }
  }

  ctx.set('Cache-Control', 'no-cache')
  await next()
}
