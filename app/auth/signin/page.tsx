import React, { Suspense } from 'react'
import { SignInForm } from './SignInForm'

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0b]" />}>
      <SignInForm />
    </Suspense>
  )
}
