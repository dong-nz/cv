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
            whileTap={{ scale: 0.95 }}
            {...(safeProps as Omit<
              React.AnchorHTMLAttributes<HTMLAnchorElement>,
              keyof ButtonProps | "to"
            >)}
          >
            {children}
          </MotionLink>
        )
      }

      return (
        <motion.a
          href={href}
          className={classes}
          ref={ref as React.Ref<HTMLAnchorElement>}
          whileTap={{ scale: 0.95 }}
          {...(props as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonProps>)}
        >
          {children}
        </motion.a>
      )
    }

    return (
      <motion.button
        className={classes}
        ref={ref as React.Ref<HTMLButtonElement>}
        whileTap={{ scale: 0.95 }}
        {...(props as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonProps>)}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = "Button"
