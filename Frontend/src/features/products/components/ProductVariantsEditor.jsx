import { useEffect, useMemo, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { parseVariantGroups, serializeVariantGroups, summarizeVariantGroups } from '../utils/variantUtils'

function createEmptyRow() {
  return {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    name: '',
    values: '',
  }
}

function normalizeRows(value) {
  const groups = parseVariantGroups(value)
  if (!groups.length) {
    return [createEmptyRow()]
  }

  return groups.map((group) => ({
    id: globalThis.crypto?.randomUUID?.() || `${group.name}-${Math.random()}`,
    name: group.name,
    values: group.values,
  }))
}

export default function ProductVariantsEditor({ value, onChange }) {
  const initialRows = useMemo(() => normalizeRows(value), [value])
  const [rows, setRows] = useState(initialRows)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect //
    setRows(initialRows)
  }, [initialRows])

  function emitChange(nextRows) {
    setRows(nextRows)
    onChange?.('variants', serializeVariantGroups(nextRows))
  }

  function updateRow(rowId, field, nextValue) {
    emitChange(
      rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]: nextValue,
            }
          : row,
      ),
    )
  }

  function addRow() {
    emitChange([...rows, createEmptyRow()])
  }

  function removeRow(rowId) {
    const nextRows = rows.filter((row) => row.id !== rowId)
    emitChange(nextRows.length ? nextRows : [createEmptyRow()])
  }

  const preview = summarizeVariantGroups(value)

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <span className="block text-sm font-medium text-[var(--text-h)]">Biến thể</span>
        <p className="text-xs text-[var(--text)]">
          Dùng cấu trúc JSON chuẩn: <code>{`{ "sizes": ["nhỏ", "vừa", "lớn"] }`}</code>
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
        {rows.map((row) => (
          <div key={row.id} className="space-y-3 rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[var(--text-h)]">Nhóm biến thể</span>
              <Button type="button" variant="secondary" size="sm" onClick={() => removeRow(row.id)}>
                Xóa nhóm
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_1.4fr]">
              <Input
                label="Tên nhóm"
                value={row.name}
                placeholder="sizes"
                onChange={(event) => updateRow(row.id, 'name', event.target.value)}
              />
              <Input
                label="Giá trị"
                value={row.values}
                placeholder="nhỏ, vừa, lớn"
                onChange={(event) => updateRow(row.id, 'values', event.target.value)}
              />
            </div>
          </div>
        ))}

        <Button type="button" variant="secondary" onClick={addRow}>
          + Thêm nhóm biến thể
        </Button>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--social-bg)] p-4">
        <div className="mb-2 text-sm font-medium text-[var(--text-h)]">Xem trước</div>
        {preview.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {preview.map((group) => (
              <span
                key={group.name}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--text-h)]"
              >
                {group.name}: {group.count}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text)]">Chưa có biến thể nào.</p>
        )}
      </div>
    </div>
  )
}
