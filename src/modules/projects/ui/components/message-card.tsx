import { format } from 'date-fns'
import { ChevronRightIcon, Code2Icon } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Fragment, Message } from '@/db/schema'
import { cn } from '@/lib/utils'

interface UserMessageProps {
  content: Message['content']
}

const UserMessage = ({ content }: UserMessageProps) => {
  return (
    <div className="flex justify-end pb-4 pr-2 pl-10">
      <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] wrap-break-word">
        {content}
      </Card>
    </div>
  )
}

interface FragmentCardProps {
  fragment: Fragment
  isActiveFragment: boolean
  onFragmentClick: (fragment: Fragment) => void
}

const FragmentCard = ({
  fragment,
  isActiveFragment,
  onFragmentClick,
}: FragmentCardProps) => {
  return (
    <button
      className={cn(
        'flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors',
        isActiveFragment &&
          'bg-primary text-primary-foreground border-primary hover:bg-primary'
      )}
      onClick={() => onFragmentClick(fragment)}
    >
      <Code2Icon className="size-4 mt-0.5" />
      <div className="flex flex-col flex-1">
        <span className="text-sm font-medium line-clamp-1">
          {fragment.title}
        </span>
        <span className="text-sm">Preview</span>
      </div>
      <div className="flex items-center justify-center mt-0.5">
        <ChevronRightIcon className="size-4" />
      </div>
    </button>
  )
}

interface AssistantCardProps {
  type: Message['type']
  content: Message['content']
  createdAt: Message['createdAt']

  isActiveFragment: boolean
  fragment: Fragment | null
  onFragmentClick: (fragment: Fragment) => void
}

const AssistantMessage = ({
  type,
  content,
  createdAt,

  fragment,
  onFragmentClick,
  isActiveFragment,
}: AssistantCardProps) => {
  return (
    <div
      className={cn(
        'flex flex-col group px-2 pb-4',
        type === 'Error' && 'text-red-700 dark:text-red-700'
      )}
    >
      <div className="flex items-center gap-2 pl-2 mb-2">
        {/* {TODO: Add a logo here} */}
        <span className="text-sm font-medium">Frontend Ai</span>
        <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {format(createdAt, "HH:mm 'on' MM dd, yyyy")}
        </span>
      </div>
      <div className="pl-8.5 flex flex-col gap-y-4">
        <span>{content}</span>
        {fragment && type === 'Result' && (
          <FragmentCard
            fragment={fragment}
            isActiveFragment={isActiveFragment}
            onFragmentClick={onFragmentClick}
          />
        )}
      </div>
    </div>
  )
}

interface MessageCardProps {
  role: Message['role']
  type: Message['type']
  content: Message['content']
  createdAt: Message['createdAt']

  isActiveFragment: boolean
  fragment: Fragment | null
  onFragmentClick: (fragment: Fragment) => void
}

export const MessageCard = ({
  role,
  type,
  content,
  createdAt,
  isActiveFragment,
  fragment,
  onFragmentClick,
}: MessageCardProps) => {
  if (role === 'Assistant') {
    return (
      <p>
        <AssistantMessage
          content={content}
          fragment={fragment}
          createdAt={createdAt}
          isActiveFragment={isActiveFragment}
          onFragmentClick={onFragmentClick}
          type={type}
        />
      </p>
    )
  }
  return (
    <p>
      <UserMessage content={content} />
    </p>
  )
}
