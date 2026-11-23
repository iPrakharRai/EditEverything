// Generates realistic sample images with crisp text for immediate OCR testing

export function generateSampleImage(type: 'certificate' | 'receipt' | 'quote'): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    if (type === 'certificate') {
      canvas.width = 900;
      canvas.height = 620;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Elegant border
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      ctx.strokeStyle = '#00bed6';
      ctx.lineWidth = 2;
      ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

      // Certificate Title
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE OF ACHIEVEMENT', 450, 110);

      ctx.fillStyle = '#0891b2';
      ctx.font = 'italic 20px Georgia, serif';
      ctx.fillText('This award is proudly presented to', 450, 175);

      ctx.fillStyle = '#008b9e';
      ctx.font = 'bold 44px Arial, sans-serif';
      ctx.fillText('ALEXANDER MORGAN', 450, 250);

      // Underline line
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(250, 275);
      ctx.lineTo(650, 275);
      ctx.stroke();

      ctx.fillStyle = '#334155';
      ctx.font = '22px Arial, sans-serif';
      ctx.fillText('For exceptional dedication and outstanding performance', 450, 335);
      ctx.fillText('in Digital Document Engineering & Innovation.', 450, 375);

      // Signatures
      ctx.fillStyle = '#64748b';
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText('Date: November 24, 2026', 260, 490);
      ctx.fillText('Director: Jordan Reed', 640, 490);

      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(180, 465);
      ctx.lineTo(340, 465);
      ctx.moveTo(560, 465);
      ctx.lineTo(720, 465);
      ctx.stroke();

    } else if (type === 'receipt') {
      canvas.width = 600;
      canvas.height = 750;

      // Paper background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.font = 'bold 32px Courier New, monospace';
      ctx.fillText('BLUE OCEAN CAFE', 300, 70);

      ctx.font = '18px Courier New, monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText('104 Market Street, Suite 4', 300, 110);
      ctx.fillText('Tel: (555) 019-2834', 300, 140);
      ctx.fillText('Order #4928 - Table 12', 300, 180);

      // Divider
      ctx.strokeStyle = '#cbd5e1';
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(50, 210);
      ctx.lineTo(550, 210);
      ctx.stroke();
      ctx.setLineDash([]);

      // Items
      ctx.textAlign = 'left';
      ctx.font = 'bold 20px Courier New, monospace';
      ctx.fillStyle = '#1e293b';

      ctx.fillText('1x Artisan Cappuccino', 70, 260);
      ctx.textAlign = 'right';
      ctx.fillText('$4.75', 530, 260);

      ctx.textAlign = 'left';
      ctx.fillText('1x Almond Croissant', 70, 310);
      ctx.textAlign = 'right';
      ctx.fillText('$4.25', 530, 310);

      ctx.textAlign = 'left';
      ctx.fillText('1x Avocado Sourdough Toast', 70, 360);
      ctx.textAlign = 'right';
      ctx.fillText('$11.50', 530, 360);

      // Divider
      ctx.strokeStyle = '#cbd5e1';
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(50, 410);
      ctx.lineTo(550, 410);
      ctx.stroke();
      ctx.setLineDash([]);

      // Totals
      ctx.textAlign = 'left';
      ctx.font = '18px Courier New, monospace';
      ctx.fillText('Subtotal:', 280, 460);
      ctx.textAlign = 'right';
      ctx.fillText('$20.50', 530, 460);

      ctx.textAlign = 'left';
      ctx.fillText('Tax (8.5%):', 280, 500);
      ctx.textAlign = 'right';
      ctx.fillText('$1.74', 530, 500);

      ctx.textAlign = 'left';
      ctx.font = 'bold 24px Courier New, monospace';
      ctx.fillText('TOTAL DUE:', 280, 560);
      ctx.textAlign = 'right';
      ctx.fillText('$22.24', 530, 560);

      ctx.textAlign = 'center';
      ctx.font = 'italic 18px Courier New, monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Thank you for your visit!', 300, 650);

    } else {
      // Quote Poster
      canvas.width = 800;
      canvas.height = 600;

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, 800, 600);
      grad.addColorStop(0, '#f0fdfa');
      grad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);

      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 720, 520);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#0891b2';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText('DAILY INSPIRATION', 400, 110);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 44px Georgia, serif';
      ctx.fillText('SIMPLICITY IS THE', 400, 210);
      ctx.fillText('ULTIMATE SOPHISTICATION', 400, 280);

      ctx.fillStyle = '#00bed6';
      ctx.font = 'italic 28px Georgia, serif';
      ctx.fillText('- Leonardo da Vinci -', 400, 370);

      ctx.fillStyle = '#64748b';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText('EditEverything Design Studio', 400, 470);
    }

    resolve(canvas.toDataURL('image/png'));
  });
}
