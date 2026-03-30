import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'

// Initial load: direct zoom to the hero screen.
// Scroll-driven moves use SCREEN_CAMERA_DURATION (shorter = snappier).
const INITIAL_TO_HERO_DURATION = 2.45
const SCREEN_CAMERA_DURATION = 2.15
const START = { x: 0, y: 1.8, z: 5 }
// Hero→Card unchanged; Card→About and all later steps doubled again.
const HERO_TARGET = { x: 0, y: 1.8, z: 0.2 }
const CARD_TARGET = { x: 2.0, y: 1.35, z: 1.4 }
const ABOUT_TARGET = { x: 9.2, y: 1.35, z: 6.2 }
const EXPERIENCE_TARGET = { x: 2.8, y: 1.55, z: 11.8 }
const PROJECTS_TARGET = { x: -5.6, y: 1.55, z: 1.8 }
const CONTACT_TARGET = { x: -20.0, y: 1.55, z: -3.8 }
const THANKYOU_TARGET = { x: -22.4, y: 1.55, z: -11.8 }

export function IntroCameraMove() {
  const { camera, invalidate } = useThree()
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    camera.position.set(START.x, START.y, START.z)

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onUpdate: () => {
          camera.lookAt(0, 1.2, 0)
          invalidate()
        },
      })

      // Direct travel into the scene to frame the hero "I'M DIPESH" screen
      tl.to(camera.position, {
        x: HERO_TARGET.x,
        y: HERO_TARGET.y,
        z: HERO_TARGET.z,
        duration: INITIAL_TO_HERO_DURATION,
        ease: 'power2.inOut',
        onComplete: () => {
          window.dispatchEvent(new Event('showHero'))
        },
      })
    })

    return () => ctx.revert()
  }, [camera, invalidate])

  useEffect(() => {
    const handleCardToHero = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onUpdate: () => {
            camera.lookAt(0, 1.4, 0)
            invalidate()
          },
          onComplete: () => {
            window.dispatchEvent(new Event('showHero'))
          },
        })

        tl.to(camera.position, {
          x: HERO_TARGET.x,
          y: HERO_TARGET.y,
          z: HERO_TARGET.z,
          duration: SCREEN_CAMERA_DURATION,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleHeroToCard = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onUpdate: () => {
            camera.lookAt(0, 1.4, 0)
            invalidate()
          },
          onComplete: () => {
            window.dispatchEvent(new Event('showCardIntro'))
          },
        })

        tl.to(camera.position, {
          x: CARD_TARGET.x,
          y: CARD_TARGET.y,
          z: CARD_TARGET.z,
          duration: SCREEN_CAMERA_DURATION,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleCardToAbout = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onUpdate: () => {
            camera.lookAt(0, 1.4, 0)
            invalidate()
          },
          onComplete: () => {
            window.dispatchEvent(new Event('showAbout'))
          },
        })

        tl.to(camera.position, {
          x: ABOUT_TARGET.x,
          y: ABOUT_TARGET.y,
          z: ABOUT_TARGET.z,
          duration: SCREEN_CAMERA_DURATION,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleAboutToCard = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onUpdate: () => {
            camera.lookAt(0, 1.4, 0)
            invalidate()
          },
          onComplete: () => {
            window.dispatchEvent(new Event('showCardIntro'))
          },
        })

        tl.to(camera.position, {
          x: CARD_TARGET.x,
          y: CARD_TARGET.y,
          z: CARD_TARGET.z,
          duration: SCREEN_CAMERA_DURATION,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleAboutToExperience = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onUpdate: () => {
            camera.lookAt(0, 1.4, 0)
            invalidate()
          },
          onComplete: () => {
            window.dispatchEvent(new Event('showExperience'))
          },
        })

        tl.to(camera.position, {
          x: EXPERIENCE_TARGET.x,
          y: EXPERIENCE_TARGET.y,
          z: EXPERIENCE_TARGET.z,
          duration: SCREEN_CAMERA_DURATION,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleExperienceToAbout = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onUpdate: () => {
            camera.lookAt(0, 1.4, 0)
            invalidate()
          },
          onComplete: () => {
            window.dispatchEvent(new Event('showAbout'))
          },
        })

        tl.to(camera.position, {
          x: ABOUT_TARGET.x,
          y: ABOUT_TARGET.y,
          z: ABOUT_TARGET.z,
          duration: SCREEN_CAMERA_DURATION,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleExperienceToProjects = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onUpdate: () => {
            camera.lookAt(0, 1.4, 0)
            invalidate()
          },
          onComplete: () => {
            window.dispatchEvent(new Event('showProjects'))
          },
        })

        tl.to(camera.position, {
          x: PROJECTS_TARGET.x,
          y: PROJECTS_TARGET.y,
          z: PROJECTS_TARGET.z,
          duration: SCREEN_CAMERA_DURATION,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleProjectsToExperience = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onUpdate: () => {
            camera.lookAt(0, 1.4, 0)
            invalidate()
          },
          onComplete: () => {
            window.dispatchEvent(new Event('showExperience'))
          },
        })

        tl.to(camera.position, {
          x: EXPERIENCE_TARGET.x,
          y: EXPERIENCE_TARGET.y,
          z: EXPERIENCE_TARGET.z,
          duration: SCREEN_CAMERA_DURATION,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleProjectsToContact = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onUpdate: () => {
            camera.lookAt(0, 1.4, 0)
            invalidate()
          },
          onComplete: () => {
            window.dispatchEvent(new Event('showContact'))
          },
        })

        tl.to(camera.position, {
          x: CONTACT_TARGET.x,
          y: CONTACT_TARGET.y,
          z: CONTACT_TARGET.z,
          duration: SCREEN_CAMERA_DURATION,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleContactToProjects = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onUpdate: () => {
            camera.lookAt(0, 1.4, 0)
            invalidate()
          },
          onComplete: () => {
            window.dispatchEvent(new Event('showProjects'))
          },
        })

        tl.to(camera.position, {
          x: PROJECTS_TARGET.x,
          y: PROJECTS_TARGET.y,
          z: PROJECTS_TARGET.z,
          duration: SCREEN_CAMERA_DURATION,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleContactToThankYou = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onUpdate: () => {
            camera.lookAt(0, 1.4, 0)
            invalidate()
          },
          onComplete: () => {
            window.dispatchEvent(new Event('showThankYou'))
          },
        })

        tl.to(camera.position, {
          x: THANKYOU_TARGET.x,
          y: THANKYOU_TARGET.y,
          z: THANKYOU_TARGET.z,
          duration: SCREEN_CAMERA_DURATION,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleThankYouToContact = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onUpdate: () => {
            camera.lookAt(0, 1.4, 0)
            invalidate()
          },
          onComplete: () => {
            window.dispatchEvent(new Event('showContact'))
          },
        })

        tl.to(camera.position, {
          x: CONTACT_TARGET.x,
          y: CONTACT_TARGET.y,
          z: CONTACT_TARGET.z,
          duration: SCREEN_CAMERA_DURATION,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    window.addEventListener('cardToHero', handleCardToHero)
    window.addEventListener('heroToCard', handleHeroToCard)
    window.addEventListener('cardToAbout', handleCardToAbout)
    window.addEventListener('aboutToCard', handleAboutToCard)
    window.addEventListener('aboutToExperience', handleAboutToExperience)
    window.addEventListener('experienceToAbout', handleExperienceToAbout)
    window.addEventListener('experienceToProjects', handleExperienceToProjects)
    window.addEventListener('projectsToExperience', handleProjectsToExperience)
    window.addEventListener('projectsToContact', handleProjectsToContact)
    window.addEventListener('contactToProjects', handleContactToProjects)
    window.addEventListener('contactToThankYou', handleContactToThankYou)
    window.addEventListener('thankYouToContact', handleThankYouToContact)
    return () => {
      window.removeEventListener('cardToHero', handleCardToHero)
      window.removeEventListener('heroToCard', handleHeroToCard)
      window.removeEventListener('cardToAbout', handleCardToAbout)
      window.removeEventListener('aboutToCard', handleAboutToCard)
      window.removeEventListener('aboutToExperience', handleAboutToExperience)
      window.removeEventListener('experienceToAbout', handleExperienceToAbout)
      window.removeEventListener('experienceToProjects', handleExperienceToProjects)
      window.removeEventListener('projectsToExperience', handleProjectsToExperience)
      window.removeEventListener('projectsToContact', handleProjectsToContact)
      window.removeEventListener('contactToProjects', handleContactToProjects)
      window.removeEventListener('contactToThankYou', handleContactToThankYou)
      window.removeEventListener('thankYouToContact', handleThankYouToContact)
    }
  }, [camera, invalidate])

  return null
}
