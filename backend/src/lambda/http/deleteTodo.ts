import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo, getTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { AttachmentUtils } from '../../helpers/attachmentUtils'

const attachmentUtils = new AttachmentUtils()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    const todoItem = await getTodo(userId, todoId)
    if (!todoItem) {
      return {
        statusCode: 404,
        body: JSON.stringify({})
      }
    }

    await attachmentUtils.deleteAttachment(todoItem.attachmentUrl.split('/').pop())
    await deleteTodo(userId, todoId)
    
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
