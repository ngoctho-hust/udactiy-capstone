import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { AttachmentUtils } from '../../helpers/attachmentUtils'

import { getTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const attachmentUtils = new AttachmentUtils()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    const todoItem = await getTodo(userId, todoId)

    const signedUrl = await attachmentUtils.getAttachmentSignedUrl(todoItem.attachmentUrl.split('/').pop());

    return {
      statusCode: 200,
      body: JSON.stringify({
        signedUrl
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
