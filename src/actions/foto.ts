'use server';

import { prisma } from '@/lib/prisma';
import { supabaseAdmin, BUCKET_NAME } from '@/lib/supabase';

// ── Upload Foto ─────────────────────────────────────────
export async function uploadFoto(kambingId: string, formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const fileName = `${kambingId}/${Date.now()}.webp`;
  
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(fileName, buffer, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  // Save to database
  await prisma.fotoKambing.create({
    data: {
      kambing_id: kambingId,
      url: urlData.publicUrl,
    },
  });

  return { url: urlData.publicUrl };
}

// ── Get Foto Kambing ────────────────────────────────────
export async function getFotoKambing(kambingId: string) {
  return prisma.fotoKambing.findMany({
    where: { kambing_id: kambingId },
    orderBy: { created_at: 'desc' },
  });
}

// ── Hapus Foto ──────────────────────────────────────────
export async function hapusFoto(fotoId: string) {
  const foto = await prisma.fotoKambing.findUnique({ where: { id: fotoId } });
  if (!foto) throw new Error('Foto not found');

  // Extract file path from URL
  const url = new URL(foto.url);
  const pathParts = url.pathname.split(`${BUCKET_NAME}/`);
  if (pathParts[1]) {
    await supabaseAdmin.storage.from(BUCKET_NAME).remove([pathParts[1]]);
  }

  await prisma.fotoKambing.delete({ where: { id: fotoId } });
  return { success: true };
}
