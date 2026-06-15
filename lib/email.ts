import { Resend } from 'resend'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
// Use a verified domain sender once you have one (e.g. "PresetScout <noreply@presetscout.com>").
// Falls back to Resend's shared onboarding sender, which only delivers to your own Resend account email.
const FROM = process.env.RESEND_FROM || 'PresetScout <onboarding@resend.dev>'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

function shell(title: string, bodyHtml: string): string {
  return `
  <div style="background:#0a0a0b;padding:32px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#111114;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
      <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <span style="font-size:18px;font-weight:600;color:#f0f0f0;">Preset<span style="color:#7c5cfc;">Scout</span></span>
      </div>
      <div style="padding:28px;color:#c9c9d1;font-size:14px;line-height:1.6;">
        <h1 style="margin:0 0 16px;font-size:18px;color:#f0f0f0;">${title}</h1>
        ${bodyHtml}
      </div>
    </div>
  </div>`
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:8px;background:#7c5cfc;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600;font-size:14px;">${label}</a>`
}

/** Confirmation + library link sent to the buyer. Never throws. */
export async function sendPurchaseReceipt(opts: {
  to: string
  presetTitle: string
  amount: string
}): Promise<void> {
  const resend = getResend()
  if (!resend) return
  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: `Your PresetScout purchase: ${opts.presetTitle}`,
      html: shell(
        'Thanks for your purchase! 🎉',
        `<p>You bought <strong style="color:#f0f0f0;">${opts.presetTitle}</strong> for <strong style="color:#f0f0f0;">${opts.amount}</strong>.</p>
         <p>Your preset is ready to download from your library.</p>
         ${button(`${SITE}/library`, 'Go to my library')}`
      ),
    })
  } catch (err) {
    console.error('sendPurchaseReceipt failed:', err)
  }
}

/** Sale notification sent to the seller. Never throws. */
export async function sendSaleNotification(opts: {
  to: string
  presetTitle: string
  payout: string
}): Promise<void> {
  const resend = getResend()
  if (!resend) return
  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: `You made a sale: ${opts.presetTitle}`,
      html: shell(
        'You just made a sale! 💸',
        `<p><strong style="color:#f0f0f0;">${opts.presetTitle}</strong> just sold.</p>
         <p>Your payout: <strong style="color:#f0f0f0;">${opts.payout}</strong> (after the platform fee).</p>
         ${button(`${SITE}/dashboard/payouts`, 'View payouts')}`
      ),
    })
  } catch (err) {
    console.error('sendSaleNotification failed:', err)
  }
}
