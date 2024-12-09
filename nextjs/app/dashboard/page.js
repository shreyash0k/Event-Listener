'use client'

import { useState, useEffect } from 'react'
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

export default function DashboardPage() {
  const [trackers, setTrackers] = useState([])
  const [isNewListenerDialogOpen, setIsNewListenerDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTrackers = async () => {
      try {
        const response = await fetch('/api/trackers');
        const { data } = await response.json();
        setTrackers(data || []);
      } catch (error) {
        console.error('Error fetching trackers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackers();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch('/api/trackers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!response.ok) throw new Error('Failed to delete tracker');
      
      setTrackers(trackers.filter(tracker => tracker.id !== id));
    } catch (error) {
      console.error('Error deleting tracker:', error);
    }
  };

  const handleUpdate = async (updatedTracker) => {
    try {
      const response = await fetch('/api/trackers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTracker)
      });

      if (!response.ok) throw new Error('Failed to update tracker');

      const { data } = await response.json();
      
      // Update local state with the returned data
      setTrackers(trackers.map(tracker => 
        tracker.id === data.id ? data : tracker
      ));
    } catch (error) {
      console.error('Error updating tracker:', error);
    }
  };

  const handleCreate = (newTracker) => {
    // Just update the local state with the data returned from the dialog
    setTrackers([newTracker, ...trackers]);
    setIsNewListenerDialogOpen(false);
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
          {isLoading ? (
            <div>Loading...</div>
          ) : trackers.length > 0 ? (
            trackers.map((tracker) => (
              <ListenerCard
                key={tracker.id}
                listener={tracker}
                onDelete={() => handleDelete(tracker.id)}
                onUpdate={handleUpdate}
              />
            ))
          ) : (
            <div className="text-center">
              <p className="text-lg">
                Welcome to Scout Pup! All of your trackers will show up here. To get started, create your {" "}
                <button 
                  onClick={() => setIsNewListenerDialogOpen(true)}
                  className="text-primary hover:underline font-medium text-blue-500"
                >
                  first tracker
                </button>.
              </p>
            </div>
          )}
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

