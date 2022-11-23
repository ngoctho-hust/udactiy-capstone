import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { AttachmentUtils } from '../../helpers/attachmentUtils'

import { getTodo, updateAttachmentUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const attachmentUtils = new AttachmentUtils()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    let todoItem = await getTodo(userId, todoId)

    await attachmentUtils.deleteAttachment(todoItem.attachmentUrl.split('/').pop())
    await updateAttachmentUrl(userId, todoId, '')

    return {
      statusCode: 201,
      body: JSON.stringify({})
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
