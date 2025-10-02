"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  label?: string
  className?: string
}

export function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Pilih tanggal...",
  label,
  className 
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [inputValue, setInputValue] = React.useState(formatDate(date))

  React.useEffect(() => {
    setDate(value)
    setInputValue(formatDate(value))
  }, [value])

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    setInputValue(formatDate(newDate))
    setOpen(false)
    onChange?.(newDate)
  }

  const handleInputClick = () => {
    setOpen(true)
  }

  return (
    <div className={className}>
      {label && (
        <Label htmlFor="date" className="px-1 mb-1 block">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          id="date"
          value={inputValue}
          placeholder={placeholder}
          className="bg-background pr-10 cursor-pointer"
          readOnly
          onClick={handleInputClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Pilih tanggal</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleDateChange}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
