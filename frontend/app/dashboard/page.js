'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ListenerCard } from "@/components/listener-card"
import { ListenerDetailsDialog } from "@/components/listener-dialog"

const initialListeners = [
  {
    id: 1,
    name: "Tesla Product Manager Job",
    url: "www.tesla.com/careers",
    prompt: "Check for new product manager job postings",
    interval: "1 day"
  },
  {
    id: 2,
    name: "Uniqlo Blue Sweater",
    url: "www.uniqlo.com/fluffy-sweater",
    prompt: "Check if the blue sweater is back in stock",
    interval: "1 hour"
  },
  {
    id: 3,
    name: "Flight to Vancouver",
    url: "www.expedia.com",
    prompt: "Check for flight deals to Vancouver",
    interval: "1 week"
  },
  {
    id: 4,
    name: "Anthropic Claude",
    url: "www.anthropic.com",
    prompt: "Check for to see when anthropic launches a new claude model and notify me as soon as possible!!!",
    interval: "1 week"
  },
]

export default function DashboardPage() {
  const [listeners, setListeners] = useState(initialListeners)
  const [isNewListenerDialogOpen, setIsNewListenerDialogOpen] = useState(false)

  const handleDelete = (id) => {
    setListeners(listeners.filter(listener => listener.id !== id))
    // Placeholder for API call
    console.log('Deleting listener:', id)
  }

  const handleUpdate = (updatedListener) => {
    setListeners(listeners.map(listener => 
      listener.id === updatedListener.id ? updatedListener : listener
    ))
    // Placeholder for API call
    console.log('Updating listener:', updatedListener)
  }

  const handleCreate = (newListener) => {
    const listenerWithId = { ...newListener, id: Date.now() }
    setListeners([...listeners, listenerWithId])
    // Placeholder for API call
    console.log('Creating new listener:', listenerWithId)
  }

  return (
      <div className="flex flex-col justify-center items-center w-full px-5 py-6">
        <div className="flex justify-between items-center w-full max-w-3xl mb-8 gap-6">
          <Select defaultValue="recent">
            <SelectTrigger className="w-full max-w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="last-triggered">Last Triggered</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="default" onClick={() => setIsNewListenerDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Listener
          </Button>
        </div>

        <div className="space-y-6 w-full max-w-3xl">
          {listeners.map((listener) => (
            <ListenerCard
              key={listener.id}
              listener={listener}
              onDelete={() => handleDelete(listener.id)}
              onUpdate={handleUpdate}
            />
          ))}
        </div>

        <ListenerDetailsDialog
          isOpen={isNewListenerDialogOpen}
          onClose={() => setIsNewListenerDialogOpen(false)}
          listener={{ id: 0, name: '', url: '', prompt: '', interval: '1 day' }}
          onSave={handleCreate}
          isNew={true}
        />
      </div>
  )
}

