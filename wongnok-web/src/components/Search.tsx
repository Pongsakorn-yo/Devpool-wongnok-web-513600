
import Image from "next/image"
import { Input } from '@/components/ui/input'

const searchData = () =>{
    return(
        <>
        <div className='w-full flex justify-center items-center my-8'>
            <div className='flex w-[584px] h-[40px] relative'>
              <div className='absolute mx-4 h-full flex justify-center items-center'>
                <Image
                  color='#E030F6'
                  src='/icons/search.svg'
                  alt='icon search'
                  width={18}
                  height={18}
                />
              </div>

              <Input
                className='rounded-3xl text-center'
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  handleSearch(e.target.value)
                }}
              />
            </div>
          </div>

          <h1 className='pt-6 pb-8 text-4xl font-bold'>สูตรอาหารทั้งหมด</h1>
        </>
    )
}

export default searchData