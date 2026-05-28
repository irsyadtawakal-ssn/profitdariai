'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export async function createProduct(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const originalPrice = formData.get('original_price')
  const { error } = await supabase.from('marketplace_products').insert({
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    category: formData.get('category') as string,
    price: Number(formData.get('price') ?? 0),
    original_price: originalPrice ? Number(originalPrice) : null,
    cover_url: (formData.get('cover_url') as string) || null,
    product_url: formData.get('product_url') as string,
    is_published: formData.get('is_published') === 'true',
  })
  if (error) {
    console.error('[createProduct]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/marketplace')
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const originalPrice = formData.get('original_price')
  const { error } = await supabase
    .from('marketplace_products')
    .update({
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      description: (formData.get('description') as string) || null,
      category: formData.get('category') as string,
      price: Number(formData.get('price') ?? 0),
      original_price: originalPrice ? Number(originalPrice) : null,
      cover_url: (formData.get('cover_url') as string) || null,
      product_url: formData.get('product_url') as string,
      is_published: formData.get('is_published') === 'true',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) {
    console.error('[updateProduct]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/marketplace')
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('marketplace_products').delete().eq('id', id)
  if (error) {
    console.error('[deleteProduct]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/marketplace')
}

export async function togglePublished(id: string, current: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('marketplace_products')
    .update({ is_published: !current, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    console.error('[togglePublished]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/marketplace')
}
