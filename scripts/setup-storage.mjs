const URL = 'https://jgkvlmgtolnsqvemwktv.supabase.co/storage/v1/bucket'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impna3ZsbWd0b2xuc3F2ZW13a3R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ1MTkzMSwiZXhwIjoyMDk3MDI3OTMxfQ.FOb0EXzhQ2y0O-sSqiWXNFn5IcTip8c5m65PAI5m_oI'

const buckets = [
  { id: 'preset-demos', name: 'preset-demos', public: true, fileSizeLimit: 10485760 },
  { id: 'preset-files', name: 'preset-files', public: false, fileSizeLimit: 52428800 },
  { id: 'avatars', name: 'avatars', public: true, fileSizeLimit: 5242880 },
]

for (const bucket of buckets) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(bucket),
  })
  const body = await res.json()
  if (res.ok || body.error === 'Duplicate') {
    console.log(`✓ "${bucket.id}" (${bucket.public ? 'public' : 'private'})`)
  } else {
    console.error(`❌ "${bucket.id}":`, body.error ?? body.message)
  }
}
console.log('Done.')
