import { loadLocalConfig, saveLocalConfig } from './localData'

type FilePermissionState = 'granted' | 'denied' | 'prompt'

export type ProjectFileHandle = {
  getFile(): Promise<File>
  createWritable(): Promise<{
    write(data: Blob): Promise<void>
    close(): Promise<void>
  }>
}

export type ProjectDirectoryHandle = {
  queryPermission(options: { mode: 'read' | 'readwrite' }): Promise<FilePermissionState>
  requestPermission(options: { mode: 'read' | 'readwrite' }): Promise<FilePermissionState>
  getFileHandle(name: string, options?: { create?: boolean }): Promise<ProjectFileHandle>
  getDirectoryHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<ProjectDirectoryHandle>
  removeEntry(name: string): Promise<void>
}

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: (options: {
    id: string
    mode: 'readwrite'
  }) => Promise<ProjectDirectoryHandle>
}

const projectDirectoryKey = 'projectPublicDirectoryHandle'

export async function chooseProjectPublicDirectory(): Promise<ProjectDirectoryHandle> {
  const picker = (window as DirectoryPickerWindow).showDirectoryPicker
  if (!picker) {
    throw new Error('Project files require a browser with folder access, such as Chrome or Edge.')
  }

  const directory = await picker.call(window, {
    id: 'gh-emoji-project-files',
    mode: 'readwrite',
  })
  const permission = await directory.queryPermission({ mode: 'readwrite' })
  if (
    permission !== 'granted' &&
    (await directory.requestPermission({ mode: 'readwrite' })) !== 'granted'
  ) {
    throw new Error('Write permission to the selected project folder was not granted.')
  }

  await saveLocalConfig(projectDirectoryKey, directory)
  return directory
}

export async function getSavedProjectPublicDirectory(): Promise<
  ProjectDirectoryHandle | undefined
> {
  const directory = await loadLocalConfig<ProjectDirectoryHandle | undefined>(
    projectDirectoryKey,
    undefined,
  )
  if (!directory) {
    return undefined
  }

  return (await directory.queryPermission({ mode: 'readwrite' })) === 'granted'
    ? directory
    : undefined
}

export async function readProjectJsonFile<T>(
  directory: ProjectDirectoryHandle,
  fileName: string,
): Promise<T | undefined> {
  try {
    const handle = await directory.getFileHandle(fileName)
    const file = await handle.getFile()
    return JSON.parse(await file.text()) as T
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      return undefined
    }
    throw error
  }
}

export async function writeProjectJsonFile(
  directory: ProjectDirectoryHandle,
  fileName: string,
  value: unknown,
): Promise<void> {
  const handle = await directory.getFileHandle(fileName, { create: true })
  const writable = await handle.createWritable()
  await writable.write(
    new Blob([JSON.stringify(value, null, 2), '\n'], {
      type: 'application/json',
    }),
  )
  await writable.close()
}

export async function hasProjectFileAccess(): Promise<boolean> {
  return Boolean(await getSavedProjectPublicDirectory())
}
