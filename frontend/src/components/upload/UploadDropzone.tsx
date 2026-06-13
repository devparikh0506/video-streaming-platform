import { useRef, useState, type DragEvent } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { TextInput } from '@/components/ui/TextInput'
import { Select } from '@/components/ui/Select'
import { cx } from '@/lib/cx'
import { formatBytes } from '@/lib/format'

const ACCEPT = 'video/*'
const FALLBACK_CATEGORIES = ['Documentary', 'Nature', 'Tech Talks', 'Short Films', 'Animation']

interface UploadDropzoneProps {
  categories: string[]
  /** Begin an upload. Returning starts an async multipart transfer. */
  onStart: (file: File, title: string, category: string) => void
}

/** Drag-and-drop target + metadata form that kicks off a multipart upload. */
export function UploadDropzone({ categories, onStart }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [dragging, setDragging] = useState(false)

  const options = (categories.length > 0 ? categories : FALLBACK_CATEGORIES).map((c) => ({
    value: c,
    label: c,
  }))

  function pick(next: File | null) {
    setFile(next)
    if (next && !title) setTitle(next.name.replace(/\.[^.]+$/, ''))
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    const dropped = event.dataTransfer.files?.[0]
    if (dropped) pick(dropped)
  }

  function submit() {
    if (!file || !title.trim() || !category) return
    onStart(file, title.trim(), category)
    setFile(null)
    setTitle('')
    setCategory('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const canSubmit = file != null && title.trim().length > 0 && category.length > 0

  return (
    <div className="stack">
      <div
        className={cx('dropzone', dragging && 'dropzone--active')}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <span className="dropzone__icon">
          <Icon name={file ? 'film' : 'upload'} />
        </span>
        <p className="dropzone__title">{file ? file.name : 'Drop a video to upload'}</p>
        <p className="dropzone__text">
          {file
            ? formatBytes(file.size)
            : 'Drag & drop a file here, or browse. Large files upload in resumable chunks.'}
        </p>
        <Button iconLeft="film" variant="secondary" onClick={() => inputRef.current?.click()}>
          {file ? 'Choose a different file' : 'Choose file'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />
        <p className="dropzone__formats">MP4, MOV, MKV, WebM · up to 5 GB</p>
      </div>

      <form
        className="upload-form"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <Field label="Title">
          {(id) => (
            <TextInput
              id={id}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Glacier Survey — Final"
            />
          )}
        </Field>
        <Field label="Category">
          {(id) => (
            <Select
              id={id}
              options={options}
              placeholder="Select a category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          )}
        </Field>
        <div className="upload-form__full">
          <Button type="submit" block iconLeft="upload" disabled={!canSubmit}>
            Start upload
          </Button>
        </div>
      </form>
    </div>
  )
}
