import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'

// Phase 1: subtle intro zoom on the avatar (4s)
// Phase 2: travel move into the first hero screen (3s)
const START = { x: 0, y: 1.8, z: 5 }
const MID = { x: 0, y: 1.8, z: 2.6 }
// Camera position when showing the intro card section
const CARD_TARGET = { x: 0.5, y: 1.4, z: 1.4 }
// Camera position when showing the "I'M DIPESH" hero
const HERO_TARGET = { x: 0, y: 1.8, z: 0.9 }
// Camera position when showing the About screen
const ABOUT_TARGET = { x: 0.8, y: 1.5, z: 1.2 }
// Camera position when showing the Experience screen
const EXPERIENCE_TARGET = { x: 0.6, y: 1.5, z: 1.1 }
// Camera position when showing the Projects screen
const PROJECTS_TARGET = { x: 0.4, y: 1.5, z: 1.1 }
// Camera position when showing the Skills screen
const SKILLS_TARGET = { x: 0.3, y: 1.5, z: 1.05 }
// Camera position when showing the Contact screen
const CONTACT_TARGET = { x: 0.25, y: 1.6, z: 1.1 }
// Camera position when showing the Thank You screen
const THANKYOU_TARGET = { x: 0.2, y: 1.6, z: 1.05 }

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

      // First 4 seconds: gentle zoom-in on the avatar
      tl.to(camera.position, {
        x: MID.x,
        y: MID.y,
        z: MID.z,
        duration: 4,
        ease: 'power2.inOut',
      })

      // Wait 1s while the avatar fades out, then
      // next 3 seconds: travel move deeper into the scene
      // to frame the hero "I'M DIPESH" screen
      tl.to(
        camera.position,
        {
          x: HERO_TARGET.x,
          y: HERO_TARGET.y,
          z: HERO_TARGET.z,
          duration: 3,
          ease: 'power2.inOut',
          onComplete: () => {
            window.dispatchEvent(new Event('showHero'))
          },
        },
        '+=1'
      )
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
          duration: 3,
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
          duration: 3,
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
          duration: 3,
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
          duration: 3,
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
          duration: 3,
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
          duration: 3,
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
          duration: 3,
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
          duration: 3,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleProjectsToSkills = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onUpdate: () => {
            camera.lookAt(0, 1.4, 0)
            invalidate()
          },
          onComplete: () => {
            window.dispatchEvent(new Event('showSkills'))
          },
        })

        tl.to(camera.position, {
          x: SKILLS_TARGET.x,
          y: SKILLS_TARGET.y,
          z: SKILLS_TARGET.z,
          duration: 3,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleSkillsToProjects = () => {
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
          duration: 3,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleSkillsToContact = () => {
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
          duration: 3,
          ease: 'power3.inOut',
        })
      })

      return () => ctx.revert()
    }

    const handleContactToSkills = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onUpdate: () => {
            camera.lookAt(0, 1.4, 0)
            invalidate()
          },
          onComplete: () => {
            window.dispatchEvent(new Event('showSkills'))
          },
        })

        tl.to(camera.position, {
          x: SKILLS_TARGET.x,
          y: SKILLS_TARGET.y,
          z: SKILLS_TARGET.z,
          duration: 3,
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
          duration: 3,
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
          duration: 3,
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
    window.addEventListener('projectsToSkills', handleProjectsToSkills)
    window.addEventListener('skillsToProjects', handleSkillsToProjects)
    window.addEventListener('skillsToContact', handleSkillsToContact)
    window.addEventListener('contactToSkills', handleContactToSkills)
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
      window.removeEventListener('projectsToSkills', handleProjectsToSkills)
      window.removeEventListener('skillsToProjects', handleSkillsToProjects)
      window.removeEventListener('skillsToContact', handleSkillsToContact)
      window.removeEventListener('contactToSkills', handleContactToSkills)
      window.removeEventListener('contactToThankYou', handleContactToThankYou)
      window.removeEventListener('thankYouToContact', handleThankYouToContact)
    }
  }, [camera, invalidate])

  return null
}
