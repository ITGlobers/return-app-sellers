import { ResolverError, UserInputError } from '@vtex/api'
import { Status } from '../../typings/ReturnRequest'

const statusAllowed: Record<Status, Status[]> = {
  new: [Status.new, Status.processing, Status.denied, Status.cancelled],
  processing: [Status.processing, Status.pickedUpFromClient, Status.denied, Status.cancelled],
  pickedUpFromClient: [Status.pickedUpFromClient, Status.pendingVerification, Status.denied],
  pendingVerification: [Status.pendingVerification, Status.packageVerified],
  // In this step, when sending the items to the resolver, it will assign the status denied or packageVerified based on the items sent.
  packageVerified: [Status.packageVerified, Status.amountRefunded],
  amountRefunded: [Status.amountRefunded],
  denied: [Status.denied],
  cancelled: [Status.cancelled],
}

export const validateStatusUpdate = (
  newStatus: Status,
  currentStatus: Status
) => {
  if (!newStatus) {
    throw new UserInputError('Missing status')
  }

  if (!statusAllowed[newStatus]) {
    throw new UserInputError(
      `Invalid status: ${newStatus}. Valid values: ${Object.keys(
        statusAllowed
      ).join(', ')}`
    )
  }

  if (!statusAllowed[currentStatus].includes(newStatus)) {
    throw new ResolverError(
      `Status transition from ${currentStatus} to ${newStatus} is not allowed. Valid status: ${statusAllowed[
        currentStatus
      ].join(', ')}`
    )
  }
}
