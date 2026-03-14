import { useEffect, useState } from 'react'
import c from '../assets/c.png'
import cpp from '../assets/cpp.png'
import css from '../assets/css.png'
import html from '../assets/html.png'
import js from '../assets/js.png'
import mongodb from '../assets/mongodb.png'
import next from '../assets/next.png'
import nodejs from '../assets/nodejs.png'
import postman from '../assets/postman.png'
import python from '../assets/python.png'
import react from '../assets/react.png'
import redux from '../assets/redux.png'
import solidity from '../assets/solidity.png'
import tailwind from '../assets/tailwind.svg'
import typescript from '../assets/typescript.png'
import mysql from '../assets/mysql.png'

const SKILLS = [
  { name: 'C', img: c },
  { name: 'C++', img: cpp },
  { name: 'HTML', img: html },
  { name: 'JS', img: js },
  { name: 'TS', img: typescript },
  { name: 'CSS', img: css },
  { name: 'Tailwind', img: tailwind },
  { name: 'Python', img: python },
  { name: 'React', img: react },
  { name: 'Redux', img: redux },
  { name: 'Next Js', img: next },
  { name: 'Solidity', img: solidity },
  { name: 'Node Js', img: nodejs },
  { name: 'Mongo', img: mongodb },
  { name: 'Postman', img: postman },
  { name: 'MySQL', img: mysql },
]

const CIRCLE_SIZE = 80

function SkillCircle({ skill, hover, onHover }) {
  const isHover = hover === skill.name
  return (
    <div
      style={{
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        padding: 10,
        border: '2px solid rgba(226, 232, 240, 1)',
        borderRadius: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onMouseEnter={() => onHover(skill.name)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onHover(isHover ? null : skill.name)}
    >
      {!isHover ? (
        <img
          src={skill.img}
          alt={skill.name}
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'contain',
            ...(skill.name === 'Next Js' ? { backgroundColor: 'white', borderRadius: 999, padding: 4 } : {}),
          }}
        />
      ) : (
        <div
          style={{
            height: '100%',
            width: '100%',
            backgroundColor: 'rgba(226, 232, 240, 1)',
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {skill.name}
        </div>
      )}
    </div>
  )
}

export function SkillsScreen() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const onShow = () => setVisible(true)
    const onHide = () => setVisible(false)

    window.addEventListener('showSkills', onShow)
    window.addEventListener('hideSkills', onHide)

    return () => {
      window.removeEventListener('showSkills', onShow)
      window.removeEventListener('hideSkills', onHide)
    }
  }, [])

  useEffect(() => {
    if (!visible) return

    const handleWheel = (event) => {
      if (!visible) return
      if (event.deltaY < 0) {
        setVisible(false)
        window.dispatchEvent(new Event('hideSkills'))
        window.dispatchEvent(new Event('skillsToProjects'))
      } else if (event.deltaY > 0) {
        setVisible(false)
        window.dispatchEvent(new Event('hideSkills'))
        window.dispatchEvent(new Event('skillsToContact'))
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [visible])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px 32px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        overflow: 'auto',
        background: '#000',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          maxWidth: 900,
          width: '100%',
          maxHeight: '100%',
          overflowY: 'auto',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          Technical Skills
        </h2>
        <p
          style={{
            margin: '8px 0 0',
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 15,
            color: '#d1d5db',
            textAlign: 'center',
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Technologies and tools I work with to build amazing digital experiences
        </p>
        <div
          style={{
            width: 48,
            height: 2,
            margin: '20px auto 28px',
            background: 'rgba(75, 85, 99, 0.8)',
            borderRadius: 1,
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 20,
            justifyItems: 'center',
          }}
        >
          {SKILLS.map((skill) => (
            <SkillCircle key={skill.name} skill={skill} hover={hovered} onHover={setHovered} />
          ))}
        </div>

        <div
          style={{
            marginTop: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 80,
              height: 1,
              background: 'rgba(75, 85, 99, 0.6)',
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: '#22c55e',
            }}
          />
          <div
            style={{
              width: 80,
              height: 1,
              background: 'rgba(75, 85, 99, 0.6)',
            }}
          />
        </div>
        <p
          style={{
            margin: '12px 0 0',
            fontSize: 13,
            color: '#d1d5db',
            textAlign: 'center',
          }}
        >
          Continuously learning and exploring new technologies
        </p>
      </div>
    </div>
  )
}
