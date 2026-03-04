'use client'

import { useState } from 'react'
import type { Event } from '@/lib/types'

type EventWithCount = Event & { applications: { count: number }[] }

interface EventFormData {
  name: string
  year: string
  slug: string
  description: string
  max_applicants: string
}

const emptyForm: EventFormData = { name: '', year: '', slug: '', description: '', max_applicants: '50' }

export default function EventsManager({ initialEvents }: { initialEvents: EventWithCount[] }) {
  const [events, setEvents] = useState<EventWithCount[]>(initialEvents)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventWithCount | null>(null)
  const [formData, setFormData] = useState<EventFormData>(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refetch() {
    const res = await fetch('/api/admin/events')
    if (res.ok) setEvents(await res.json())
  }

  function openCreate() {
    setEditingEvent(null)
    setFormData(emptyForm)
    setShowForm(true)
    setError(null)
  }

  function openEdit(event: EventWithCount) {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      year: String(event.year),
      slug: event.slug,
      description: event.description ?? '',
      max_applicants: String(event.max_applicants),
    })
    setShowForm(true)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      name: formData.name,
      year: Number(formData.year),
      slug: formData.slug,
      description: formData.description || null,
      max_applicants: Number(formData.max_applicants),
    }

    const res = await fetch('/api/admin/events', {
      method: editingEvent ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingEvent ? { id: editingEvent.id, ...payload } : payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'เกิดข้อผิดพลาด')
      setLoading(false)
      return
    }

    await refetch()
    setShowForm(false)
    setLoading(false)
  }

  async function handleToggleActive(event: EventWithCount) {
    setLoading(true)
    await fetch('/api/admin/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: event.id, is_active: !event.is_active }),
    })
    await refetch()
    setLoading(false)
  }

  async function handleDelete(id: string) {
    setLoading(true)
    await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' })
    await refetch()
    setDeleteConfirm(null)
    setLoading(false)
  }

  const applicantCount = (event: EventWithCount) => event.applications?.[0]?.count ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">กิจกรรม</h1>
          <p className="text-gray-500 mt-1">จัดการกิจกรรมทั้งหมด</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มกิจกรรม
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ชื่อกิจกรรม</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ปี</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">สถานะ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ผู้สมัคร</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">ไม่มีกิจกรรม</td>
                </tr>
              )}
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{event.name}</td>
                  <td className="px-4 py-3 text-gray-600">{event.year}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{event.slug}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(event)}
                      disabled={loading}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        event.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${event.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {event.is_active ? 'เปิดรับสมัคร' : 'ปิด'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {applicantCount(event)} / {event.max_applicants}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(event)}
                        className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded transition-colors"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(event.id)}
                        className="text-red-600 hover:text-red-800 px-2 py-1 rounded transition-colors"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingEvent ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกิจกรรม</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ปี (ค.ศ.)</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                    min={2020}
                    max={2099}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รับสมัครสูงสุด</label>
                  <input
                    type="number"
                    value={formData.max_applicants}
                    onChange={(e) => setFormData({ ...formData, max_applicants: e.target.value })}
                    required
                    min={1}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    pattern="[a-z0-9-]+"
                    placeholder="next-gen-web-academy"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ยืนยันการลบ</h3>
            <p className="text-gray-500 text-sm mb-6">คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
