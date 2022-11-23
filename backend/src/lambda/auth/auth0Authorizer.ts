import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJIgj93a5A9fU1MA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi04MG02bmhlNGV6NjRsdHN4LnVzLmF1dGgwLmNvbTAeFw0yMjExMTkw
OTAxNTlaFw0zNjA3MjgwOTAxNTlaMCwxKjAoBgNVBAMTIWRldi04MG02bmhlNGV6
NjRsdHN4LnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAMJwmWVFwo9QI9no7hCW0HwP888efWXAgLubVPf/ro+PV148LPgRLAa2Jwnt
N/jVNsjprOARo5avXV9PoGyVVhN2AwgnFVYmDr5H6h99UL3SjelSoBf+iaAoGEQH
s/NkJlH2ZPo1K6GzjzP1LoT4Zueyoyb5Oak+UWHnA9MtopzF/7XZ/Yu3pzSGuUek
YW10FmYM3CaHP3fULYWvzhf9L1klKxMZH0D1QtU0U32ygpvizJakGrSO2OSLmu20
XWNlaTIYRwvP84v4l8WlEpJK0OsNF+w9UW7xhOIOoo3nlZgG+HAxZ4L8SDF4ZxuF
2z55mPPeR1gzoXnjdALX7xzP/hUCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUh3LeMb/iWZpEpx8kv8qkXvbpZC0wDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQCsbK7bgN1lUlJwP8C6+D2g8DHCW9RwI4kzBnF34lUz
vXVgvnUH2qgYMOAvh3Qio+cvac6WsgKerBoljBS015GDMuy6XRDvBhrszqpTWmCl
eh7YcAxe0nq2Boop3qJ/xK0IK21uM4Q7TTQMGkUyyoiOSDQbh9egTJjMcfrQPMwx
1v/zAg3FvH3xA6s3Z4BC0tHmPHAxDGWaOFV62ZjcMvC8x9q2UEHuzZhTyTmBAeev
5GF2kkXrOgLrmoaBFH09BteQORWlfKoQGdjIJPSOXuUxQf2MC7I9xGnekDG6sOIq
STuNaVPGZ8XU72abK3lcO1ffuOkcpHXd0NwN1DxCeCZE
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  return  verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
