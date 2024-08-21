import { Skeleton } from './skeleton'

const UserLoader = () => {
  return (
    <div className='flex gap-1 items-center'>
        <Skeleton className='w-12 h-12 rounded-full' />
        <Skeleton className='w-[calc(100%-48px)] h-4' />
    </div>
  )
}

export default UserLoader