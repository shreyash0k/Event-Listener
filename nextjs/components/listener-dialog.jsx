import { useState, useEffect } from 'react'
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
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export function ListenerDetailsDialog({ isOpen, onClose, listener, onSave }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(listener.name)
  const [url, setUrl] = useState(listener.url)
  const [prompt, setPrompt] = useState(listener.prompt || '')
  const [interval, setInterval] = useState(listener.interval || '1 day')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setName(listener.name)
      setUrl(listener.url)
      setPrompt(listener.prompt || '')
      setInterval(listener.interval || '1 day')
      setErrors({})
    }
  }, [isOpen, listener])

  const validateForm = () => {
    const newErrors = {}
    
    if (!name.trim()) newErrors.name = 'Required'
    if (!url.trim()) newErrors.url = 'Required'
    if (!prompt.trim()) newErrors.prompt = 'Required'
    if (!interval) newErrors.interval = 'Required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true)
      
      const response = await fetch('/api/trackers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, prompt, interval })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          toast({
            title: "Tracker Limit Reached",
            description: (
              <div>
                You've reached your tracker limit. 
                <Link href="/pricing" className="ml-2 underline">
                  Upgrade your plan for more trackers!
                </Link>
              </div>
            ),
          });
          return;
        }
        throw new Error(data.error || 'Failed to create tracker');
      }

      onSave(data);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = Boolean(
    name.trim() && 
    url.trim() && 
    prompt.trim() && 
    interval
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Create New Tracker</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Uniqlo Fleece Jacket"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">URL <span className="text-red-500">*</span></Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.uniqlo.com/us/en/products/E449753-000/00"
              className={errors.url ? "border-red-500" : ""}
            />
            {errors.url && (
              <p className="text-sm text-red-500">{errors.url}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prompt">What to check for <span className="text-red-500">*</span></Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Let me know when this jacket is available in light blue and XL"
              className={errors.prompt ? "border-red-500" : ""}
            />
            {errors.prompt && (
              <p className="text-sm text-red-500">{errors.prompt}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="interval">
              Check Every <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={interval} 
              onValueChange={setInterval}
              className={errors.interval ? "border-red-500" : ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select check frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 hour">1 hour</SelectItem>
                <SelectItem value="1 day">1 day</SelectItem>
                <SelectItem value="1 week">1 week</SelectItem>
              </SelectContent>
            </Select>
            {errors.interval && (
              <p className="text-sm text-red-500">{errors.interval}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

