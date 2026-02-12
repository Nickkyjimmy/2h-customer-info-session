import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { validateDomainWithError } from '@/lib/validators'

type Location = 'HANOI' | 'HCM' | 'DANANG';

interface Session {
  id: string;
  name: string;
  quantities: number;
}

interface CheckInFormProps {
  onSuccess?: (id: string) => void
}

export default function CheckInForm({ onSuccess }: CheckInFormProps) {
  const router = useRouter()
  const [domain, setDomain] = useState('')
  const [questions, setQuestions] = useState('')
  const [location, setLocation] = useState<Location | ''>('')
  const [sessionId, setSessionId] = useState('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (location) {
      fetch(`/api/sessions?location=${location}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSessions(data)
          } else {
            console.error('API Error:', data)
            setSessions([])
          }
        })
        .catch(err => {
          console.error('Error fetching sessions:', err)
          setSessions([])
        })
    } else {
      setSessions([])
      setSessionId('')
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Validate email domain on client side first
      const validationError = validateDomainWithError(domain)
      if (validationError) {
        setError(validationError)
        setIsSubmitting(false)
        return
      }

      // Submit form
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          domain, 
          questions,
          located_in: location || null,
          sessionId: sessionId || null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit form')
        setIsSubmitting(false)
        return
      }

      // Handle success
      if (data.id) {
        if (onSuccess) {
          onSuccess(data.id)
        } else {
          router.push(`/mini-game/${data.id}`)
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/agenda/11.png"
        alt="Renaissance Gallery"
        fill
        className="object-cover"
        priority
      />
      
      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Column: Reward Image */}
        <motion.div
           initial={{ opacity: 0, x: -50 }}
           whileInView={{ opacity: 1, x: 0 }}
           transition={{ duration: 1 }}
           className="hidden lg:flex justify-center items-center gap-4"
        >
           <div className="relative w-full aspect-[3/4] max-w-[300px]">
             <Image 
               src="/reward/mat-truoc.png" 
               alt="Customer 2H Reward Front" 
               fill 
               className="object-contain drop-shadow-[0_0_50px_rgba(251,191,36,0.3)] hover:scale-105 transition-transform duration-500"
               priority
             />
           </div>
           <div className="relative w-full aspect-[3/4] max-w-[300px]">
             <Image 
               src="/reward/mat-sau.png" 
               alt="Customer 2H Reward Back" 
               fill 
               className="object-contain drop-shadow-[0_0_50px_rgba(251,191,36,0.3)] hover:scale-105 transition-transform duration-500"
               priority
             />
           </div>
        </motion.div>

        {/* Right Column: Check-in Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative z-10 w-full max-w-xl mx-auto"
        >
        {/* Renaissance Frame Border */}
        <div className="relative">
          {/* Frame Image as Border - extends beyond content */}
          <div className="absolute -inset-16 md:-inset-20 pointer-events-none z-0">
            <Image
              src="/frame.png"
              alt="Renaissance Frame"
              fill
              className="object-fill"
              style={{ 
                filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5))'
              }}
            />
          </div>

          {/* Form Content - with padding to avoid frame edges */}
          <div className="relative z-10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md p-6 md:p-16 m-4">
            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-center mb-3 text-amber-100 tracking-tight"
              style={{
                fontFamily: 'var(--font-dancing-script)',
                textShadow: '0 2px 10px rgba(251, 191, 36, 0.3)'
              }}
            >
              Đối thoại cùng Nàng Thơ
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center text-sm md:text-base text-amber-200/70 mb-8 font-serif italic"
            >
              Đăng ký ngay session User Waik-in với số lượng có hạn sau buổi training để nhận đặc quyền thực chiến chạm tim User và cơ hội sở hữu ngay <span className="font-bold text-amber-100">chiếc bình Customer 2H cực phẩm</span>!
            </motion.p>

            {/* Decorative divider */}
            <div className="flex items-center justify-center mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/50" />
              <div className="mx-3 w-2 h-2 rotate-45 border border-amber-500/50" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/50" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Domain Input */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <label 
                  htmlFor="domain" 
                  className="block text-sm font-serif text-amber-100 mb-2 tracking-wide uppercase"
                >
                  Email 
                </label>
                <input
                  type="email"
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border-2 text-amber-50 placeholder-amber-900/50 
                           focus:outline-none focus:ring-2
                           transition-all duration-300 font-serif
                           shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                  style={{
                    borderColor: '#D42A87'
                  }}
                  placeholder="your.name@mservice.com.vn"
                  required
                />
                <p className="text-xs text-amber-200/60 mt-1 font-serif italic">
                  Must be @mservice.com.vn or @momo.vn
                </p>
              </motion.div>

              {/* Location Select */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
              >
                <label 
                  htmlFor="location" 
                  className="block text-sm font-serif text-amber-100 mb-2 tracking-wide uppercase"
                >
                  Văn Phòng
                </label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value as Location)}
                  className="w-full px-4 py-3 bg-slate-800/50 border-2 text-amber-50 
                           focus:outline-none focus:ring-2
                           transition-all duration-300 font-serif
                           shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] appearance-none"
                  style={{
                    borderColor: '#D42A87'
                  }}
                  required
                >
                  <option value="" disabled className="bg-slate-900">Chọn văn phòng của bạn</option>
                  <option value="HCM" className="bg-slate-900">Hồ Chí Minh</option>
                  <option value="HANOI" className="bg-slate-900">Hà Nội</option>
                  <option value="DANANG" className="bg-slate-900">Đà Nẵng</option>
                </select>
              </motion.div>

              {/* Session Select */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <label 
                  htmlFor="session" 
                  className="block text-sm font-serif text-amber-100 mb-2 tracking-wide uppercase"
                >
                  Chọn Session - User Walk-in
                </label>
                <select
                  id="session"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border-2 text-amber-50 
                           focus:outline-none focus:ring-2
                           transition-all duration-300 font-serif
                           shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] appearance-none disabled:opacity-50"
                  style={{
                    borderColor: '#D42A87'
                  }}
                  disabled={!location}
                >
                  <option value="" className="bg-slate-900">{location ? 'Chọn session' : 'Vui lòng chọn văn phòng trước'}</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900">
                      {s.name} ({s.quantities} slots)
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Questions Textarea */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <label 
                  htmlFor="questions" 
                  className="block text-sm font-serif text-amber-100 mb-2 tracking-wide uppercase"
                >
                  Leave Your Questions
                </label>
                <textarea
                  id="questions"
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-800/50 border-2 text-amber-50 placeholder-amber-900/50 
                           focus:outline-none focus:ring-2
                           transition-all duration-300 resize-none font-serif
                           shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                  style={{
                    borderColor: '#D42A87'
                  }}
                  placeholder="Share your thoughts and questions..."
                  required
                />
              </motion.div>



              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-900/30 border-2 border-red-500/50 rounded text-red-200 text-sm font-serif"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="pt-4"
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Button border frame */}
                  <div className="absolute inset-0 p-[2px]" style={{ background: '#D42A87' }}>
                    <div className="absolute inset-0 group-hover:brightness-110 transition-all duration-500" 
                         style={{ background: '#D42A87' }} />
                  </div>
                  
                  {/* Button content */}
                  <span className="relative block px-8 py-4 text-lg font-bold text-amber-50 tracking-widest uppercase
                                 font-serif group-hover:text-white transition-colors duration-300
                                 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </span>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                                  transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] 
                                  transition-transform duration-1000" />
                  </div>
                </button>
              </motion.div>
            </form>

            {/* Bottom decorative element */}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rotate-45 bg-amber-600/30 border border-amber-500/50" />
                <div className="w-2 h-2 rotate-45 bg-amber-600/50 border border-amber-500/70" />
                <div className="w-2 h-2 rotate-45 bg-amber-600/30 border border-amber-500/50" />
              </div>
            </div>
          </div>
        </div>
        </motion.div>
      </div>
    </section>
  )
}
