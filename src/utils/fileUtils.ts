export const getTypeVideoOrImageFromFileName = (fileName: string) => {
  const ext = fileName.split('.').pop()
  if (ext && ['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video'
  else return 'image'
}
