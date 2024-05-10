import type { InstanceOptions, IOContext } from '@vtex/api'
import { JanusClient } from '@vtex/api'

import type { SchedulerRequest } from '../events/keepAlive'

export default class Scheduler extends JanusClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdclientAutCookie: context.authToken,
      },
    })
  }

  public createScheduler = async (
    appName: string,
    schedulerData: SchedulerRequest
  ): Promise<void> => {
    await this.http.put(
      `/api/scheduler/${this.context.workspace}/${appName}/?version=4`,
      schedulerData,
      {
        metric: `create-scheduler-return-app-setup`,
      }
    )
  }

  public deleteScheduler = async (
    appName: string,
    id: string
  ): Promise<void> => {
    await this.http.delete(
      `/api/scheduler/${this.context.workspace}/${appName}/${id}?version=4`,
      {
        metric: `delete-scheduler-return-app-setup`,
      }
    )
  }
}
