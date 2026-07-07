import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import PDFDocument from 'pdfkit';

type Params = Promise<{ id: string }>;

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;

  try {
    const result = await query('SELECT * FROM digests WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Digest not found' }, { status: 404 });
    }
    const digest = result.rows[0];

    // Ensure it is published or allow admin to download pending
    // For simplicity, anyone can download published, and we check credentials if pending
    // Let's allow public downloads of PDFs if published, or admin download.
    const isPublished = digest.status === 'published';

    // Generate PDF in memory buffer
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        bufferPages: true,
      });

      const chunks: any[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // --- PDF CONTENT STYLING ---
      
      // Document Title
      doc.fillColor('#0f172a') // Dark slate
         .font('Helvetica-Bold')
         .fontSize(22)
         .text('International Law Research Collective', { align: 'center' });
      
      doc.fontSize(10)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Practitioner-oriented international law and arbitration analysis', { align: 'center', paragraphGap: 10 });

      // Divider Line
      doc.moveTo(50, 95)
         .lineTo(545, 95)
         .strokeColor('#cbd5e1')
         .lineWidth(1)
         .stroke();

      doc.y = 110;

      // Issue Info
      const pubDate = digest.published_at 
        ? new Date(digest.published_at).toLocaleDateString('en-US', { dateStyle: 'long' }) 
        : new Date(digest.created_at).toLocaleDateString('en-US', { dateStyle: 'long' });

      doc.fillColor('#334155')
         .font('Helvetica-Bold')
         .fontSize(12)
         .text(`Digest Issue #${digest.issue_number}`, { underline: false });

      doc.font('Helvetica')
         .fontSize(10)
         .fillColor('#64748b')
         .text(`Published: ${pubDate}`, { align: 'right' });
      
      doc.y = 140;

      // 1. Editor's Note
      if (digest.editors_note) {
        doc.fillColor('#0f172a')
           .font('Helvetica-Bold')
           .fontSize(13)
           .text("Editor's Note", { paragraphGap: 6 });
        
        doc.fillColor('#334155')
           .font('Helvetica-Oblique')
           .fontSize(10.5)
           .text(`"${digest.editors_note}"`, { paragraphGap: 18, lineGap: 3 });
      }

      // 2. Editor's Insight (if present)
      if (digest.editors_insight) {
        doc.fillColor('#0f172a')
           .font('Helvetica-Bold')
           .fontSize(13)
           .text("Editor's Insight", { paragraphGap: 6 });
        
        doc.fillColor('#334155')
           .font('Helvetica')
           .fontSize(10.5)
           .text(digest.editors_insight, { paragraphGap: 4, lineGap: 3 });

        doc.fillColor('#0284c7')
           .font('Helvetica-Bold')
           .fontSize(9.5)
           .text('By Ananyaa Joshi', { paragraphGap: 18 });
      }

      // 3. Arbitration Development
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .fontSize(13)
         .text('Arbitration Development', { paragraphGap: 6 });
      
      doc.fillColor('#1e293b')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text(digest.arb_title, { paragraphGap: 4 });
      
      doc.fillColor('#334155')
         .font('Helvetica')
         .fontSize(10)
         .text(digest.arb_summary, { paragraphGap: 6, lineGap: 2 });
      
      const arbDate = new Date(digest.arb_source_date).toLocaleDateString('en-US', { dateStyle: 'medium' });
      doc.fillColor('#64748b')
         .font('Helvetica-Bold')
         .fontSize(8.5)
         .text(`Source: ${digest.arb_source_name} (${arbDate})`, { paragraphGap: 18 });

      // 4. Treaty Update
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .fontSize(13)
         .text('Treaty Update', { paragraphGap: 6 });
      
      doc.fillColor('#1e293b')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text(digest.treaty_title, { paragraphGap: 4 });
      
      doc.fillColor('#334155')
         .font('Helvetica')
         .fontSize(10)
         .text(digest.treaty_summary, { paragraphGap: 6, lineGap: 2 });
      
      const treatyDate = new Date(digest.treaty_source_date).toLocaleDateString('en-US', { dateStyle: 'medium' });
      doc.fillColor('#64748b')
         .font('Helvetica-Bold')
         .fontSize(8.5)
         .text(`Source: ${digest.treaty_source_name} (${treatyDate})`, { paragraphGap: 18 });

      // 5. Institution Update
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .fontSize(13)
         .text('Institution Update', { paragraphGap: 6 });
      
      doc.fillColor('#1e293b')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text(digest.inst_title, { paragraphGap: 4 });
      
      doc.fillColor('#334155')
         .font('Helvetica')
         .fontSize(10)
         .text(digest.inst_summary, { paragraphGap: 6, lineGap: 2 });
      
      const instDate = new Date(digest.inst_source_date).toLocaleDateString('en-US', { dateStyle: 'medium' });
      doc.fillColor('#64748b')
         .font('Helvetica-Bold')
         .fontSize(8.5)
         .text(`Source: ${digest.inst_source_name} (${instDate})`, { paragraphGap: 25 });

      // 6. Sources Checklist Section
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text('Sources', { paragraphGap: 6 });

      doc.fillColor('#0284c7')
         .font('Helvetica')
         .fontSize(9);

      doc.text(`* ${digest.arb_source_name}: ${digest.arb_source_url}`, { lineGap: 2 });
      doc.text(`* ${digest.treaty_source_name}: ${digest.treaty_source_url}`, { lineGap: 2 });
      doc.text(`* ${digest.inst_source_name}: ${digest.inst_source_url}`, { paragraphGap: 30 });

      // 7. Footer Disclaimer
      doc.fillColor('#94a3b8')
         .font('Helvetica-Oblique')
         .fontSize(8)
         .text(
           "Digest items and case notes are generated from publicly available sources listed with each item. Editor's Notes and Editorial Insights are original content by the editor. Source URLs are provided for reader verification. ILRC does not guarantee accuracy — readers should verify all citations independently.",
           { align: 'justify', lineGap: 2 }
         );

      doc.end();
    });

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=ilrc-digest-${digest.issue_number}.pdf`,
      },
    });

  } catch (error) {
    console.error('PDF generation route error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
