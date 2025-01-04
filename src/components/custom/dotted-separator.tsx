import { cn } from '@/lib/utils';
import React from 'react'

type SizeHeightFormat = `${number}px`

type Direction = 'horizontal' | 'vertical'

interface DottedSeparatorProps {
  className?: string;
  color?: string;
  height?: SizeHeightFormat;
  dotSize?: SizeHeightFormat;
  gapSize?: SizeHeightFormat;
  direction?: Direction;
}

export const DottedSeparator = ({
  className,
  color = '#d4d4d8',
  height = '2px',
  dotSize = '2px',
  gapSize = '6px',
  direction = 'horizontal'
} : DottedSeparatorProps) => {
  const isHorizontal = direction === 'horizontal'

  return (
    <div className={cn(
      isHorizontal ? "w-full flex items-center" : "h-full flex flex-col items-center",
      className,
    )}>
      <div 
      className={isHorizontal ? "flex-grow" : "flex-grow-0"}
      style={{
        width: isHorizontal ? "100%" : height,
        height: isHorizontal ? height : "100%",
        backgroundImage: `radial-gradient(circle, ${color} 25%, transparent 25%)`,
        backgroundSize: isHorizontal 
          ? `${parseInt(dotSize) + parseInt(gapSize)}px ${height}`
          : `${height} ${parseInt(dotSize) + parseInt(gapSize)}px`,
        backgroundRepeat: isHorizontal ? "repeat-x" : "repeat-y",
        backgroundPosition: "center"
      }}/>
    </div>
  )
}