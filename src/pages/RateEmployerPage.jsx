import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import StatusBar from '../components/StatusBar'
import TopBar from '../components/TopBar'
import { Star, ShieldCheck } from 'lucide-react'

const CRITERIA = [
  { id: 'salary',        label: 'Salary fairness'  },
  { id: 'conditions',    label: 'Work conditions'  },
  { id: 'accommodation', label: 'Accommodation'    },
  { id: 'safety',        label: 'Safety & wellbeing' },
]

export default function RateEmployerPage() {
  const { goBack, showToast } = useApp()
  const [ratings, setRatings] = useState({})
  const [comment, setComment] = useState('')

  const submit = () => {
    showToast('Review submitted · Thank you')
    setTimeout(goBack, 600)
  }

  const allRated = CRITERIA.every(c => ratings[c.id])

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary overflow-hidden">
      <StatusBar />
      <TopBar title="Rate this Employer" sub="Verified workers only" />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="bg-ok-light border border-ok rounded-xl p-3 flex items-start gap-2">
          <ShieldCheck size={16} className="text-ok flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-ok leading-relaxed">
            Your review is verified against your employment record. Helps protect other workers from exploitation.
          </p>
        </div>

        <div className="bg-white rounded-card shadow-card p-4 mt-3">
          <div className="text-[13px] font-bold text-txt-primary mb-3">Rate by category</div>
          <div className="space-y-4">
            {CRITERIA.map(c => (
              <div key={c.id}>
                <div className="text-[12px] text-txt-secondary mb-2">{c.label}</div>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      onClick={() => setRatings(r => ({ ...r, [c.id]: n }))}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
                    >
                      <Star
                        size={26}
                        className={n <= (ratings[c.id] || 0) ? 'text-warn fill-warn' : 'text-bdr'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-card shadow-card p-4 mt-3">
          <div className="text-[13px] font-bold text-txt-primary mb-2">Share your experience</div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            placeholder="What should other workers know?"
            className="w-full border-2 border-bdr rounded-xl p-3 text-[13px] outline-none focus:border-primary resize-none"
          />
          <p className="text-[10px] text-txt-tertiary mt-1">Your name won't be shown publicly.</p>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-bdr-light bg-white flex-shrink-0">
        <button
          onClick={submit}
          disabled={!allRated}
          className="w-full bg-primary text-white font-bold text-[14px] py-3 rounded-pill disabled:opacity-40"
        >
          Submit Review
        </button>
      </div>
    </div>
  )
}
