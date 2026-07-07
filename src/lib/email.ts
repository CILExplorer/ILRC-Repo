import { Resend } from 'resend';

export async function broadcastDigest(digest: any, emails: string[]) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY is not defined. Email broadcast skipped.');
    return;
  }

  if (emails.length === 0) {
    console.log('No subscribers found. Email broadcast skipped.');
    return;
  }

  const resend = new Resend(resendApiKey);

  const subject = `ILRC Digest Issue #${digest.issue_number} - International Law Research Collective`;

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px;">
        <h1 style="margin: 0; font-size: 24px; color: #0f172a; font-weight: 700; letter-spacing: -0.025em;">
          International Law Research Collective (ILRC)
        </h1>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
          Issue #${digest.issue_number} — ${new Date(digest.published_at || Date.now()).toLocaleDateString('en-US', { dateStyle: 'long' })}
        </p>
      </div>
      
      ${digest.editors_note ? `
        <div style="background-color: #f8fafc; border-left: 4px solid #475569; padding: 16px; margin: 0 0 25px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; color: #334155; font-size: 15px; font-weight: 600;">Editor's Note</h3>
          <p style="margin: 0; font-style: italic; color: #475569;">"${digest.editors_note}"</p>
        </div>
      ` : ''}

      ${digest.editors_insight ? `
        <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; margin: 0 0 25px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; color: #0369a1; font-size: 15px; font-weight: 600;">Editor's Insight</h3>
          <p style="margin: 0 0 10px 0; color: #0c4a6e;">${digest.editors_insight}</p>
          <p style="margin: 0; font-size: 12px; color: #0369a1; font-weight: bold;">
            Original Content — By Ananyaa Joshi
          </p>
        </div>
      ` : ''}
      
      <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <h3 style="color: #0f172a; font-size: 18px; margin: 0 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; font-weight: 600;">
          Arbitration Development
        </h3>
        <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #1e293b; font-weight: 600;">${digest.arb_title}</h4>
        <p style="margin: 0 0 12px 0; color: #334155; font-size: 15px;">${digest.arb_summary}</p>
        <span style="font-size: 12px; color: #64748b;">
          Source: <a href="${digest.arb_source_url}" style="color: #0284c7; text-decoration: none; font-weight: 500;">${digest.arb_source_name}</a> (${new Date(digest.arb_source_date).toLocaleDateString('en-US', { dateStyle: 'medium' })})
        </span>
      </div>
      
      <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <h3 style="color: #0f172a; font-size: 18px; margin: 0 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; font-weight: 600;">
          Treaty Update
        </h3>
        <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #1e293b; font-weight: 600;">${digest.treaty_title}</h4>
        <p style="margin: 0 0 12px 0; color: #334155; font-size: 15px;">${digest.treaty_summary}</p>
        <span style="font-size: 12px; color: #64748b;">
          Source: <a href="${digest.treaty_source_url}" style="color: #0284c7; text-decoration: none; font-weight: 500;">${digest.treaty_source_name}</a> (${new Date(digest.treaty_source_date).toLocaleDateString('en-US', { dateStyle: 'medium' })})
        </span>
      </div>
      
      <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <h3 style="color: #0f172a; font-size: 18px; margin: 0 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; font-weight: 600;">
          Institution Update
        </h3>
        <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #1e293b; font-weight: 600;">${digest.inst_title}</h4>
        <p style="margin: 0 0 12px 0; color: #334155; font-size: 15px;">${digest.inst_summary}</p>
        <span style="font-size: 12px; color: #64748b;">
          Source: <a href="${digest.inst_source_url}" style="color: #0284c7; text-decoration: none; font-weight: 500;">${digest.inst_source_name}</a> (${new Date(digest.inst_source_date).toLocaleDateString('en-US', { dateStyle: 'medium' })})
        </span>
      </div>

      <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #94a3b8; text-align: justify; line-height: 1.5;">
        <p style="margin: 0 0 10px 0;">
          <strong>Disclaimer:</strong> Digest items and case notes are generated from publicly available sources listed with each item. Editor's Notes and Editorial Insights are original content by the editor. Source URLs are provided for reader verification. ILRC does not guarantee accuracy — readers should verify all citations independently.
        </p>
        <p style="margin: 0; text-align: center;">
          You are receiving this because you subscribed to the International Law Research Collective.
        </p>
      </div>
    </div>
  `;

  // Resend onboarding@resend.dev requires the recipient to be the developer's registered email address.
  // In production, using a verified domain is required.
  const fromEmail = 'ILRC Digest <onboarding@resend.dev>';
  
  // Batch size 90
  const batchSize = 90;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    try {
      // In Resend sandbox, we can only send to verified emails (typically the account owner's email).
      // So if it fails because of unverified recipients, we catch and log it so it doesn't crash the server.
      await resend.emails.send({
        from: fromEmail,
        to: batch.length === 1 ? batch[0] : 'subscribers@resend.dev',
        bcc: batch.length > 1 ? batch : undefined,
        subject: subject,
        html: html,
      });
      console.log(`Successfully sent digest email to batch of ${batch.length}`);
    } catch (e) {
      console.error('Resend email dispatch error:', e);
    }
  }
}
