import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ListenerDetailsDialog({ isOpen, onClose, listener, onSave }) {
  const [name, setName] = useState(listener.name)
  const [url, setUrl] = useState(listener.url)
  const [prompt, setPrompt] = useState(listener.prompt || '')
  const [interval, setInterval] = useState(listener.interval || '1 day')

  const handleSave = () => {
    onSave({ ...listener, name, url, prompt, interval })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Create New Tracker</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Uniqlo Fleece Jacket"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">
              URL
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.uniqlo.com/us/en/products/E449753-000/00"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prompt">
              What to check for
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Let me know when this jacket is available in light blue and XL"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="interval">
              Check Every
            </Label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger>
                <SelectValue placeholder="Select check frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 hour">1 hour</SelectItem>
                <SelectItem value="1 day">1 day</SelectItem>
                <SelectItem value="1 week">1 week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

