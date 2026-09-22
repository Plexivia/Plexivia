import * as React from "react"
import { cn } from "@/lib/utils"

export const ChartContainer = React.forwardRef(
  ({ id, config, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        {...props}
      >
        <ChartStyle id={id} config={config} />
        {children}
      </div>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

export const ChartStyle = ({ id, config }) => {
  const styles = React.useMemo(() => {
    return Object.entries(config)
      .map(([key, value]) => {
        if (value.color) {
          return `[data-chart="${id}"] { --color-${key}: ${value.color}; }`
        }
        return null
      })
      .filter(Boolean)
      .join("\n")
  }, [id, config])

  return <style dangerouslySetInnerHTML={{ __html: styles }} />
}

export const ChartTooltip = ({ active, payload, label, content, ...props }) => {
  if (content) {
    return React.cloneElement(content, { active, payload, label, ...props })
  }
  return null
}

export const ChartTooltipContent = ({ active, payload, hideLabel }) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-md text-xs">
      {!hideLabel && <div className="font-semibold mb-1">{payload[0].name}</div>}
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: payload[0].payload.fill || payload[0].color }}
        />
        <span>{payload[0].name}:</span>
        <span className="font-bold">{payload[0].value}</span>
      </div>
    </div>
  )
}
