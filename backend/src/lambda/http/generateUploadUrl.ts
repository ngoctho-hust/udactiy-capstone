import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { AttachmentUtils } from '../../helpers/attachmentUtils'
import * as uuid from 'uuid'

import { updateAttachmentUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const attachmentUtils = new AttachmentUtils()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const attachmentId = uuid.v4()

    let uploadUrl = await attachmentUtils.createAttachmentPresignedUrl(attachmentId);

    const attachmentUrl = await attachmentUtils.getAttachmentUrl(attachmentId)

    await updateAttachmentUrl(userId, todoId, attachmentUrl)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
