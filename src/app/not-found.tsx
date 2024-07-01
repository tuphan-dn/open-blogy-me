import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 z-10">
      <h1 className="text-primary">blogy.me/404 :(</h1>
      <h3 className="mt-6">Not Found</h3>
      <p className="opacity-60 text-center">
        Sorry, we could not find the requested resource.
      </p>
      <Link href="/" className="btn btn-primary mt-4">
        Return Home
      </Link>
    </div>
  )
}
