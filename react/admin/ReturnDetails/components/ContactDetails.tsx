import React from 'react'
import { FormattedMessage } from 'react-intl'

import { useReturnDetails } from '../../hooks/useReturnDetails'

export const ContactDetails = () => {
  const { data } = useReturnDetails()

  if (!data) return null

  const {
    returnRequestDetails: {
      customerProfileData: { name, email, phoneNumber },
    },
  } = data

  return (
    <section className="flex-ns flex-wrap flex-auto flex-column pt4 pb4">
      <h3>
        <FormattedMessage id="admin/return-app.return-request-details.contact-details.title" />
      </h3>
      <div className="mb5">
        <p className="ma0">
          <FormattedMessage id="returns.name" />: {name}
        </p>
      </div>
      <div className="mb5">
        <p className="ma0">
          <FormattedMessage id="returns.email" />: {email}
        </p>
      </div>
      <div className="mb5">
        <p className="ma0">
          <FormattedMessage id="returns.phone" />: {phoneNumber}
        </p>
      </div>
    </section>
  )
}
