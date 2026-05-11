'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/ToastContext'
import { BrainCircuit, Copy, Download, RefreshCw, FileText } from 'lucide-react'

export default function AdvisorPage() {
  const { toast } = useToast()
  const [summary, setSummary] = useState('')
  const [questions, setQuestions] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  const generateSummary = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/summary')
      const { summary: s } = await res.json()
      // Replace the placeholder questions section with the user's questions
      const withQuestions = s.replace('[Your questions will appear here]', questions || '[Your questions will appear here]')
      setSummary(withQuestions)
      setGenerated(true)
      toast('Summary generated — ready to copy!')
    } catch {
      toast('Failed to generate summary', 'error')
    } finally {
      setLoading(false)
    }
  }, [questions, toast])

  const fullText = summary
    ? summary.replace('[Your questions will appear here]', questions || '[No questions added]')
    : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText)
      toast('Copied to clipboard!')
    } catch {
      toast('Copy failed — try selecting and copying manually', 'error')
    }
  }

  const handleDownloadTxt = () => {
    const blob = new Blob([fullText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `agency-report-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPDF = () => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Agency Situation Report</title>
        <style>
          body { font-family: monospace; font-size: 13px; padding: 40px; white-space: pre-wrap; line-height: 1.6; color: #1e293b; }
          h1 { font-size: 16px; }
        </style>
      </head>
      <body>${fullText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
      </html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">AI Business Advisor</h1>
          <p className="text-sm text-slate-500 mt-0.5">Generate a complete business situation report to paste into ChatGPT, Claude, or any AI</p>
        </div>
        <BrainCircuit size={32} className="text-indigo-400 mt-1 shrink-0" />
      </div>

      {/* How it works */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <p className="text-sm text-indigo-800 font-medium mb-1">How to use this</p>
        <ol className="text-sm text-indigo-700 space-y-1 list-decimal list-inside">
          <li>Optionally type your specific questions below</li>
          <li>Click "Generate Report" — it pulls live data from all modules</li>
          <li>Copy the output and paste it into ChatGPT, Claude, or any AI advisor</li>
        </ol>
      </div>

      {/* Questions input */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Section 4 — Your Questions for the AI Advisor
        </label>
        <p className="text-xs text-slate-400 mb-3">These will be appended to the report. Be specific about what advice you need.</p>
        <textarea
          rows={5}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder={`Example questions:\n• Should I follow up with Sunita Rao again or write off the invoice?\n• How can I convert Ravi Mehta from Hot lead to Converted?\n• Is my expense-to-income ratio healthy for a freelance agency?\n• What's the best way to handle overdue follow-ups?`}
          value={questions}
          onChange={e => setQuestions(e.target.value)}
        />
      </div>

      {/* Generate button */}
      <button
        onClick={generateSummary}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
      >
        {loading ? (
          <><RefreshCw size={18} className="animate-spin" /> Generating…</>
        ) : (
          <><BrainCircuit size={18} /> Generate Situation Report</>
        )}
      </button>

      {/* Output */}
      {generated && summary && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-700">Generated Report</h3>
              <span className="text-xs text-slate-400">— ready to copy</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Copy size={13} /> Copy to Clipboard
              </button>
              <button
                onClick={handleDownloadTxt}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Download size={13} /> .txt
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Download size={13} /> PDF
              </button>
            </div>
          </div>
          <pre className="px-5 py-4 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto bg-slate-50">
            {summary.replace('[Your questions will appear here]', questions || '[No questions added]')}
          </pre>
        </div>
      )}

      {!generated && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BrainCircuit size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 text-sm">Click "Generate Situation Report" to create your business summary.</p>
          <p className="text-slate-300 text-xs mt-1">The report pulls live data from Dashboard, Expenses, and Wishlist.</p>
        </div>
      )}
    </div>
  )
}
