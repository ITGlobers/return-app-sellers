export async function exportRequests(ctx: Context, next: () => Promise<void>) {
  const {
    query,
    clients: { return: returnClient, account },
  } = ctx

  const { _dateSubmitted } = query

  try {
    const accountInfo = await account.getInfo()

    if (!_dateSubmitted) {
      throw new Error("The '_dateSubmitted' query parameter is required")
    }

    const exports = await returnClient.exportReturns(query, accountInfo)

    ctx.status = 200
    ctx.set('Content-Type', 'application/csv')
    ctx.set('Content-Disposition', `attachment; filename=request.csv`)
    ctx.body = exports
  } catch (error) {
    ctx.status = 500
    ctx.body = { error: error.message }
  }

  ctx.set('Cache-Control', 'no-cache')
  await next()
}
