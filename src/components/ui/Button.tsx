import { Link } from "react-router"
import { motion } from "motion/react"
import { forwardRef } from "react"
const MotionLink = motion.create(Link)
import type { ComponentPropsWithoutRef } from "react"

type ButtonVariant = "primary" | "secondary" | "ghost"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ReactNode
  href?: string
  download?: boolean
  target?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  ghost: "btn btn-ghost",
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      variant = "primary",
      size = "md",
      href,
      icon,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const classes = `${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()

    if (href) {
      const isRoute = href.startsWith("/")
      const safeProps = { ...props }
      if (isRoute) {
        delete (safeProps as Record<string, unknown>)["download"]
      }

      if (isRoute) {
        return (
          <MotionLink
            to={href}
            className={classes}
            ref={ref as React.Ref<HTMLAnchorElement>}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            {...(safeProps as Omit<
              React.AnchorHTMLAttributes<HTMLAnchorElement>,
              keyof ButtonProps | "to"
            >)}
          >
            {icon ? (<>
              {children}
              <span className="btn-icon">{icon}</span>
            </>) : children}
          </MotionLink>
        )
      }

      return (
        <motion.a
          href={href}
          className={classes}
          ref={ref as React.Ref<HTMLAnchorElement>}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          {...(props as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonProps>)}
        >
          {icon ? (<>
            {children}
            <span className="btn-icon">{icon}</span>
          </>) : children}
        </motion.a>
      )
    }

    return (
      <motion.button
        className={classes}
        ref={ref as React.Ref<HTMLButtonElement>}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        {...(props as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonProps>)}
      >
        {icon ? (<>
          {children}
          <span className="btn-icon">{icon}</span>
        </>) : children}
      </motion.button>
    )
  }
)

Button.displayName = "Button"
