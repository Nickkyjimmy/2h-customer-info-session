import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { validateDomainWithError } from '@/lib/validators'



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
  const sectionRef = useRef<HTMLElement>(null)
  
  // Parallax effect for reward image
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })
  
  const yParallax = useTransform(scrollYProgress, [0, 1], [-100, 100])

  const [domain, setDomain] = useState('')
  const [questions, setQuestions] = useState('')

  const [sessionId, setSessionId] = useState('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedOffice, setSelectedOffice] = useState('')
  const [offices, setOffices] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [regId, setRegId] = useState<string | null>(null)

  useEffect(() => {
    // Fetch offices
    fetch('/api/offices')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOffices(data)
        } else {
          console.error('API Error:', data)
          setOffices([])
        }
      })
      .catch(err => {
        console.error('Error fetching offices:', err)
        setOffices([])
      })

    // Fetch sessions
    fetch('/api/sessions')
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
  }, [])



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
          officeId: selectedOffice || null,
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
        setRegId(data.id)
        setShowSuccessDialog(true)
      }
    } catch (err) {
      console.error('Error submitting form:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleCloseDialog = () => {
    setShowSuccessDialog(false)
    setDomain('')
    setQuestions('')
    setSessionId('')
    setSelectedOffice('')
    setRegId(null)
    setIsSubmitting(false)
    // Optionally refresh offices to update slot counts
    fetch('/api/offices')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOffices(data)
      })
  }

  const allSlotsFull = offices.length > 0 && offices.every(o => o.quantity <= 0)

  return (
    <section ref={sectionRef} className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-10">
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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-0 md:px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Column: Reward Image */}
        <motion.div
           style={{ y: yParallax }}
           initial={{ opacity: 0, x: -50 }}
           whileInView={{ opacity: 1, x: 0 }}
           transition={{ duration: 1 }}
           className="flex justify-center items-center gap-4 order-2 md:order-1"
        >
           <div className="relative w-full aspect-[3/4] max-w-[1500px]">
             <Image 
               src="/reward/mat-truoc.png" 
               alt="Customer 2H Reward Front" 
               fill 
               className="object-contain drop-shadow-[0_0_50px_rgba(251,191,36,0.3)] -rotate-12 scale-[1.4] hover:scale-[1.5] transition-transform duration-500"
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
          className="relative z-10 w-full max-w-xl mx-auto order-1 md:order-2"
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
          <div className="relative z-10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md p-6 md:p-16 m-0 md:m-4">
            {/* Top Decorative Border */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%+300px)] h-24 pointer-events-none z-20">
              <Image src="/frame-test.png" alt="Top Border" fill className="object-contain object-center" />
            </div>
            
            {/* Bottom Decorative Border */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[calc(100%+300px)] h-24 pointer-events-none z-20">
              <Image src="/frame-test.png" alt="Bottom Border" fill className="object-contain object-center rotate-180" />
            </div>
            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl md:text-3xl font-bold text-center mb-3 text-amber-100 tracking-tight"
              style={{
                // fontFamily: 'var(--font-dancing-script)',
                textShadow: '0 2px 10px rgba(251, 191, 36, 0.3)'
              }}
            >
              Đối thoại cùng Nàng Thơ
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center text-[0.65rem] md:text-xs text-amber-200/70 mb-8 "
            >
            Số lượng có hạn! Đăng ký User Walk-in để sở hữu ngay <span className="font-bold text-amber-100">chiếc bình Customer 2H cực phẩm</span>!
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
                  className="block text-[0.6rem]  text-amber-100 mb-2 tracking-wide uppercase"
                >
                  Email 
                </label>
                <input
                  type="email"
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-slate-800/50 border-2 text-amber-50 placeholder-[#F57799]/50 
                           focus:outline-none focus:ring-2
                           transition-all duration-300 font
                           shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                  style={{
                    borderColor: '#EFD4B4'
                  }}
                  placeholder="your.name@mservice.com.vn"
                  required
                />
              
              </motion.div>



              {/* Office Select */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
              >
                <label 
                  htmlFor="office-location" 
                  className="block text-[0.6rem] font text-amber-100 mb-2 tracking-wide uppercase"
                >
                  Văn Phòng
                </label>
                <select
                  id="office-location"
                  value={selectedOffice}
                  onChange={(e) => setSelectedOffice(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-slate-800/50 border-2 text-amber-50 
                           focus:outline-none focus:ring-2
                           transition-all duration-300 font
                           shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] appearance-none disabled:opacity-50"
                  style={{
                    borderColor: '#EFD4B4'
                  }}
                  required={!allSlotsFull}
                  disabled={allSlotsFull}
                >
                  <option value="" className="bg-slate-900">
                    {offices.length > 0 && offices.every(o => o.quantity <= 0) ? 'Hết Slot' : 'Chọn văn phòng'}
                  </option>
                  {offices
                    .sort((a, b) => {
                      const order: Record<string, number> = { 'Hồ Chí Minh': 1, 'Hà Nội': 2, 'Đà Nẵng': 3 };
                      return (order[a.name] || 99) - (order[b.name] || 99);
                    })
                    .map((office) => (
                      <option key={office.id} value={office.id} className="bg-slate-900" disabled={office.quantity <= 0}>
                        {office.name} {office.quantity > 0 ? `(${office.quantity} slots)` : '(Hết Slot)'}
                      </option>
                    ))}
                </select>
              </motion.div>

              {/* Session Select */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <label 
                  htmlFor="office" 
                  className="block text-[0.6rem] font text-amber-100 mb-2 tracking-wide uppercase"
                >
                  Chọn Session - User Walk-in
                </label>
                <select
                  id="office"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-slate-800/50 border-2 text-amber-50 
                           focus:outline-none focus:ring-2
                           transition-all duration-300 font
                            shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] appearance-none disabled:opacity-50"
                  style={{
                    borderColor: '#EFD4B4'
                  }}
                  required={!allSlotsFull}
                  disabled={allSlotsFull}
                >
                  <option value="" className="bg-slate-900">{allSlotsFull ? 'Hết Slot' : 'Chọn session'}</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id} className="bg-slate-900">
                      {session.name}
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
                  className="block text-[0.6rem]  text-amber-100 mb-2 tracking-wide uppercase"
                >
                  Câu hỏi dành cho chương trình
                </label>
                <textarea
                  id="questions"
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 text-sm bg-slate-800/50 border-2 text-amber-50 placeholder-[#F57799]/50 
                           focus:outline-none focus:ring-2
                           transition-all duration-300 resize-none 
                           shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                  style={{
                    borderColor: '#EFD4B4'
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
                  className="p-4 bg-red-900/30 border-2 border-red-500/50 rounded text-red-200 text-xs font"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="pt-4 flex justify-center"
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-fit px-8 py-3 bg-[#D42B87] text-white font-bold text-sm rounded-full shadow-[0_0_20px_rgba(212,43,135,0.5)] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:scale-95 transition-transform duration-300"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
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
      <AnimatePresence>
        {showSuccessDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleCloseDialog}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 border-2 border-[#EFD4B4] shadow-[0_0_50px_rgba(239,212,180,0.2)]"
            >
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#EFD4B4] -translate-x-1 -translate-y-1" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#EFD4B4] translate-x-1 -translate-y-1" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#EFD4B4] -translate-x-1 translate-y-1" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#EFD4B4] translate-x-1 translate-y-1" />

              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-green-500/50 flex items-center justify-center">
                    <motion.svg 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="w-8 h-8 text-green-500" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#EFD4B4] mb-4 uppercase tracking-wider">
                  Gửi form thành công
                </h3>
                <p className="text-sm text-amber-100/90 font italic mb-8 leading-relaxed">
                  Cảm ơn anh/chị đã gửi cầu hỏi<br />
                  Hẹn anh/chị tại buổi training nhé.
                </p>

                <button
                  onClick={handleCloseDialog}
                  className="w-fit px-8 py-3 bg-[#D42B87] text-white text-sm font-bold rounded-full shadow-[0_0_20px_rgba(212,43,135,0.5)] uppercase tracking-widest hover:scale-95 transition-transform duration-300 mx-auto block"
                >
                  Tiếp tục
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
