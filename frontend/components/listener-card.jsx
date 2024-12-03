import { useState } from 'react'
import { Trash, Pencil, RotateCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ListenerCard({ listener, onDelete, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [editedListener, setEditedListener] = useState(listener)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleSave = () => {
    onUpdate(editedListener)
    // Placeholder for API call
    console.log('Updating listener:', editedListener)
    setIsExpanded(false)
  }

  const handleCancel = () => {
    setEditedListener(listener) // Reset to original values
    setIsExpanded(false)
  }

  const handleChange = (field, value) => {
    setEditedListener(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const truncatePrompt = (prompt) => {
    if (!prompt) return '';
    return prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
  };

  const handleDelete = () => {
    onDelete()
    setShowDeleteDialog(false)
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">{listener.name}</CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1 bg-green-500 text-white hover:bg-green-600">
            <RotateCw className="h-3 w-3" />
            {listener.interval}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {!isExpanded ? (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{listener.url}</p>
            {listener.prompt && (
              <p className="text-sm text-muted-foreground/60">{truncatePrompt(listener.prompt)}</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editedListener.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Uniqlo Fleece Jacket"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={editedListener.url}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://www.uniqlo.com/us/en/products/E449753-000/00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prompt">What to check for</Label>
              <Textarea
                id="prompt"
                value={editedListener.prompt}
                onChange={(e) => handleChange('prompt', e.target.value)}
                placeholder="Let me know when this jacket is available in light blue and XL"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interval">Check Every</Label>
              <Select 
                value={editedListener.interval} 
                onValueChange={(value) => handleChange('interval', value)}
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
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        {!isExpanded ? (
          <>
            <Button
              variant="link"
              className="text-sm text-primary p-0 h-auto flex items-center gap-1"
              onClick={() => setIsExpanded(true)}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete this tracker.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete this tracker.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

