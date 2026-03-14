import { useEffect, useState, useRef } from 'react'
import emailjs from '@emailjs/browser'
import { Toaster, toast } from 'react-hot-toast'
import { SiGithub, SiInstagram, SiX } from 'react-icons/si'
import { FaLinkedin } from 'react-icons/fa'

export function ContactScreen() {
  const [visible, setVisible] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    const onShow = () => setVisible(true)
    const onHide = () => setVisible(false)

    window.addEventListener('showContact', onShow)
    window.addEventListener('hideContact', onHide)

    return () => {
      window.removeEventListener('showContact', onShow)
      window.removeEventListener('hideContact', onHide)
    }
  }, [])

  // Scroll: up -> back to Skills; down -> forward to Thank You.
  useEffect(() => {
    if (!visible) return

    const handleWheel = (event) => {
      if (!visible) return
      if (event.deltaY < 0) {
        setVisible(false)
        window.dispatchEvent(new Event('hideContact'))
        window.dispatchEvent(new Event('contactToSkills'))
      } else if (event.deltaY > 0) {
        setVisible(false)
        window.dispatchEvent(new Event('hideContact'))
        window.dispatchEvent(new Event('contactToThankYou'))
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [visible])

  const sendEmail = (e) => {
    e.preventDefault()
    if (!formRef.current) return
    emailjs.sendForm('service_r61kmn8', 'template_5gxoita', formRef.current, '0J3p5PmdR7bRXKFCv')
      .then(() => {
        toast.success('Successfully sent the email.')
        formRef.current?.reset()
      }, () => {
        toast.error('Failed to send email.')
      })
  }

  if (!visible) return null

  return (
    <>
    <Toaster position="top-center" />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px 32px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          maxWidth: 1040,
          width: '100%',
          maxHeight: '100%',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.2fr)',
          gap: 32,
          alignItems: 'flex-start',
        }}
      >
        <section>
          <h2
            style={{
              margin: 0,
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#f9fafb',
              textAlign: 'center',
            }}
          >
            Have something to say?
          </h2>
          <div
            style={{
              width: 72,
              height: 2,
              margin: '12px auto 24px',
              background: 'rgba(75, 85, 99, 0.8)',
              borderRadius: 1,
            }}
          />

          <article
            style={{
              padding: 20,
              borderRadius: 18,
              background: 'linear-gradient(to bottom right, rgba(15,23,42,0.6), rgba(30,41,59,0.4))',
              border: '1px solid rgba(55,65,81,0.9)',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.95)',
              color: '#94a3b8',
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Wanna give some suggestions, share some thoughts or have some
            conversations? Feel free to reach out through any of the mentioned
            social media platforms or just fill out the attached form to send me
            a mail with your thoughts.
          </article>

          <div
            style={{
              marginTop: 24,
              padding: 18,
              borderRadius: 16,
              background: 'linear-gradient(to bottom right, rgba(15,23,42,0.6), rgba(30,41,59,0.4))',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              color: '#e5e7eb',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 10,
              }}
            >
              Connect with me
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 28,
                fontSize: 28,
              }}
            >
              <a href="https://github.com/dkyadavkosli" target="_blank" rel="noreferrer" style={{ color: '#fff' }}><SiGithub /></a>
              <a href="https://www.linkedin.com/in/dipesh-kumar-b8580020b/" target="_blank" rel="noreferrer" style={{ color: '#fff' }}><FaLinkedin /></a>
              <a href="https://www.instagram.com/kal.se_padhai.shuru/" target="_blank" rel="noreferrer" style={{ color: '#fff' }}><SiInstagram /></a>
              <a href="https://twitter.com/DipeshK71331890" target="_blank" rel="noreferrer" style={{ color: '#fff' }}><SiX /></a>
            </div>

            <div
              style={{
                marginTop: 22,
                padding: 14,
                borderRadius: 14,
                background:
                  'radial-gradient(circle at left, rgba(15,23,42,0.9), transparent 60%)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                justifyContent: 'center',
                fontSize: 13,
                color: '#e5e7eb',
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                }}
              >
                ✉️
              </span>
              <span>dipesh23062003@gmail.com</span>
            </div>
          </div>
        </section>

        <section>
          <form
            ref={formRef}
            onSubmit={sendEmail}
            style={{
              padding: 22,
              borderRadius: 18,
              background: 'linear-gradient(to bottom right, rgba(15,23,42,0.6), rgba(30,41,59,0.4))',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.95)',
              color: '#e5e7eb',
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                marginBottom: 18,
                textAlign: 'center',
              }}
            >
              Send me a message
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <input name="from_name" id="from_name" placeholder="First Name" style={inputStyle} />
              <input name="from_name2" id="from_name2" placeholder="Last Name" style={inputStyle} />
              <input name="from_email" id="from_email" type="email" placeholder="Email Address" style={inputStyle} />
              <input name="from_phone" id="from_phone" placeholder="Phone No." style={inputStyle} />
            </div>
            <textarea
              name="message"
              id="message"
              placeholder="Elaborate your concern"
              rows={12}
              style={{
                ...inputStyle,
                width: '100%',
                minHeight: 200,
                resize: 'vertical',
                marginBottom: 16,
              }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 24px',
                borderRadius: 6,
                border: '1px solid rgba(148,163,184,0.7)',
                background: 'rgba(51, 65, 85, 1)',
                color: '#fff',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </form>
        </section>
      </div>
    </div>
    </>
  )
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 15,
  border: '1px solid rgba(148, 163, 184, 1)',
  backgroundColor: '#020b0e',
  color: '#e2e8f0',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
}

