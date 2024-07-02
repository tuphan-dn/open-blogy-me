import 'server-only'
import 'reflect-metadata'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { env } from '@/configs/env'
import { COOKIE_NAME, verify } from '@/lib/auth'

const AuthMetadataKey = Symbol('inject:auth')
const QueryMetadataKey = Symbol('inject:query')
const BodyMetadataKey = Symbol('inject:body')
const FormMetadataKey = Symbol('inject:form')
const ParamsMetadataKey = Symbol('inject:params')

/**
 * Allow to all decorator work correctly
 * The side effect of this decorator is to handle exceptions (aka. try/catch) the api
 * So we highly recommmend to use it every api
 */
export function Injectable() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // Original function
    const fn: (req: NextRequest, ...props: any[]) => Promise<NextResponse> =
      descriptor.value
    // Wrapped function
    descriptor.value = async function (
      req: NextRequest,
      { params: nextParams }: { params: object },
    ) {
      try {
        const args: [NextRequest, ...any[]] = [req]
        // Auth
        const metaauth:
          | { index: number; whitelist?: string[]; loose: boolean }
          | undefined = Reflect.getOwnMetadata(
          AuthMetadataKey,
          target,
          propertyKey,
        )
        if (metaauth) {
          const { value } = cookies().get(COOKIE_NAME) || {}
          const userId = await verify(value)
          if (!userId && !metaauth.loose)
            return NextResponse.json('Unauthorized request', { status: 401 })
          if (metaauth.whitelist && !metaauth.whitelist.includes(userId))
            return NextResponse.json('Unauthorized request', { status: 401 })
          if (metaauth.index >= 0) args[metaauth.index] = userId
        }
        // Query
        const metaquery: { index: number; dto?: z.ZodObject<any> } | undefined =
          Reflect.getOwnMetadata(QueryMetadataKey, target, propertyKey)
        if (metaquery && metaquery.dto) {
          const query = metaquery.dto.safeParse(
            Object.fromEntries(req.nextUrl.searchParams.entries()),
          )
          if (!query.success)
            return NextResponse.json(fromZodError(query.error).toString(), {
              status: 400,
            })
          args[metaquery.index] = query.data
        }
        // Body
        const metabody: { index: number; dto?: z.ZodObject<any> } | undefined =
          Reflect.getOwnMetadata(BodyMetadataKey, target, propertyKey)
        if (metabody && metabody.dto) {
          const body = metabody.dto.safeParse(await req.clone().json())
          if (!body.success)
            return NextResponse.json(fromZodError(body.error).toString(), {
              status: 400,
            })
          args[metabody.index] = body.data
        }
        // Form
        const metaform: { index: number; dto?: z.ZodObject<any> } | undefined =
          Reflect.getOwnMetadata(FormMetadataKey, target, propertyKey)
        if (metaform && metaform.dto) {
          const form = metaform.dto.safeParse(
            Object.fromEntries(await req.clone().formData()),
          )
          if (!form.success)
            return NextResponse.json(fromZodError(form.error).toString(), {
              status: 400,
            })
          args[metaform.index] = form.data
        }
        // Params
        const metaparams:
          | { index: number; dto?: z.ZodObject<any> }
          | undefined = Reflect.getOwnMetadata(
          ParamsMetadataKey,
          target,
          propertyKey,
        )
        if (metaparams && metaparams.dto) {
          const params = metaparams.dto.safeParse(nextParams)
          if (!params.success)
            return NextResponse.json(fromZodError(params.error).toString(), {
              status: 400,
            })
          args[metaparams.index] = params.data
        }
        // Execute
        return await fn.apply(this, args)
      } catch (er: any) {
        if (env === 'development') console.trace(er)
        return NextResponse.json(er.message, { status: 500 })
      }
    }
  }
}

/**
 * Auth decorator
 * You can use for either a static method or a method parameter
 * For example:
 * ```
 * @Auth()
 * static async GET() { ... }
 *
 * static async POST(@Auth() userId: string) { ... }
 * ```
 * @param opts Authentication options
 * @param opts.whitelist The list of allowed emails
 * @param opts.loose If true, the unauthorized request can be bypassed
 */
export function Auth({
  whitelist,
  loose = false,
}: {
  whitelist?: string[]
  loose?: boolean
} = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptorOrIndex: PropertyDescriptor | number,
  ) {
    if (Reflect.getOwnMetadata(AuthMetadataKey, target, propertyKey))
      throw new Error(
        `Cannot accept multiple @Auth() in a single method ${propertyKey}`,
      )
    const index = typeof descriptorOrIndex === 'number' ? descriptorOrIndex : -1
    Reflect.defineMetadata(
      AuthMetadataKey,
      { index, whitelist, loose },
      target,
      propertyKey,
    )
  }
}

/**
 * Query decorator
 * Ref: https://nextjs.org/docs/app/building-your-application/routing/route-handlers#url-query-parameters
 */
export function Query(dto?: z.ZodObject<any>) {
  return function (target: any, propertyKey: string, index: number) {
    if (Reflect.getOwnMetadata(QueryMetadataKey, target, propertyKey))
      throw new Error(
        `Cannot accept multiple @Query() in a single method ${propertyKey}`,
      )
    Reflect.defineMetadata(
      QueryMetadataKey,
      { index, dto },
      target,
      propertyKey,
    )
  }
}

/**
 * Body decorator
 * Ref: https://nextjs.org/docs/app/building-your-application/routing/route-handlers#request-body
 */
export function Body(dto?: z.ZodObject<any>) {
  return function (target: any, propertyKey: string, index: number) {
    if (Reflect.getOwnMetadata(BodyMetadataKey, target, propertyKey))
      throw new Error(
        `Cannot accept multiple @Body() in a single method ${propertyKey}`,
      )
    Reflect.defineMetadata(BodyMetadataKey, { index, dto }, target, propertyKey)
  }
}

/**
 * Form decorator
 * Ref: https://nextjs.org/docs/app/building-your-application/routing/route-handlers#request-body-formdata
 */
export function Form(dto?: z.ZodObject<any>) {
  return function (target: any, propertyKey: string, index: number) {
    if (Reflect.getOwnMetadata(FormMetadataKey, target, propertyKey))
      throw new Error(
        `Cannot accept multiple @Form() in a single method ${propertyKey}`,
      )
    Reflect.defineMetadata(FormMetadataKey, { index, dto }, target, propertyKey)
  }
}

/**
 * Params decorator
 * Ref: https://nextjs.org/docs/app/building-your-application/routing/route-handlers#dynamic-route-segments
 */
export function Params(dto?: z.ZodObject<any>) {
  return function (target: any, propertyKey: string, index: number) {
    if (Reflect.getOwnMetadata(ParamsMetadataKey, target, propertyKey))
      throw new Error(
        `Cannot accept multiple @Params() in a single method ${propertyKey}`,
      )
    Reflect.defineMetadata(
      ParamsMetadataKey,
      { index, dto },
      target,
      propertyKey,
    )
  }
}