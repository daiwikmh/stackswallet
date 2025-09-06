import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Fingerprint, Shield, AlertCircle, CheckCircle2 } from 'lucide-react'

interface CredentialData {
  id: string
  name: string
  createdAt: string
}

interface FingerprintAuthProps {
  onAuthSuccess?: (credential: CredentialData) => void
  onAuthError?: (error: string) => void
  className?: string
}

export default function FingerprintAuth({ 
  onAuthSuccess, 
  onAuthError, 
  className = "" 
}: FingerprintAuthProps) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [registeredCredentials, setRegisteredCredentials] = useState<CredentialData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Check WebAuthn support
  const checkSupport = useCallback(() => {
    const supported = typeof window !== 'undefined' &&
                     !!window.PublicKeyCredential &&
                     !!navigator.credentials
    setIsSupported(supported)
    return supported
  }, [])

  // Generate challenge (in production, this should come from your server)
  const generateChallenge = (): ArrayBuffer => {
    return crypto.getRandomValues(new Uint8Array(32)).buffer
  }

  // Convert ArrayBuffer to base64url
  const arrayBufferToBase64Url = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let str = ''
    for (const byte of bytes) {
      str += String.fromCharCode(byte)
    }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  // Register a new fingerprint credential
  const registerFingerprint = async () => {
    if (!checkSupport()) {
      setError('WebAuthn is not supported on this device')
      return
    }

    setIsRegistering(true)
    setError(null)
    setSuccess(null)

    try {
      const challenge = generateChallenge()
      
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Stacks App",
          id: window.location.hostname,
        },
        user: {
          id: crypto.getRandomValues(new Uint8Array(64)),
          name: "user@stacksapp.com",
          displayName: "Stacks User",
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "direct"
      }

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential

      if (credential) {
        const credentialData: CredentialData = {
          id: arrayBufferToBase64Url(credential.rawId),
          name: `Fingerprint ${registeredCredentials.length + 1}`,
          createdAt: new Date().toISOString()
        }

        // Store credential info (in production, store on server)
        const stored = localStorage.getItem('webauthn-credentials')
        const credentials = stored ? JSON.parse(stored) : []
        credentials.push(credentialData)
        localStorage.setItem('webauthn-credentials', JSON.stringify(credentials))
        
        setRegisteredCredentials(credentials)
        setSuccess('Fingerprint registered successfully!')
      }
    } catch (err: any) {
      console.error('Registration failed:', err)
      setError(`Registration failed: ${err.message || 'Unknown error'}`)
      onAuthError?.(err.message || 'Registration failed')
    } finally {
      setIsRegistering(false)
    }
  }

  // Authenticate with fingerprint
  const authenticateFingerprint = async () => {
    if (!checkSupport()) {
      setError('WebAuthn is not supported on this device')
      return
    }

    // Check if any credentials are registered
    const stored = localStorage.getItem('webauthn-credentials')
    const credentials = stored ? JSON.parse(stored) : []
    
    if (credentials.length === 0) {
      setError('No fingerprint registered. Please register first.')
      return
    }

    setIsAuthenticating(true)
    setError(null)
    setSuccess(null)

    try {
      const challenge = generateChallenge()
      
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: credentials.map((cred: CredentialData) => ({
          id: Uint8Array.from(atob(cred.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
          type: 'public-key'
        })),
        userVerification: "required",
        timeout: 60000,
      }

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential

      if (assertion) {
        const credentialId = arrayBufferToBase64Url(assertion.rawId)
        const matchedCredential = credentials.find((cred: CredentialData) => cred.id === credentialId)
        
        setSuccess('Authentication successful!')
        onAuthSuccess?.(matchedCredential || { id: credentialId, name: 'Unknown', createdAt: new Date().toISOString() })
      }
    } catch (err: any) {
      console.error('Authentication failed:', err)
      if (err.name === 'NotAllowedError') {
        setError('Authentication was cancelled or timed out')
      } else {
        setError(`Authentication failed: ${err.message || 'Unknown error'}`)
      }
      onAuthError?.(err.message || 'Authentication failed')
    } finally {
      setIsAuthenticating(false)
    }
  }

  // Load registered credentials on mount
  useState(() => {
    checkSupport()
    const stored = localStorage.getItem('webauthn-credentials')
    if (stored) {
      setRegisteredCredentials(JSON.parse(stored))
    }
  })

  if (isSupported === false) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            WebAuthn Not Supported
          </CardTitle>
          <CardDescription>
            Your device or browser doesn't support WebAuthn fingerprint authentication.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Fingerprint Authentication
        </CardTitle>
        <CardDescription>
          Use your device's fingerprint sensor for secure authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={registerFingerprint}
            disabled={isRegistering || isAuthenticating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {isRegistering ? 'Registering...' : 'Register Fingerprint'}
          </Button>

          <Button
            onClick={authenticateFingerprint}
            disabled={isAuthenticating || isRegistering || registeredCredentials.length === 0}
            className="flex items-center gap-2"
          >
            <Fingerprint className="h-4 w-4" />
            {isAuthenticating ? 'Authenticating...' : 'Authenticate'}
          </Button>
        </div>

        {registeredCredentials.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Registered Fingerprints</h4>
            <div className="space-y-1">
              {registeredCredentials.map((cred, index) => (
                <div key={cred.id} className="text-xs text-muted-foreground">
                  {cred.name} - {new Date(cred.createdAt).toLocaleDateString()}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4">
          <p>• Ensure your device has a fingerprint sensor enabled</p>
          <p>• Use HTTPS for WebAuthn to work properly</p>
          <p>• On mobile, use Chrome/Safari for best compatibility</p>
        </div>
      </CardContent>
    </Card>
  )
}