import type { FC } from 'react'
import React, { createContext, useMemo } from 'react'
import type { ParamsUpdateReturnRequestStatus, RefundDataInput, ReturnRequestCommentInput, ReturnRequestResponse, Status } from '../../../typings/ReturnRequest'
import { useMutation } from 'react-apollo'
import { FormattedMessage } from 'react-intl'
import UPDATE_RETURN_STATUS from '../graphql/updateReturnRequestStatus.gql'
import { useAlert } from '../hooks/userAlert'
import { useReturnDetails } from '../../common/hooks/useReturnDetails'

interface HandleStatusUpdateArgs {
  status: Status
  id: string
  comment?: ReturnRequestCommentInput
  cleanUp?: () => void
  refundData?: RefundDataInput
}

interface UpdateRequestInterface {
  handleStatusUpdate: (args: HandleStatusUpdateArgs) => Promise<void>
  submitting: boolean
}

export const UpdateRequestStatusContext = createContext<UpdateRequestInterface>(
  {} as UpdateRequestInterface
)

export const UpdateRequestStatusProvider: FC = ({ children }) => {
  const { openAlert } = useAlert()
  const { _handleUpdateQuery } = useReturnDetails()
  const [updateReturnStatus, { loading: submitting }] = useMutation<
    {
      updateReturnRequestStatus: ReturnRequestResponse
    },
    ParamsUpdateReturnRequestStatus
  >(UPDATE_RETURN_STATUS)

  const handleStatusUpdate = async (args: HandleStatusUpdateArgs) => {
    const { id, status, comment, cleanUp, refundData } = args
    try {
      const { errors, data: mutationData } = await updateReturnStatus({
        variables: {
          requestId: id,
          status,
          ...(comment ? { comment } : {}),
          ...(refundData ? { refundData } : {}),
        },
      })
      if (errors) {
        throw new Error('Error updating return request status')
      }
      openAlert(
        'success',
        <FormattedMessage id="admin/return-app.return-request-details.update-status.alert.success" />
      )
      cleanUp?.()
      if (!mutationData) return
      _handleUpdateQuery(mutationData.updateReturnRequestStatus)
    } catch {
      openAlert(
        'error',
        <FormattedMessage id="admin/return-app.return-request-details.update-status.alert.error" />
      )
    }
  }

  const contextValue = useMemo(() => ({
    handleStatusUpdate,
    submitting,
  }), [handleStatusUpdate, submitting])

  return (
    <UpdateRequestStatusContext.Provider value={contextValue}>
      {children}
    </UpdateRequestStatusContext.Provider>
  )
}
