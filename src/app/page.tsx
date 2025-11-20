'use client'
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/trpc/client'

export default function Home() {
  const trpc = useTRPC()
  const { data: messages } = useQuery(trpc.messages.getMany.queryOptions())
  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        toast.success('message created')
      },
    })
  )

  const [value, setValue] = useState('')

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Input value={value} onChange={(e) => setValue(e.target.value)}></Input>
      <Button
        disabled={createMessage.isPending}
        onClick={() => createMessage.mutate({ value: value })}
      >
        Invoke background job
      </Button>
      <div>{JSON.stringify(messages, null, 2)}</div>
    </div>
  )
}
