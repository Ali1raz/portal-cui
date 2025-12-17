export function useConstructImageUrl(key: string) {
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.t3.storage.dev/${key}`;
}
